from datetime import datetime
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models import Coupon


def apply_coupon(db: Session, code: Optional[str], target_slug: str, total: float) -> tuple[float, Optional[Coupon]]:
    """Return (discounted total, coupon). target_slug is a course slug or 'all-access'."""
    if not code:
        return total, None
    coupon = db.query(Coupon).filter(Coupon.code == code.strip().upper()).first()
    if not coupon or not coupon.is_active:
        raise HTTPException(status_code=400, detail="This coupon code is not valid")
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This coupon has expired")
    if coupon.max_uses and (coupon.used_count or 0) >= coupon.max_uses:
        raise HTTPException(status_code=400, detail="This coupon has been fully used")
    if coupon.course_slug and coupon.course_slug != target_slug:
        raise HTTPException(status_code=400, detail="This coupon doesn't apply to this course")
    if coupon.percent_off:
        discounted = total * (100 - coupon.percent_off) / 100
    else:
        discounted = total - (coupon.amount_off or 0)
    return max(0, round(discounted)), coupon
