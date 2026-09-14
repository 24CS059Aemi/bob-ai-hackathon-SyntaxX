#!/usr/bin/env bash
# build.sh — Render build phase (runs from repo root)
# The React frontend is pre-built and committed to src/backend/app/static/
# We only need to install Python dependencies here.
set -e

echo "==> Installing Python dependencies..."
pip install -r src/backend/requirements.txt

echo "==> Static frontend files (pre-built and committed):"
ls -la src/backend/app/static/ && ls -la src/backend/app/static/assets/

echo "==> Build complete."
