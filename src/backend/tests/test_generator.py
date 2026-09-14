"""Tests for the synthetic data generator."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.data.generator import (
    get_assets, get_crews, generate_sensor_readings,
    generate_weather_forecasts, generate_incidents,
    ASSETS, ZONES, CREWS,
)


def test_assets_count():
    assets = get_assets()
    assert len(assets) == 15


def test_asset_fields():
    for a in get_assets():
        assert "asset_id" in a
        assert "zone" in a
        assert a["zone"] in ZONES
        assert a["capacity_mva"] > 0
        assert a["customers_served"] > 0
        assert a["age_years"] > 0


def test_sensor_readings_count():
    readings = generate_sensor_readings(days=7)
    # 15 assets × 7 days × 4 intervals/day = 420
    assert len(readings) == 15 * 7 * 4


def test_sensor_readings_deterministic():
    r1 = generate_sensor_readings(days=3)
    r2 = generate_sensor_readings(days=3)
    assert r1[0]["temperature_c"] == r2[0]["temperature_c"]


def test_sensor_value_ranges():
    readings = generate_sensor_readings(days=30)
    for r in readings:
        assert 0 < r["temperature_c"] < 200,        f"temp out of range: {r['temperature_c']}"
        assert 0 <= r["vibration_mms"] < 20,         f"vib out of range: {r['vibration_mms']}"
        assert 0 <= r["partial_discharge_pc"] < 500, f"pd out of range: {r['partial_discharge_pc']}"
        assert 0 <= r["oil_quality_index"] <= 100,   f"oil out of range: {r['oil_quality_index']}"
        assert 0 <= r["load_percent"] <= 100,         f"load out of range: {r['load_percent']}"


def test_weather_forecast_zones():
    forecasts = generate_weather_forecasts(days_ahead=5)
    zones_covered = {f["zone"] for f in forecasts}
    assert zones_covered == set(ZONES)


def test_weather_forecast_values():
    forecasts = generate_weather_forecasts()
    for f in forecasts:
        assert 0 <= f["weather_risk_index"] <= 1
        assert 0 <= f["lightning_risk"] <= 10
        assert f["wind_speed_kmh"] >= 0


def test_incidents_generated():
    incidents = generate_incidents(years=3)
    assert len(incidents) >= 10  # at minimum one per asset


def test_incidents_asset_coverage():
    incidents = generate_incidents(years=3)
    asset_ids_with_incidents = {i["asset_id"] for i in incidents}
    all_ids = {a["asset_id"] for a in get_assets()}
    # Every asset should have at least one historical incident
    assert all_ids == asset_ids_with_incidents


def test_crews_count():
    assert len(get_crews()) == 5


def test_crews_zones():
    crews = get_crews()
    home_zones = {c["home_zone"] for c in crews}
    assert home_zones.issubset(set(ZONES))
