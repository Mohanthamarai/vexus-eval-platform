"""
Student API routes.

Provides endpoints for listing students and viewing individual student
details including sessions, dependency history, and assessments.
"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import (
    Student,
    Session as DBSession,
    Evaluation,
    Assessment,
    get_db,
)
from models import (
    AssessmentInfo,
    DependencyHistory,
    SessionInfo,
    StudentDetail,
    StudentSummary,
)

router = APIRouter(prefix="/api", tags=["Students"])


@router.get("/students", response_model=List[StudentSummary])
def list_students(db: Session = Depends(get_db)) -> List[StudentSummary]:
    """Return all students with aggregated evaluation metrics."""
    students = db.query(Student).all()
    result: List[StudentSummary] = []

    for s in students:
        evals = (
            db.query(Evaluation)
            .filter(Evaluation.student_id == s.id)
            .all()
        )
        sessions_count = (
            db.query(DBSession)
            .filter(DBSession.student_id == s.id)
            .count()
        )

        if evals:
            avg_q = sum(e.quality_score for e in evals) / len(evals)
            avg_h = sum(e.hallucination_risk for e in evals) / len(evals)
            avg_d = sum(e.dependency_index for e in evals) / len(evals)
            avg_l = sum(e.learning_score for e in evals) / len(evals)
        else:
            avg_q = avg_h = avg_d = avg_l = 0.0

        if avg_d >= 0.6:
            alert_level = "critical"
        elif avg_d >= 0.3:
            alert_level = "caution"
        else:
            alert_level = "healthy"

        result.append(
            StudentSummary(
                id=s.id,
                name=s.name,
                grade=s.grade,
                language=s.language,
                avg_quality=round(avg_q, 2),
                avg_hallucination_risk=round(avg_h, 4),
                dependency_index=round(avg_d, 4),
                learning_score=round(avg_l, 2),
                total_sessions=sessions_count,
                alert_level=alert_level,
            )
        )

    return result


@router.get("/students/{student_id}", response_model=StudentDetail)
def get_student(
    student_id: int, db: Session = Depends(get_db)
) -> StudentDetail:
    """Return detailed student view with sessions, dependency history, and
    assessments."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    evals = (
        db.query(Evaluation)
        .filter(Evaluation.student_id == student_id)
        .all()
    )
    sessions = (
        db.query(DBSession)
        .filter(DBSession.student_id == student_id)
        .order_by(DBSession.timestamp.desc())
        .all()
    )
    assessments = (
        db.query(Assessment)
        .filter(Assessment.student_id == student_id)
        .order_by(Assessment.timestamp)
        .all()
    )

    if evals:
        avg_q = sum(e.quality_score for e in evals) / len(evals)
        avg_h = sum(e.hallucination_risk for e in evals) / len(evals)
        avg_d = sum(e.dependency_index for e in evals) / len(evals)
        avg_l = sum(e.learning_score for e in evals) / len(evals)
    else:
        avg_q = avg_h = avg_d = avg_l = 0.0

    if avg_d >= 0.6:
        alert_level = "critical"
    elif avg_d >= 0.3:
        alert_level = "caution"
    else:
        alert_level = "healthy"

    # Build dependency history (group by date)
    dep_by_date: dict[str, list[float]] = {}
    for e in evals:
        date_str = e.timestamp.strftime("%Y-%m-%d")
        dep_by_date.setdefault(date_str, []).append(e.dependency_index)
    dependency_history = [
        DependencyHistory(
            date=d, dependency_index=round(sum(vals) / len(vals), 4)
        )
        for d, vals in sorted(dep_by_date.items())
    ]

    session_infos = []
    for s in sessions:
        q_score = 0.0
        r_score = 0.0
        if s.evaluations:
            q_score = s.evaluations[0].quality_score
            r_score = s.evaluations[0].hallucination_risk
        session_infos.append(
            SessionInfo(
                id=s.id,
                question=s.question,
                ai_response=s.ai_response,
                subject=s.subject,
                grade_level=s.grade_level,
                timestamp=s.timestamp,
                quality_score=q_score,
                risk_score=r_score,
            )
        )
    assessment_infos = [
        AssessmentInfo(
            id=a.id,
            assessment_type=a.assessment_type,
            subject=a.subject,
            score=a.score,
            bloom_level=a.bloom_level,
            timestamp=a.timestamp,
        )
        for a in assessments
    ]

    return StudentDetail(
        id=student.id,
        name=student.name,
        grade=student.grade,
        language=student.language,
        avg_quality=round(avg_q, 2),
        avg_hallucination_risk=round(avg_h, 4),
        dependency_index=round(avg_d, 4),
        learning_score=round(avg_l, 2),
        total_sessions=len(sessions),
        alert_level=alert_level,
        sessions=session_infos,
        dependency_history=dependency_history,
        assessments=assessment_infos,
    )
