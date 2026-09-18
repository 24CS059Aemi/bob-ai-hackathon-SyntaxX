"""Routes: POST /bob/briefing, GET /bob/explain/{asset_id}"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List

from ..engine.asset_ranker import get_ranked_assets
from ..engine.risk_scorer import RiskResult
from ..engine.maintenance import generate_maintenance_plan
from ..bob.advisor import generate_briefing, generate_explanation
from ..schemas import BobBriefingRequest, BobBriefingResponse, BobExplainResponse

router = APIRouter(prefix="/bob", tags=["IBM Bob Advisor"])


@router.post("/briefing", response_model=BobBriefingResponse)
def get_briefing(
    request: BobBriefingRequest = None,
    ranked: List[RiskResult] = Depends(get_ranked_assets),
):
    if request is None:
        request = BobBriefingRequest()
    result = generate_briefing(ranked, top_n=request.top_n or 5)
    return BobBriefingResponse(**result)


@router.get("/explain/{asset_id}", response_model=BobExplainResponse)
def explain_asset(
    asset_id: str,
    ranked: List[RiskResult] = Depends(get_ranked_assets),
):
    asset = next((r for r in ranked if r.asset_id == asset_id), None)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")

    plan = generate_maintenance_plan(ranked)
    action_obj = next((a for a in plan if a.asset_id == asset_id), None)
    action = action_obj.action_detail if action_obj else "Follow standard maintenance procedure."

    result = generate_explanation(asset, action)
    return BobExplainResponse(**result)


from ..schemas import BobChatRequest, BobChatResponse

@router.post("/chat", response_model=BobChatResponse)
def bob_chat(
    req: BobChatRequest,
    ranked: List[RiskResult] = Depends(get_ranked_assets),
):
    msg = req.message.lower().strip()
    top1 = ranked[0] if ranked else None
    source = "watsonx" if False else "rule-based"

    # Analyze user prompt intent
    ref_asset = None
    for r in ranked:
        if r.asset_id.lower() in msg:
            ref_asset = r.asset_id
            break

    if "heat" in msg or "temp" in msg or "weather" in msg or "storm" in msg:
        reply = (
            f"Under elevated thermal or severe storm conditions, assets in Zone-A and Zone-C suffer the highest vulnerability multiplier. "
            f"Currently, {top1.asset_id if top1 else 'T-01'} is at {top1.latest_temperature_c if top1 else 92.4}°C with a risk score of "
            f"{int((top1.risk_score if top1 else 0.88)*100)}%. We recommend pre-staging Crew Alpha to Zone-A and implementing 15% load-shedding."
        )
        actions = [f"Inspect {top1.asset_id if top1 else 'T-01'}", "Launch What-If Simulator", "Stage Crew Alpha"]
    elif ref_asset:
        target = next((r for r in ranked if r.asset_id == ref_asset), top1)
        reply = (
            f"Asset {target.asset_id} ({target.asset_type.title()} in {target.zone}) has a priority risk score of {int(target.risk_score*100)}% ({target.severity_label}). "
            f"Key telemetry: Core Temp {target.latest_temperature_c}°C, Partial Discharge {target.latest_partial_discharge_pc} pC, "
            f"Oil Quality {target.latest_oil_quality_index}, serving {target.customers_served:,} customers. Immediate inspection is recommended."
        )
        actions = [f"View {target.asset_id} Full Profile", f"Create Work Order for {target.asset_id}", "Dispatch Nearest Crew"]
    elif "crew" in msg or "dispatch" in msg:
        reply = (
            "Crew Alpha is currently dispatched to Zone-A for T-01. Beta Team is available in Zone-B, and Delta Team is staging in Zone-D. "
            "Gamma Team is on standby in Zone-C with specialized oil treatment equipment."
        )
        actions = ["Open Crew Dispatch Panel", "View Travel Time Matrix", "Reassign Standby Crew"]
    elif "first" in msg or "priority" in msg or "today" in msg or "worst" in msg:
        reply = (
            f"Operational Priority 1 for this shift is {top1.asset_id if top1 else 'T-01'} in {top1.zone if top1 else 'Zone-A'}. "
            f"It poses the largest immediate outage risk threatening {top1.customers_served if top1 else 87000:,} customers due to concurrent "
            f"thermal overload and elevated partial discharge. Second priority is S-01 in Zone-A."
        )
        actions = [f"Dispatch to {top1.asset_id if top1 else 'T-01'}", "Generate Daily Briefing", "View All Critical Assets"]
    else:
        reply = (
            f"Hello Operator! The grid status currently reports {sum(1 for r in ranked if r.severity_label == 'Critical')} Critical assets "
            f"and {sum(1 for r in ranked if r.severity_label == 'High')} High-risk equipment across 5 zones. "
            f"Highest risk zone is {top1.zone if top1 else 'Zone-A'}, with {top1.asset_id if top1 else 'T-01'} needing urgent maintenance within 4 hours."
        )
        actions = ["View Top Critical Assets", "Generate Briefing", "Simulate Weather Hazard"]

    return BobChatResponse(
        reply=reply,
        source=source,
        suggested_actions=actions,
        referenced_asset=ref_asset,
    )

