"""
Pydantic schemas for request/response validation in the Multilingual Tutoring
Assistant Evaluation System.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class EvaluationRequest(BaseModel):
    """Payload sent by the frontend to evaluate an AI tutoring response."""

    question: str = Field(..., min_length=1, description="Student's question")
    ai_response: str = Field(..., min_length=1, description="AI tutor's response")
    subject: str = Field("general", description="Academic subject")
    grade_level: int = Field(8, ge=1, le=16, description="Student grade level (13-16 for college)")
    student_id: Optional[int] = Field(None, description="Optional student ID")
    ground_truth: Optional[str] = Field(
        None, description="Reference answer for accuracy comparison"
    )


# ---------------------------------------------------------------------------
# Breakdown schemas (sub-components of an evaluation result)
# ---------------------------------------------------------------------------

class QualityBreakdown(BaseModel):
    """Detailed sub-scores for the Answer Quality module."""

    factual_accuracy: float = Field(..., ge=0, le=100)
    completeness: float = Field(..., ge=0, le=100)
    clarity: float = Field(..., ge=0, le=100)
    pedagogical_value: float = Field(..., ge=0, le=100)
    age_appropriateness: float = Field(..., ge=0, le=100)


class HallucinationBreakdown(BaseModel):
    """Detailed sub-scores for the Hallucination Detection module."""

    fabrication_score: float = Field(..., ge=0, le=1)
    citation_score: float = Field(..., ge=0, le=1)
    formula_score: float = Field(..., ge=0, le=1)
    confidence_score: float = Field(..., ge=0, le=1)
    flagged_claims: List[str] = Field(default_factory=list)


class DependencyBreakdown(BaseModel):
    """Detailed sub-scores for the Dependency Analysis module."""

    query_frequency: float = Field(..., ge=0, le=1)
    copy_paste_ratio: float = Field(..., ge=0, le=1)
    self_attempt_time: float = Field(..., ge=0, le=1)
    scaffolding_bypass: float = Field(..., ge=0, le=1)
    alert_level: str = Field("healthy", description="healthy | caution | critical")


class LearningBreakdown(BaseModel):
    """Detailed sub-scores for the Learning Outcomes module."""

    assessment_gain: float = Field(..., ge=0, le=100)
    bloom_progression: float = Field(..., ge=0, le=100)
    retention_rate: float = Field(..., ge=0, le=100)


# ---------------------------------------------------------------------------
# Full evaluation result
# ---------------------------------------------------------------------------

class EvaluationResult(BaseModel):
    """Complete evaluation output combining all four modules."""

    quality_score: float
    hallucination_risk: float
    dependency_index: float
    learning_score: float
    quality_details: QualityBreakdown
    hallucination_details: HallucinationBreakdown
    dependency_details: DependencyBreakdown
    learning_details: LearningBreakdown
    recommendations: List[str] = Field(default_factory=list)
    overall_grade: str = Field("C", description="Letter grade A-F")


# ---------------------------------------------------------------------------
# Student schemas
# ---------------------------------------------------------------------------

class StudentSummary(BaseModel):
    """Lightweight student overview for list views."""

    id: int
    name: str
    grade: int
    language: str = "en"
    avg_quality: float = 0.0
    avg_hallucination_risk: float = 0.0
    dependency_index: float = 0.0
    learning_score: float = 0.0
    total_sessions: int = 0
    alert_level: str = "healthy"

    class Config:
        from_attributes = True


class SessionInfo(BaseModel):
    """Minimal session data embedded in StudentDetail."""

    id: int
    question: str
    ai_response: str
    subject: str
    grade_level: int
    timestamp: datetime
    quality_score: Optional[float] = 0.0
    risk_score: Optional[float] = 0.0

    class Config:
        from_attributes = True


class DependencyHistory(BaseModel):
    """A single dependency snapshot for timeline charts."""

    date: str
    dependency_index: float


class AssessmentInfo(BaseModel):
    """Assessment data embedded in StudentDetail."""

    id: int
    assessment_type: str
    subject: str
    score: float
    bloom_level: int
    timestamp: datetime

    class Config:
        from_attributes = True


class StudentDetail(StudentSummary):
    """Extended student view with historical data."""

    sessions: List[SessionInfo] = Field(default_factory=list)
    dependency_history: List[DependencyHistory] = Field(default_factory=list)
    assessments: List[AssessmentInfo] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Dashboard schemas
# ---------------------------------------------------------------------------

class AlertModel(BaseModel):
    """Single alert entry."""

    id: int
    severity: str
    module: str
    student_name: Optional[str] = None
    student_id: Optional[int] = None
    message: str
    timestamp: datetime
    resolved: bool = False

    class Config:
        from_attributes = True


class DashboardOverview(BaseModel):
    """Aggregated metrics for the main dashboard."""

    avg_quality: float = 0.0
    avg_hallucination_risk: float = 0.0
    avg_dependency: float = 0.0
    avg_learning_score: float = 0.0
    total_students: int = 0
    total_evaluations: int = 0
    total_alerts: int = 0
    active_alerts_count: int = 0
    quality_trend: float = 0.0
    risk_trend: float = 0.0
    dependency_trend: float = 0.0
    learning_trend: float = 0.0
    recent_alerts: List[AlertModel] = Field(default_factory=list)


class TrendData(BaseModel):
    """Time-series data for dashboard charts."""

    labels: List[str] = Field(default_factory=list, description="Date strings")
    quality: List[float] = Field(default_factory=list)
    hallucination: List[float] = Field(default_factory=list)
    dependency: List[float] = Field(default_factory=list)
    learning: List[float] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Authentication & Role schemas
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=80)
    password: str = Field(..., min_length=1)


class LoginResponse(BaseModel):
    session_token: str
    user_id: int
    username: str
    email: Optional[str] = None
    role: str
    student_id: Optional[int] = None
    student_name: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    student_id: Optional[int] = None
    student_name: Optional[str] = None

    class Config:
        from_attributes = True


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


class AdminCreateStudentRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    grade: int = Field(..., ge=1, le=16)
    language: str = Field("en", min_length=2, max_length=10)
    username: Optional[str] = None
    password: Optional[str] = None


class AdminUpdateStudentRequest(BaseModel):
    name: Optional[str] = None
    grade: Optional[int] = None
    language: Optional[str] = None
    is_active: Optional[bool] = None


class AdminResetPasswordRequest(BaseModel):
    new_password: Optional[str] = None


class StudentChatMessage(BaseModel):
    role: str
    content: str


class StudentChatRequest(BaseModel):
    subject: str = Field("general", description="Academic subject")
    grade_level: Optional[int] = None
    history: List[StudentChatMessage] = Field(default_factory=list)
    message: str = Field(..., min_length=1)


class StudentChatResponse(BaseModel):
    response: str
    session_id: int
    subject: str
    grade_level: int
    overall_grade: str
    quality_score: float
    hallucination_risk: float
    pedagogical_feedback: List[str] = Field(default_factory=list)
    model_used: str
    latency_ms: float

