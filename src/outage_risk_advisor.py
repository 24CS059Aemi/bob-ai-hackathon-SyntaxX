#!/usr/bin/env python3
"""SyntaxX outage-risk advisor sample implementation.

This project is a utility grid intelligence concept that ranks assets by
outage-risk signals such as health score, weather risk, incident history,
and crew distance. The code intentionally stays dependency-free so the
repository satisfies the GitHub Actions validator check for source files.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class AssetObservation:
    asset_id: str
    feeder: str
    zone: str
    health_score: int
    weather_risk: int
    incident_history: int
    crew_distance_km: int


class OutageRiskAdvisor:
    def __init__(self, observations: Iterable[AssetObservation]) -> None:
        self.observations = list(observations)

    def score(self, observation: AssetObservation) -> dict[str, object]:
        risk = (
            max(0, 100 - observation.health_score)
            + observation.weather_risk
            + observation.incident_history
            + min(12, observation.crew_distance_km)
        )

        if risk >= 80:
            band = "CRITICAL"
            action = "pre-position crew and isolate asset"
        elif risk >= 50:
            band = "HIGH"
            action = "increase inspection frequency"
        elif risk >= 25:
            band = "MEDIUM"
            action = "monitor and inspect"
        else:
            band = "LOW"
            action = "routine monitoring"

        return {
            "asset_id": observation.asset_id,
            "feeder": observation.feeder,
            "zone": observation.zone,
            "risk_score": min(100, risk),
            "risk_band": band,
            "recommended_action": action,
        }

    def ranked_recommendations(self) -> list[dict[str, object]]:
        ranked = [self.score(obs) for obs in self.observations]
        ranked.sort(key=lambda row: row["risk_score"], reverse=True)
        return ranked


SAMPLE_OBSERVATIONS = [
    AssetObservation("TR-014", "Feeder-A", "North Ridge", 62, 18, 12, 5),
    AssetObservation("TX-205", "Feeder-B", "East Canal", 44, 22, 16, 8),
    AssetObservation("CB-011", "Feeder-C", "South Grid", 78, 10, 7, 3),
]


if __name__ == "__main__":
    advisor = OutageRiskAdvisor(SAMPLE_OBSERVATIONS)
    print(json.dumps(advisor.ranked_recommendations(), indent=2))
