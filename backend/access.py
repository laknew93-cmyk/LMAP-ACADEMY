from typing import Optional

from fastapi import Request
from sqlalchemy.orm import Session

from models import Course, Enrollment, Module, PaymentStatus, User, Video


def optional_user(request: Request, db: Session) -> Optional[User]:
    """User from a Bearer header or ?token= query param (needed for <video src>), else None."""
    from auth import get_current_user
    from fastapi.security import HTTPAuthorizationCredentials

    token = None
    header = request.headers.get("Authorization")
    if header and header.startswith("Bearer "):
        token = header[7:]
    elif request.query_params.get("token"):
        token = request.query_params["token"]
    if not token:
        return None
    try:
        return get_current_user(credentials=HTTPAuthorizationCredentials(scheme="Bearer", credentials=token), db=db)
    except Exception:
        return None


def is_enrolled(db: Session, user: User, course_id: int) -> bool:
    return db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == course_id,
        Enrollment.payment_status == PaymentStatus.paid,
    ).first() is not None


def lesson_course(db: Session, lesson: Video) -> Optional[Course]:
    return db.query(Course).join(Module).filter(Module.id == lesson.module_id).first()


def can_access_lesson(db: Session, lesson: Video, user: Optional[User]) -> bool:
    if lesson.is_preview:
        return True
    if user is None:
        return False
    if user.role.value == "admin":
        return True
    course = lesson_course(db, lesson)
    return course is not None and is_enrolled(db, user, course.id)
