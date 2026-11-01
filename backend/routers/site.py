import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from coupons import apply_coupon
from database import get_db
from models import Course, Lead
from site_settings import get_site_settings

router = APIRouter(prefix="/site", tags=["site"])


@router.get("/settings")
def public_settings(db: Session = Depends(get_db)):
    return get_site_settings(db)


class LeadIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    phone: str = Field(default="", max_length=30)
    email: str = Field(default="", max_length=200)
    interest: str = Field(default="", max_length=200)
    message: str = Field(default="", max_length=3000)
    source: str = Field(default="", max_length=300)
    website: str = ""  # honeypot: real visitors never fill this hidden field


@router.post("/leads")
def create_lead(data: LeadIn, db: Session = Depends(get_db)):
    if data.website:
        return {"ok": True}
    if len(re.sub(r"\D", "", data.phone)) < 10 and "@" not in data.email:
        raise HTTPException(status_code=400, detail="Please enter a valid phone number or email")
    db.add(Lead(**data.model_dump(exclude={"website"})))
    db.commit()
    return {"ok": True}


@router.get("/coupon")
def check_coupon(code: str, course_slug: Optional[str] = None, bundle: bool = False, db: Session = Depends(get_db)):
    """Preview a coupon at checkout: returns the discounted price."""
    if bundle:
        target, total = "all-access", get_site_settings(db)["bundle_price"]
    else:
        course = db.query(Course).filter(Course.slug == course_slug, Course.is_published == True).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        target, total = course.slug, course.price
    final, coupon = apply_coupon(db, code, target, total)
    return {"code": coupon.code, "original": total, "final": final, "saved": total - final}
