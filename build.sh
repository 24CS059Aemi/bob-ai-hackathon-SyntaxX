#!/usr/bin/env bash
# build.sh — Render build phase (runs from repo root)
# Install Python dependencies, then build the React frontend into the
# FastAPI static directory so every push to GitHub can refresh the
# Render live URL automatically from the latest UI source.
set -e

echo "==> Installing Python dependencies..."
pip install -r src/backend/requirements.txt

echo "==> Installing frontend dependencies..."
cd src/frontend
npm install

echo "==> Building frontend static assets..."
npm run build

cd ../..
echo "==> Static frontend files generated into src/backend/app/static/:"
ls -la src/backend/app/static/
ls -la src/backend/app/static/_app/ 2>/dev/null || ls -la src/backend/app/static/assets/ 2>/dev/null || echo "WARNING: no assets subfolder found"

echo "==> Build complete."
