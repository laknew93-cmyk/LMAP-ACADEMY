import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from access import is_enrolled
from auth import get_current_user
from database import get_db
from models import Certificate, Course, User, VideoProgress

router = APIRouter(prefix="/certificates", tags=["certificates"])


def _out(cert: Certificate) -> dict:
    return {
        "code": cert.code,
        "name": cert.user.name,
        "course_title": cert.course.title,
        "course_slug": cert.course.slug,
        "duration_hours": cert.course.duration_hours,
        "issued_at": cert.issued_at,
    }


@router.post("/{course_slug}")
def claim_certificate(course_slug: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.slug == course_slug).first()
    if not course or not is_enrolled(db, current_user, course.id):
        raise HTTPException(status_code=403, detail="You are not enrolled in this course")

    existing = db.query(Certificate).filter(
        Certificate.user_id == current_user.id, Certificate.course_id == course.id
    ).first()
    if existing:
        return _out(existing)

    lesson_ids = {v.id for m in course.modules for v in m.videos}
    done = {
        p.video_id for p in db.query(VideoProgress).filter(
            VideoProgress.user_id == current_user.id,
            VideoProgress.video_id.in_(lesson_ids),
            VideoProgress.completed == True,
        )
    }
    if not lesson_ids or done != lesson_ids:
        raise HTTPException(status_code=400, detail=f"Complete all lessons first ({len(done)}/{len(lesson_ids)} done)")

    cert = Certificate(code="LMAP-" + secrets.token_hex(4).upper(), user_id=current_user.id, course_id=course.id)
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return _out(cert)


@router.get("/verify/{code}")
def verify_certificate(code: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.code == code.upper()).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return _out(cert)
