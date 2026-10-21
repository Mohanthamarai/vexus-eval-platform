"""
Learning Outcomes Tracker module.

Tracks student learning progress by comparing pre/post assessments, Bloom's
taxonomy progression, and knowledge retention rates.
"""

from __future__ import annotations

from typing import Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session as SASession

from database import Assessment, Evaluation
from models import LearningBreakdown


class LearningOutcomeTracker:
    """Tracks and scores student learning outcomes over time."""

    # Default scores when no assessment data is available
    DEFAULT_GAIN = 50.0
    DEFAULT_BLOOM = 33.0
    DEFAULT_RETENTION = 50.0
    DEFAULT_COMPOSITE = 45.0

    def track(
        self, student_id: int, db: SASession
    ) -> Tuple[LearningBreakdown, float]:
        """
        Compute learning outcome metrics for a student.

        Args:
            student_id: The student's database ID.
            db: An active SQLAlchemy database session.

        Returns:
            Tuple of (LearningBreakdown, composite_learning_score 0-100).
        """
        # Fetch assessments
        assessments = (
            db.query(Assessment)
            .filter(Assessment.student_id == student_id)
            .order_by(Assessment.timestamp)
            .all()
        )

        if not assessments:
            breakdown = LearningBreakdown(
                assessment_gain=self.DEFAULT_GAIN,
                bloom_progression=self.DEFAULT_BLOOM,
                retention_rate=self.DEFAULT_RETENTION,
            )
            return breakdown, self.DEFAULT_COMPOSITE

        gain = self._assessment_gain(assessments)
        bloom = self._bloom_progression(assessments)
        retention = self._retention_rate(assessments)

        breakdown = LearningBreakdown(
            assessment_gain=round(gain, 2),
            bloom_progression=round(bloom, 2),
            retention_rate=round(retention, 2),
        )

        composite = gain * 0.40 + bloom * 0.35 + retention * 0.25
        return breakdown, round(composite, 2)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _assessment_gain(self, assessments: list) -> float:
        """
        Compare average pre-assessment scores to average post-assessment
        scores.  A 50-point improvement maps to a score of 100.
        """
        pre_scores = [a.score for a in assessments if a.assessment_type == "pre"]
        post_scores = [a.score for a in assessments if a.assessment_type == "post"]

        if not pre_scores or not post_scores:
            # If only pre exists, no gain yet; if neither, use default
            return self.DEFAULT_GAIN if not pre_scores and not post_scores else 0.0

        pre_avg = sum(pre_scores) / len(pre_scores)
        post_avg = sum(post_scores) / len(post_scores)

        raw_gain = post_avg - pre_avg  # can be negative
        # Normalise: 50-point gain → 100, 0 gain → 0, negative → 0
        normalised = max(raw_gain / 50.0 * 100.0, 0.0)
        return float(min(normalised, 100.0))

    def _bloom_progression(self, assessments: list) -> float:
        """
        Average Bloom level (1-6) normalised to 0-100.
        Higher average → better progression.
        """
        bloom_levels = [a.bloom_level for a in assessments if a.bloom_level]

        if not bloom_levels:
            return self.DEFAULT_BLOOM

        avg_bloom = sum(bloom_levels) / len(bloom_levels)
        # Normalise 1-6 to 0-100
        normalised = ((avg_bloom - 1) / 5.0) * 100.0
        return float(max(min(normalised, 100.0), 0.0))

    def _retention_rate(self, assessments: list) -> float:
        """
        Compare retention assessment scores to post-assessment scores.
        A retention / post ratio of 1.0 → 100%.
        """
        post_scores = [a.score for a in assessments if a.assessment_type == "post"]
        retention_scores = [a.score for a in assessments if a.assessment_type == "retention"]

        if not retention_scores:
            return self.DEFAULT_RETENTION

        if not post_scores:
            # No post to compare against – use retention avg directly
            return float(min(sum(retention_scores) / len(retention_scores), 100.0))

        post_avg = sum(post_scores) / len(post_scores)
        retention_avg = sum(retention_scores) / len(retention_scores)

        if post_avg <= 0:
            return self.DEFAULT_RETENTION

        rate = (retention_avg / post_avg) * 100.0
        return float(min(rate, 100.0))
