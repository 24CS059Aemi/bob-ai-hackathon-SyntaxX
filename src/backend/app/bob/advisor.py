"""
IBM Bob / watsonx.ai advisor integration.

When WATSONX_API_KEY is set, calls watsonx.ai Granite to generate
natural-language briefings and asset explanations.

When not set, falls back to rule-based text — the full app works
locally with zero IBM credentials.
"""

import os
import json
from datetime import datetime, timedelta
from typing import List, Optional

from ..engine.risk_scorer import RiskResult
from ..engine.maintenance import generate_maintenance_plan
from .prompts import (
    BRIEFING_PROMPT, EXPLAIN_PROMPT,
    FALLBACK_BRIEFING, FALLBACK_EXPLAIN,
)

WATSONX_API_KEY    = os.getenv("WATSONX_API_KEY", "")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID", "")
WATSONX_URL        = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
WATSONX_MODEL_ID   = os.getenv("WATSONX_MODEL_ID", "ibm/granite-13b-instruct-v2")

# ── IAM token cache (valid for 1 hour; reuse across calls) ───────────────────
_iam_token: Optional[str] = None
_iam_token_expiry: Optional[datetime] = None


def _get_iam_token() -> Optional[str]:
    """Return a cached IAM bearer token, refreshing only when expired."""
    global _iam_token, _iam_token_expiry
    import requests  # type: ignore

    now = datetime.utcnow()
    if _iam_token and _iam_token_expiry and now < _iam_token_expiry:
        return _iam_token

    try:
        resp = requests.post(
            "https://iam.cloud.ibm.com/identity/token",
            data={"grant_type": "urn:ibm:params:oauth:grant-type:apikey", "apikey": WATSONX_API_KEY},
            timeout=15,
        )
        if resp.status_code != 200:
            return None
        token = resp.json().get("access_token")
        if token:
            _iam_token = token
            # IBM IAM tokens live 1 h; refresh 5 min early to be safe
            _iam_token_expiry = now + timedelta(minutes=55)
        return _iam_token
    except Exception:
        return None


def _call_watsonx(prompt: str) -> Optional[str]:
    """Call watsonx.ai text generation API. Returns None on any error."""
    try:
        import requests  # type: ignore

        access_token = _get_iam_token()
        if not access_token:
            return None

        gen_url = f"{WATSONX_URL}/ml/v1/text/generation?version=2023-05-29"
        payload = {
            "model_id": WATSONX_MODEL_ID,
            "project_id": WATSONX_PROJECT_ID,
            "input": prompt,
            "parameters": {
                "max_new_tokens": 300,
                "temperature": 0.4,
                "repetition_penalty": 1.1,
            },
        }
        gen_resp = requests.post(
            gen_url,
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json=payload,
            timeout=30,
        )
        if gen_resp.status_code == 200:
            results = gen_resp.json().get("results", [])
            if results:
                return results[0].get("generated_text", "").strip()
        return None
    except Exception:
        return None


def _asset_to_dict(r: RiskResult) -> dict:
    return {
        "asset_id": r.asset_id,
        "asset_type": r.asset_type,
        "zone": r.zone,
        "severity": r.severity_label,
        "risk_score": r.risk_score,
        "age_years": r.age_years,
        "customers_served": r.customers_served,
        "temperature_c": r.latest_temperature_c,
        "vibration_mms": r.latest_vibration_mms,
        "partial_discharge_pc": r.latest_partial_discharge_pc,
        "oil_quality_index": r.latest_oil_quality_index,
        "load_percent": r.latest_load_percent,
        "weather_risk": r.weather_risk_norm,
    }


def _top_sensors(r: RiskResult) -> str:
    """Return the names of the two worst sensor readings for fallback text."""
    sensors = {
        "temperature": r.temperature_norm,
        "partial discharge": r.partial_discharge_norm,
        "vibration": r.vibration_norm,
        "oil quality degradation": r.oil_quality_norm,
    }
    top = sorted(sensors.items(), key=lambda x: x[1], reverse=True)[:2]
    return " and ".join(s[0] for s in top if s[1] > 0) or "sensor readings"


