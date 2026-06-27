from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from database import init_db
from config import settings
from routers import auth, courses, videos, payments, admin
from models import User, UserRole
from auth import hash_password

app = FastAPI(title="LMAP Academy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(videos.router)
app.include_router(payments.router)
app.include_router(admin.router)

os.makedirs(os.path.join(settings.UPLOAD_DIR, "videos"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "thumbnails"), exist_ok=True)

app.mount("/thumbnails", StaticFiles(directory=os.path.join(settings.UPLOAD_DIR, "thumbnails")), name="thumbnails")


@app.on_event("startup")
def startup():
    init_db()
    _seed_admin()


def _seed_admin():
    from database import SessionLocal
    db = SessionLocal()
    try:
        admin_email = "admin@lmapacademy.com"
        if not db.query(User).filter(User.email == admin_email).first():
            admin = User(
                name="LMAP Admin",
                email=admin_email,
                hashed_password=hash_password("Admin@LMAP2024"),
                role=UserRole.admin,
            )
            db.add(admin)
            db.commit()
            print(f"[LMAP] Admin created: {admin_email} / Admin@LMAP2024")
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok", "app": "LMAP Academy"}
