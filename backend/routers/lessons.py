from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from access import can_access_lesson, lesson_course, optional_user
from auth import get_current_user
from database import get_db
from models import User, Video, VideoProgress

router = APIRouter(prefix="/lessons", tags=["lessons"])


class CompleteRequest(BaseModel):
    completed: bool = True


@router.get("/{lesson_id}")
def get_lesson(lesson_id: int, request: Request, db: Session = Depends(get_db)):
    lesson = db.query(Video).filter(Video.id == lesson_id).first()
    course = lesson and lesson_course(db, lesson)
    if not lesson or not course or not course.is_published:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if not can_access_lesson(db, lesson, optional_user(request, db)):
        raise HTTPException(status_code=403, detail="Enroll in the course to read this lesson")
    return {
        "id": lesson.id,
        "title": lesson.title,
        "summary": lesson.summary,
        "content": lesson.content or "",
        "has_video": bool(lesson.filename),
        "duration_seconds": lesson.duration_seconds,
        "course_slug": course.slug,
    }


@router.post("/{lesson_id}/complete")
def mark_complete(
    lesson_id: int,
    data: CompleteRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = db.query(Video).filter(Video.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if not can_access_lesson(db, lesson, current_user):
        raise HTTPException(status_code=403, detail="Enroll in the course first")
    prog = db.query(VideoProgress).filter(
        VideoProgress.user_id == current_user.id, VideoProgress.video_id == lesson_id
    ).first()
    if not prog:
        prog = VideoProgress(user_id=current_user.id, video_id=lesson_id, watched_seconds=0)
        db.add(prog)
    prog.completed = data.completed
    prog.last_watched = datetime.utcnow()
    db.commit()
    return {"completed": prog.completed}
