"""
Dependency Analyzer module.

Measures how dependent a student is on the AI tutor by examining query
frequency, copy-paste behaviour, inter-session timing, and whether the
student tries to bypass scaffolded learning.
"""

from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session as SASession

from database import Session as DBSession, Evaluation
from models import DependencyBreakdown


class DependencyAnalyzer:
    """Analyses student dependency on the AI tutoring system."""

    # Phrases indicating the student wants a direct answer (bypass scaffolding)
    DIRECT_ANSWER_PHRASES = [
        "give me the answer",
        "solve this for me",
        "tell me the answer",
        "just give me",
        "full solution",
        "do my homework",
        "write this for me",
        "complete solution",
        "just tell me",
        "answer this",
        "solve it",
        "do this for me",
    ]

    # Phrases indicating the student wants to learn
    LEARNING_PHRASES = [
        "hint",
        "explain",
        "help me understand",
        "why does",
        "how does",
        "can you teach",
        "show me how",
        "step by step",
        "what does",
        "help me learn",
        "i don't understand",
        "can you clarify",
        "walk me through",
    ]

    def analyze(
        self, student_id: int, db: SASession
    ) -> Tuple[DependencyBreakdown, float]:
        """
        Analyse dependency metrics for a student.

        Args:
            student_id: The student's database ID.
            db: An active SQLAlchemy database session.

        Returns:
            Tuple of (DependencyBreakdown, composite_dependency_index 0-1).
        """
        # Fetch recent sessions
        recent_sessions = (
            db.query(DBSession)
            .filter(DBSession.student_id == student_id)
            .order_by(DBSession.timestamp.desc())
            .limit(50)
            .all()
        )

        if not recent_sessions:
            breakdown = DependencyBreakdown(
                query_frequency=0.0,
                copy_paste_ratio=0.0,
                self_attempt_time=0.0,
                scaffolding_bypass=0.0,
                alert_level="healthy",
            )
            return breakdown, 0.0

        qf = self._query_frequency(student_id, db)
        cpr = self._copy_paste_ratio(recent_sessions)
        sat = self._self_attempt_time(recent_sessions)
        sb = self._scaffolding_bypass(recent_sessions)

        composite = qf * 0.25 + cpr * 0.30 + sat * 0.25 + sb * 0.20

        if composite >= 0.6:
            alert = "critical"
        elif composite >= 0.3:
            alert = "caution"
        else:
            alert = "healthy"

        breakdown = DependencyBreakdown(
            query_frequency=round(qf, 4),
            copy_paste_ratio=round(cpr, 4),
            self_attempt_time=round(sat, 4),
            scaffolding_bypass=round(sb, 4),
            alert_level=alert,
        )

        return breakdown, round(composite, 4)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _query_frequency(self, student_id: int, db: SASession) -> float:
        """
        Count sessions in the last 24 hours.  20+ queries/day → score 1.0.
        """
        cutoff = datetime.utcnow() - timedelta(hours=24)
        count = (
            db.query(func.count(DBSession.id))
            .filter(
                DBSession.student_id == student_id,
                DBSession.timestamp >= cutoff,
            )
            .scalar()
        ) or 0
        return float(min(count / 20.0, 1.0))

    def _copy_paste_ratio(self, sessions: list) -> float:
        """
        Compute average Jaccard similarity between consecutive AI responses
        to detect copy-paste behaviour.
        """
        if len(sessions) < 2:
            return 0.0

        recent = sessions[:10]  # last 10 sessions
        similarities = []
        for i in range(len(recent) - 1):
            set_a = set(recent[i].ai_response.lower().split())
            set_b = set(recent[i + 1].ai_response.lower().split())
            if not set_a and not set_b:
                continue
            intersection = len(set_a & set_b)
            union = len(set_a | set_b)
            jaccard = intersection / union if union > 0 else 0.0
            similarities.append(jaccard)

        if not similarities:
            return 0.0
        return float(sum(similarities) / len(similarities))

    def _self_attempt_time(self, sessions: list) -> float:
        """
        Average gap between consecutive sessions.  Short gaps indicate
        dependency (rapid-fire querying).

        < 2 min  → 1.0 (very dependent)
        > 60 min → 0.0 (healthy)
        Linear interpolation in between.
        """
        if len(sessions) < 2:
            return 0.0

        recent = sorted(sessions[:20], key=lambda s: s.timestamp)
        gaps = []
        for i in range(len(recent) - 1):
            delta = (recent[i + 1].timestamp - recent[i].timestamp).total_seconds() / 60.0
            if delta >= 0:
                gaps.append(delta)

        if not gaps:
            return 0.0

        avg_gap = sum(gaps) / len(gaps)

        if avg_gap <= 2:
            return 1.0
        if avg_gap >= 60:
            return 0.0
        # Linear interpolation: 2 min → 1.0, 60 min → 0.0
        return float(1.0 - (avg_gap - 2) / (60 - 2))

    def _scaffolding_bypass(self, sessions: list) -> float:
        """
        Analyse question phrasing to determine whether the student seeks
        direct answers (bypass) vs. genuine understanding (learning).
        """
        recent = sessions[:20]
        direct_count = 0
        learning_count = 0

        for session in recent:
            q_lower = session.question.lower()
            for phrase in self.DIRECT_ANSWER_PHRASES:
                if phrase in q_lower:
                    direct_count += 1
                    break
            for phrase in self.LEARNING_PHRASES:
                if phrase in q_lower:
                    learning_count += 1
                    break

        total = direct_count + learning_count + 1  # +1 to avoid division by zero
        return float(min(direct_count / total, 1.0))
