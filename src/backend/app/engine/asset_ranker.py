"""
Asset Ranker — sorts RiskResult objects by priority score and assigns ranks.
Also produces the zone risk summary table.
"""

from typing import List, Dict
from .risk_scorer import RiskResult, compute_risk_scores, compute_zone_risk
from sqlalchemy.orm import Session
from fastapi import Depends
from ..database import get_db


def rank_assets(db: Session) -> List[RiskResult]:
    """Compute risk scores and return assets sorted by priority_score descending."""
    results = compute_risk_scores(db)
    # Sort by priority score descending (higher = act first)
    results.sort(key=lambda r: r.priority_score, reverse=True)
    for i, r in enumerate(results, start=1):
        r.rank = i
    return results


def get_ranked_assets(db: Session = Depends(get_db)) -> List[RiskResult]:
    """
    FastAPI dependency — runs rank_assets once per request.
    Re-use across multiple route handlers in the same request via Depends()
    so the DB scoring pipeline is never called twice in one request.
    """
    return rank_assets(db)


def get_zone_summary(db: Session) -> List[Dict]:
    """Return zone-level risk aggregation sorted by zone risk."""
    results = compute_risk_scores(db)
    return compute_zone_risk(results)


def severity_counts(ranked: List[RiskResult]) -> Dict[str, int]:
    """Return count of assets per severity label."""
    counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for r in ranked:
        counts[r.severity_label] = counts.get(r.severity_label, 0) + 1
    return counts
