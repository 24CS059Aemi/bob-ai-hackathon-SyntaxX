"""
Crew Pre-Positioning Engine — greedy assignment algorithm.

Rules:
  Critical assets → assign nearest available crew immediately
  High assets     → stage nearest crew in same zone by 6-hour forecast window
  Medium assets   → include in next-day crew schedule
  Low assets      → no immediate crew action needed
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from .risk_scorer import RiskResult
from ..data.generator import CREWS, ZONE_TRAVEL_MINUTES


@dataclass
class CrewAssignment:
    crew_id: str
    crew_name: str
    assigned_asset_id: str
    assigned_asset_type: str
    zone: str
    severity_label: str
    status: str            # DISPATCHED | STAGING | SCHEDULED | STANDBY
    dispatch_time_iso: str
    estimated_arrival_iso: str
    travel_minutes: int
    action: str


def _nearest_crew(asset_zone: str, available_crews: List[Dict]) -> Optional[Dict]:
    """Return the crew with the shortest travel time to the asset's zone."""
    if not available_crews:
        return None
    return min(
        available_crews,
        key=lambda c: ZONE_TRAVEL_MINUTES.get(c["home_zone"], {}).get(asset_zone, 999)
    )


def generate_crew_positioning(ranked_assets: List[RiskResult]) -> List[CrewAssignment]:
    """
    Greedily assign crews to high-priority assets.
    Each crew can only be assigned once (first-come, highest-priority).
    """
    now = datetime.utcnow()
    available_crews: List[Dict] = list(CREWS)  # mutable copy
    assignments: List[CrewAssignment] = []

    for asset in ranked_assets:
        s = asset.severity_label

        if s not in ("Critical", "High", "Medium"):
            continue

        crew = _nearest_crew(asset.zone, available_crews)
        if crew is None:
            # All crews assigned — remaining assets go to standby queue
            assignments.append(CrewAssignment(
                crew_id="UNASSIGNED",
                crew_name="No crew available",
                assigned_asset_id=asset.asset_id,
                assigned_asset_type=asset.asset_type,
                zone=asset.zone,
                severity_label=s,
                status="QUEUED",
                dispatch_time_iso=now.isoformat(),
                estimated_arrival_iso=(now + timedelta(hours=8)).isoformat(),
                travel_minutes=0,
                action="Waiting for crew availability",
            ))
            continue

        travel_min = ZONE_TRAVEL_MINUTES.get(crew["home_zone"], {}).get(asset.zone, 60)

        if s == "Critical":
            status = "DISPATCHED"
            dispatch_dt = now
            action = "Emergency dispatch — proceed immediately"
        elif s == "High":
            status = "STAGING"
            dispatch_dt = now + timedelta(hours=2)
            action = "Stage in zone — ready for dispatch within 6-hour window"
        else:  # Medium
            status = "SCHEDULED"
            dispatch_dt = now + timedelta(hours=12)
            action = "Scheduled for next-day deployment"

        arrival_dt = dispatch_dt + timedelta(minutes=travel_min)

        assignments.append(CrewAssignment(
            crew_id=crew["crew_id"],
            crew_name=crew["name"],
            assigned_asset_id=asset.asset_id,
            assigned_asset_type=asset.asset_type,
            zone=asset.zone,
            severity_label=s,
            status=status,
            dispatch_time_iso=dispatch_dt.isoformat(),
            estimated_arrival_iso=arrival_dt.isoformat(),
            travel_minutes=travel_min,
            action=action,
        ))

        available_crews.remove(crew)

    # Remaining crews are on standby
    for crew in available_crews:
        assignments.append(CrewAssignment(
            crew_id=crew["crew_id"],
            crew_name=crew["name"],
            assigned_asset_id="—",
            assigned_asset_type="—",
            zone=crew["home_zone"],
            severity_label="Low",
            status="STANDBY",
            dispatch_time_iso=now.isoformat(),
            estimated_arrival_iso=now.isoformat(),
            travel_minutes=0,
            action="On standby — no immediate assignment",
        ))

    return assignments
