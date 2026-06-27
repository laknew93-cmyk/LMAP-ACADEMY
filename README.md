# LMAP Academy

AI-powered course platform for career re-entry and upskilling.

## Stack
- **Backend**: FastAPI + SQLite (PostgreSQL-ready) + JWT auth
- **Frontend**: React + Vite
- **Payments**: Razorpay (INR)
- **Video**: Built-in streaming

## Quick Start

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --port 8001 --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Seed courses
```bash
cd backend
python seed_courses.py
```

## Admin
Default admin: `admin@lmapacademy.com` / `Admin@LMAP2024`
