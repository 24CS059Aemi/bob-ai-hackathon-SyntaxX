# Setup Guide

> **This file is read by the automated evaluation pipeline. Be precise and complete.**

## Prerequisites

Before you begin, ensure you have the following installed:

- [ ] Python 3.11+  (`python --version`)
- [ ] Node.js 18+   (`node --version`)
- [ ] npm 9+        (`npm --version`)
- No Docker required — uses SQLite by default

## Quick Start (2 commands)

```bash
# 1. Start backend (auto-seeds data on first run)
cd src/backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# 2. Start frontend (in a new terminal)
cd src/frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

Copy `.env.example` to `.env` in `src/` and fill in values.

| Variable | Description | Required |
|---|---|---|
| `WATSONX_API_KEY` | IBM watsonx.ai API key | No — app works without it |
| `WATSONX_PROJECT_ID` | IBM watsonx.ai project ID | No |
| `WATSONX_URL` | watsonx.ai endpoint URL | No |
| `DATABASE_URL` | PostgreSQL connection string | No — defaults to SQLite |
| `VITE_API_URL` | Backend URL seen by React | No — defaults to `http://localhost:8000` |

> ⚠️ Without `WATSONX_API_KEY`, the Bob AI Advisor panel uses rule-based text. All other features work fully.

```bash
cd src
cp .env.example .env
# Edit .env if you have watsonx.ai credentials
```

---

## Detailed Installation

### Backend

```bash
cd src/backend

# Install dependencies
pip install -r requirements.txt

# Start server (tables + seed data created automatically on first startup)
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd src/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Dashboard available at `http://localhost:5173`.

---

## Seeding Data Manually

To seed the database and see a terminal summary before starting the server:

```bash
cd src/backend
python -m app.data.seed
```

Or use the standalone demo script:

```bash
cd src/backend
python ../../demo/seed_demo_data.py
```

---

## Running Tests

```bash
cd src/backend
pip install -r requirements.txt
pytest tests/ -v
```

All tests use an in-memory SQLite database — no running server required.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/assets` | List all 15 grid assets |
| GET | `/assets/{id}` | Single asset details |
| GET | `/assets/{id}/sensors` | Sensor readings (7-day default) |
| GET | `/risk/ranking` | Ranked asset list with risk scores |
| GET | `/risk/zones` | Zone-level risk aggregation |
| GET | `/risk/summary` | Dashboard summary counts |
| GET | `/maintenance/plan` | Prioritised maintenance actions |
| GET | `/crew/positioning` | Crew assignment and staging |
| POST | `/bob/briefing` | AI-generated operational briefing |
| GET | `/bob/explain/{id}` | AI explanation for one asset |

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` in `src/backend/` |
| Port 8000 already in use | `uvicorn app.main:app --reload --port 8001` then set `VITE_API_URL=http://localhost:8001` |
| Frontend shows "Backend Not Running" | Confirm backend is running: `curl http://localhost:8000/health` |
| `npm install` fails | Ensure Node.js 18+: `node --version` |
| Tests fail with import errors | Run pytest from `src/backend/`: `cd src/backend && pytest tests/ -v` |
| watsonx.ai 401 error | Check `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` in `.env`; app works without them |
| Database already seeded message | Normal — seed script skips if data exists; delete `grid_advisor.db` to re-seed |
