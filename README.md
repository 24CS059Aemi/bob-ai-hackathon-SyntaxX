# 🚀 Power Outage Prediction & Grid Equipment Failure Advisor

> 🌐 **Live Demo:** [https://grid-advisor-yipp.onrender.com](https://grid-advisor-yipp.onrender.com)

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | SyntaxX |
| **Track** | AI |
| **Team Lead** | Anshi Ladani — 24cs044@charusat.edu.in |
| **Members** | Aemi Patel, Suyanshi Patel, Drashti Patel |

---

## 🎯 Problem Statement

Electric utilities need a single operational picture of asset health, weather risk, and historical incident patterns. Transformer and substation failures can cause widespread outages, expensive restoration, and public safety risk when maintenance decisions are delayed or based on incomplete signals.

---

## 💡 Solution

We built a Bob-powered outage decision support solution that ranks equipment and regions by outage likelihood and operational impact. It fuses sensor health indicators, weather forecasts, and incidents into a prioritized action plan for maintenance and crew pre-positioning.

---

## ✨ Key Features

- Predict outage-prone areas using weather and equipment-condition signals.
- Rank grid assets by health risk and potential outage impact.
- Generate prioritized maintenance and crew pre-positioning suggestions.
- Surface attack of incidents and asset health signals through a dashboard workflow.
- Provide explainable, reusable risk recommendations for operations teams.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.11, TypeScript |
| **Frameworks** | FastAPI, React 18, Tailwind CSS, Recharts |
| **IBM Technologies** | IBM Bob (skill + in-IDE advisor), watsonx.ai (optional) |
| **Databases** | SQLite (default, zero-infra) |
| **Other** | Docker, Vite, GitHub Actions |

---

## 📁 Repository Structure

```
├── src/                  # All source code
├── docs/                 # Written documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/      # App screenshots
│   └── demo-video-link.txt  # Link to demo video
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

### Option C — Deploy to Render (free, permanent URL)
Click the **Deploy to Render** button above, or see [`render.yaml`](render.yaml) for details.

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [https://grid-advisor-yipp.onrender.com](https://grid-advisor-yipp.onrender.com) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

This prototype uses representative example data and should be adapted to real utility telemetry, forecast APIs, and secure access controls before production deployment.

---

## 🏅 What We're Most Proud Of

We are most proud of combining sensor health, weather data, and historical incident records into one operational response workflow for grid outage prevention.

---
