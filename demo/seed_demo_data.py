#!/usr/bin/env python3
"""
Standalone demo seed script.
Seeds the database and prints a summary table to the terminal.

Usage:
    cd src/backend
    python ../../demo/seed_demo_data.py
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src", "backend"))

from app.database import engine, SessionLocal
from app import models
from app.data.seed import seed
from app.engine.asset_ranker import rank_assets
from app.engine.maintenance import generate_maintenance_plan
from app.engine.crew import generate_crew_positioning


def main():
    print("=" * 70)
    print("  ⚡  Power Outage Prediction & Grid Equipment Failure Advisor")
    print("       Demo Data Seed Script — SyntaxX / IBM Bob Hackathon 2026")
    print("=" * 70)

    models.Base.metadata.create_all(bind=engine)
    seed()

    db = SessionLocal()
    try:
        ranked = rank_assets(db)
        plan   = generate_maintenance_plan(ranked)
        crew   = generate_crew_positioning(ranked)
    finally:
        db.close()

    # Asset risk ranking table
    print("\n📊 ASSET RISK RANKING (Top 15)\n")
    print(f"{'#':<4} {'Asset':<8} {'Type':<12} {'Zone':<8} {'Risk':>6} {'Severity':<10} {'Customers':>12}")
    print("-" * 70)
    for r in ranked:
        print(f"{r.rank:<4} {r.asset_id:<8} {r.asset_type:<12} {r.zone:<8} "
              f"{r.risk_score*100:>5.1f}%  {r.severity_label:<10} {r.customers_served:>12,}")

    # Maintenance plan
    print("\n🔧 MAINTENANCE PLAN\n")
    print(f"{'Asset':<8} {'Severity':<10} {'Action':<30} {'Deadline':>12}")
    print("-" * 70)
    for a in plan[:8]:
        print(f"{a.asset_id:<8} {a.severity_label:<10} {a.action:<30} {a.deadline_hours:>10.0f}h")

    # Crew positioning
    print("\n🚑 CREW POSITIONING\n")
    print(f"{'Crew':<14} {'Status':<12} {'Assigned To':<10} {'Zone':<8} {'Travel':>8}")
    print("-" * 60)
    for c in crew:
        print(f"{c.crew_name:<14} {c.status:<12} {c.assigned_asset_id:<10} {c.zone:<8} {c.travel_minutes:>6} min")

    print("\n✅ Seed complete. Start the app:\n")
    print("   Backend:  cd src/backend && uvicorn app.main:app --reload")
    print("   Frontend: cd src/frontend && npm install && npm run dev")
    print("   Open:     http://localhost:5173\n")


if __name__ == "__main__":
    main()
