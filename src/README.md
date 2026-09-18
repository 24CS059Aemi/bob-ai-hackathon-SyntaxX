# Source Code

## Layout

```
src/
├── backend/                        ← FastAPI Python backend
│   ├── requirements.txt            ← Python dependencies
│   ├── app/
│   │   ├── main.py                 ← FastAPI app entry point
│   │   ├── database.py             ← SQLAlchemy engine (SQLite default)
│   │   ├── models.py               ← ORM models
│   │   ├── schemas.py              ← Pydantic response schemas
│   │   ├── data/
│   │   │   ├── generator.py        ← Synthetic data (IEEE/IEC grounded)
│   │   │   └── seed.py             ← DB seed script
│   │   ├── engine/
│   │   │   ├── risk_scorer.py      ← Composite risk formula
│   │   │   ├── asset_ranker.py     ← Priority ranking
│   │   │   ├── maintenance.py      ← Maintenance action rules
│   │   │   └── crew.py             ← Crew pre-positioning algorithm
│   │   ├── bob/
│   │   │   ├── advisor.py          ← watsonx.ai / rule-based fallback
│   │   │   └── prompts.py          ← LLM prompt templates
│   │   └── routes/
│   │       ├── assets.py           ← /assets
│   │       ├── risk.py             ← /risk/ranking, /risk/zones, /risk/summary
│   │       ├── maintenance.py      ← /maintenance/plan
│   │       ├── crew.py             ← /crew/positioning
│   │       └── bob.py              ← /bob/briefing, /bob/explain/{id}
│   └── tests/
│       ├── test_generator.py
│       ├── test_risk_scorer.py
│       └── test_api.py
│
├── frontend/                       ← React 18 + TypeScript + Vite + Tailwind
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── api/
│       │   ├── client.ts           ← Axios API calls
│       │   └── types.ts            ← TypeScript interfaces
│       ├── components/
│       │   ├── DashboardHeader.tsx ← Summary counts bar
│       │   ├── RiskRankingTable.tsx← Sortable asset table
│       │   ├── ZoneMap.tsx         ← SVG zone heatmap
│       │   ├── SensorSparklines.tsx← 7-day sensor trend charts
│       │   ├── MaintenancePlan.tsx ← Ordered action cards
│       │   ├── CrewPanel.tsx       ← Crew assignment table
│       │   └── BobAdvisorPanel.tsx ← AI briefing panel
│       └── pages/
│           └── Dashboard.tsx       ← Main tabbed dashboard
│
└── .env.example                    ← Environment variable template
```

## Quick Start

```bash
# Backend (auto-seeds on first run)
cd src/backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (in a new terminal)
cd src/frontend
npm install
npm run dev
```

Open **http://localhost:5173**

## Running Tests

```bash
cd src/backend
pytest tests/ -v
```

All 43 tests pass. No external services required — watsonx.ai is mocked in tests.
