"""
Crew Pre-Positioning Engine — greedy assignment algorithm.

Rules:
  Critical assets → assign best-matched available crew immediately
  High assets     → stage best-matched crew in same zone by 6-hour forecast window
  Medium assets   → include in next-day crew schedule
  Low assets      → no immediate crew action needed

Best-match scoring (lower is better):
  - Travel time to the asset zone (primary)
  - Skill match penalty: +30 min per missing required skill (secondary)
"""

from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from .risk_scorer import RiskResult
from ..data.generator import CREWS, ZONE_TRAVEL_MINUTES

# Penalty (in synthetic minutes) applied per missing required skill
_SKILL_MISMATCH_PENALTY = 30


@dataclass
class CrewAssignment:
    crew_id: str
    crew_name: str
    assigned_asset_id: str
    assigned_asset_type: str
    zone: str
    severity_label: str
    status: str            # DISPATCHED | STAGING | SCHEDULED | STANDBY | QUEUED
    dispatch_time_iso: str
    estimated_arrival_iso: str
    travel_minutes: int
    action: str


def _best_crew(asset_zone: str, required_skills: List[str], available_crews: List[Dict]) -> Optional[Dict]:
    """
    Return the crew with the best combined score:
      score = travel_minutes + (missing_skills × _SKILL_MISMATCH_PENALTY)
    Lower score = better fit.
    """
    if not available_crews:
        return None

    def _score(crew: Dict) -> int:
        travel = ZONE_TRAVEL_MINUTES.get(crew["home_zone"], {}).get(asset_zone, 999)
        crew_skills = set(crew.get("skills", []))
        missing = sum(1 for s in required_skills if s not in crew_skills)
        return travel + missing * _SKILL_MISMATCH_PENALTY

    return min(available_crews, key=_score)


# Skill requirements per asset type (mirrors maintenance._SKILL_MAP)
_ASSET_SKILL_MAP: Dict[str, List[str]] = {
    "transformer": ["HV Technician", "Oil Specialist", "Thermal Imaging"],
    "substation":  ["HV Technician", "Thermal Imaging"],
    "feeder":      ["HV Technician", "Mechanical"],
}


def generate_crew_positioning(ranked_assets: List[RiskResult]) -> List[CrewAssignment]:
    """
    Greedily assign crews to high-priority assets.
    Each crew can only be assigned once (first-come, highest-priority).
    Crew selection prefers skill match over raw travel time.
    """
    now = datetime.utcnow()
    available_crews: List[Dict] = list(CREWS)  # mutable copy
    assignments: List[CrewAssignment] = []

    for asset in ranked_assets:
        s = asset.severity_label

        if s not in ("Critical", "High", "Medium"):
            continue

        required_skills = _ASSET_SKILL_MAP.get(asset.asset_type, ["HV Technician"])
        # Add Oil Specialist if oil quality is degraded
        if asset.oil_quality_norm > 0.5 and "Oil Specialist" not in required_skills:
            required_skills = required_skills + ["Oil Specialist"]

        crew = _best_crew(asset.zone, required_skills, available_crews)
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
