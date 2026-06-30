from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_required, require_role
from app.db.session import get_db
from app.models.alert import Alert, RiskIndicator
from app.models.enums import AlertSeverity, UserRole
from app.schemas.alert import AlertCreateRequest, AlertResponse, RiskIndicatorResponse

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertResponse])
def list_active_alerts(
    state: str | None = Query(default=None, description="Filter by affected state"),
    severity: AlertSeverity | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """Public endpoint — no auth required. Citizens must always be able to see active alerts."""
    query = db.query(Alert).filter(Alert.is_active == True)  # noqa: E712
    if state:
        query = query.filter(Alert.affected_state == state)
    if severity:
        query = query.filter(Alert.severity == severity)
    return query.order_by(Alert.severity.desc(), Alert.issued_at.desc()).all()


@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return alert


@router.get("/{alert_id}/risk-indicators", response_model=list[RiskIndicatorResponse])
def get_alert_risk_indicators(alert_id: str, db: Session = Depends(get_db)):
    return db.query(RiskIndicator).filter(RiskIndicator.alert_id == alert_id).all()


@router.post("", response_model=AlertResponse, status_code=201)
def create_alert(
    payload: AlertCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.authority, UserRole.admin)),
):
    """Only Authority/Admin roles can publish alerts — this is the
    trust boundary for a government system: any citizen-facing alert
    must trace back to a verified authority account."""
    alert = Alert(**payload.model_dump(), created_by=current_user.id)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.patch("/{alert_id}/deactivate", response_model=AlertResponse)
def deactivate_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.authority, UserRole.admin)),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.is_active = False
    db.commit()
    db.refresh(alert)
    return alert
