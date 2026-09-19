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

- **User Authentication** — Secure register and login system with JWT-based session management. Clean, centered card UI for both Login and Register pages (no distracting side panels).
- **AI Risk Scoring Engine** — Composite risk formula (IEEE C57.91 / IEC 60270 / ISO 10816 grounded) fuses temperature, vibration, partial discharge, oil quality, load percentage, weather risk and historical incident rate into a single 0–100 priority score per asset.
- **Live SCADA Simulator** — Background thread generates fresh sensor readings for all 15 assets every 6 minutes, simulating a real SCADA data feed. Runs indefinitely as long as the server is up.
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
│   │   │   ├── routes/   # API endpoints (auth, risk, crew, bob, maintenance)
│   │   │   └── data/     # Synthetic data generator + live SCADA simulator
│   │   └── tests/        # pytest tests
│   └── frontend/         # React + Vite + Tailwind frontend
│       └── src/
│           ├── pages/    # LoginPage, RegisterPage, Dashboard, HomePage
│           ├── components/  # SCADA panel, risk table, crew panel, Bob chat
│           └── context/  # AuthContext (JWT session management)
├── docs/                 # Written documentation
├── demo/                 # Demo artifacts & screenshots
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

> ⚠️ **Important:** Make sure you `cd` into the correct folder before running each command. You have two Python versions — always use `py -3.11` to ensure packages install for the right interpreter.

```bash
# Terminal 1 — Backend API (Python 3.11)
cd src/backend
py -3.11 -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# API running at http://localhost:8000

# Terminal 2 — Frontend dev server
cd src/frontend
npm install
npm run dev
# Open http://localhost:5173
```

> 💡 **Tip:** To make the live SCADA data update faster during demos, set the interval before starting:
> ```powershell
> # Windows PowerShell
> $env:LIVE_INTERVAL_SECONDS="30"
> uvicorn app.main:app --reload --port 8000
> ```

### Option C — Render (live, free, permanent URL)
Already deployed — see live demo link below. To redeploy your own instance, connect this repo on [render.com](https://render.com) — `render.yaml` configures everything automatically.

### Optional — IBM watsonx.ai
```bash
cp src/.env.example src/.env
# Set WATSONX_API_KEY and WATSONX_PROJECT_ID
# App works fully in rule-based mode without credentials
```

---

## 📊 Live SCADA Data — How It Works

The platform ships with a built-in **SCADA simulator** that runs as a background thread:

| What | Detail |
|---|---|
| **Assets monitored** | 15 (8 Transformers + 5 Substations + 2 Feeders) |
| **Zones** | Zone-A through Zone-E (5 grid zones) |
| **Update frequency** | Every 6 minutes (configurable via `LIVE_INTERVAL_SECONDS`) |
| **Historical data** | 30 days pre-seeded on startup |
| **Standards used** | IEEE C57.91, IEC 60270, ISO 10816, IEC 60422 |
| **Data type** | Synthetic (simulates real SCADA — not connected to live utility) |

> In a production deployment, the simulator would be replaced with a live SCADA/DMS API feed from the utility company.

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [Watch on Google Drive](https://drive.google.com/file/d/1sOyyvgPNTsu5GApZZwWq8QSBTBrx_EaB/view?usp=sharing) |
| 🌐 Live Demo | [https://grid-advisor-yipp.onrender.com](https://grid-advisor-yipp.onrender.com) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

- **Synthetic SCADA data** — All sensor readings, weather forecasts and incidents are procedurally generated using IEEE/IEC-grounded parameters. Real deployment would require integration with live SCADA/DMS feeds and validated threshold calibration per utility.
- **SQLite in-process storage** — Suitable for demo and single-instance deployments. High-availability production use would require PostgreSQL and a proper migration strategy.
- **watsonx.ai is optional** — The AI briefing falls back to rule-based templates when IBM credentials are not configured. The rule-based output is functional but less nuanced than the Granite model.
- **Free-tier Render cold starts** — The live demo may take up to 50 seconds to respond after a period of inactivity (Render free tier spin-down behaviour).

---

## 🏅 What We're Most Proud Of

The strongest part of our submission is the **end-to-end AI risk pipeline** that we built from first principles — grounded in real IEEE C57.91, IEC 60270, and ISO 10816 standards. Rather than using a black-box model, we designed a transparent, explainable composite scoring formula that field engineers can trust and audit. Every risk score traces directly back to measurable sensor readings, weather signals, and historical incident rates.

We are also proud of the **complete authentication system** — users can register and log in to access the operations dashboard, with a clean, minimal card UI that keeps the focus on the data. The **live SCADA simulator** runs continuously in the background, making every dashboard visit show updated readings without any manual refresh.

The crew pre-positioning engine, which combines skill matching with geographic travel-time optimisation, is the kind of practical decision-support tool that would genuinely reduce outage response time in a real utility deployment.

---
