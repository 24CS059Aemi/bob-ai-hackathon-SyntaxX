"""
Maintenance Recommender — generates a prioritised maintenance action per asset.

Rules grounded in utility industry standard response times:
  Critical (risk >= 0.75)  → Emergency inspection within 4 hours
  High     (risk >= 0.55)  → Field inspection within 24 hours
  Medium   (risk >= 0.35)  → Condition monitoring within 7 days
  Low      (risk <  0.35)  → Schedule in next planned maintenance cycle
"""

from dataclasses import dataclass
from typing import List
from datetime import datetime, timedelta
from .risk_scorer import RiskResult


@dataclass
class MaintenanceAction:
    rank: int
    asset_id: str
    asset_type: str
    zone: str
    severity_label: str
    risk_score: float
    action: str
    action_detail: str
    deadline_iso: str
    deadline_hours: float
    estimated_duration_hours: float
    required_skills: List[str]
    priority_score: float
    customers_at_risk: int


_SKILL_MAP = {
    "transformer": ["HV Technician", "Oil Specialist", "Thermal Imaging"],
    "substation":  ["HV Technician", "Thermal Imaging"],
    "feeder":      ["HV Technician", "Mechanical"],
}


def generate_maintenance_plan(ranked_assets: List[RiskResult]) -> List[MaintenanceAction]:
    """
    Given the ranked asset list, produce one MaintenanceAction per asset.
    List is already sorted by priority (rank).
    """
    now = datetime.utcnow()
    actions: List[MaintenanceAction] = []

    for asset in ranked_assets:
        s = asset.severity_label

        if s == "Critical":
            action       = "Emergency Inspection"
            detail       = (
                "Immediate field inspection required. Isolate unit if oil quality index < 50 "
                "or partial discharge > 200 pC. Prepare oil sampling kit and thermal camera."
            )
            deadline_h   = 4.0
            est_duration = 6.0
        elif s == "High":
            action       = "Scheduled Field Inspection"
            detail       = (
                "Dispatch crew for full field inspection including thermal imaging, "
                "oil sampling, and vibration analysis. Review DGA results before visit."
            )
            deadline_h   = 24.0
            est_duration = 4.0
        elif s == "Medium":
            action       = "Condition Monitoring Review"
            detail       = (
                "Review trending sensor data remotely. Schedule oil sampling and "
                "visual inspection within the week. Update asset health record."
            )
            deadline_h   = 7 * 24.0
            est_duration = 2.0
        else:  # Low
            action       = "Planned Maintenance Cycle"
            detail       = (
                "Log for next scheduled maintenance window. No immediate action required. "
                "Continue standard monitoring interval."
            )
            deadline_h   = 30 * 24.0
            est_duration = 2.0

        deadline_dt = now + timedelta(hours=deadline_h)
        skills = _SKILL_MAP.get(asset.asset_type, ["HV Technician"])

        # Add oil specialist if oil quality is degraded
        if asset.oil_quality_norm > 0.5 and "Oil Specialist" not in skills:
            skills = skills + ["Oil Specialist"]

        actions.append(MaintenanceAction(
            rank=asset.rank,
            asset_id=asset.asset_id,
            asset_type=asset.asset_type,
            zone=asset.zone,
            severity_label=s,
            risk_score=asset.risk_score,
            action=action,
            action_detail=detail,
            deadline_iso=deadline_dt.isoformat(),
            deadline_hours=deadline_h,
            estimated_duration_hours=est_duration,
            required_skills=skills,
            priority_score=asset.priority_score,
            customers_at_risk=asset.customers_served,
        ))

    return actions
