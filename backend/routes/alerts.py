"""
Alerts API routes.

Provides endpoints for viewing, filtering, and resolving system-generated
alerts.
"""

from __future__ import annotations
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import Alert, Student, get_db
from models import AlertModel

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertModel])
def get_active_alerts(db: Session = Depends(get_db)) -> List[AlertModel]:
    """Return all unresolved (active) alerts, newest first."""
    alerts = (
        db.query(Alert)
        .filter(Alert.resolved == False)  # noqa: E712
        .order_by(Alert.timestamp.desc())
        .all()
    )
    return _to_alert_models(alerts, db)


@router.get("/history", response_model=List[AlertModel])
def get_alert_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
) -> List[AlertModel]:
    """Return all alerts (resolved and unresolved) with pagination."""
    alerts = (
        db.query(Alert)
        .order_by(Alert.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return _to_alert_models(alerts, db)


@router.put("/{alert_id}/resolve", response_model=AlertModel)
def resolve_alert(
    alert_id: int, db: Session = Depends(get_db)
) -> AlertModel:
    """Mark a specific alert as resolved."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.resolved = True
    db.commit()
    db.refresh(alert)

    student_name = None
    if alert.student_id:
        student = db.query(Student).filter(Student.id == alert.student_id).first()
        student_name = student.name if student else None

    return AlertModel(
        id=alert.id,
        severity=alert.severity,
        module=alert.module,
        student_name=student_name,
        student_id=alert.student_id,
        message=alert.message,
        timestamp=alert.timestamp,
        resolved=alert.resolved,
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _to_alert_models(
    alerts: list, db: Session
) -> List[AlertModel]:
    """Convert ORM Alert rows to Pydantic AlertModel instances."""
    result: List[AlertModel] = []
    for a in alerts:
        student_name = None
        if a.student_id:
            student = (
                db.query(Student).filter(Student.id == a.student_id).first()
            )
            student_name = student.name if student else None
        result.append(
            AlertModel(
                id=a.id,
                severity=a.severity,
                module=a.module,
                student_name=student_name,
                student_id=a.student_id,
                message=a.message,
                timestamp=a.timestamp,
                resolved=a.resolved,
            )
        )
    return result
