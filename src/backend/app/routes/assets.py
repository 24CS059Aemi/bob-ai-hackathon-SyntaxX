"""Routes: GET /assets, GET /assets/{asset_id}, GET /assets/{asset_id}/sensors"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from .. import models
from ..schemas import AssetSchema, SensorReadingSchema

router = APIRouter(prefix="/assets", tags=["Assets"])


@router.get("", response_model=List[AssetSchema])
def list_assets(db: Session = Depends(get_db)):
    return db.query(models.Asset).all()


@router.get("/{asset_id}", response_model=AssetSchema)
def get_asset(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(models.Asset).filter(models.Asset.asset_id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    return asset


@router.get("/{asset_id}/sensors", response_model=List[SensorReadingSchema])
def get_sensor_readings(asset_id: str, days: int = 7, db: Session = Depends(get_db)):
    """Return sensor readings for the past `days` days for a single asset."""
    since = datetime.utcnow() - timedelta(days=days)
    readings = (
        db.query(models.SensorReading)
        .filter(
            models.SensorReading.asset_id == asset_id,
            models.SensorReading.timestamp >= since,
        )
        .order_by(models.SensorReading.timestamp)
        .all()
    )
    return [
        SensorReadingSchema(
            asset_id=r.asset_id,
            timestamp=r.timestamp.isoformat(),
            temperature_c=r.temperature_c,
            vibration_mms=r.vibration_mms,
            partial_discharge_pc=r.partial_discharge_pc,
            oil_quality_index=r.oil_quality_index,
            load_percent=r.load_percent,
        )
        for r in readings
    ]
