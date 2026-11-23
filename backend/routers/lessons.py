from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from access import can_access_lesson, lesson_course, optional_user
from auth import get_current_user
from database import get_db
from models import User, Video, VideoProgress
from site_settings import get_site_settings

router = APIRouter(prefix="/lessons", tags=["lessons"])


def min_study_seconds(lesson: Video) -> int:
    """Time a learner must spend on a lesson before it can be marked complete:
    half its estimated length, between 1 and 8 minutes."""
    return int(max(60, min(480, (lesson.duration_seconds or 0) * 0.5)))


def _unlock_in(prog: VideoProgress | None, lesson: Video) -> int:
    if prog and prog.completed:
        return 0
    if not prog or not prog.started_at:
        return min_study_seconds(lesson)
    elapsed = (datetime.utcnow() - prog.started_at).total_seconds()
    return max(0, int(min_study_seconds(lesson) - elapsed))


class CompleteRequest(BaseModel):
    completed: bool = True


@router.get("/{lesson_id}")
def get_lesson(lesson_id: int, request: Request, db: Session = Depends(get_db)):
    lesson = db.query(Video).filter(Video.id == lesson_id).first()
    course = lesson and lesson_course(db, lesson)
    if not lesson or not course or not course.is_published:
        raise HTTPException(status_code=404, detail="Lesson not found")
    user = optional_user(request, db)
    if not can_access_lesson(db, lesson, user):
        raise HTTPException(status_code=403, detail="Enroll in the course to read this lesson")
    unlock_in = 0
    if user and user.role.value != "admin" and get_site_settings(db)["lesson_timer"]:
        # Start the study clock the first time a signed-in learner opens the lesson.
        prog = db.query(VideoProgress).filter(VideoProgress.user_id == user.id, VideoProgress.video_id == lesson.id).first()
        if not prog:
            prog = VideoProgress(user_id=user.id, video_id=lesson.id, watched_seconds=0, completed=False)
            db.add(prog)
        if not prog.started_at:
            prog.started_at = datetime.utcnow()
            db.commit()
        unlock_in = _unlock_in(prog, lesson)
    return {
        "unlock_in": unlock_in,
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
    if data.completed and current_user.role.value != "admin" and get_site_settings(db)["lesson_timer"]:
        wait = _unlock_in(prog, lesson)
        if wait > 0:
            raise HTTPException(status_code=400, detail=f"Spend a little more time on this lesson first ({wait // 60}:{wait % 60:02d} left).")
    if not prog:
        prog = VideoProgress(user_id=current_user.id, video_id=lesson_id, watched_seconds=0)
        db.add(prog)
    prog.completed = data.completed
    prog.last_watched = datetime.utcnow()
    db.commit()
    return {"completed": prog.completed}
