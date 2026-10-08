# Duolingo Web App Clone

A full-stack Duolingo clone replicating Duolingo's playful design system, interactive multi-format lesson loop, and gamification mechanics (streaks, hearts, XP, and unlockable skill progression).

---

## Tech Stack

- **Frontend:** Next.js 15+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend:** Python 3.11+, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2
- **Database:** SQLite (Relational schema with cascade rules)

---

## Architecture & System Design

The application follows a decoupled client-server architecture:
1. **Frontend (Next.js):** Client components drive interactive exercise states (Word Bank word bank tap/untap, pair matching maps, typed translations).
2. **Backend (FastAPI):** Exposes high-throughput REST endpoints for lesson hierarchy, user profile, heart depletion, and progression updates.
3. **Database (SQLite):** File-based relational database mapped via SQLAlchemy ORM.

### Database Schema

- `users`: Stores user statistics (`xp`, `streak`, `hearts`, `gems`, `last_activity_date`).
- `courses` -> `units` -> `lessons`: 3-tier hierarchical curriculum structure.
- `exercises`: Exercises linked to a lesson with an `enum` type (`MULTIPLE_CHOICE`, `WORD_BANK`, `MATCH_PAIRS`, `TYPE_ANSWER`).
- `exercise_options`: Options linked to exercises with `pair_key` for matching pairs and `is_correct` flags.
- `user_lesson_progress`: Tracks completion and status (`LOCKED`, `AVAILABLE`, `COMPLETED`).

---

## Local Setup & Installation

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows Activate
.\venv\Scripts\Activate.ps1

# Install requirements
pip install fastapi uvicorn sqlalchemy pydantic

# Seed database
python seed.py

# Run API server
python -m uvicorn main:app --reload --port 8000
Backend runs at: http://localhost:8000 (Swagger docs at /docs)

2. Frontend Setup
Bash
cd frontend
npm install
npm run dev
Frontend runs at: http://localhost:3000

Core Features Implemented
Skill Tree / Snake Path: Mathematical sinusoidal curve layout representing lessons with AVAILABLE, LOCKED, and COMPLETED states.

Interactive Lesson Player: 4 distinct exercise categories (MCQ, Tap-to-assemble Word Bank, Pair Matching, Type Translation).

Signature Feedback Sheet: Green/Red animated drawer with sound/validation prompts.

Gamification:

Real-time hearts deduction and 0-hearts game-over modal with instant refill.

Streak preservation and increment logic evaluated on daily UTC boundaries.

XP awarding and automatic sequential unlocking of the next lesson.

Leaderboard & Profile: Gold league ranking with seeded learners + current user stats.