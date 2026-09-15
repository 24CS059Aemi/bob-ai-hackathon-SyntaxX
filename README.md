# 🚀 Power Outage Prediction & Grid Equipment Failure Advisor

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | SyntaxX |
| **Track** | AI |
| **Team Lead** | Anshi Ladani — 24cs044@charusat.edu.in |
| **Members** | Aemi Patel, Suyanshi Patel, Drashti Patel |

---

## 🎯 Problem Statement

Electric utility operators manage hundreds of aging transformers, substations, and feeders spread across multiple geographic zones — yet most maintenance decisions are still reactive, triggered only after a failure occurs. When a transformer overheats or a substation's insulation degrades undetected, the result is an unplanned outage that can cut power to tens of thousands of customers, cost millions in emergency restoration, and create public safety risks. The core challenge is that sensor data, weather forecasts, and incident history all exist in silos — no single tool fuses them into an actionable, prioritised risk picture that field operations teams can act on in real time.

---

## 💡 Solution

We built a **Bob-powered Grid Equipment Failure Advisor** — an AI-driven operational intelligence platform that continuously ingests transformer and substation sensor readings, overlays real-time weather risk forecasts, and analyses three years of historical incident patterns to compute a composite risk score for every grid asset. The system automatically ranks all equipment by outage likelihood and impact severity, then generates a prioritised maintenance action plan and optimal crew pre-positioning schedule. IBM Bob provides plain-English operational briefings and per-asset risk explanations via watsonx.ai Granite, making complex sensor data immediately understandable for grid operations managers.

---

## ✨ Key Features

- **AI Risk Scoring Engine** — Composite risk formula (IEEE C57.91 / IEC 60270 / ISO 10816 grounded) fuses temperature, vibration, partial discharge, oil quality, load percentage, weather risk and historical incident rate into a single 0–100 priority score per asset.
- **Zone Risk Heatmap** — Real-time geographic view of 5 grid zones colour-coded Critical / High / Medium / Low, showing which areas need immediate attention.
- **Prioritised Maintenance Plan** — Auto-generates one maintenance action per asset with specific deadlines (4 hrs for Critical → 30 days for Low), required skill sets, and estimated durations.
- **Skill-Matched Crew Pre-positioning** — Greedy dispatch algorithm assigns field crews to highest-priority assets using travel-time optimisation + skill-match scoring to minimise response time.
- **IBM Bob AI Briefing** — One-click operational morning briefing and per-asset risk explanation powered by watsonx.ai Granite (automatic rule-based fallback when credentials are not set).
- **Live Sensor Sparklines** — Click any asset in the risk table to view 7-day sensor trend charts for temperature, vibration, partial discharge, oil quality and load.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.11, TypeScript |
| **Frameworks** | FastAPI, React 18, Tailwind CSS, Recharts |
| **IBM Technologies** | IBM Bob (skill + in-IDE advisor), watsonx.ai Granite-13b (optional) |
| **Databases** | SQLite (zero-infra, auto-seeded on first run) |
| **Other** | Docker, Vite, GitHub Actions, Render |

---

## 📁 Repository Structure

```
├── src/                  # All source code
│   ├── backend/          # FastAPI Python backend
│   │   ├── app/
│   │   │   ├── engine/   # Risk scorer, asset ranker, crew, maintenance
│   │   │   ├── bob/      # watsonx.ai advisor + prompt templates
│   │   │   ├── routes/   # API endpoints
│   │   │   └── data/     # Synthetic data generator + live simulator
│   │   └── tests/        # 43 pytest tests
│   └── frontend/         # React + Vite + Tailwind frontend
├── docs/                 # Written documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/      # App screenshots
│   └── demo-video-link.txt
├── presentation/         # Slide deck
└── submission.yaml       # Structured submission metadata
```

---

## ⚡ How to Run

### Option A — One command (Docker)
```bash
docker-compose up --build
# Open http://localhost:8000
```

### Option B — Local dev (two terminals)
```bash
# Terminal 1 — backend API
cd src/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend dev server
cd src/frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Option C — Render (live, free, permanent URL)
Already deployed — see live demo link below. To redeploy your own instance, connect this repo on [render.com](https://render.com) — `render.yaml` configures everything automatically.

### Optional — IBM watsonx.ai
```bash
cp src/.env.example src/.env
# Set WATSONX_API_KEY and WATSONX_PROJECT_ID
# App works fully in rule-based mode without credentials
```

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [Watch on Google Drive](https://drive.google.com/file/d/1uU-o5FC7WdDRw2NWhvz_sDAwqwkYSie6/view?usp=sharing) · [Link file](demo/demo-video-link.txt) |
| 🌐 Live Demo | [https://grid-advisor-yipp.onrender.com](https://grid-advisor-yipp.onrender.com) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

- **Synthetic data only** — All sensor readings, weather forecasts and incidents are procedurally generated using IEEE/IEC-grounded parameters. Real deployment would require integration with live SCADA/DMS feeds and validated threshold calibration per utility.
- **Single-user, no authentication** — The dashboard has no login or role-based access control. Production use would need secure multi-user access management.
- **SQLite in-process storage** — Suitable for demo and single-instance deployments. High-availability production use would require PostgreSQL and a proper migration strategy.
- **watsonx.ai is optional** — The AI briefing falls back to rule-based templates when IBM credentials are not configured. The rule-based output is functional but less nuanced than the Granite model.
- **Free-tier Render cold starts** — The live demo may take up to 50 seconds to respond after a period of inactivity (Render free tier spin-down behaviour).

---

## 🏅 What We're Most Proud Of

The strongest part of our submission is the **end-to-end AI risk pipeline** that we built from first principles — grounded in real IEEE C57.91, IEC 60270, and ISO 10816 standards. Rather than using a black-box model, we designed a transparent, explainable composite scoring formula that field engineers can trust and audit. Every risk score traces directly back to measurable sensor readings, weather signals, and historical incident rates.

We are also proud of how tightly IBM Bob is integrated: Bob doesn't just answer questions — it generates an actionable morning operational briefing and a per-asset failure explanation that a grid operations manager can read in 30 seconds and act on immediately. The crew pre-positioning engine, which combines skill matching with geographic travel-time optimisation, is the kind of practical decision-support tool that would genuinely reduce outage response time in a real utility deployment.

---
