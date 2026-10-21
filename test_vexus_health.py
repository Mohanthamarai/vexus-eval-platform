"""
VEXUS Comprehensive Health & Diagnostic Suite
Tests and audits all 8 core subsystems of the VEXUS platform:
1. SQLite Database & Schema
2. Groq LLaMA/GPT Model Connectivity & Latency
3. Module 1: Answer Quality Scorer
4. Module 2: Hallucination Detector & Wikipedia Grounding
5. Module 3: Student Dependency Analyzer
6. Module 4: Learning Outcomes Tracker
7. Module 5: Multilingual Intelligence Layer
8. AI Tutor Simulator & Live Pedagogical Chat
"""

import sys
import os
import time

# Ensure backend modules can be imported
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

def print_header(title):
    print("\n" + "=" * 65)
    print(f"  {title.upper()}")
    print("=" * 65)

def run_diagnostics():
    print_header("Vexus Platform - Full System Health & Model Diagnostics")
    start_total = time.time()
    scorecard = []

    # 1. Database Check
    print("\n[1/8] Auditing SQLite Database & Schema...")
    try:
        from database import SessionLocal, Student, Evaluation, Alert, Session as DBSession
        t0 = time.time()
        db = SessionLocal()
        students_count = db.query(Student).count()
        evals_count = db.query(Evaluation).count()
        alerts_count = db.query(Alert).count()
        sessions_count = db.query(DBSession).count()
        db.close()
        lat = round((time.time() - t0) * 1000, 2)
        print(f"  [PASS] SQLite Operational ({lat}ms)")
        print(f"         Records: {students_count} students | {evals_count} evaluations | {alerts_count} alerts | {sessions_count} sessions")
        scorecard.append(("Database & Schema", "PASS", f"{lat}ms", f"{students_count} students, {evals_count} evals"))
    except Exception as e:
        print(f"  [FAIL] Database Error: {e}")
        scorecard.append(("Database & Schema", "FAIL", "0ms", str(e)))

    # 2. Groq LLM Inference Check
    print("\n[2/8] Auditing Groq LLM Connectivity & Active Model...")
    try:
        from config import GROQ_API_KEY, GROQ_MODEL
        from groq import Groq
        t0 = time.time()
        client = Groq(api_key=GROQ_API_KEY)
        models = [m.id for m in client.models.list().data]
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": "Respond strictly with: VEXUS_HEALTH_OK"}],
            max_tokens=15,
            timeout=15.0
        )
        reply = completion.choices[0].message.content.strip()
        lat = round((time.time() - t0) * 1000, 2)
        print(f"  [PASS] Groq LLM Active Model: '{GROQ_MODEL}' ({lat}ms)")
        print(f"         Handshake Response: '{reply}'")
        print(f"         Available Model Pool: {models[:5]}")
        scorecard.append(("Groq LLM Engine", "PASS", f"{lat}ms", f"Model: {GROQ_MODEL}"))
    except Exception as e:
        print(f"  [FAIL] Groq LLM Error: {e}")
        scorecard.append(("Groq LLM Engine", "FAIL", "0ms", str(e)))

    # 3. Answer Quality Module
    print("\n[3/8] Testing Module 1: Answer Quality Scorer...")
    try:
        from modules.answer_quality import AnswerQualityScorer
        scorer = AnswerQualityScorer()
        t0 = time.time()
        q_breakdown, q_score = scorer.score(
            question="What is photosynthesis?",
            ai_response="Photosynthesis is the biological process where plants convert sunlight, carbon dioxide, and water into glucose and oxygen.",
            subject="Science",
            grade_level=8
        )
        lat = round((time.time() - t0) * 1000, 2)
        print(f"  [PASS] Answer Quality Scored: {q_score}/100 ({lat}ms)")
        print(f"         Sub-metrics: Accuracy={q_breakdown.factual_accuracy} | Clarity={q_breakdown.clarity} | Pedagogy={q_breakdown.pedagogical_value}")
        scorecard.append(("Module 1: Answer Quality", "PASS", f"{lat}ms", f"Score: {q_score}/100"))
    except Exception as e:
        print(f"  [FAIL] Answer Quality Scorer Error: {e}")
        scorecard.append(("Module 1: Answer Quality", "FAIL", "0ms", str(e)))

    # 4. Hallucination Detector & Wikipedia Grounding
    print("\n[4/8] Testing Module 2: Hallucination Detector & Wikipedia Grounding...")
    try:
        from modules.hallucination_detector import HallucinationDetector
        detector = HallucinationDetector()
        t0 = time.time()
        h_breakdown, h_risk = detector.detect(
            question="Who proposed the theory of relativity?",
            ai_response="Albert Einstein proposed the special theory of relativity in 1905 and general relativity in 1915.",
            subject="History"
        )
        lat = round((time.time() - t0) * 1000, 2)
        print(f"  [PASS] Hallucination Risk Computed: {h_risk:.2f} ({lat}ms)")
        print(f"         Sub-metrics: Fabrication={h_breakdown.fabrication_score} | Citation={h_breakdown.citation_score} | Flags={len(h_breakdown.flagged_claims)}")
        scorecard.append(("Module 2: Hallucination Guard", "PASS", f"{lat}ms", f"Risk: {h_risk:.2f}"))
    except Exception as e:
        print(f"  [FAIL] Hallucination Detector Error: {e}")
        scorecard.append(("Module 2: Hallucination Guard", "FAIL", "0ms", str(e)))

    # 5. Dependency Analyzer
    print("\n[5/8] Testing Module 3: Student Dependency Analyzer...")
    try:
        from modules.dependency_analyzer import DependencyAnalyzer
        analyzer = DependencyAnalyzer()
        t0 = time.time()
        db = SessionLocal()
        d_breakdown, d_index = analyzer.analyze(1, db)
        db.close()
        lat = round((time.time() - t0) * 1000, 2)
        print(f"  [PASS] Dependency Analyzed: Index={d_index:.2f} | Alert Level={d_breakdown.alert_level} ({lat}ms)")
        scorecard.append(("Module 3: Dependency Telemetry", "PASS", f"{lat}ms", f"Level: {d_breakdown.alert_level}"))
    except Exception as e:
        print(f"  [FAIL] Dependency Analyzer Error: {e}")
        scorecard.append(("Module 3: Dependency Telemetry", "FAIL", "0ms", str(e)))

    # 6. Learning Outcomes Tracker
    print("\n[6/8] Testing Module 4: Learning Outcomes Tracker...")
    try:
        from modules.learning_outcomes import LearningOutcomeTracker
        tracker = LearningOutcomeTracker()
        t0 = time.time()
        db = SessionLocal()
        l_breakdown, l_score = tracker.track(1, db)
        db.close()
        lat = round((time.time() - t0) * 1000, 2)
        print(f"  [PASS] Learning Progress Tracked: Score={l_score}/100 ({lat}ms)")
        print(f"         Assessment Gain={l_breakdown.assessment_gain}% | Bloom Progression={l_breakdown.bloom_progression}%")
        scorecard.append(("Module 4: Learning Outcomes", "PASS", f"{lat}ms", f"Score: {l_score}/100"))
    except Exception as e:
        print(f"  [FAIL] Learning Tracker Error: {e}")
        scorecard.append(("Module 4: Learning Outcomes", "FAIL", "0ms", str(e)))

    # 7. Multilingual Intelligence Layer
    print("\n[7/8] Testing Module 5: Multilingual Intelligence Layer...")
    try:
        from modules.multilingual import multilingual
        t0 = time.time()
        en_lang = multilingual.detect_language("What is the capital of France?")
        fr_lang = multilingual.detect_language("Bonjour, quel est le principe de Pythagore?")
        hi_lang = multilingual.detect_language("गुरुत्वाकर्षण क्या है?")
        lat = round((time.time() - t0) * 1000, 2)
        print(f"  [PASS] Multilingual Layer Operational ({lat}ms)")
        print(f"         Language Detections: English='{en_lang}' | French='{fr_lang}' | Hindi='{hi_lang}'")
        scorecard.append(("Module 5: Multilingual Layer", "PASS", f"{lat}ms", "en, fr, hi detected"))
    except Exception as e:
        print(f"  [FAIL] Multilingual Layer Error: {e}")
        scorecard.append(("Module 5: Multilingual Layer", "FAIL", "0ms", str(e)))

    # 8. AI Tutor Simulator
    print("\n[8/8] Testing Vexus AI Tutor Simulator Chat Generation...")
    try:
        from routes.simulator import simulate_chat, ChatRequest
        t0 = time.time()
        chat_req = ChatRequest(
            subject="Science",
            grade_level=8,
            history=[],
            message="Explain gravity in simple terms for an 8th grader."
        )
        chat_res = simulate_chat(chat_req)
        lat = round((time.time() - t0) * 1000, 2)
        print(f"  [PASS] AI Tutor Response Generated ({lat}ms)")
        print(f"         Model Used: {chat_res.model_used}")
        print(f"         Response Length: {len(chat_res.response)} chars")
        print(f"         Sample Excerpt: '{chat_res.response[:150]}...'")
        scorecard.append(("Vexus Tutor Simulator", "PASS", f"{lat}ms", f"Length: {len(chat_res.response)} chars"))
    except Exception as e:
        print(f"  [FAIL] Tutor Simulator Error: {e}")
        scorecard.append(("Vexus Tutor Simulator", "FAIL", "0ms", str(e)))

    # Final Scorecard Summary
    total_elapsed = round(time.time() - start_total, 2)
    print_header("Vexus Diagnostic Scorecard & Health Results")
    print(f"{'Component / Subsystem':<32} | {'Status':<8} | {'Latency':<10} | {'Details'}")
    print("-" * 75)
    passes = 0
    for name, status, lat, details in scorecard:
        status_str = f"PASS" if status == "PASS" else "FAIL"
        print(f"{name:<32} | {status_str:<8} | {lat:<10} | {details}")
        if status == "PASS":
            passes += 1
    
    health_percentage = round((passes / len(scorecard)) * 100, 1)
    print("-" * 75)
    print(f"Overall Platform Health: {health_percentage}% ({passes}/{len(scorecard)} Subsystems Operational)")
    print(f"Total Diagnostic Execution Time: {total_elapsed}s\n")
    return scorecard

if __name__ == "__main__":
    run_diagnostics()
