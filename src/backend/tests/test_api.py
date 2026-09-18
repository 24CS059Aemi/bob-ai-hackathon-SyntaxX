"""Tests for FastAPI routes via TestClient."""
import sys, os, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
import app.database as db_module


@pytest.fixture(scope="module")
def client():
    """
    Spin up a temporary file-based SQLite DB, seed it, and override
    the FastAPI get_db dependency so all routes use the test DB.
    """
    # Use a temp file so tables persist across the module session
    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(db_fd)
    db_url = f"sqlite:///{db_path}"

    test_engine = create_engine(db_url, connect_args={"check_same_thread": False})
    TestingSession = sessionmaker(bind=test_engine)

    # Swap module-level references BEFORE calling seed (seed uses _db.engine)
    original_engine = db_module.engine
    original_session_local = db_module.SessionLocal
    db_module.engine = test_engine
    db_module.SessionLocal = TestingSession

    # Create tables and seed
    Base.metadata.create_all(bind=test_engine)
    from app.data.seed import seed as do_seed
    do_seed()

    # Import app after swap so startup event sees the test engine
    from app.main import app

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app, raise_server_exceptions=True) as c:
        yield c

    # Cleanup
    app.dependency_overrides.clear()
    db_module.engine = original_engine
    db_module.SessionLocal = original_session_local
    test_engine.dispose()
    try:
        os.unlink(db_path)
    except OSError:
        pass


# ── Health ────────────────────────────────────────────────────────────────────

def test_root(client):
    # In production the SPA catch-all serves index.html; in dev it returns JSON.
    # Either way the status must be 200.
    r = client.get("/")
    assert r.status_code == 200
    # If JSON is returned (dev / no static build), check the status field.
    ct = r.headers.get("content-type", "")
    if "application/json" in ct:
        assert r.json()["status"] == "running"


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200


# ── Assets ────────────────────────────────────────────────────────────────────

def test_list_assets(client):
    r = client.get("/assets")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 15


def test_get_asset(client):
    r = client.get("/assets/T-01")
    assert r.status_code == 200
    assert r.json()["asset_id"] == "T-01"


def test_get_asset_not_found(client):
    r = client.get("/assets/INVALID-999")
    assert r.status_code == 404


def test_asset_sensors(client):
    r = client.get("/assets/T-01/sensors?days=7")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "temperature_c" in data[0]


# ── Risk ──────────────────────────────────────────────────────────────────────

def test_risk_ranking(client):
    r = client.get("/risk/ranking")
    assert r.status_code == 200
    data = r.json()
    assert data["total_assets"] == 15
    assert "assets" in data
    scores = [a["priority_score"] for a in data["assets"]]
    assert scores == sorted(scores, reverse=True)


def test_risk_ranking_has_severity_counts(client):
    r = client.get("/risk/ranking")
    counts = r.json()["severity_counts"]
    assert set(counts.keys()) >= {"Critical", "High", "Medium", "Low"}


def test_zone_risk(client):
    r = client.get("/risk/zones")
    assert r.status_code == 200
    zones = r.json()["zones"]
    assert len(zones) == 5


def test_dashboard_summary(client):
    r = client.get("/risk/summary")
    assert r.status_code == 200
    data = r.json()
    assert "critical_count" in data
    assert "top_risk_zone" in data
    assert data["total_assets"] == 15


# ── Maintenance ────────────────────────────────────────────────────────────────

def test_maintenance_plan(client):
    r = client.get("/maintenance/plan")
    assert r.status_code == 200
    data = r.json()
    assert data["total_actions"] == 15
    actions = data["actions"]
    assert actions[0]["rank"] == 1


def test_maintenance_actions_have_deadlines(client):
    r = client.get("/maintenance/plan")
    for action in r.json()["actions"]:
        assert action["deadline_iso"] != ""
        assert action["deadline_hours"] > 0


def test_maintenance_critical_deadline(client):
    r = client.get("/maintenance/plan")
    for action in r.json()["actions"]:
        if action["severity_label"] == "Critical":
            assert action["deadline_hours"] == 4.0


# ── Crew ──────────────────────────────────────────────────────────────────────

def test_crew_positioning(client):
    r = client.get("/crew/positioning")
    assert r.status_code == 200
    data = r.json()
    assert data["total_crews"] == 5
    assignments = data["assignments"]
    assert len(assignments) >= 5


def test_crew_dispatched_for_critical(client):
    """
    The crew engine assigns greedily by priority rank.
    Verify that all DISPATCHED crews are assigned to Critical or High assets
    (no crew should be dispatched to a Low-severity asset).
    """
    risk_r = client.get("/risk/ranking")
    severity_map = {a["asset_id"]: a["severity_label"] for a in risk_r.json()["assets"]}

    crew_r = client.get("/crew/positioning")
    dispatched = [a for a in crew_r.json()["assignments"] if a["status"] == "DISPATCHED"]

    for assignment in dispatched:
        asset_id = assignment["assigned_asset_id"]
        if asset_id in severity_map:
            assert severity_map[asset_id] in ("Critical", "High"), \
                f"Crew dispatched to Low/Medium asset {asset_id}"


# ── Bob Advisor ────────────────────────────────────────────────────────────────

def test_bob_briefing(client):
    r = client.post("/bob/briefing", json={"top_n": 3})
    assert r.status_code == 200
    data = r.json()
    assert "briefing" in data
    assert len(data["briefing"]) > 20
    assert data["source"] in ("watsonx", "rule-based")


def test_bob_explain(client):
    r = client.get("/bob/explain/T-01")
    assert r.status_code == 200
    data = r.json()
    assert data["asset_id"] == "T-01"
    assert len(data["explanation"]) > 20
    assert "recommended_action" in data


def test_bob_explain_not_found(client):
    r = client.get("/bob/explain/INVALID-999")
    assert r.status_code == 404
