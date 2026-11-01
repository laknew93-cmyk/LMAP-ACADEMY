"""Admin panel API: students, sales, leads, courses, coupons and site settings."""
import csv
import io
import json
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import require_admin
from content_sync import LEGACY_SLUGS, apply_overrides
from database import get_db
from models import Certificate, Coupon, Course, Enrollment, Lead, PaymentStatus, User, VideoProgress
from site_settings import get_site_settings, update_site_settings

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


def _iso(dt):
    return dt.isoformat() if dt else None


def _paid(db: Session):
    return db.query(Enrollment).filter(Enrollment.payment_status == PaymentStatus.paid)


# ------------------------------------------------------------------ overview

@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    paid = _paid(db).all()
    since = datetime.utcnow() - timedelta(days=30)
    revenue = sum(e.amount_paid or 0 for e in paid)
    by_course = defaultdict(lambda: {"students": 0, "revenue": 0.0})
    for e in paid:
        by_course[e.course.title]["students"] += 1
        by_course[e.course.title]["revenue"] += e.amount_paid or 0
    orders = _orders(paid)
    return {
        "users": db.query(User).count(),
        "paying_students": len({e.user_id for e in paid if (e.amount_paid or 0) > 0}),
        "enrollments": len(paid),
        "revenue": round(revenue, 2),
        "revenue_30d": round(sum(e.amount_paid or 0 for e in paid if e.enrolled_at and e.enrolled_at >= since), 2),
        "orders": len([o for o in orders if o["amount"] > 0]),
        "new_leads": db.query(Lead).filter(Lead.status == "new").count(),
        "certificates": db.query(Certificate).count(),
        "by_course": sorted(({"course": k, **v} for k, v in by_course.items()), key=lambda r: -r["revenue"]),
        "recent_sales": [o for o in orders if o["amount"] > 0][:8],
    }


# ------------------------------------------------------------------ students & sales

def _students(db: Session, q: str = ""):
    done = defaultdict(set)
    for p in db.query(VideoProgress).filter(VideoProgress.completed == True):
        done[p.user_id].add(p.video_id)
    certs = {(c.user_id, c.course_id): c.code for c in db.query(Certificate)}
    rows = []
    users = db.query(User).order_by(User.created_at.desc()).all()
    for u in users:
        if q and q.lower() not in f"{u.name} {u.email} {u.phone or ''}".lower():
            continue
        courses = []
        for e in u.enrollments:
            if e.payment_status != PaymentStatus.paid:
                continue
            ids = [v.id for m in e.course.modules for v in m.videos]
            courses.append({
                "slug": e.course.slug, "title": e.course.title, "source": e.source,
                "amount": e.amount_paid or 0, "enrolled_at": _iso(e.enrolled_at),
                "percent": round(100 * len(done[u.id] & set(ids)) / len(ids)) if ids else 0,
                "certificate": certs.get((u.id, e.course_id)),
            })
        rows.append({
            "id": u.id, "name": u.name, "email": u.email, "phone": u.phone or "", "role": u.role.value,
            "joined": _iso(u.created_at), "courses": courses,
            "total_paid": round(sum(c["amount"] for c in courses), 2),
        })
    return rows


@router.get("/students")
def students(q: str = "", db: Session = Depends(get_db)):
    return _students(db, q)


def _orders(enrollments):
    """Group enrollments into orders (a bundle purchase is one order covering many courses)."""
    groups = defaultdict(list)
    for e in enrollments:
        groups[e.razorpay_order_id or f"enrollment-{e.id}"].append(e)
    orders = []
    for key, items in groups.items():
        first = items[0]
        orders.append({
            "order_id": first.razorpay_order_id or "",
            "payment_id": first.razorpay_payment_id or "",
            "date": _iso(first.enrolled_at),
            "student": first.user.name, "email": first.user.email, "phone": first.user.phone or "",
            "type": first.source or "course",
            "courses": ", ".join(e.course.title for e in items) if len(items) < 3 else f"All-Access ({len(items)} courses)",
            "amount": round(sum(e.amount_paid or 0 for e in items), 2),
            "coupon": first.coupon_code or "",
            "note": first.note or "",
        })
    return sorted(orders, key=lambda o: o["date"] or "", reverse=True)


@router.get("/sales")
def sales(db: Session = Depends(get_db)):
    return _orders(_paid(db).all())


