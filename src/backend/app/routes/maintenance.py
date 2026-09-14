"""Route: GET /maintenance/plan"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db
from ..engine.asset_ranker import rank_assets
from ..engine.maintenance import generate_maintenance_plan
from ..schemas import MaintenancePlanResponse, MaintenanceActionSchema

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@router.get("/plan", response_model=MaintenancePlanResponse)
def get_maintenance_plan(db: Session = Depends(get_db)):
    ranked = rank_assets(db)
    actions = generate_maintenance_plan(ranked)
    return MaintenancePlanResponse(
        generated_at=datetime.utcnow().isoformat(),
        total_actions=len(actions),
        actions=[
            MaintenanceActionSchema(
                rank=a.rank,
                asset_id=a.asset_id,
                asset_type=a.asset_type,
                zone=a.zone,
                severity_label=a.severity_label,
                risk_score=a.risk_score,
                action=a.action,
                action_detail=a.action_detail,
                deadline_iso=a.deadline_iso,
                deadline_hours=a.deadline_hours,
                estimated_duration_hours=a.estimated_duration_hours,
                required_skills=a.required_skills,
                priority_score=a.priority_score,
                customers_at_risk=a.customers_at_risk,
            )
            for a in actions
        ],
    )
