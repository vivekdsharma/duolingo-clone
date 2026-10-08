# Duolingo Web App Clone

A full-stack Duolingo clone featuring interactive lessons, sinusoidal skill tree, hearts, streaks, XP gamification, and leaderboards.

---

## Tech Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- Backend: Python, FastAPI, Uvicorn, SQLAlchemy, Pydantic
- Database: SQLite

---

## Local Setup

### 1. Backend Setup
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install fastapi uvicorn sqlalchemy pydantic
python seed.py
python -m uvicorn main:app --reload --port 8000

Backend API runs at: http://localhost:8000
Swagger Docs: http://localhost:8000/docs

### 2. Frontend Setup
cd frontend
npm install
npm run dev

Frontend runs at: http://localhost:3000

---

## Features
- Interactive Lesson Engine: Multiple Choice, Word Bank (Tap-to-assemble), Match Pairs, Type Translation
- Gamification: Streak calculation, Heart depletion on mistakes, XP rewards, Level completion celebration
- Skill Tree: Mathematical sinusoidal curve learning path with dynamic unlocked states
- Leaderboard & Profile: Gold League player rankings and personal statistics dashboard