def _csv(rows: list[dict], filename: str):
    buf = io.StringIO()
    buf.write("﻿")  # BOM so Excel opens UTF-8 (₹, names) correctly
    if rows:
        writer = csv.DictWriter(buf, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.get("/export/{kind}")
def export(kind: str, db: Session = Depends(get_db)):
    stamp = datetime.utcnow().strftime("%Y%m%d")
    if kind == "students":
        rows = [{
            "Name": s["name"], "Email": s["email"], "Phone": s["phone"], "Joined": s["joined"],
            "Courses": "; ".join(f"{c['title']} ({c['percent']}%)" for c in s["courses"]),
            "Total paid (INR)": s["total_paid"],
        } for s in _students(db)]
    elif kind == "sales":
        rows = [{
            "Date": o["date"], "Student": o["student"], "Email": o["email"], "Phone": o["phone"],
            "Courses": o["courses"], "Type": o["type"], "Amount (INR)": o["amount"], "Coupon": o["coupon"],
            "Razorpay payment ID": o["payment_id"], "Razorpay order ID": o["order_id"], "Note": o["note"],
        } for o in _orders(_paid(db).all())]
    elif kind == "leads":
        rows = [{
            "Date": _iso(l.created_at), "Name": l.name, "Phone": l.phone, "Email": l.email,
            "Interest": l.interest, "Message": l.message, "Status": l.status, "Notes": l.notes or "",
            "Source page": l.source,
        } for l in db.query(Lead).order_by(Lead.created_at.desc())]
    else:
        raise HTTPException(status_code=404, detail="Unknown export")
    return _csv(rows, f"lmap-{kind}-{stamp}.csv")


class ManualEnroll(BaseModel):
    email: str
    course_slug: Optional[str] = None
    bundle: bool = False
    amount: float = 0
    note: str = ""


@router.post("/enroll")
def manual_enroll(data: ManualEnroll, db: Session = Depends(get_db)):
    """Give a student access after an offline payment (UPI, bank transfer, cash) or as a gift."""
    user = db.query(User).filter(User.email == data.email.strip().lower()).first() \
        or db.query(User).filter(User.email == data.email.strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account with that email. Ask the student to register first.")
    if data.bundle:
        courses = db.query(Course).filter(Course.is_published == True, Course.price > 0).all()
    else:
        course = db.query(Course).filter(Course.slug == data.course_slug).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        courses = [course]
    order_id = f"manual_{int(datetime.utcnow().timestamp())}_{user.id}"
    list_total = sum(c.price for c in courses) or 1
    for c in courses:
        e = db.query(Enrollment).filter(Enrollment.user_id == user.id, Enrollment.course_id == c.id).first() \
            or Enrollment(user_id=user.id, course_id=c.id)
        e.payment_status = PaymentStatus.paid
        e.source = "manual"
        e.razorpay_order_id = order_id
        e.amount_paid = round(data.amount * (c.price / list_total if len(courses) > 1 else 1), 2)
        e.note = data.note[:500]
        e.enrolled_at = datetime.utcnow()
        db.add(e)
    db.commit()
    return {"enrolled": [c.slug for c in courses], "student": user.email}


class Revoke(BaseModel):
    email: str
    course_slug: str


@router.post("/revoke")
def revoke(data: Revoke, db: Session = Depends(get_db)):
    """Remove access, e.g. after a refund."""
    e = db.query(Enrollment).join(User).join(Course).filter(
        User.email == data.email.strip(), Course.slug == data.course_slug
    ).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    e.payment_status = PaymentStatus.refunded
    db.commit()
    return {"ok": True}


# ------------------------------------------------------------------ leads

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


@router.get("/leads")
def leads(db: Session = Depends(get_db)):
    return [{
        "id": l.id, "name": l.name, "phone": l.phone, "email": l.email, "interest": l.interest,
        "message": l.message, "source": l.source, "status": l.status, "notes": l.notes or "",
        "created_at": _iso(l.created_at),
    } for l in db.query(Lead).order_by(Lead.created_at.desc())]


@router.patch("/leads/{lead_id}")
def update_lead(lead_id: int, data: LeadUpdate, db: Session = Depends(get_db)):
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if data.status in ("new", "contacted", "converted", "closed"):
        lead.status = data.status
    if data.notes is not None:
        lead.notes = data.notes[:3000]
    db.commit()
    return {"ok": True}


@router.delete("/leads/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.get(Lead, lead_id)
    if lead:
        db.delete(lead)
        db.commit()
    return {"ok": True}


# ------------------------------------------------------------------ courses

class CourseEdit(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    price: Optional[float] = None
    mrp: Optional[float] = None
    is_published: Optional[bool] = None


@router.get("/courses")
def admin_courses(db: Session = Depends(get_db)):
    paid = defaultdict(lambda: [0, 0.0])
    for e in _paid(db):
        paid[e.course_id][0] += 1
        paid[e.course_id][1] += e.amount_paid or 0
    return [{
        "slug": c.slug, "title": c.title, "subtitle": c.short_description, "price": c.price, "mrp": c.mrp,
        "is_published": c.is_published, "category": c.category,
        "lessons": sum(len(m.videos) for m in c.modules),
        "students": paid[c.id][0], "revenue": round(paid[c.id][1], 2),
        "edited": bool(json.loads(c.overrides or "{}")),
    } for c in db.query(Course).filter(Course.slug.notin_(LEGACY_SLUGS)).order_by(Course.sort_order, Course.id)]


@router.patch("/courses/{slug}")
def edit_course(slug: str, data: CourseEdit, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    overrides = json.loads(course.overrides or "{}")
    overrides.update({k: v for k, v in data.model_dump().items() if v is not None})
    if overrides.get("price") is not None and overrides["price"] < 0:
        raise HTTPException(status_code=400, detail="Price can't be negative")
    course.overrides = json.dumps(overrides)
    apply_overrides(course)
    db.commit()
    return {"ok": True}


@router.delete("/courses/{slug}/overrides")
def reset_course(slug: str, db: Session = Depends(get_db)):
    """Drop admin edits; the content files apply again on the next restart."""
    course = db.query(Course).filter(Course.slug == slug).first()
    if course:
        course.overrides = None
        db.commit()
    return {"ok": True}


# ------------------------------------------------------------------ coupons

class CouponIn(BaseModel):
    code: str
    percent_off: Optional[int] = None
    amount_off: Optional[float] = None
    course_slug: Optional[str] = None
    max_uses: Optional[int] = None
    expires_at: Optional[datetime] = None
    is_active: bool = True


def _coupon_out(c: Coupon):
    return {
        "id": c.id, "code": c.code, "percent_off": c.percent_off, "amount_off": c.amount_off,
        "course_slug": c.course_slug or "", "max_uses": c.max_uses, "used_count": c.used_count or 0,
        "expires_at": _iso(c.expires_at), "is_active": c.is_active,
    }


@router.get("/coupons")
def coupons(db: Session = Depends(get_db)):
    return [_coupon_out(c) for c in db.query(Coupon).order_by(Coupon.created_at.desc())]


@router.post("/coupons")
def create_coupon(data: CouponIn, db: Session = Depends(get_db)):
    code = data.code.strip().upper()
    if not code.replace("-", "").replace("_", "").isalnum():
        raise HTTPException(status_code=400, detail="Use letters, numbers, - or _ in coupon codes")
    if bool(data.percent_off) == bool(data.amount_off):
        raise HTTPException(status_code=400, detail="Set either a percent or a rupee discount")
    if data.percent_off and not 1 <= data.percent_off <= 100:
        raise HTTPException(status_code=400, detail="Percent must be between 1 and 100")
    if db.query(Coupon).filter(Coupon.code == code).first():
        raise HTTPException(status_code=400, detail="That code already exists")
    coupon = Coupon(**{**data.model_dump(), "code": code, "course_slug": data.course_slug or None})
    db.add(coupon)
    db.commit()
    return _coupon_out(coupon)


@router.patch("/coupons/{coupon_id}")
def toggle_coupon(coupon_id: int, data: dict, db: Session = Depends(get_db)):
    coupon = db.get(Coupon, coupon_id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    if "is_active" in data:
        coupon.is_active = bool(data["is_active"])
    db.commit()
    return _coupon_out(coupon)


@router.delete("/coupons/{coupon_id}")
def delete_coupon(coupon_id: int, db: Session = Depends(get_db)):
    coupon = db.get(Coupon, coupon_id)
    if coupon:
        db.delete(coupon)
        db.commit()
    return {"ok": True}


# ------------------------------------------------------------------ settings

@router.get("/settings")
def get_settings_admin(db: Session = Depends(get_db)):
    return get_site_settings(db)


@router.put("/settings")
def put_settings(data: dict, db: Session = Depends(get_db)):
    return update_site_settings(db, data)
