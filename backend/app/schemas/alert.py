from datetime import datetime

from pydantic import BaseModel

from app.models.enums import AlertSeverity, DisasterType


class RiskIndicatorResponse(BaseModel):
    id: str
    indicator_type: str
    value: float
    unit: str
    trend: str | None
    recorded_at: datetime

    class Config:
        from_attributes = True


class AlertResponse(BaseModel):
    id: str
    title: str
    description: str
    disaster_type: DisasterType
    severity: AlertSeverity
    issuing_authority: str
    affected_state: str
    affected_district: str | None
    latitude: float | None
    longitude: float | None
    radius_km: float | None
    is_active: bool
    issued_at: datetime
    expires_at: datetime | None

    class Config:
        from_attributes = True


class AlertCreateRequest(BaseModel):
    title: str
    description: str
    disaster_type: DisasterType
    severity: AlertSeverity
    issuing_authority: str
    affected_state: str
    affected_district: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    radius_km: float | None = None
    expires_at: datetime | None = None
