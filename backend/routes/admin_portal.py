"""
Admin Portal API routes for VEXUS.
Provides administrator management endpoints:
- System overview and aggregate analytics
- Student account management (create, update, reset password)
- AI evaluation audit logs
- Safety alert management
- Administrative audit trail
Strictly protected by require_admin dependency.
"""

from datetime import datetime
import json
import secrets
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import (
    User,
    Student,
    Session as DBSession,
    Evaluation,
    Alert,
    Assessment,
    AuditLog,
    get_db,
)
from models import (
    AdminCreateStudentRequest,
    AdminUpdateStudentRequest,
    AdminResetPasswordRequest,
    AlertModel,
)
from auth_deps import require_admin
from security import hash_password

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])


@router.get("/dashboard")
def get_admin_dashboard(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Return comprehensive system analytics for the administrator."""
    total_students = db.query(Student).count()
    total_evaluations = db.query(Evaluation).count()
    total_sessions = db.query(DBSession).count()
    total_alerts = db.query(Alert).count()
    active_alerts_count = db.query(Alert).filter(Alert.resolved == False).count()  # noqa: E712

    if total_evaluations > 0:
        avg_q = db.query(func.avg(Evaluation.quality_score)).scalar() or 0
        avg_h = db.query(func.avg(Evaluation.hallucination_risk)).scalar() or 0
        avg_d = db.query(func.avg(Evaluation.dependency_index)).scalar() or 0
        avg_l = db.query(func.avg(Evaluation.learning_score)).scalar() or 0
    else:
        avg_q = avg_h = avg_d = avg_l = 0

    # Recent alerts
    recent_alerts_rows = (
        db.query(Alert)
        .order_by(Alert.timestamp.desc())
        .limit(10)
        .all()
    )
    alerts_data = []
    for a in recent_alerts_rows:
        student_name = a.student.name if a.student else None
        alerts_data.append({
            "id": a.id,
            "severity": a.severity,
            "module": a.module,
            "student_name": student_name,
            "student_id": a.student_id,
            "message": a.message,
            "timestamp": a.timestamp.isoformat(),
            "resolved": a.resolved,
        })

    # Subject performance
    subjects = (
        db.query(
            Evaluation.subject,
            func.avg(Evaluation.quality_score),
            func.avg(Evaluation.learning_score)
        )
        .group_by(Evaluation.subject)
        .all()
    )
    subject_labels = []
    subject_quality = []
    subject_learning = []
    for subj, q, l in subjects:
        subject_labels.append(subj)
        subject_quality.append(round(q or 0, 1))
        subject_learning.append(round(l or 0, 1))

    # Score distribution
    eval_scores = db.query(Evaluation.quality_score).all()
    excellent = sum(1 for e in eval_scores if e[0] >= 80)
    good = sum(1 for e in eval_scores if 60 <= e[0] < 80)
    average = sum(1 for e in eval_scores if 40 <= e[0] < 60)
    poor = sum(1 for e in eval_scores if e[0] < 40)

    return {
        "overview": {
            "total_students": total_students,
            "total_evaluations": total_evaluations,
            "total_sessions": total_sessions,
            "total_alerts": total_alerts,
            "active_alerts_count": active_alerts_count,
            "avg_quality": round(float(avg_q), 1),
            "avg_hallucination_risk": round(float(avg_h), 3),
            "avg_dependency": round(float(avg_d), 3),
            "avg_learning_score": round(float(avg_l), 1),
        },
        "recent_alerts": alerts_data,
        "subjects": {
            "labels": subject_labels,
            "quality": subject_quality,
            "learning": subject_learning,
        },
        "distribution": {
            "labels": ['Excellent (80+)', 'Good (60-79)', 'Average (40-59)', 'Poor (<40)'],
            "values": [excellent, good, average, poor],
        }
    }


@router.get("/students")
def list_students(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all students with aggregate metrics and user account info."""
    students = db.query(Student).all()
    results = []

    for s in students:
        evals = s.evaluations
        sessions_count = len(s.sessions)

        if evals:
            avg_q = sum(e.quality_score for e in evals) / len(evals)
            avg_h = sum(e.hallucination_risk for e in evals) / len(evals)
            avg_d = sum(e.dependency_index for e in evals) / len(evals)
            avg_l = sum(e.learning_score for e in evals) / len(evals)
        else:
            avg_q = avg_h = avg_d = avg_l = 0.0

        alert_level = "critical" if avg_d >= 0.6 else ("caution" if avg_d >= 0.3 else "healthy")

        results.append({
            "id": s.id,
            "name": s.name,
            "grade": s.grade,
            "language": s.language,
            "username": s.user.username if s.user else None,
            "user_id": s.user_id,
            "is_active": s.user.is_active if s.user else True,
            "total_sessions": sessions_count,
            "avg_quality": round(avg_q, 1),
            "avg_hallucination_risk": round(avg_h, 3),
            "dependency_index": round(avg_d, 3),
            "learning_score": round(avg_l, 1),
            "alert_level": alert_level,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        })
    return results


@router.post("/students", status_code=status.HTTP_201_CREATED)
def create_student(
    req: AdminCreateStudentRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new student record along with their authenticated User account."""
    clean_name = "".join(c.lower() for c in req.name if c.isalnum())
    username = req.username.strip().lower() if req.username else clean_name
    if not username:
        username = f"student_{int(datetime.utcnow().timestamp())}"

    # Verify username uniqueness
    if db.query(User).filter(User.username == username).first():
        username = f"{username}_{secrets.randbelow(1000)}"

    plain_password = req.password.strip() if req.password else f"{username.capitalize()}2026!"

    user = User(
        username=username,
        email=f"{username}@student.vexus.internal",
        password_hash=hash_password(plain_password),
        role="student",
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.flush()

    student = Student(
        user_id=user.id,
        name=req.name.strip(),
        grade=req.grade,
        language=req.language.strip().lower(),
        created_at=datetime.utcnow()
    )
    db.add(student)
    db.flush()

    # Record Audit Log
    db.add(AuditLog(
        user_id=current_admin.id,
        action="ADMIN_CREATED_STUDENT",
        target_type="student",
        target_id=str(student.id),
        details=f"Admin '{current_admin.username}' created student '{student.name}' with username '{username}'"
    ))
    db.commit()

    return {
        "status": "success",
        "student_id": student.id,
        "user_id": user.id,
        "name": student.name,
        "username": username,
        "initial_password": plain_password,
        "grade": student.grade,
        "language": student.language,
        "message": "Student account provisioned successfully"
    }


@router.patch("/students/{student_id}")
def update_student(
    student_id: int,
    req: AdminUpdateStudentRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update student profile details or toggle active status."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if req.name is not None:
        student.name = req.name.strip()
    if req.grade is not None:
        student.grade = req.grade
    if req.language is not None:
        student.language = req.language.strip()
    if req.is_active is not None and student.user:
        student.user.is_active = req.is_active

    db.add(AuditLog(
        user_id=current_admin.id,
        action="ADMIN_UPDATED_STUDENT",
        target_type="student",
        target_id=str(student.id),
        details=f"Admin '{current_admin.username}' updated student ID {student_id}"
    ))
    db.commit()

    return {"status": "success", "message": "Student profile updated successfully"}


@router.post("/students/{student_id}/reset-password")
def reset_student_password(
    student_id: int,
    req: AdminResetPasswordRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Reset the password for a student user account."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if not student.user:
        # If user account is missing, create one
        clean_name = "".join(c.lower() for c in student.name if c.isalnum())
        username = clean_name if clean_name else f"student_{student.id}"
        user = User(
            username=username,
            email=f"{username}@student.vexus.internal",
            password_hash=hash_password("StudentReset2026!"),
            role="student",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.flush()
        student.user_id = user.id

    new_pass = req.new_password.strip() if req.new_password else f"Student{secrets.token_hex(4)}!"
    student.user.password_hash = hash_password(new_pass)
    student.user.updated_at = datetime.utcnow()

    db.add(AuditLog(
        user_id=current_admin.id,
        action="ADMIN_RESET_PASSWORD",
        target_type="student",
        target_id=str(student.id),
        details=f"Admin '{current_admin.username}' reset password for student '{student.name}'"
    ))
    db.commit()

    return {
        "status": "success",
        "username": student.user.username,
        "new_password": new_pass,
        "message": "Password reset successfully"
    }


@router.get("/evaluations")
def list_evaluations(
    limit: int = 50,
    skip: int = 0,
    subject: Optional[str] = None,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Audit log of all evaluations with search and subject filters."""
    query = db.query(Evaluation)
    if subject and subject.lower() != "all":
        query = query.filter(Evaluation.subject.ilike(f"%{subject}%"))

    total = query.count()
    records = query.order_by(Evaluation.timestamp.desc()).offset(skip).limit(limit).all()

    results = []
    for e in records:
        student_name = e.student.name if e.student else "Unassigned"
        question = e.session.question if e.session else "N/A"
        results.append({
            "id": e.id,
            "session_id": e.session_id,
            "student_id": e.student_id,
            "student_name": student_name,
            "question": question,
            "subject": e.subject,
            "quality_score": round(e.quality_score, 1),
            "hallucination_risk": round(e.hallucination_risk, 3),
            "dependency_index": round(e.dependency_index, 3),
            "learning_score": round(e.learning_score, 1),
            "timestamp": e.timestamp.isoformat(),
        })

    return {"total": total, "evaluations": results}


@router.get("/alerts")
def list_alerts(
    resolved: Optional[bool] = None,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieve safety alerts with optional resolution filter."""
    query = db.query(Alert)
    if resolved is not None:
        query = query.filter(Alert.resolved == resolved)

    alerts = query.order_by(Alert.timestamp.desc()).limit(100).all()
    results = []
    for a in alerts:
        student_name = a.student.name if a.student else None
        results.append({
            "id": a.id,
            "severity": a.severity,
            "module": a.module,
            "student_name": student_name,
            "student_id": a.student_id,
            "message": a.message,
            "timestamp": a.timestamp.isoformat(),
            "resolved": a.resolved,
        })
    return results


@router.put("/alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Mark a specific safety alert as resolved."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.resolved = True
    db.add(AuditLog(
        user_id=current_admin.id,
        action="ALERT_RESOLVED",
        target_type="alert",
        target_id=str(alert.id),
        details=f"Admin '{current_admin.username}' resolved alert {alert_id}"
    ))
    db.commit()

    return {"status": "success", "alert_id": alert_id, "resolved": True}


@router.get("/audit-logs")
def list_audit_logs(
    limit: int = 50,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieve security audit logs."""
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "username": log.user.username if log.user else "System",
            "action": log.action,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "details": log.details,
            "timestamp": log.timestamp.isoformat(),
        }
        for log in logs
    ]
