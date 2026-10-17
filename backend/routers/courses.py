import json
import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session, joinedload

from access import is_enrolled
from auth import get_current_user, require_admin
from database import get_db
from models import Course, CourseLevel, Module, User, VideoProgress

router = APIRouter(prefix="/courses", tags=["courses"])


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


class VideoOut(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    duration_seconds: int
    order: int
    is_preview: bool
    has_video: bool = False

    class Config:
        from_attributes = True


class ModuleOut(BaseModel):
    id: int
    title: str
    order: int
    videos: list[VideoOut] = []

    class Config:
        from_attributes = True


class CourseOut(BaseModel):
    id: int
    title: str
    slug: str
    description: Optional[str]
    short_description: Optional[str]
    price: float
    mrp: Optional[float] = None
    category: Optional[str] = None
    level: str
    thumbnail: Optional[str]
    duration_hours: float
    is_published: bool
    sort_order: Optional[int] = 0
    details: dict = {}
    modules: list[ModuleOut] = []

    class Config:
        from_attributes = True

    @field_validator("details", mode="before")
    @classmethod
    def _parse_details(cls, v):
        return json.loads(v) if isinstance(v, str) and v else (v or {})


def course_out(course: Course) -> CourseOut:
    out = CourseOut.model_validate(course)
    for module, mod_out in zip(course.modules, out.modules):
        for video, vid_out in zip(module.videos, mod_out.videos):
            vid_out.has_video = bool(video.filename)
    return out


class CourseCreate(BaseModel):
    title: str
    description: str = ""
    short_description: str = ""
    price: float
    level: CourseLevel = CourseLevel.beginner
    duration_hours: float = 0


class ModuleCreate(BaseModel):
    title: str
    order: int = 0


def _published(db: Session, slug: str) -> Course:
    course = (
        db.query(Course)
        .options(joinedload(Course.modules).joinedload(Module.videos))
        .filter(Course.slug == slug, Course.is_published == True)
        .first()
    )
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/")
def list_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).filter(Course.is_published == True).order_by(Course.sort_order, Course.id).all()
    return [course_out(c) for c in courses]


@router.get("/all")
def list_all_courses(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    return [course_out(c) for c in db.query(Course).order_by(Course.sort_order, Course.id).all()]


@router.get("/{slug}")
def get_course(slug: str, db: Session = Depends(get_db)):
    return course_out(_published(db, slug))


@router.post("/")
def create_course(data: CourseCreate, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    slug = slugify(data.title)
    base_slug = slug
    counter = 1
    while db.query(Course).filter(Course.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    course = Course(**data.model_dump(), slug=slug)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course_out(course)


@router.put("/{course_id}/publish")
def publish_course(course_id: int, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.is_published = not course.is_published
    db.commit()
    return {"is_published": course.is_published}


@router.post("/{course_id}/modules")
def add_module(course_id: int, data: ModuleCreate, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    module = Module(course_id=course_id, **data.model_dump())
    db.add(module)
    db.commit()
    db.refresh(module)
    return {"id": module.id, "title": module.title, "order": module.order}


@router.get("/{slug}/enrolled")
def check_enrollment(slug: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    enrolled = is_enrolled(db, current_user, course.id) or current_user.role.value == "admin"
    return {"enrolled": enrolled}


@router.get("/{slug}/progress")
def course_progress(slug: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = _published(db, slug)
    lesson_ids = [v.id for m in course.modules for v in m.videos]
    done = [
        p.video_id for p in db.query(VideoProgress).filter(
            VideoProgress.user_id == current_user.id,
            VideoProgress.video_id.in_(lesson_ids),
            VideoProgress.completed == True,
        )
    ]
    total = len(lesson_ids)
    return {
        "completed": done,
        "total": total,
        "percent": round(100 * len(done) / total) if total else 0,
    }
