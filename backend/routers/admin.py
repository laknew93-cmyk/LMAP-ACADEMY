import hmac
import os
import re
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Header, Request
from sqlalchemy.orm import Session
from content_sync import lesson_video_name, lesson_video_path
from database import get_db
from models import User, Course, Enrollment, Module, PaymentStatus, Video
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

    safe_name = f"course_{course_id}_{os.path.basename(file.filename).replace(' ', '_')}"
    file_path = os.path.join(THUMB_PATH, safe_name)

    async with aiofiles.open(file_path, "wb") as out:
        content = await file.read()
        await out.write(content)

    course.thumbnail = f"/thumbnails/{safe_name}"
    db.commit()
    return {"thumbnail": course.thumbnail}


@router.put("/lesson-video/{course_slug}/{lesson_stem}")
async def upload_lesson_video(
    course_slug: str,
    lesson_stem: str,
    request: Request,
    x_upload_token: str = Header(default=""),
    db: Session = Depends(get_db),
):
    """Store an MP4 for one lesson. The raw request body is the video file."""
    if not settings.VIDEO_UPLOAD_TOKEN or not hmac.compare_digest(x_upload_token, settings.VIDEO_UPLOAD_TOKEN):
        raise HTTPException(status_code=403, detail="Invalid upload token")
    if not re.fullmatch(r"[a-z0-9-]+", course_slug) or not re.fullmatch(r"[A-Za-z0-9_-]+", lesson_stem):
        raise HTTPException(status_code=400, detail="Bad course or lesson name")
    lesson = (
        db.query(Video).join(Module).join(Course)
        .filter(Course.slug == course_slug, Video.source_file == f"{lesson_stem}.md")
        .first()
    )
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    path = lesson_video_path(course_slug, f"{lesson_stem}.md")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".part"
    size = 0
    async with aiofiles.open(tmp, "wb") as out:
        async for chunk in request.stream():
            size += len(chunk)
            await out.write(chunk)
    if size < 1000:
        os.remove(tmp)
        raise HTTPException(status_code=400, detail="Empty upload")
    os.replace(tmp, path)

    lesson.filename = lesson_video_name(course_slug, f"{lesson_stem}.md")
    db.commit()
    return {"lesson_id": lesson.id, "filename": lesson.filename, "bytes": size}


@router.get("/lesson-videos")
def lesson_video_status(x_upload_token: str = Header(default=""), db: Session = Depends(get_db)):
    """Which lessons already have a video — used by the upload script to skip finished ones."""
    if not settings.VIDEO_UPLOAD_TOKEN or not hmac.compare_digest(x_upload_token, settings.VIDEO_UPLOAD_TOKEN):
        raise HTTPException(status_code=403, detail="Invalid upload token")
    rows = db.query(Video, Course.slug).select_from(Video).join(Module, Video.module_id == Module.id).join(Course, Module.course_id == Course.id).filter(Video.filename.isnot(None)).all()
    return sorted(f"{slug}/{v.source_file[:-3]}" for v, slug in rows if v.source_file)
