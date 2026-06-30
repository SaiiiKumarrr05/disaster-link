import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.models.enums import SOSCategory, SOSPriority, SOSStatus


class SOSRequest(Base):
    __tablename__ = "sos_requests"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    citizen_id: Mapped[str | None] = mapped_column(String, ForeignKey("profiles.id"), nullable=True)
    anonymous_contact_phone: Mapped[str | None] = mapped_column(String, nullable=True)

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    category: Mapped[SOSCategory | None] = mapped_column(Enum(SOSCategory), nullable=True)
    priority: Mapped[SOSPriority] = mapped_column(Enum(SOSPriority), default=SOSPriority.high, nullable=False)
    status: Mapped[SOSStatus] = mapped_column(Enum(SOSStatus), default=SOSStatus.submitted, nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_unit: Mapped[str | None] = mapped_column(String, nullable=True)

    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    en_route_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class SOSStatusHistory(Base):
    __tablename__ = "sos_status_history"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sos_request_id: Mapped[str] = mapped_column(String, ForeignKey("sos_requests.id"), nullable=False)
    status: Mapped[SOSStatus] = mapped_column(Enum(SOSStatus), nullable=False)
    changed_by: Mapped[str | None] = mapped_column(String, ForeignKey("profiles.id"), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
