#!/usr/bin/env bash
# start.sh — called by Render to start the server
# Runs from the repo root.
set -e

echo "==> Starting Grid Advisor API..."
echo "==> Static files present:"
ls src/backend/app/static/ 2>/dev/null || echo "WARNING: no static dir found"

cd src/backend
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
