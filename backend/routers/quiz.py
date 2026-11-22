"""Final certificate test: 10 random questions from the course's bank, 70% to pass."""
import json
import os
import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from access import is_enrolled
from auth import get_current_user
from content_sync import CONTENT_DIR
from database import get_db
from models import Course, QuizAttempt, User, VideoProgress

router = APIRouter(prefix="/quiz", tags=["quiz"])

QUESTIONS_PER_TEST = 10
PASS_PERCENT = 70
MAX_FAILS_PER_DAY = 3


def load_bank(slug: str) -> list[dict]:
    path = os.path.join(CONTENT_DIR, slug, "quiz.json")
    if not os.path.isfile(path):
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def has_passed(db: Session, user: User, course: Course) -> bool:
    return db.query(QuizAttempt).filter(
        QuizAttempt.user_id == user.id, QuizAttempt.course_id == course.id, QuizAttempt.passed == True
    ).first() is not None


def _course_for(db: Session, user: User, slug: str) -> Course:
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course or not (is_enrolled(db, user, course.id) or user.role.value == "admin"):
        raise HTTPException(status_code=403, detail="You are not enrolled in this course")
    lesson_ids = {v.id for m in course.modules for v in m.videos}
    done = {p.video_id for p in db.query(VideoProgress).filter(
        VideoProgress.user_id == user.id, VideoProgress.video_id.in_(lesson_ids), VideoProgress.completed == True)}
    if user.role.value != "admin" and done != lesson_ids:
        raise HTTPException(status_code=400, detail=f"Complete all lessons before the final test ({len(done)}/{len(lesson_ids)} done)")
    return course


def _recent_fails(db: Session, user: User, course: Course) -> int:
    since = datetime.utcnow() - timedelta(hours=24)
    return db.query(QuizAttempt).filter(
        QuizAttempt.user_id == user.id, QuizAttempt.course_id == course.id,
        QuizAttempt.submitted_at >= since, QuizAttempt.passed == False,
    ).count()


@router.get("/{slug}")
def start_test(slug: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    course = _course_for(db, user, slug)
    bank = load_bank(slug)
    if not bank:
        return {"required": False}
    if has_passed(db, user, course):
        return {"required": True, "passed": True}
    if _recent_fails(db, user, course) >= MAX_FAILS_PER_DAY:
        raise HTTPException(status_code=429, detail="You've used today's 3 attempts. Review the lessons and try again tomorrow.")
    ids = sorted(random.sample(range(len(bank)), min(QUESTIONS_PER_TEST, len(bank))))
    attempt = QuizAttempt(user_id=user.id, course_id=course.id, question_ids=",".join(map(str, ids)))
    db.add(attempt)
    db.commit()
    return {
        "required": True, "passed": False, "attempt_id": attempt.id, "pass_percent": PASS_PERCENT,
        "attempts_left_today": MAX_FAILS_PER_DAY - _recent_fails(db, user, course),
        "questions": [{"id": i, "q": bank[i]["q"], "options": bank[i]["options"]} for i in ids],
    }


class Submission(BaseModel):
    attempt_id: int
    answers: dict[str, int]  # question id → chosen option index


@router.post("/{slug}")
def submit_test(slug: str, data: Submission, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    course = _course_for(db, user, slug)
    attempt = db.get(QuizAttempt, data.attempt_id)
    if not attempt or attempt.user_id != user.id or attempt.course_id != course.id:
        raise HTTPException(status_code=404, detail="Test not found. Please start again.")
    if attempt.submitted_at:
        raise HTTPException(status_code=400, detail="This test was already submitted. Start a new one.")
    bank = load_bank(slug)
    ids = [int(i) for i in attempt.question_ids.split(",")]
    results = []
    for i in ids:
        chosen = data.answers.get(str(i))
        correct = bank[i]["answer"]
        results.append({"id": i, "q": bank[i]["q"], "options": bank[i]["options"], "chosen": chosen,
                        "correct": correct, "explain": bank[i].get("explain", "")})
    score = sum(1 for r in results if r["chosen"] == r["correct"])
    attempt.score, attempt.total = score, len(ids)
    attempt.passed = score * 100 >= PASS_PERCENT * len(ids)
    attempt.submitted_at = datetime.utcnow()
    db.commit()
    if not attempt.passed:
        # Don't reveal answers on a fail: retries share the same question bank.
        results = [{"id": r["id"], "q": r["q"], "right": r["chosen"] == r["correct"]} for r in results]
    return {"score": score, "total": len(ids), "passed": attempt.passed, "pass_percent": PASS_PERCENT,
            "attempts_left_today": max(0, MAX_FAILS_PER_DAY - _recent_fails(db, user, course)), "results": results}
