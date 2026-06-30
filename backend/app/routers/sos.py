from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.enums import SOSPriority, SOSStatus, UserRole
from app.models.sos import SOSRequest, SOSStatusHistory
from app.schemas.sos import (
    SOSCreateRequest,
    SOSQueueStats,
    SOSResponse,
    SOSStatusUpdateRequest,
    SOSUpdateRequest,
)

router = APIRouter(prefix="/api/sos", tags=["sos"])

# Category -> default priority. Medical and Trapped are life-threatening-first by default;
# an authority/rescue team member can always override this after assessment.
DEFAULT_PRIORITY_BY_CATEGORY = {
    "medical": SOSPriority.critical,
    "trapped": SOSPriority.critical,
    "fire": SOSPriority.critical,
    "flood": SOSPriority.high,
    "other": SOSPriority.medium,
}


@router.post("", response_model=SOSResponse, status_code=201)
def create_sos(
    payload: SOSCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),  # optional — anonymous SOS must work
):
    """
    THE most important endpoint in this system. Deliberately minimal required
    fields (lat/lng only) so the signal goes out in seconds. No auth required:
    a citizen mid-emergency must never be blocked by a login screen.
    """
    priority = DEFAULT_PRIORITY_BY_CATEGORY.get(
        payload.category.value if payload.category else "other", SOSPriority.high
    )

    sos = SOSRequest(
        citizen_id=current_user.id if current_user else None,
        anonymous_contact_phone=payload.anonymous_contact_phone,
        latitude=payload.latitude,
        longitude=payload.longitude,
        category=payload.category,
        note=payload.note,
        priority=priority,
        status=SOSStatus.submitted,
    )
    db.add(sos)
    db.commit()
    db.refresh(sos)

    db.add(SOSStatusHistory(sos_request_id=sos.id, status=SOSStatus.submitted, changed_by=sos.citizen_id))
    db.commit()

    return sos


@router.get("/{sos_id}", response_model=SOSResponse)
def get_sos(sos_id: str, db: Session = Depends(get_db)):
    """Public read by ID — lets an anonymous citizen poll their own SOS status
    using the ID they received on submission, without requiring login."""
    sos = db.query(SOSRequest).filter(SOSRequest.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS request not found.")
    return sos


@router.patch("/{sos_id}", response_model=SOSResponse)
def update_sos_details(sos_id: str, payload: SOSUpdateRequest, db: Session = Depends(get_db)):
    """Allows the citizen to add category/note after the initial fast submission."""
    sos = db.query(SOSRequest).filter(SOSRequest.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS request not found.")

    if payload.category is not None:
        sos.category = payload.category
        sos.priority = DEFAULT_PRIORITY_BY_CATEGORY.get(payload.category.value, sos.priority)
    if payload.note is not None:
        sos.note = payload.note

    db.commit()
    db.refresh(sos)
    return sos


@router.get("", response_model=list[SOSResponse])
def list_sos_queue(
    status_filter: SOSStatus | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.rescue_team, UserRole.authority, UserRole.admin)),
):
    """Rescue team / authority queue view. Sorted by priority (critical first),
    then oldest-first within the same priority, matching the documented triage flow."""
    query = db.query(SOSRequest)
    if status_filter:
        query = query.filter(SOSRequest.status == status_filter)
    else:
        query = query.filter(SOSRequest.status != SOSStatus.resolved, SOSRequest.status != SOSStatus.cancelled)

    priority_order = {SOSPriority.critical: 0, SOSPriority.high: 1, SOSPriority.medium: 2, SOSPriority.low: 3}
    results = query.all()
    results.sort(key=lambda r: (priority_order[r.priority], r.created_at))
    return results


@router.get("/stats/summary", response_model=SOSQueueStats)
def get_queue_stats(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.rescue_team, UserRole.authority, UserRole.admin)),
):
    open_count = db.query(SOSRequest).filter(
        SOSRequest.status.notin_([SOSStatus.resolved, SOSStatus.cancelled])
    ).count()
    critical_count = db.query(SOSRequest).filter(
        SOSRequest.status.notin_([SOSStatus.resolved, SOSStatus.cancelled]),
        SOSRequest.priority == SOSPriority.critical,
    ).count()

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
    resolved_today_rows = (
        db.query(SOSRequest)
        .filter(SOSRequest.status == SOSStatus.resolved, SOSRequest.resolved_at >= today_start)
        .all()
    )
    resolved_today = len(resolved_today_rows)

    # Computed in Python rather than via a DB-specific date function (e.g. Postgres'
    # EXTRACT(EPOCH FROM ...)), which doesn't behave the same on SQLite and is easy
    # to get subtly wrong with naive vs timezone-aware datetimes. This keeps the
    # calculation identical regardless of which database backs the deployment.
    durations_seconds = [
        (row.resolved_at - row.created_at).total_seconds()
        for row in resolved_today_rows
        if row.resolved_at is not None
    ]
    avg_response_minutes = round(sum(durations_seconds) / len(durations_seconds) / 60, 1) if durations_seconds else None

    return SOSQueueStats(
        open_count=open_count,
        critical_count=critical_count,
        resolved_today=resolved_today,
        avg_response_minutes=avg_response_minutes,
    )


@router.patch("/{sos_id}/status", response_model=SOSResponse)
def update_sos_status(
    sos_id: str,
    payload: SOSStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.rescue_team, UserRole.authority, UserRole.admin)),
):
    """One-tap status transitions for the rescue dashboard. Every change is
    written to sos_status_history for audit purposes — required for a
    government-operated emergency system."""
    sos = db.query(SOSRequest).filter(SOSRequest.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS request not found.")

    now = datetime.now(timezone.utc)
    sos.status = payload.status
    if payload.assigned_unit:
        sos.assigned_unit = payload.assigned_unit
    if payload.status == SOSStatus.acknowledged:
        sos.acknowledged_at = now
    elif payload.status == SOSStatus.en_route:
        sos.en_route_at = now
    elif payload.status == SOSStatus.resolved:
        sos.resolved_at = now

    db.add(
        SOSStatusHistory(
            sos_request_id=sos.id,
            status=payload.status,
            changed_by=current_user.id,
            notes=payload.notes,
        )
    )
    db.commit()
    db.refresh(sos)
    return sos


@router.get("/{sos_id}/history")
def get_sos_history(
    sos_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.rescue_team, UserRole.authority, UserRole.admin)),
):
    history = (
        db.query(SOSStatusHistory)
        .filter(SOSStatusHistory.sos_request_id == sos_id)
        .order_by(SOSStatusHistory.changed_at.asc())
        .all()
    )
    return [
        {"status": h.status.value, "changed_at": h.changed_at, "notes": h.notes, "changed_by": h.changed_by}
        for h in history
    ]
