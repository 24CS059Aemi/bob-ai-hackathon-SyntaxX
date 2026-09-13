# Setup Guide

> **This file is read by the automated evaluation pipeline. Be precise and complete.**

## Prerequisites

Before you begin, ensure you have the following installed:

- [ ] Python 3.11+
- [ ] Node.js 18+
- [ ] Docker Desktop
- [ ] IBM Cloud credentials with access to IBM Bob and watsonx.ai services

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `WATSONX_API_KEY` | IBM watsonx.ai API key | Yes |
| `WATSONX_PROJECT_ID` | IBM watsonx.ai project ID | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SLACK_WEBHOOK_URL` | Optional webhook for alerts | No |

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/24CS059Aemi/bob-ai-hackathon-SyntaxX.git
cd bob-ai-hackathon-SyntaxX

# 2. Install backend dependencies
pip install -r requirements.txt

# 3. Install frontend dependencies
cd frontend && npm install

# 4. Set up the database
python manage.py migrate
```

## Running the Application

```bash
# Start the backend
uvicorn app.main:app --reload

# Start the frontend (in a separate terminal)
cd frontend && npm run dev
```

The application will be available at: `http://localhost:8000`

## Running Tests

```bash
pytest tests/ -v
```

## Quick Demo

Use the sample data file in the repository to demonstrate the risk ranking workflow.

```bash
python demo/seed_demo_data.py
open http://localhost:8000/demo
```

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` again |
| Database connection refused | Ensure PostgreSQL is running with `docker compose up db` |
| watsonx.ai 401 error | Check the `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` values in `.env` |
