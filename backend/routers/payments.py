import hashlib
import hmac
import json
import logging
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import get_current_user
from config import settings
from database import get_db
from models import Certificate, Course, Enrollment, PaymentStatus, User, VideoProgress
from razorpay_client import RazorpayClient

router = APIRouter(prefix="/payments", tags=["payments"])
log = logging.getLogger("lmap.payments")


class CreateOrderRequest(BaseModel):
    course_slug: Optional[str] = None
    course_id: Optional[int] = None
    bundle: bool = False


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


def _owned_ids(db: Session, user: User) -> set[int]:
    return {
        e.course_id for e in db.query(Enrollment).filter(
            Enrollment.user_id == user.id, Enrollment.payment_status == PaymentStatus.paid
        )
    }


def _mark_paid(enrollments: list[Enrollment], payment_id: str) -> list[str]:
    for e in enrollments:
        e.payment_status = PaymentStatus.paid
        e.razorpay_payment_id = payment_id
    return [e.course.slug for e in enrollments]


@router.get("/bundle")
def bundle_info(db: Session = Depends(get_db)):
    courses = db.query(Course).filter(Course.is_published == True, Course.price > 0).order_by(Course.sort_order).all()
    return {
        "slug": settings.BUNDLE_SLUG,
        "title": settings.BUNDLE_TITLE,
        "price": settings.BUNDLE_PRICE,
        "value": sum(c.price for c in courses),
        "mrp": sum((c.mrp or c.price) for c in courses),
        "courses": [{"slug": c.slug, "title": c.title, "price": c.price} for c in courses],
    }


@router.post("/create-order")
def create_order(data: CreateOrderRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    owned = _owned_ids(db, current_user)

    if data.bundle:
        courses = [
            c for c in db.query(Course).filter(Course.is_published == True, Course.price > 0).all()
            if c.id not in owned
        ]
        if not courses:
            raise HTTPException(status_code=400, detail="You already own every course")
        total = settings.BUNDLE_PRICE
        title = settings.BUNDLE_TITLE
        source = "bundle"
    else:
        q = db.query(Course).filter(Course.is_published == True)
        course = (q.filter(Course.slug == data.course_slug) if data.course_slug else q.filter(Course.id == data.course_id)).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        if course.id in owned:
            raise HTTPException(status_code=400, detail="Already enrolled in this course")
        courses = [course]
        total = course.price
        title = course.title
        source = "course"

    # Free course: enrol straight away.
    if total <= 0:
        course = courses[0]
        enrollment = db.query(Enrollment).filter(
            Enrollment.user_id == current_user.id, Enrollment.course_id == course.id
        ).first() or Enrollment(user_id=current_user.id, course_id=course.id)
        enrollment.payment_status = PaymentStatus.paid
        enrollment.amount_paid = 0
        enrollment.source = "free"
        db.add(enrollment)
        db.commit()
        return {"enrolled": True, "course_slugs": [course.slug]}

    amount_paise = int(round(total * 100))
    if settings.RAZORPAY_KEY_ID:
        client = RazorpayClient(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        rz_order = client.create_order(
            amount_paise,
            receipt=f"u{current_user.id}-{uuid.uuid4().hex[:10]}",
            notes={"user_id": str(current_user.id), "kind": source, "courses": ",".join(c.slug for c in courses)[:250]},
        )
        order_id = rz_order["id"]
    elif settings.ALLOW_DEV_PAYMENTS:
        order_id = f"order_dev_{uuid.uuid4().hex[:16]}"
    else:
        log.error("Checkout attempted but RAZORPAY_KEY_ID is not configured")
        raise HTTPException(status_code=503, detail="Online payments are being set up. Please try again shortly or contact support.")

    list_total = sum(c.price for c in courses) or 1
    for c in courses:
        enrollment = db.query(Enrollment).filter(
            Enrollment.user_id == current_user.id, Enrollment.course_id == c.id
        ).first()
        if not enrollment:
            enrollment = Enrollment(user_id=current_user.id, course_id=c.id)
            db.add(enrollment)
        enrollment.razorpay_order_id = order_id
        enrollment.payment_status = PaymentStatus.pending
        enrollment.amount_paid = round(total * c.price / list_total, 2)
        enrollment.source = source
    db.commit()

    return {
        "order_id": order_id,
        "amount": amount_paise,
        "currency": "INR",
        "key": settings.RAZORPAY_KEY_ID,
        "title": title,
        "dev": order_id.startswith("order_dev_"),
        "prefill": {"name": current_user.name, "email": current_user.email, "contact": current_user.phone or ""},
    }


@router.post("/verify")
def verify_payment(data: VerifyPaymentRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.razorpay_order_id == data.razorpay_order_id,
    ).all()
    if not enrollments:
        raise HTTPException(status_code=404, detail="Order not found")

    if data.razorpay_order_id.startswith("order_dev_"):
        if not settings.ALLOW_DEV_PAYMENTS:
            raise HTTPException(status_code=400, detail="Payment verification failed")
    else:
        client = RazorpayClient(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        if not client.verify_signature(data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature):
            for e in enrollments:
                if e.payment_status != PaymentStatus.paid:
                    e.payment_status = PaymentStatus.failed
            db.commit()
            raise HTTPException(status_code=400, detail="Payment verification failed")

    slugs = _mark_paid(enrollments, data.razorpay_payment_id)
    db.commit()
    return {"success": True, "course_slugs": slugs}


@router.post("/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Backup path: enrols the buyer even if their browser closed before /verify ran."""
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook not configured")
    body = await request.body()
    expected = hmac.new(settings.RAZORPAY_WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, request.headers.get("X-Razorpay-Signature", "")):
        raise HTTPException(status_code=400, detail="Invalid signature")

    event = json.loads(body)
    if event.get("event") not in ("payment.captured", "order.paid"):
        return {"ok": True}
    payment = event.get("payload", {}).get("payment", {}).get("entity", {})
    order_id = payment.get("order_id")
    if not order_id:
        return {"ok": True}
    enrollments = db.query(Enrollment).filter(Enrollment.razorpay_order_id == order_id).all()
    _mark_paid(enrollments, payment.get("id", ""))
    db.commit()
    return {"ok": True}


@router.get("/my-courses")
def my_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id, Enrollment.payment_status == PaymentStatus.paid
    ).all()
    done = {
        p.video_id for p in db.query(VideoProgress).filter(
            VideoProgress.user_id == current_user.id, VideoProgress.completed == True
        )
    }
    certs = {
        c.course_id: c.code for c in db.query(Certificate).filter(Certificate.user_id == current_user.id)
    }
    out = []
    for e in sorted(enrollments, key=lambda e: e.course.sort_order or 0):
        lesson_ids = [v.id for m in e.course.modules for v in m.videos]
        completed = sum(1 for i in lesson_ids if i in done)
        out.append({
            "course_id": e.course_id,
            "course_title": e.course.title,
            "course_slug": e.course.slug,
            "category": e.course.category,
            "thumbnail": e.course.thumbnail,
            "enrolled_at": e.enrolled_at,
            "lessons_total": len(lesson_ids),
            "lessons_completed": completed,
            "percent": round(100 * completed / len(lesson_ids)) if lesson_ids else 0,
            "certificate_code": certs.get(e.course_id),
        })
    return out
