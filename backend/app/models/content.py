import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.models.enums import DisasterType


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    label: Mapped[str] = mapped_column(String, nullable=False)
    phone_number: Mapped[str] = mapped_column(String, nullable=False)
    scope: Mapped[str] = mapped_column(String, default="national", nullable=False)
    state: Mapped[str | None] = mapped_column(String, nullable=True)
    district: Mapped[str | None] = mapped_column(String, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class GuidanceTopic(Base):
    __tablename__ = "guidance_topics"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_key: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    title_en: Mapped[str] = mapped_column(String, nullable=False)
    title_hi: Mapped[str] = mapped_column(String, nullable=False)
    steps_en: Mapped[list] = mapped_column(JSON, nullable=False)
    steps_hi: Mapped[list] = mapped_column(JSON, nullable=False)
    disaster_type: Mapped[DisasterType | None] = mapped_column(Enum(DisasterType), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
