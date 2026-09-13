# Solution Overview

## What We Built

We built a Bob-powered operational intelligence solution for utility outage prevention. The project combines asset health sensor readings, weather forecast signals, and historical incident data to identify which transformers, substations, and regions are most likely to face grid disruption.

## How It Works

1. The user loads live and historical asset, weather, and incident data into the dashboard workflow.
2. The backend normalizes sensor features such as temperature, vibration, partial discharge, and oil condition.
3. A scoring and ranking engine identifies outage-prone zones and prioritizes equipment by predicted failure risk and grid impact.
4. The system generates recommended maintenance and crew pre-positioning actions for dispatch planning.

## Architecture Diagram

> See [`architecture.md`](architecture.md) for the detailed diagram.

```
[Utility User] → [Frontend Dashboard] → [API / Risk Engine] → [IBM Bob / watsonx.ai]
                                    ↓
                             [PostgreSQL + Asset Data]
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Used a combined risk model across sensors, weather, and incidents | Creates a more complete picture of outage likelihood than individual data streams |
| Ranked assets by both health risk and outage impact | Helps operations teams focus on the highest-risk and highest-consequence equipment |
| Created action recommendations for maintenance and crew routing | Converts risk predictions into a practical field operations plan |

## IBM Technologies Used

- **IBM Bob:** Used as the interaction and orchestration layer for a guided AI-powered grid decision workflow.
- **watsonx.ai:** Used to support reasoning, prediction scoring, and explainable risk recommendations from structured infrastructure signals.
- **IBM Cloud Functions:** Used as a lightweight execution pattern for event-driven task orchestration in the prototype architecture.
