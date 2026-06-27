from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Course, Enrollment, PaymentStatus, User
from auth import get_current_user
from config import settings
from razorpay_client import RazorpayClient

router = APIRouter(prefix="/payments", tags=["payments"])


class CreateOrderRequest(BaseModel):
    course_id: int


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    course_id: int


@router.post("/create-order")
def create_order(data: CreateOrderRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == data.course_id, Course.is_published == True).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == course.id, Enrollment.payment_status == PaymentStatus.paid)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    amount_paise = int(course.price * 100)

    if not settings.RAZORPAY_KEY_ID:
        import uuid
        order_id = f"order_dev_{uuid.uuid4().hex[:16]}"
    else:
        client = RazorpayClient(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        rz_order = client.create_order(amount_paise, receipt=f"course_{course.id}_user_{current_user.id}")
        order_id = rz_order["id"]

    enrollment = db.query(Enrollment).filter(Enrollment.user_id == current_user.id, Enrollment.course_id == course.id).first()
    if enrollment:
        enrollment.razorpay_order_id = order_id
        enrollment.payment_status = PaymentStatus.pending
    else:
        enrollment = Enrollment(
            user_id=current_user.id,
            course_id=course.id,
            razorpay_order_id=order_id,
            payment_status=PaymentStatus.pending,
            amount_paid=course.price,
        )
        db.add(enrollment)
    db.commit()

    return {
        "order_id": order_id,
        "amount": amount_paise,
        "currency": "INR",
        "key": settings.RAZORPAY_KEY_ID,
        "course_title": course.title,
    }


@router.post("/verify")
def verify_payment(data: VerifyPaymentRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == data.course_id,
            Enrollment.razorpay_order_id == data.razorpay_order_id,
        )
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=404, detail="Order not found")

    if not settings.RAZORPAY_KEY_ID or data.razorpay_order_id.startswith("order_dev_"):
        enrollment.payment_status = PaymentStatus.paid
        enrollment.razorpay_payment_id = data.razorpay_payment_id
        db.commit()
        return {"success": True}

    client = RazorpayClient(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    if not client.verify_signature(data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature):
        enrollment.payment_status = PaymentStatus.failed
        db.commit()
        raise HTTPException(status_code=400, detail="Payment verification failed")

    enrollment.payment_status = PaymentStatus.paid
    enrollment.razorpay_payment_id = data.razorpay_payment_id
    db.commit()
    return {"success": True}


@router.get("/my-courses")
def my_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    enrollments = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == current_user.id, Enrollment.payment_status == PaymentStatus.paid)
        .all()
    )
    return [
        {
            "course_id": e.course_id,
            "course_title": e.course.title,
            "course_slug": e.course.slug,
            "thumbnail": e.course.thumbnail,
            "enrolled_at": e.enrolled_at,
        }
        for e in enrollments
    ]
