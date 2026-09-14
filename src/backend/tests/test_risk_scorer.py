"""Tests for the risk scorer engine."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from app import models
from app.database import Base
from app.data.seed import seed as do_seed
from app.engine.risk_scorer import compute_risk_scores, _norm, _age_factor, _load_factor, compute_zone_risk


@pytest.fixture(scope="module")
def db_session():
    """In-memory SQLite DB seeded with synthetic data."""
    import app.database as db_module
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Session = sessionmaker(bind=test_engine)
    # Swap before creating tables so seed uses this engine
    original_engine = db_module.engine
    original_session_local = db_module.SessionLocal
    db_module.engine = test_engine
    db_module.SessionLocal = Session
    Base.metadata.create_all(bind=test_engine)
    do_seed()
    session = Session()
    yield session
    session.close()
    db_module.engine = original_engine
    db_module.SessionLocal = original_session_local


def test_norm_below_normal():
    assert _norm(60.0, normal_hi=75.0, alarm_lo=85.0) == 0.0


def test_norm_at_alarm():
    assert _norm(85.0, normal_hi=75.0, alarm_lo=85.0) == 1.0


def test_norm_midpoint():
    result = _norm(80.0, normal_hi=75.0, alarm_lo=85.0)
    assert 0.0 < result < 1.0


def test_age_factor_old():
    assert _age_factor(40) == 1.25


def test_age_factor_young():
    assert _age_factor(5) == 1.0


def test_age_factor_middle():
    assert _age_factor(28) == 1.15


def test_load_factor_overload():
    assert _load_factor(0.95) == 1.20


def test_load_factor_normal():
    assert _load_factor(0.5) == 1.0


def test_risk_scores_all_assets(db_session):
    results = compute_risk_scores(db_session)
    assert len(results) == 15


def test_risk_scores_range(db_session):
    results = compute_risk_scores(db_session)
    for r in results:
        assert 0.0 <= r.risk_score <= 1.0, f"{r.asset_id} risk={r.risk_score}"


def test_severity_labels_valid(db_session):
    results = compute_risk_scores(db_session)
    valid = {"Critical", "High", "Medium", "Low"}
    for r in results:
        assert r.severity_label in valid


def test_critical_assets_exist(db_session):
    """High-risk assets (T-01, S-01, T-05) should score Critical."""
    results = compute_risk_scores(db_session)
    critical_ids = {r.asset_id for r in results if r.severity_label == "Critical"}
    assert len(critical_ids) >= 1


def test_zone_risk_all_zones(db_session):
    results = compute_risk_scores(db_session)
    zones = compute_zone_risk(results)
    zone_names = {z["zone"] for z in zones}
    assert zone_names == {"Zone-A", "Zone-B", "Zone-C", "Zone-D", "Zone-E"}


def test_zone_risk_sorted(db_session):
    results = compute_risk_scores(db_session)
    zones = compute_zone_risk(results)
    scores = [z["zone_risk_score"] for z in zones]
    assert scores == sorted(scores, reverse=True)
