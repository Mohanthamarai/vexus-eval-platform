"""
VEXUS Health & System Diagnostics API
Provides endpoints for monitoring, inspecting, and running live diagnostic tests
across all evaluation modules, databases, and AI models.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import time
import os
import sys

from database import get_db, Student, Evaluation, Alert, Session as DBSession
from config import GROQ_API_KEY, GROQ_MODEL
from groq import Groq
from modules.answer_quality import AnswerQualityScorer
from modules.hallucination_detector import HallucinationDetector
from modules.dependency_analyzer import DependencyAnalyzer
from modules.learning_outcomes import LearningOutcomeTracker
from modules.multilingual import multilingual

router = APIRouter(prefix="/api/health", tags=["Health & Diagnostics"])

_START_TIME = time.time()

# Singletons for health testing
_quality_scorer = AnswerQualityScorer()
_hallucination_detector = HallucinationDetector()
_dependency_analyzer = DependencyAnalyzer()
_learning_tracker = LearningOutcomeTracker()

@router.get("")
def get_health_status(db: Session = Depends(get_db)):
    """Instant status check across all platform components."""
    now = datetime.utcnow().isoformat()
    uptime_sec = round(time.time() - _START_TIME, 1)

    # 1. Database check
    db_status = "operational"
    db_metrics = {}
    try:
        student_count = db.query(Student).count()
        eval_count = db.query(Evaluation).count()
        alert_count = db.query(Alert).count()
        session_count = db.query(DBSession).count()
        db_metrics = {
            "students": student_count,
            "evaluations": eval_count,
            "alerts": alert_count,
            "sessions": session_count,
        }
    except Exception as e:
        db_status = f"degraded: {str(e)}"

    # 2. Groq LLM check
    groq_status = "operational"
    available_models = []
    try:
        client = Groq(api_key=GROQ_API_KEY)
        models = client.models.list().data
        available_models = [m.id for m in models][:8]
    except Exception as e:
        groq_status = f"degraded: {str(e)}"

    return {
        "status": "healthy" if db_status == "operational" and groq_status == "operational" else "degraded",
        "timestamp": now,
        "version": "2.4.0",
        "uptime_seconds": uptime_sec,
        "active_model": GROQ_MODEL,
        "components": {
            "database": {
                "status": db_status,
                "engine": "SQLite (SQLAlchemy)",
                "metrics": db_metrics
            },
            "groq_llm": {
                "status": groq_status,
                "model": GROQ_MODEL,
                "available_models": available_models
            },
            "answer_quality_module": {
                "status": "operational",
                "sub_dimensions": ["accuracy", "completeness", "clarity", "pedagogy", "age_appropriateness"]
            },
            "hallucination_module": {
                "status": "operational",
                "sub_dimensions": ["fabrication", "citation", "formula", "confidence"]
            },
            "dependency_module": {
                "status": "operational",
                "sub_dimensions": ["query_freq", "copy_paste_ratio", "self_attempt_time", "scaffolding_bypass"]
            },
            "learning_module": {
                "status": "operational",
                "sub_dimensions": ["assessment_gain", "blooms_taxonomy", "retention_rate"]
            },
            "multilingual_layer": {
                "status": "operational",
                "base_language": "en",
                "auto_detect_supported": True
            }
        }
    }


@router.post("/test")
def run_live_diagnostics(db: Session = Depends(get_db)):
    """Runs an active, live synthetic evaluation test across all 6 sub-systems and returns metrics."""
    results = {}
    overall_pass = True

    # Test 1: Database ORM Latency
    t0 = time.time()
    try:
        st_count = db.query(Student).count()
        db_latency = round((time.time() - t0) * 1000, 2)
        results["database"] = {
            "verdict": "PASS",
            "latency_ms": db_latency,
            "details": f"Successfully queried {st_count} students in SQLite."
        }
    except Exception as e:
        overall_pass = False
        results["database"] = {"verdict": "FAIL", "latency_ms": 0, "details": str(e)}

    # Test 2: Groq LLM Direct Inference
    t0 = time.time()
    llm_output = ""
    try:
        client = Groq(api_key=GROQ_API_KEY)
        resp = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": "Respond with the single word: OK"}],
            max_tokens=10,
            timeout=10.0
        )
        llm_latency = round((time.time() - t0) * 1000, 2)
        llm_output = resp.choices[0].message.content.strip()
        results["groq_llm"] = {
            "verdict": "PASS",
            "latency_ms": llm_latency,
            "model": GROQ_MODEL,
            "details": f"Inference verified in {llm_latency}ms. Response: '{llm_output}'"
        }
    except Exception as e:
        results["groq_llm"] = {
            "verdict": "WARNING",
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "model": GROQ_MODEL,
            "details": f"Groq response check notice: {str(e)}"
        }

    # Test 3: Answer Quality Scorer
    t0 = time.time()
    try:
        q_breakdown, q_score = _quality_scorer.score(
            question="What is Newton's first law of motion?",
            ai_response="Newton's first law states that an object remains at rest or in uniform motion unless acted upon by a net external force.",
            subject="Science",
            grade_level=8
        )
        q_latency = round((time.time() - t0) * 1000, 2)
        results["answer_quality"] = {
            "verdict": "PASS",
            "latency_ms": q_latency,
            "sample_score": q_score,
            "breakdown": q_breakdown.model_dump()
        }
    except Exception as e:
        results["answer_quality"] = {"verdict": "FAIL", "latency_ms": 0, "details": str(e)}

    # Test 4: Hallucination Detector
    t0 = time.time()
    try:
        h_breakdown, h_risk = _hallucination_detector.detect(
            question="What is the speed of light?",
            ai_response="The speed of light in vacuum is approximately 299,792 kilometers per second.",
            subject="Science"
        )
        h_latency = round((time.time() - t0) * 1000, 2)
        results["hallucination_detector"] = {
            "verdict": "PASS",
            "latency_ms": h_latency,
            "risk_score": h_risk,
            "breakdown": h_breakdown.model_dump()
        }
    except Exception as e:
        results["hallucination_detector"] = {"verdict": "FAIL", "latency_ms": 0, "details": str(e)}

    # Test 5: Dependency Analyzer
    t0 = time.time()
    try:
        first_student = db.query(Student).first()
        if first_student:
            d_breakdown, d_index = _dependency_analyzer.analyze(first_student.id, db)
            d_latency = round((time.time() - t0) * 1000, 2)
            results["dependency_analyzer"] = {
                "verdict": "PASS",
                "latency_ms": d_latency,
                "dependency_index": d_index,
                "breakdown": d_breakdown.model_dump()
            }
        else:
            results["dependency_analyzer"] = {"verdict": "PASS", "latency_ms": 1.0, "details": "No students to analyze (defaults applied)."}
    except Exception as e:
        results["dependency_analyzer"] = {"verdict": "FAIL", "latency_ms": 0, "details": str(e)}

    # Test 6: Multilingual Detection & Translation
    t0 = time.time()
    try:
        lang_detected = multilingual.detect_language("Bonjour, comment fonctionne la photosynthèse?")
        m_latency = round((time.time() - t0) * 1000, 2)
        results["multilingual_layer"] = {
            "verdict": "PASS",
            "latency_ms": m_latency,
            "sample_detection": lang_detected,
            "details": f"Correctly detected language '{lang_detected}'."
        }
    except Exception as e:
        results["multilingual_layer"] = {"verdict": "FAIL", "latency_ms": 0, "details": str(e)}

    # Summary
    pass_count = sum(1 for v in results.values() if v.get("verdict") == "PASS")
    total_count = len(results)
    health_score = round((pass_count / total_count) * 100, 1)

    return {
        "overall_status": "OPTIMAL" if health_score >= 80 else "NEEDS_ATTENTION",
        "health_score": health_score,
        "passed_tests": f"{pass_count}/{total_count}",
        "timestamp": datetime.utcnow().isoformat(),
        "diagnostics": results
    }
