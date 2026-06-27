import os
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Video, Module, Enrollment, PaymentStatus, VideoProgress, Course, User
from auth import get_current_user, require_admin
from config import settings

router = APIRouter(prefix="/videos", tags=["videos"])

UPLOAD_PATH = os.path.join(settings.UPLOAD_DIR, "videos")
os.makedirs(UPLOAD_PATH, exist_ok=True)


class VideoCreate(BaseModel):
    title: str
    description: str = ""
    order: int = 0
    is_preview: bool = False


def _user_can_watch(video: Video, user: Optional[User], db: Session) -> bool:
    if video.is_preview:
        return True
    if user is None:
        return False
    if user.role.value == "admin":
        return True
    course = db.query(Course).join(Module).filter(Module.id == video.module_id).first()
    if not course:
        return False
    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user.id, Enrollment.course_id == course.id, Enrollment.payment_status == PaymentStatus.paid)
        .first()
    )
    return enrollment is not None


@router.post("/module/{module_id}/upload")
async def upload_video(
    module_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    safe_name = f"{module_id}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_PATH, safe_name)

    async with aiofiles.open(file_path, "wb") as out:
        while chunk := await file.read(1024 * 1024):
            await out.write(chunk)

    return {"filename": safe_name, "path": file_path}


@router.post("/module/{module_id}")
def create_video_record(
    module_id: int,
    data: VideoCreate,
    filename: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    video = Video(module_id=module_id, filename=filename, **data.model_dump())
    db.add(video)
    db.commit()
    db.refresh(video)
    return {"id": video.id, "title": video.title}


@router.get("/{video_id}/stream")
async def stream_video(video_id: int, request: Request, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Try to get current user from optional auth header
    user = None
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        from auth import get_current_user as _gcu
        from fastapi.security import HTTPAuthorizationCredentials
        try:
            creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=auth[7:])
            user = _gcu(credentials=creds, db=db)
        except Exception:
            pass

    if not _user_can_watch(video, user, db):
        raise HTTPException(status_code=403, detail="Purchase the course to watch this video")

    file_path = os.path.join(UPLOAD_PATH, video.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video file not found")

    file_size = os.path.getsize(file_path)
    range_header = request.headers.get("Range")

    if range_header:
        start, end = 0, file_size - 1
        range_val = range_header.replace("bytes=", "")
        parts = range_val.split("-")
        start = int(parts[0]) if parts[0] else 0
        end = int(parts[1]) if parts[1] else file_size - 1
        end = min(end, file_size - 1)
        chunk_size = end - start + 1

        async def iter_file():
            async with aiofiles.open(file_path, "rb") as f:
                await f.seek(start)
                remaining = chunk_size
                while remaining > 0:
                    read_size = min(1024 * 1024, remaining)
                    data = await f.read(read_size)
                    if not data:
                        break
                    remaining -= len(data)
                    yield data

        return StreamingResponse(
            iter_file(),
            status_code=206,
            media_type="video/mp4",
            headers={
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(chunk_size),
            },
        )

    async def iter_full():
        async with aiofiles.open(file_path, "rb") as f:
            while chunk := await f.read(1024 * 1024):
                yield chunk

    return StreamingResponse(
        iter_full(),
        media_type="video/mp4",
        headers={"Accept-Ranges": "bytes", "Content-Length": str(file_size)},
    )


@router.post("/{video_id}/progress")
def update_progress(
    video_id: int,
    watched_seconds: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    prog = (
        db.query(VideoProgress)
        .filter(VideoProgress.user_id == current_user.id, VideoProgress.video_id == video_id)
        .first()
    )
    if prog:
        prog.watched_seconds = max(prog.watched_seconds, watched_seconds)
        prog.completed = watched_seconds >= (video.duration_seconds * 0.9)
    else:
        prog = VideoProgress(
            user_id=current_user.id,
            video_id=video_id,
            watched_seconds=watched_seconds,
            completed=watched_seconds >= (video.duration_seconds * 0.9),
        )
        db.add(prog)
    db.commit()
    return {"saved": True}
