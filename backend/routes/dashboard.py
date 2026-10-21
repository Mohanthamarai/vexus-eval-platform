"""
Dashboard API routes.

Provides aggregated metrics and 30-day trend data for the evaluation
dashboard.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import Alert, Evaluation, Student, get_db
from models import AlertModel, DashboardOverview, TrendData

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverview)
def get_overview(db: Session = Depends(get_db)) -> DashboardOverview:
    """Return aggregated evaluation metrics for the dashboard."""
    total_students = db.query(Student).count()
    total_evaluations = db.query(Evaluation).count()
    total_alerts = db.query(Alert).count()
    active_alerts_count = (
        db.query(Alert).filter(Alert.resolved == False).count()  # noqa: E712
    )

    # Averages
    if total_evaluations > 0:
        avg_q = db.query(func.avg(Evaluation.quality_score)).scalar() or 0
        avg_h = db.query(func.avg(Evaluation.hallucination_risk)).scalar() or 0
        avg_d = db.query(func.avg(Evaluation.dependency_index)).scalar() or 0
        avg_l = db.query(func.avg(Evaluation.learning_score)).scalar() or 0
    else:
        avg_q = avg_h = avg_d = avg_l = 0

    # 10 most recent alerts
    recent_rows = (
        db.query(Alert).order_by(Alert.timestamp.desc()).limit(10).all()
    )
    recent_alerts: List[AlertModel] = []
    for a in recent_rows:
        student_name = None
        if a.student_id:
            student = db.query(Student).filter(Student.id == a.student_id).first()
            student_name = student.name if student else None
        recent_alerts.append(
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

    # Calculate trends comparing the last 7 days with the previous 7 days (days 8-14)
    now = datetime.utcnow()
    one_week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    cur_q = db.query(func.avg(Evaluation.quality_score)).filter(Evaluation.timestamp >= one_week_ago).scalar()
    cur_h = db.query(func.avg(Evaluation.hallucination_risk)).filter(Evaluation.timestamp >= one_week_ago).scalar()
    cur_d = db.query(func.avg(Evaluation.dependency_index)).filter(Evaluation.timestamp >= one_week_ago).scalar()
    cur_l = db.query(func.avg(Evaluation.learning_score)).filter(Evaluation.timestamp >= one_week_ago).scalar()

    prev_q = db.query(func.avg(Evaluation.quality_score)).filter(Evaluation.timestamp >= two_weeks_ago, Evaluation.timestamp < one_week_ago).scalar()
    prev_h = db.query(func.avg(Evaluation.hallucination_risk)).filter(Evaluation.timestamp >= two_weeks_ago, Evaluation.timestamp < one_week_ago).scalar()
    prev_d = db.query(func.avg(Evaluation.dependency_index)).filter(Evaluation.timestamp >= two_weeks_ago, Evaluation.timestamp < one_week_ago).scalar()
    prev_l = db.query(func.avg(Evaluation.learning_score)).filter(Evaluation.timestamp >= two_weeks_ago, Evaluation.timestamp < one_week_ago).scalar()

    q_trend = (cur_q - prev_q) if (cur_q is not None and prev_q is not None) else 0.0
    h_trend = (cur_h - prev_h) if (cur_h is not None and prev_h is not None) else 0.0
    d_trend = (cur_d - prev_d) if (cur_d is not None and prev_d is not None) else 0.0
    l_trend = (cur_l - prev_l) if (cur_l is not None and prev_l is not None) else 0.0

    return DashboardOverview(
        avg_quality=round(float(avg_q), 2),
        avg_hallucination_risk=round(float(avg_h), 4),
        avg_dependency=round(float(avg_d), 4),
        avg_learning_score=round(float(avg_l), 2),
        total_students=total_students,
        total_evaluations=total_evaluations,
        total_alerts=total_alerts,
        active_alerts_count=active_alerts_count,
        quality_trend=round(float(q_trend), 2),
        risk_trend=round(float(h_trend), 4),
        dependency_trend=round(float(d_trend), 4),
        learning_trend=round(float(l_trend), 2),
        recent_alerts=recent_alerts,
    )


@router.get("/trends", response_model=TrendData)
def get_trends(db: Session = Depends(get_db)) -> TrendData:
    """Return daily-averaged metrics for the past 30 days."""
    today = datetime.utcnow().date()

    labels: List[str] = []
    quality: List[float] = []
    hallucination: List[float] = []
    dependency: List[float] = []
    learning: List[float] = []

    for i in range(29, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day)
        day_end = day_start + timedelta(days=1)

        evals = (
            db.query(Evaluation)
            .filter(
                Evaluation.timestamp >= day_start,
                Evaluation.timestamp < day_end,
            )
            .all()
        )

        labels.append(day.strftime("%Y-%m-%d"))

        if evals:
            n = len(evals)
            quality.append(
                round(sum(e.quality_score for e in evals) / n, 2)
            )
            hallucination.append(
                round(sum(e.hallucination_risk for e in evals) / n, 4)
            )
            dependency.append(
                round(sum(e.dependency_index for e in evals) / n, 4)
            )
            learning.append(
                round(sum(e.learning_score for e in evals) / n, 2)
            )
        else:
            quality.append(0.0)
            hallucination.append(0.0)
            dependency.append(0.0)
            learning.append(0.0)

    return TrendData(
        labels=labels,
        quality=quality,
        hallucination=hallucination,
        dependency=dependency,
        learning=learning,
    )

@router.get("/subjects")
def get_subjects(db: Session = Depends(get_db)):
    """Return performance aggregated by subject."""
    subjects = db.query(Evaluation.subject, func.avg(Evaluation.quality_score), func.avg(Evaluation.learning_score)).group_by(Evaluation.subject).all()
    
    labels = []
    quality = []
    learning = []
    
    for subj, q_avg, l_avg in subjects:
        labels.append(subj)
        quality.append(round(q_avg or 0, 2))
        learning.append(round(l_avg or 0, 2))
        
    return {
        "labels": labels,
        "quality": quality,
        "learning": learning
    }

@router.get("/distribution")
def get_distribution(db: Session = Depends(get_db)):
    """Return score distribution breakdown."""
    evals = db.query(Evaluation.quality_score).all()
    
    excellent = sum(1 for e in evals if e[0] >= 80)
    good = sum(1 for e in evals if 60 <= e[0] < 80)
    average = sum(1 for e in evals if 40 <= e[0] < 60)
    poor = sum(1 for e in evals if e[0] < 40)
    
    return {
        "labels": ['Excellent (80+)', 'Good (60-79)', 'Average (40-59)', 'Poor (<40)'],
        "values": [excellent, good, average, poor]
    }
