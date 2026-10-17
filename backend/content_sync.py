"""Load course content from backend/content/courses into the database.

Each course folder holds a course.json plus markdown lessons (see content/COURSE_SPEC.md).
Courses are matched by slug, modules by position, lessons by position within a module, so
re-running the sync updates rows in place and keeps learners' progress and enrollments.
"""
import json
import os

from config import settings

from sqlalchemy.orm import Session

from models import Course, CourseLevel, Module, Video, VideoProgress

CONTENT_DIR = os.path.join(os.path.dirname(__file__), "content", "courses")


def lesson_video_name(course_slug: str, lesson_file: str) -> str:
    """Video path relative to UPLOAD_DIR/videos for a lesson, e.g. 'my-course/01-02-intro.mp4'."""
    return f"{course_slug}/{os.path.splitext(lesson_file)[0]}.mp4"


def lesson_video_path(course_slug: str, lesson_file: str) -> str:
    return os.path.join(settings.UPLOAD_DIR, "videos", lesson_video_name(course_slug, lesson_file))
DETAIL_KEYS = ("audience", "outcomes", "prerequisites", "tools", "projects", "faqs", "seo")
# Placeholder courses from the original seed script, replaced by the content folder.
LEGACY_SLUGS = (
    "ai-foundations-for-career-re-entry",
    "ai-for-business-freelancing",
    "no-code-ai-product-building",
    "ai-for-content-personal-branding",
    "data-ai-for-non-technical-professionals",
)


def load_catalog() -> list[dict]:
    """Return every course.json with each lesson's markdown attached as `content`."""
    if not os.path.isdir(CONTENT_DIR):
        return []
    catalog = []
    for slug in sorted(os.listdir(CONTENT_DIR)):
        manifest = os.path.join(CONTENT_DIR, slug, "course.json")
        if not os.path.isfile(manifest):
            continue
        with open(manifest, encoding="utf-8") as f:
            course = json.load(f)
        for module in course.get("modules", []):
            for lesson in module.get("lessons", []):
                path = os.path.join(CONTENT_DIR, slug, "lessons", lesson["file"])
                with open(path, encoding="utf-8") as f:
                    lesson["content"] = f.read()
        catalog.append(course)
    return catalog


def _delete_lessons(db: Session, lessons: list[Video]):
    for lesson in lessons:
        db.query(VideoProgress).filter(VideoProgress.video_id == lesson.id).delete()
        db.delete(lesson)


def sync_content(db: Session) -> int:
    catalog = load_catalog()
    if not catalog:
        return 0
    for data in catalog:
        course = db.query(Course).filter(Course.slug == data["slug"]).first()
        if not course:
            course = Course(slug=data["slug"], title=data["title"], price=data["price"])
            db.add(course)
        course.title = data["title"]
        course.short_description = data.get("subtitle", "")
        course.description = data.get("description", "")
        course.price = data["price"]
        course.mrp = data.get("mrp")
        course.category = data.get("category")
        course.level = CourseLevel(data.get("level", "beginner"))
        course.duration_hours = data.get("duration_hours", 0)
        course.sort_order = data.get("sort_order", 0)
        course.details = json.dumps({k: data.get(k) for k in DETAIL_KEYS})
        course.is_published = data.get("published", True)
        db.flush()

        modules = list(course.modules)
        for m_idx, m_data in enumerate(data.get("modules", [])):
            if m_idx < len(modules):
                module = modules[m_idx]
            else:
                module = Module(course_id=course.id, title=m_data["title"])
                db.add(module)
            module.title = m_data["title"]
            module.order = m_idx
            db.flush()

            lessons = list(module.videos)
            for l_idx, l_data in enumerate(m_data.get("lessons", [])):
                if l_idx < len(lessons):
                    lesson = lessons[l_idx]
                else:
                    lesson = Video(module_id=module.id, title=l_data["title"])
                    db.add(lesson)
                lesson.title = l_data["title"]
                lesson.summary = l_data.get("summary", "")
                lesson.content = l_data.get("content", "")
                lesson.duration_seconds = int(l_data.get("minutes", 0) * 60)
                lesson.is_preview = bool(l_data.get("preview", False))
                lesson.order = l_idx
                lesson.source_file = l_data["file"]
                # Videos live on disk under a name derived from the lesson file, so the link
                # survives a database reset.
                if os.path.isfile(lesson_video_path(data["slug"], l_data["file"])):
                    lesson.filename = lesson_video_name(data["slug"], l_data["file"])
            _delete_lessons(db, lessons[len(m_data.get("lessons", [])):])

        for module in modules[len(data.get("modules", [])):]:
            _delete_lessons(db, list(module.videos))
            db.delete(module)

    # Legacy courses stay in the DB (they may have enrollments) but leave the catalogue.
    for course in db.query(Course).filter(Course.slug.in_(LEGACY_SLUGS)).all():
        course.is_published = False
    db.commit()
    return len(catalog)
