# ── Stage 1: Build React frontend ───────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY src/frontend/package*.json ./
RUN npm ci --silent

COPY src/frontend/ ./
# Point API calls at the same origin (empty string = relative URLs)
ENV VITE_API_URL=""
RUN npm run build

# ── Stage 2: Python runtime ──────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Install Python deps
COPY src/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY src/backend/ ./

# Copy built frontend into the static folder FastAPI will serve
COPY --from=frontend-build /app/frontend/dist ./app/static

# Create data directory for SQLite DB
RUN mkdir -p /data

ENV DATABASE_URL="sqlite:////data/grid_advisor.db"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
