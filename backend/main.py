import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from auth import hash_password
from config import settings
from content_sync import sync_content
from database import SessionLocal, init_db
from models import User, UserRole
from routers import admin, auth, certificates, courses, lessons, payments, videos

log = logging.getLogger("lmap")

app = FastAPI(title="LMAP Academy API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(videos.router)
app.include_router(lessons.router)
app.include_router(payments.router)
app.include_router(certificates.router)
app.include_router(admin.router)

os.makedirs(os.path.join(settings.UPLOAD_DIR, "videos"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "thumbnails"), exist_ok=True)

app.mount("/thumbnails", StaticFiles(directory=os.path.join(settings.UPLOAD_DIR, "thumbnails")), name="thumbnails")


@app.on_event("startup")
def startup():
    init_db()
    db = SessionLocal()
    try:
        _seed_admin(db)
        if settings.SYNC_CONTENT:
            count = sync_content(db)
            log.warning("[LMAP] Synced %d courses from content folder", count)
    finally:
        db.close()


def _seed_admin(db):
    if not settings.ADMIN_PASSWORD:
        return
    if db.query(User).filter(User.email == settings.ADMIN_EMAIL).first():
        return
    db.add(User(
        name="LMAP Admin",
        email=settings.ADMIN_EMAIL,
        hashed_password=hash_password(settings.ADMIN_PASSWORD),
        role=UserRole.admin,
    ))
    db.commit()
    log.warning("[LMAP] Admin account created for %s", settings.ADMIN_EMAIL)


@app.get("/health")
def health():
    return {"status": "ok", "app": "LMAP Academy"}
