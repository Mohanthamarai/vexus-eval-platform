"""
Database configuration and ORM models for the Multilingual Tutoring Assistant
Evaluation System. Uses SQLAlchemy with SQLite for persistent storage.
Supports Role-Based Access Control (Admin and Student) and secure sessions.
"""

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    text,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from config import DB_PATH, DATABASE_URL

# ---------------------------------------------------------------------------
# Engine & session
# ---------------------------------------------------------------------------

if DATABASE_URL:
    db_url = DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URL = db_url
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
else:
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},  # required for SQLite
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ---------------------------------------------------------------------------
# Dependency for FastAPI routes
# ---------------------------------------------------------------------------

def get_db():
    """Yield a database session and ensure it is closed after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# ORM Models
# ---------------------------------------------------------------------------

class User(Base):
    """Authenticated user account with server-side role validation."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(80), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="student")  # 'admin' | 'student'
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student_profile = relationship("Student", back_populates="user", uselist=False)
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")


class UserSession(Base):
    """Server-side active user sessions with revocation and expiration."""

    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_token = Column(String(128), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    user_agent = Column(String(255), nullable=True)
    ip_address = Column(String(64), nullable=True)

    # Relationships
    user = relationship("User", back_populates="sessions")


class Student(Base):
    """Represents a student enrolled in the tutoring system."""

    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True, index=True)
    name = Column(String(120), nullable=False)
    grade = Column(Integer, nullable=False)  # 1-16
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    sessions = relationship("Session", back_populates="student", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="student", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="student")
    assessments = relationship("Assessment", back_populates="student", cascade="all, delete-orphan")


class Session(Base):
    """A single tutoring interaction (question + AI response)."""

    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    question = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    subject = Column(String(60), nullable=False)
    grade_level = Column(Integer, nullable=False)
    language = Column(String(10), default="en")
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="sessions")
    evaluations = relationship("Evaluation", back_populates="session", cascade="all, delete-orphan")


class Evaluation(Base):
    """Stores the composite evaluation result for a session."""

    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    quality_score = Column(Float, nullable=False)        # 0-100
    hallucination_risk = Column(Float, nullable=False)   # 0-1
    dependency_index = Column(Float, nullable=False)     # 0-1
    learning_score = Column(Float, nullable=False)       # 0-100
    subject = Column(String(60), nullable=False)
    language = Column(String(10), default="en")
    timestamp = Column(DateTime, default=datetime.utcnow)
    details_json = Column(Text, nullable=True)           # JSON blob

    # Relationships
    session = relationship("Session", back_populates="evaluations")
    student = relationship("Student", back_populates="evaluations")


class Alert(Base):
    """System-generated alert when a metric crosses a threshold."""

    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    severity = Column(String(20), nullable=False)   # 'critical', 'warning', 'info'
    module = Column(String(60), nullable=False)      # which module triggered
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    resolved = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", back_populates="alerts")


class Assessment(Base):
    """Pre / post / retention assessment scores for a student."""

    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    assessment_type = Column(String(20), nullable=False)  # 'pre', 'post', 'retention'
    subject = Column(String(60), nullable=False)
    score = Column(Float, nullable=False)       # 0-100
    bloom_level = Column(Integer, nullable=False)  # 1-6
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="assessments")


class AuditLog(Base):
    """Audit log recording administrative and security actions."""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=True)
    target_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")


# ---------------------------------------------------------------------------
# Safe Zero-Downtime Migration Helper
# ---------------------------------------------------------------------------

def ensure_database_schema(db_engine):
    """
    Safely inspects existing SQLite tables and adds missing columns/tables
    without dropping or modifying existing rows.
    """
    is_sqlite = "sqlite" in str(db_engine.url)
    if is_sqlite:
        with db_engine.connect() as conn:
            # 1. Check if 'students' table has 'user_id' column
            try:
                result = conn.execute(text("PRAGMA table_info(students)")).fetchall()
                col_names = [row[1] for row in result]
                if "user_id" not in col_names and len(col_names) > 0:
                    conn.execute(text("ALTER TABLE students ADD COLUMN user_id INTEGER REFERENCES users(id)"))
                    conn.commit()
                    print("Applied migration: Added user_id to students table.")
            except Exception as e:
                print(f"Schema check error for students table: {e}")

    # 2. Create missing tables (users, user_sessions, audit_logs)
    Base.metadata.create_all(bind=db_engine)