def generate_briefing(ranked_assets: List[RiskResult], top_n: int = 5) -> dict:
    """Generate an operational briefing for the top-N at-risk assets."""
    top = ranked_assets[:top_n]
    now = datetime.utcnow()

    # Build maintenance plan for deadline info
    plan = generate_maintenance_plan(ranked_assets)
    deadline = f"{plan[0].deadline_hours:.0f} hours" if plan else "4 hours"

    critical = sum(1 for r in ranked_assets if r.severity_label == "Critical")
    high     = sum(1 for r in ranked_assets if r.severity_label == "High")
    medium   = sum(1 for r in ranked_assets if r.severity_label == "Medium")

    top_asset_ids = [r.asset_id for r in top]
    source = "rule-based"
    briefing_text = ""

    # Try watsonx.ai first
    if WATSONX_API_KEY and WATSONX_PROJECT_ID:
        asset_data_str = json.dumps([_asset_to_dict(r) for r in top], indent=2)
        prompt = BRIEFING_PROMPT.format(asset_data=asset_data_str)
        result = _call_watsonx(prompt)
        if result:
            briefing_text = result
            source = "watsonx"

    # Fallback to rule-based text
    if not briefing_text:
        top1 = ranked_assets[0] if ranked_assets else None
        briefing_text = FALLBACK_BRIEFING.format(
            timestamp=now.strftime("%Y-%m-%d %H:%M UTC"),
            critical_count=critical,
            high_count=high,
            top_asset=top1.asset_id if top1 else "N/A",
            top_zone=top1.zone if top1 else "N/A",
            top_score=top1.risk_score if top1 else 0,
            top_sensors=_top_sensors(top1) if top1 else "multiple sensors",
            deadline=deadline,
            medium_count=medium,
        )

    return {
        "generated_at": now.isoformat(),
        "briefing": briefing_text,
        "source": source,
        "top_assets": top_asset_ids,
    }


def generate_explanation(asset: RiskResult, action: str) -> dict:
    """Generate a plain-English explanation of why a specific asset is at risk."""
    source = "rule-based"
    explanation = ""
    recommended_action = action

    if WATSONX_API_KEY and WATSONX_PROJECT_ID:
        asset_data_str = json.dumps(_asset_to_dict(asset), indent=2)
        prompt = EXPLAIN_PROMPT.format(asset_data=asset_data_str)
        result = _call_watsonx(prompt)
        if result:
            # Parse EXPLANATION / RECOMMENDED ACTION sections
            lines = result.strip().splitlines()
            exp_lines, act_lines = [], []
            section = None
            for line in lines:
                if line.startswith("EXPLANATION:"):
                    section = "exp"
                    exp_lines.append(line.replace("EXPLANATION:", "").strip())
                elif line.startswith("RECOMMENDED ACTION:"):
                    section = "act"
                    act_lines.append(line.replace("RECOMMENDED ACTION:", "").strip())
                elif section == "exp":
                    exp_lines.append(line)
                elif section == "act":
                    act_lines.append(line)
            explanation = " ".join(exp_lines).strip()
            if act_lines:
                recommended_action = " ".join(act_lines).strip()
            if explanation:
                source = "watsonx"

    if not explanation:
        # Determine status labels for sensors
        def _status(norm: float) -> str:
            return "⚠️ ELEVATED" if norm > 0.5 else ("↑ above normal" if norm > 0.2 else "normal")

        explanation = FALLBACK_EXPLAIN.format(
            asset_id=asset.asset_id,
            asset_type=asset.asset_type,
            zone=asset.zone,
            risk_score=asset.risk_score,
            severity=asset.severity_label,
            temp=asset.latest_temperature_c,
            temp_status=_status(asset.temperature_norm),
            pd=asset.latest_partial_discharge_pc,
            pd_status=_status(asset.partial_discharge_norm),
            oil=asset.latest_oil_quality_index,
            oil_status=_status(asset.oil_quality_norm),
            age=asset.age_years,
            action=action,
        )

    return {
        "asset_id": asset.asset_id,
        "explanation": explanation,
        "source": source,
        "recommended_action": recommended_action,
    }
