from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Course, Module, Video, Enrollment, PaymentStatus, CourseLevel, User
from auth import get_current_user, require_admin
import re

router = APIRouter(prefix="/courses", tags=["courses"])


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


class VideoOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    duration_seconds: int
    order: int
    is_preview: bool

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
    level: str
    thumbnail: Optional[str]
    duration_hours: float
    is_published: bool
    modules: list[ModuleOut] = []

    class Config:
        from_attributes = True


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


@router.get("/")
def list_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).filter(Course.is_published == True).all()
    return [CourseOut.model_validate(c) for c in courses]


@router.get("/all")
def list_all_courses(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    courses = db.query(Course).all()
    return [CourseOut.model_validate(c) for c in courses]


@router.get("/{slug}")
def get_course(slug: str, db: Session = Depends(get_db)):
    course = (
        db.query(Course)
        .options(joinedload(Course.modules).joinedload(Module.videos))
        .filter(Course.slug == slug, Course.is_published == True)
        .first()
    )
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseOut.model_validate(course)


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
    return CourseOut.model_validate(course)


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
    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == course.id, Enrollment.payment_status == PaymentStatus.paid)
        .first()
    )
    return {"enrolled": enrollment is not None}
