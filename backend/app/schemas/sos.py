from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import SOSCategory, SOSPriority, SOSStatus


class SOSCreateRequest(BaseModel):
    """
    Minimal required fields by design: latitude/longitude only.
    Category, note, and contact phone are optional and can be added
    in a follow-up PATCH — the initial signal must never be blocked
    by asking for more information than GPS alone.
    """
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., le=180, ge=-180)
    category: SOSCategory | None = None
    note: str | None = None
    anonymous_contact_phone: str | None = None


class SOSUpdateRequest(BaseModel):
    category: SOSCategory | None = None
    note: str | None = None


class SOSStatusUpdateRequest(BaseModel):
    status: SOSStatus
    assigned_unit: str | None = None
    notes: str | None = None


class SOSResponse(BaseModel):
    id: str
    citizen_id: str | None
    anonymous_contact_phone: str | None
    latitude: float
    longitude: float
    category: SOSCategory | None
    priority: SOSPriority
    status: SOSStatus
    note: str | None
    assigned_unit: str | None
    acknowledged_at: datetime | None
    en_route_at: datetime | None
    resolved_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SOSQueueStats(BaseModel):
    open_count: int
    critical_count: int
    resolved_today: int
    avg_response_minutes: float | None
