import os
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import User, Course, Enrollment, PaymentStatus
from auth import require_admin
from config import settings

router = APIRouter(prefix="/admin", tags=["admin"])

THUMB_PATH = os.path.join(settings.UPLOAD_DIR, "thumbnails")
os.makedirs(THUMB_PATH, exist_ok=True)


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    total_users = db.query(User).count()
    total_courses = db.query(Course).count()
    total_enrollments = db.query(Enrollment).filter(Enrollment.payment_status == PaymentStatus.paid).count()
    revenue = db.query(Enrollment).filter(Enrollment.payment_status == PaymentStatus.paid).all()
    total_revenue = sum(e.amount_paid or 0 for e in revenue)
    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_revenue": total_revenue,
    }


@router.get("/users")
def list_users(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    users = db.query(User).all()
    return [
        {"id": u.id, "name": u.name, "email": u.email, "role": u.role.value, "created_at": u.created_at}
        for u in users
    ]


@router.post("/thumbnail/{course_id}")
async def upload_thumbnail(course_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    safe_name = f"course_{course_id}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(THUMB_PATH, safe_name)

    async with aiofiles.open(file_path, "wb") as out:
        content = await file.read()
        await out.write(content)

    course.thumbnail = f"/thumbnails/{safe_name}"
    db.commit()
    return {"thumbnail": course.thumbnail}
