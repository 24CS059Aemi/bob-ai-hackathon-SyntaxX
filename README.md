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
| **Languages** | Python, TypeScript |
| **Frameworks** | FastAPI, React |
| **IBM Technologies** | IBM Bob, watsonx.ai, IBM Cloud Functions |
| **Databases** | PostgreSQL, Redis |
| **Other** | Docker, GitHub Actions, Slack API |

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

> Use the instructions in the setup guide for the repository.

```bash
# 1. Clone the repo
git clone https://github.com/24CS059Aemi/bob-ai-hackathon-SyntaxX.git
cd bob-ai-hackathon-SyntaxX

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Run the project
uvicorn app.main:app --reload
```

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

This prototype uses representative example data and should be adapted to real utility telemetry, forecast APIs, and secure access controls before production deployment.

---

## 🏅 What We're Most Proud Of

We are most proud of combining sensor health, weather data, and historical incident records into one operational response workflow for grid outage prevention.

---
