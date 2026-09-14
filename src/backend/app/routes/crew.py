"""Route: GET /crew/positioning"""

from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime

from ..engine.asset_ranker import get_ranked_assets
from ..engine.risk_scorer import RiskResult
from ..engine.crew import generate_crew_positioning
from ..schemas import CrewPositioningResponse, CrewAssignmentSchema
from ..data.generator import CREWS

router = APIRouter(prefix="/crew", tags=["Crew"])


@router.get("/positioning", response_model=CrewPositioningResponse)
def get_crew_positioning(ranked: List[RiskResult] = Depends(get_ranked_assets)):
    assignments = generate_crew_positioning(ranked)
    return CrewPositioningResponse(
        generated_at=datetime.utcnow().isoformat(),
        total_crews=len(CREWS),
        assignments=[
            CrewAssignmentSchema(
                crew_id=a.crew_id,
                crew_name=a.crew_name,
                assigned_asset_id=a.assigned_asset_id,
                assigned_asset_type=a.assigned_asset_type,
                zone=a.zone,
                severity_label=a.severity_label,
                status=a.status,
                dispatch_time_iso=a.dispatch_time_iso,
                estimated_arrival_iso=a.estimated_arrival_iso,
                travel_minutes=a.travel_minutes,
                action=a.action,
            )
            for a in assignments
        ],
    )
