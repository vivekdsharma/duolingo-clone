from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import engine, Base, get_db
import models

# App initialization
app = FastAPI(title="Duolingo Clone API", version="1.0.0")


# Enable CORS taaki Next.js frontend bina kisi restriction ke backend se baat kar sake
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PYDANTIC SCHEMAS -----------------
class HeartActionRequest(BaseModel):
    user_id: int = 1

class CompleteLessonRequest(BaseModel):
    user_id: int = 1

# ----------------- HELPER LOGIC (GAMIFICATION) -----------------
def calculate_streak(last_date: Optional[datetime], current_streak: int) -> int:
    """
    Streak Logic:
    - Same day lesson complete: Streak unchanged
    - Next day (diff == 1 day): Streak + 1
    - Missed 2+ days: Streak resets to 1
    """
    if not last_date:
        return 1
    
    today = datetime.now(timezone.utc).date()
    last = last_date.date()
    diff = (today - last).days

    if diff == 0:
        return max(1, current_streak)
    elif diff == 1:
        return current_streak + 1
    else:
        return 1

# ----------------- API ROUTES -----------------

@app.get("/")
def root():
    return {"message": "Duolingo Clone API is running"}

# 1. Get Current User Profile / Stats
@app.get("/api/user")
def get_user(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "username": user.username,
        "xp": user.xp,
        "streak": user.streak,
        "hearts": user.hearts,
        "gems": user.gems,
    }

# 2. Get Learning Path (Units, Lessons & Progress Status)
@app.get("/api/path")
def get_learning_path(user_id: int = 1, db: Session = Depends(get_db)):
    course = db.query(models.Course).first()
    if not course:
        raise HTTPException(status_code=404, detail="No course found")

    progress_map = {
        p.lesson_id: p.status
        for p in db.query(models.UserLessonProgress).filter_by(user_id=user_id).all()
    }

    units_data = []
    for unit in sorted(course.units, key=lambda u: u.order_index):
        lessons_data = []
        for lesson in sorted(unit.lessons, key=lambda l: l.order_index):
            status = progress_map.get(lesson.id, models.LessonStatus.LOCKED)
            lessons_data.append({
                "id": lesson.id,
                "title": lesson.title,
                "order_index": lesson.order_index,
                "base_xp": lesson.base_xp,
                "status": status,
            })
        units_data.append({
            "id": unit.id,
            "title": unit.title,
            "description": unit.description,
            "order_index": unit.order_index,
            "lessons": lessons_data,
        })

    return {
        "course_title": course.title,
        "units": units_data,
    }

# 3. Get Lesson Questions & Exercise Options
@app.get("/api/lessons/{lesson_id}")
def get_lesson_detail(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    exercises = []
    for ex in sorted(lesson.exercises, key=lambda e: e.order_index):
        exercises.append({
            "id": ex.id,
            "type": ex.type,
            "prompt": ex.prompt,
            "correct_solution": ex.correct_solution,
            "options": [
                {
                    "id": opt.id,
                    "text": opt.text,
                    "is_correct": opt.is_correct,
                    "pair_key": opt.pair_key,
                }
                for opt in ex.options
            ],
        })

    return {
        "id": lesson.id,
        "title": lesson.title,
        "base_xp": lesson.base_xp,
        "exercises": exercises,
    }

# 4. Deduct Heart (Wrong Answer)
@app.post("/api/user/deduct-heart")
def deduct_heart(payload: HeartActionRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hearts = max(0, user.hearts - 1)
    db.commit()
    return {"hearts": user.hearts}

# 5. Refill Hearts (Mocked Practice / Refill)
@app.post("/api/user/refill-hearts")
def refill_hearts(payload: HeartActionRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hearts = 5
    db.commit()
    return {"hearts": user.hearts}

# 6. Complete Lesson (Award XP, Update Streak, Unlock Next Lesson)
@app.post("/api/lessons/{lesson_id}/complete")
def complete_lesson(lesson_id: int, payload: CompleteLessonRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not user or not lesson:
        raise HTTPException(status_code=404, detail="User or Lesson not found")

    # Update Streak & XP
    user.streak = calculate_streak(user.last_activity_date, user.streak)
    user.xp += lesson.base_xp
    user.last_activity_date = datetime.now(timezone.utc)

    # Current lesson -> COMPLETED
    progress = db.query(models.UserLessonProgress).filter_by(
        user_id=user.id, lesson_id=lesson.id
    ).first()
    if not progress:
        progress = models.UserLessonProgress(user_id=user.id, lesson_id=lesson.id)
        db.add(progress)
    progress.status = models.LessonStatus.COMPLETED
    progress.completed_at = datetime.now(timezone.utc)

    # Unlock next lesson in sequence
    next_lesson = db.query(models.Lesson).filter(
        models.Lesson.unit_id == lesson.unit_id,
        models.Lesson.order_index == lesson.order_index + 1,
    ).first()

    if next_lesson:
        next_progress = db.query(models.UserLessonProgress).filter_by(
            user_id=user.id, lesson_id=next_lesson.id
        ).first()
        if not next_progress:
            next_progress = models.UserLessonProgress(
                user_id=user.id, lesson_id=next_lesson.id, status=models.LessonStatus.AVAILABLE
            )
            db.add(next_progress)
        elif next_progress.status == models.LessonStatus.LOCKED:
            next_progress.status = models.LessonStatus.AVAILABLE

    db.commit()

    return {
        "message": "Lesson completed successfully",
        "xp_earned": lesson.base_xp,
        "total_xp": user.xp,
        "streak": user.streak,
        "hearts": user.hearts,
    }

# 7. Leaderboard (Seeded mock players + current user)
@app.get("/api/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == 1).first()
    
    mock_players = [
        {"id": 991, "username": "Sofia", "xp": 450, "avatar": "🦉"},
        {"id": 992, "username": "Carlos", "xp": 310, "avatar": "🦊"},
        {"id": 993, "username": "Marco", "xp": 230, "avatar": "🐻"},
        {"id": 1, "username": user.username if user else "You", "xp": user.xp if user else 120, "avatar": "⭐", "is_user": True},
        {"id": 994, "username": "Elena", "xp": 90, "avatar": "🐼"},
    ]
    # Sort descending by XP
    ranked = sorted(mock_players, key=lambda p: p["xp"], reverse=True)
    return {"leaderboard": ranked}