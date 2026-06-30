from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.content import EmergencyContact
from app.schemas.content import EmergencyContactResponse

router = APIRouter(prefix="/api/emergency-contacts", tags=["emergency-contacts"])


@router.get("", response_model=list[EmergencyContactResponse])
def list_emergency_contacts(
    state: str | None = Query(default=None),
    district: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """Always-public endpoint. National numbers (police 100, ambulance 108,
    disaster helpline 1078, NDRF) plus any state/district-specific entries."""
    query = db.query(EmergencyContact)
    if state:
        query = query.filter((EmergencyContact.state == state) | (EmergencyContact.scope == "national"))
    if district:
        query = query.filter((EmergencyContact.district == district) | (EmergencyContact.scope != "district"))
    return query.order_by(EmergencyContact.display_order.asc()).all()
