from sqlalchemy.orm import Session
from database import Student, Session as DbSession, Evaluation, Alert, Assessment
import random
from datetime import datetime, timedelta
import json

def seed_database(db: Session):
    if db.query(Student).first():
        return # already seeded
    
    names = ['Alice Smith', 'Bob Jones', 'Charlie Brown', 'Diana Prince', 'Evan Wright', 
             'Fiona Gallagher', 'George Costanza', 'Hannah Abbott', 'Ian Malcolm', 'Jessica Day',
             'Kevin Malone', 'Luna Lovegood', 'Michael Scott', 'Nina Zenik', 'Oscar Martinez']
    
    students = []
    for i, name in enumerate(names):
        grade = random.randint(6, 12)
        student = Student(name=name, grade=grade, language='en')
        db.add(student)
        students.append(student)
    db.commit()

    subjects = ['Mathematics', 'Science', 'History', 'English Literature', 'Geography']
    now = datetime.utcnow()

    for student in students:
        # Create Pre, Post, Retention assessments
        for subj in random.sample(subjects, 2):
            pre_score = random.uniform(40, 70)
            post_score = pre_score + random.uniform(10, 30)
            retention_score = post_score - random.uniform(0, 10)
            
            db.add(Assessment(student_id=student.id, assessment_type='pre', subject=subj, score=pre_score, bloom_level=random.randint(1, 3), timestamp=now - timedelta(days=25)))
            db.add(Assessment(student_id=student.id, assessment_type='post', subject=subj, score=post_score, bloom_level=random.randint(3, 5), timestamp=now - timedelta(days=10)))
            db.add(Assessment(student_id=student.id, assessment_type='retention', subject=subj, score=retention_score, bloom_level=random.randint(4, 6), timestamp=now - timedelta(days=2)))

        num_sessions = random.randint(5, 15)
        for j in range(num_sessions):
            timestamp = now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
            subj = random.choice(subjects)
            session = DbSession(student_id=student.id, question="What is...", ai_response="The answer is...", subject=subj, grade_level=student.grade, language='en', timestamp=timestamp)
            db.add(session)
            db.commit() # commit to get ID

            q_score = random.gauss(72, 15)
            h_risk = max(0, min(1, random.gauss(0.2, 0.15)))
            d_index = max(0, min(1, random.gauss(0.4, 0.2)))
            l_score = max(0, min(100, random.gauss(68, 12)))

            details = {
                "quality": {"factual_accuracy": q_score, "completeness": q_score, "clarity": q_score, "pedagogical_value": q_score, "age_appropriateness": q_score},
                "hallucination": {"fabrication_score": h_risk, "citation_score": h_risk, "formula_score": h_risk, "confidence_score": h_risk, "flagged_claims": []},
                "dependency": {"query_frequency": d_index, "copy_paste_ratio": d_index, "self_attempt_time": 1 - d_index, "scaffolding_bypass": d_index, "alert_level": "healthy" if d_index < 0.3 else ("caution" if d_index < 0.6 else "critical")},
                "learning": {"assessment_gain": l_score, "bloom_progression": l_score, "retention_rate": l_score}
            }

            eval_record = Evaluation(session_id=session.id, student_id=student.id, quality_score=q_score, hallucination_risk=h_risk, dependency_index=d_index, learning_score=l_score, subject=subj, language='en', timestamp=timestamp, details_json=json.dumps(details))
            db.add(eval_record)
            
            if h_risk > 0.6 or d_index > 0.6:
                sev = 'critical' if (h_risk > 0.8 or d_index > 0.8) else 'warning'
                mod = 'hallucination' if h_risk > 0.6 else 'dependency'
                alert = Alert(student_id=student.id, severity=sev, module=mod, message=f"High {mod} risk detected.", timestamp=timestamp, resolved=False)
                db.add(alert)
    
    db.commit()
