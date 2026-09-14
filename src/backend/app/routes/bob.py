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
