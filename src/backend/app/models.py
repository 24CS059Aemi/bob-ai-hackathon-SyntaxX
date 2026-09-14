"""
SQLAlchemy ORM models for the Grid Advisor database.
"""

from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Asset(Base):
    __tablename__ = "assets"

    asset_id        = Column(String, primary_key=True, index=True)
    asset_type      = Column(String, nullable=False)   # transformer | substation | feeder
    zone            = Column(String, nullable=False)
    capacity_mva    = Column(Float,  nullable=False)
    age_years       = Column(Integer, nullable=False)
    customers_served= Column(Integer, nullable=False)
    voltage_kv      = Column(Float,  nullable=False)

    sensor_readings = relationship("SensorReading", back_populates="asset", cascade="all, delete-orphan")
    incidents       = relationship("Incident",      back_populates="asset", cascade="all, delete-orphan")
    risk_scores     = relationship("RiskScore",     back_populates="asset", cascade="all, delete-orphan")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id                    = Column(Integer, primary_key=True, autoincrement=True)
    asset_id              = Column(String, ForeignKey("assets.asset_id"), nullable=False, index=True)
    timestamp             = Column(DateTime, nullable=False, index=True)
    temperature_c         = Column(Float)
    vibration_mms         = Column(Float)
    partial_discharge_pc  = Column(Float)
    oil_quality_index     = Column(Float)
    load_percent          = Column(Float)

    asset = relationship("Asset", back_populates="sensor_readings")


class Incident(Base):
    __tablename__ = "incidents"

    incident_id           = Column(String, primary_key=True)
    asset_id              = Column(String, ForeignKey("assets.asset_id"), nullable=False, index=True)
    incident_date         = Column(DateTime, nullable=False)
    failure_type          = Column(String)
    outage_duration_hours = Column(Float)
    customers_affected    = Column(Integer)
    restoration_cost_usd  = Column(Float)
    root_cause            = Column(String)
    severity              = Column(String)

    asset = relationship("Asset", back_populates="incidents")


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id                     = Column(Integer, primary_key=True, autoincrement=True)
    asset_id               = Column(String, ForeignKey("assets.asset_id"), nullable=False, index=True)
    computed_at            = Column(DateTime, default=datetime.utcnow)
    temperature_norm       = Column(Float)
    vibration_norm         = Column(Float)
    partial_discharge_norm = Column(Float)
    oil_quality_norm       = Column(Float)
    weather_risk_norm      = Column(Float)
    incident_rate_norm     = Column(Float)
    age_factor             = Column(Float)
    load_factor            = Column(Float)
    risk_score             = Column(Float)
    grid_impact_factor     = Column(Float)
    priority_score         = Column(Float)
    severity_label         = Column(String)
    rank                   = Column(Integer)

    asset = relationship("Asset", back_populates="risk_scores")


class WeatherForecast(Base):
    __tablename__ = "weather_forecasts"

    id                 = Column(Integer, primary_key=True, autoincrement=True)
    zone               = Column(String, nullable=False, index=True)
    forecast_date      = Column(String, nullable=False)
    wind_speed_kmh     = Column(Float)
    rainfall_mm_hr     = Column(Float)
    temp_deviation_c   = Column(Float)
    lightning_risk     = Column(Float)
    weather_risk_index = Column(Float)


class CrewRecord(Base):
    __tablename__ = "crews"

    crew_id   = Column(String, primary_key=True)
    name      = Column(String)
    home_zone = Column(String)
    size      = Column(Integer)
    skills    = Column(Text)  # JSON-serialised list
