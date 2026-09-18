"""
Prompt templates for IBM Bob / watsonx.ai integration.
"""

BRIEFING_PROMPT = """You are an expert power grid operations advisor for an electric utility company.

You are given a ranked list of grid assets (transformers, substations, feeders) with their current risk scores and sensor readings.

Generate a concise operational morning briefing (3-5 sentences) for the grid operations team. The briefing should:
1. State how many assets are at critical/high risk
2. Name the top 2-3 most urgent assets and WHY they are at risk (based on sensor data)
3. Give the key recommended action for the operations team today
4. Mention weather impact if weather risk is elevated

Asset data:
{asset_data}

Write the briefing in plain English, professional tone, suitable for a utility operations manager.
"""

EXPLAIN_PROMPT = """You are an expert power grid equipment analyst.

Explain in plain English (3-4 sentences) why the following grid asset is at risk of failure. 
Focus on which specific sensor readings are most concerning and what failure mode they indicate.
Then give one clear recommended action.

Asset details:
{asset_data}

Format:
EXPLANATION: <3-4 sentence explanation of why this asset is at risk>
RECOMMENDED ACTION: <one clear action sentence>
"""

FALLBACK_BRIEFING = """Grid Operations Briefing — {timestamp}

{critical_count} CRITICAL and {high_count} HIGH priority assets detected requiring immediate attention.

Top priority: {top_asset} in {top_zone} with risk score {top_score:.0%} — showing elevated {top_sensors}. Recommend dispatching inspection crew within {deadline}.

{medium_count} additional assets at MEDIUM risk scheduled for this week. All crews have been pre-positioned per zone risk assessment. Review the maintenance plan for full action list.
"""

FALLBACK_EXPLAIN = """Asset {asset_id} ({asset_type}, {zone}) is showing elevated risk (score: {risk_score:.0%}, severity: {severity}).

Key indicators: temperature {temp}°C {temp_status}, partial discharge {pd} pC {pd_status}, oil quality index {oil} {oil_status}. Asset age is {age} years with a cumulative incident history contributing to the risk profile.

Recommended action: {action}
"""
