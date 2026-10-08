# Duolingo Web App Clone

A full-stack functional clone of the Duolingo web application replicating Duolingo's signature playful design system, interactive multi-format lesson loop, and gamification mechanics (streaks, hearts, XP progression, and leaderboards).

---

## Live Links

- **Live Web Application:** [https://duolingo-clone-pi-livid.vercel.app/](https://duolingo-clone-pi-livid.vercel.app/)
- **Backend API Docs (Swagger):** [https://duolingo-api-3zp8.onrender.com/docs](https://duolingo-api-3zp8.onrender.com/docs)
- **GitHub Repository:** [https://github.com/vivekdsharma/duolingo-clone](https://github.com/vivekdsharma/duolingo-clone)

---

## 1. Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend:** Python, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2
- **Database:** SQLite (Relational schema with cascade integrity)
- **Deployment:** Vercel (Frontend), Render (Backend API)

---

## 2. Architecture Overview

The system follows a decoupled client-server architecture:

1. **Client Layer (Next.js):** - Manages interactive client-side exercise state machines (word-bank tap-to-assemble, pair-matching maps, open text typing).
   - Renders a mathematical sinusoidal S-curve skill path using horizontal vector offsets.
   - Triggers dynamic visual feedback (animated bottom sheets, hearts depletion modal, celebration confetti).

2. **REST API Service (FastAPI):**
   - Serves hierarchical course structures and randomized exercise options.
   - Handles server-side gamification calculations (daily streak validation against UTC timestamps, XP increment, next sequential lesson unlock).
   - Manages heart depletion and refill state transitions.

3. **Persistence Layer (SQLite + SQLAlchemy):**
   - File-based relational database mapped via SQLAlchemy ORM models with cascading relationships.

---

## 3. Database Schema

The database schema models curriculum hierarchies, exercise variations, and user progress:

- **`users`**: Stores user identity and persistent statistics (`id`, `username`, `xp`, `streak`, `hearts`, `gems`, `last_activity_date`).
- **`courses`**: Top-level language track (`id`, `title`, `description`).
- **`units`**: Thematic learning sections belonging to a course (`id`, `course_id`, `title`, `description`, `order_index`).
- **`lessons`**: Sequential learning modules (`id`, `unit_id`, `title`, `order_index`, `base_xp`).
- **`exercises`**: Question bank mapped to lessons (`id`, `lesson_id`, `type`, `prompt`, `correct_solution`, `order_index`).
  - Supported types: `MULTIPLE_CHOICE`, `WORD_BANK`, `MATCH_PAIRS`, `TYPE_ANSWER`.
- **`exercise_options`**: Options linked to exercises (`id`, `exercise_id`, `text`, `is_correct`, `pair_key`). The `pair_key` metadata enables bidirectional matching pair validation.
- **`user_lesson_progress`**: Junction table tracking learner progress per module (`id`, `user_id`, `lesson_id`, `status`, `completed_at`). Statuses: `LOCKED`, `AVAILABLE`, `COMPLETED`.

---

## 4. Assumptions & Mocked Data

1. **Authentication:** Assumes a default persistent session (User ID: 1) without requiring login/signup flows.
2. **Seeded Course:** Curriculum is pre-seeded with a starter Spanish language module featuring varied exercise mechanics.
3. **Leaderboard:** Ranks the active user against a seeded pool of simulated learners in the Gold League based on accumulated XP.
4. **Heart Regeneration:** Implemented an instant practice/refill loop when hearts hit zero rather than a delayed background timer.
5. **In-App Purchases & Audio:** Gems balance is mocked; audio/TTS and external purchase systems are left as placeholders per assignment guidelines.

---

## 5. Local Setup & Installation

### Backend Setup
1. cd backend
2. python -m venv venv
3. .\venv\Scripts\Activate.ps1   *(macOS/Linux: source venv/bin/activate)*
4. pip install fastapi uvicorn sqlalchemy pydantic
5. python seed.py
6. python -m uvicorn main:app --reload --port 8000

- Backend Base URL: http://localhost:8000
- Swagger UI Documentation: http://localhost:8000/docs

### Frontend Setup
1. cd frontend
2. npm install
3. npm run dev

- Frontend Web App: http://localhost:3000