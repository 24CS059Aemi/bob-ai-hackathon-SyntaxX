"""Routes: GET /maintenance/plan, Work Orders management"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import uuid

from ..engine.asset_ranker import get_ranked_assets
from ..engine.risk_scorer import RiskResult
from ..engine.maintenance import generate_maintenance_plan
from ..schemas import (
    MaintenancePlanResponse, MaintenanceActionSchema,
    WorkOrderItemSchema, CreateWorkOrderRequest, UpdateWorkOrderStatusRequest,
)

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

# In-memory work orders store with default pre-seeded work orders
_WORK_ORDERS: Dict[str, dict] = {}


def _init_default_work_orders():
    if _WORK_ORDERS:
        return
    now = datetime.utcnow()
    initial_orders = [
        {
            "id": "WO-2026-001",
            "asset_id": "T-01",
            "zone": "Zone-A",
            "title": "Emergency DGA & Core Temperature Inspection",
            "description": "Critical thermal rise detected (92.4°C). Run comprehensive DGA and check auxiliary cooling pumps.",
            "priority": "P1-Critical",
            "status": "in_progress",
            "assigned_crew": "Alpha Team",
            "assigned_technician": "Alex Rivera (HV Specialist)",
            "created_at": (now - timedelta(hours=3)).isoformat(),
            "deadline_iso": (now + timedelta(hours=4)).isoformat(),
            "completed_at": None,
            "required_skills": ["HV Technician", "Oil Specialist", "Thermal Imaging"],
            "notes": "Crew Alpha on-site. Infrared scan shows winding hot spot on Phase B.",
        },
        {
            "id": "WO-2026-002",
            "asset_id": "S-01",
            "zone": "Zone-A",
            "title": "Busbar Partial Discharge Ultrasonic Survey",
            "description": "Acoustic and UHF sensor indicates 168 pC partial discharge activity near bus isolator 2.",
            "priority": "P1-Critical",
            "status": "assigned",
            "assigned_crew": "Beta Team",
            "assigned_technician": "Sarah Chen",
            "created_at": (now - timedelta(hours=2)).isoformat(),
            "deadline_iso": (now + timedelta(hours=6)).isoformat(),
            "completed_at": None,
            "required_skills": ["HV Technician", "Thermal Imaging"],
            "notes": "Staged at Zone-A gate awaiting clearance tag.",
        },
        {
            "id": "WO-2026-003",
            "asset_id": "T-05",
            "zone": "Zone-C",
            "title": "Insulation Oil Degassing & Moisture Filtering",
            "description": "Dielectric breakdown voltage below 28 kV. Mobile oil processing unit required.",
            "priority": "P2-High",
            "status": "pending",
            "assigned_crew": "Gamma Team",
            "assigned_technician": None,
            "created_at": (now - timedelta(hours=5)).isoformat(),
            "deadline_iso": (now + timedelta(hours=14)).isoformat(),
            "completed_at": None,
            "required_skills": ["HV Technician", "Oil Specialist"],
            "notes": "Waiting for tanker transport dispatch.",
        },
        {
            "id": "WO-2026-004",
            "asset_id": "F-02",
            "zone": "Zone-D",
            "title": "Overhead Line Vegetation Clearance & Vibration Damper Check",
            "description": "Vibration sensor alarm on conductor suspension span 14-16 ahead of forecast high winds.",
            "priority": "P2-High",
            "status": "completed",
            "assigned_crew": "Delta Team",
            "assigned_technician": "Marcus Vance",
            "created_at": (now - timedelta(days=1)).isoformat(),
            "deadline_iso": (now - timedelta(hours=2)).isoformat(),
            "completed_at": (now - timedelta(hours=3)).isoformat(),
            "required_skills": ["Mechanical", "HV Technician"],
            "notes": "Re-torqued dampers and cleared tree limb encroaching within 3.5m clearance zone.",
        },
    ]
    for wo in initial_orders:
        _WORK_ORDERS[wo["id"]] = wo


@router.get("/plan", response_model=MaintenancePlanResponse)
def get_maintenance_plan(ranked: List[RiskResult] = Depends(get_ranked_assets)):
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


@router.get("/workorders", response_model=List[WorkOrderItemSchema])
def get_work_orders():
    _init_default_work_orders()
    return list(_WORK_ORDERS.values())


@router.post("/workorders", response_model=WorkOrderItemSchema)
def create_work_order(req: CreateWorkOrderRequest):
    _init_default_work_orders()
    now = datetime.utcnow()
    new_id = f"WO-2026-{len(_WORK_ORDERS) + 1:03d}"
    deadline = now + timedelta(hours=req.deadline_hours or 24.0)

    # Determine zone from asset
    zone = "Zone-A"
    if req.asset_id in ["T-03", "T-04", "S-02", "F-01"]:
        zone = "Zone-B"
    elif req.asset_id in ["T-05", "T-06", "S-03"]:
        zone = "Zone-C"
    elif req.asset_id in ["T-07", "S-04", "F-02"]:
        zone = "Zone-D"
    elif req.asset_id in ["T-08", "S-05"]:
        zone = "Zone-E"

    order = {
        "id": new_id,
        "asset_id": req.asset_id,
        "zone": zone,
        "title": req.title,
        "description": req.description,
        "priority": req.priority,
        "status": "assigned" if req.assigned_crew else "pending",
        "assigned_crew": req.assigned_crew,
        "assigned_technician": req.assigned_technician,
        "created_at": now.isoformat(),
        "deadline_iso": deadline.isoformat(),
        "completed_at": None,
        "required_skills": req.required_skills or ["HV Technician"],
        "notes": req.notes,
    }
    _WORK_ORDERS[new_id] = order
    return order


@router.patch("/workorders/{order_id}", response_model=WorkOrderItemSchema)
def update_work_order_status(order_id: str, req: UpdateWorkOrderStatusRequest):
    _init_default_work_orders()
    if order_id not in _WORK_ORDERS:
        raise HTTPException(status_code=404, detail=f"Work Order {order_id} not found")

    order = _WORK_ORDERS[order_id]
    order["status"] = req.status
    if req.status == "completed":
        order["completed_at"] = datetime.utcnow().isoformat()
    if req.notes:
        prev = order.get("notes") or ""
        order["notes"] = f"{prev}\n[{datetime.utcnow().strftime('%H:%M')}] {req.notes}".strip()
    return order

