"""
Answer Quality Scorer module.

Evaluates AI tutoring responses for factual accuracy, completeness, clarity,
pedagogical value, and age-appropriateness using the Gemini API.
"""

from __future__ import annotations

import json
import requests
import wikipedia
from typing import Optional, Tuple

wikipedia.set_user_agent("VexusEducationalPlatform/1.0 (evaluator@vexus.local)")

from models import QualityBreakdown
from config import GROQ_API_KEY, GROQ_MODEL
from groq import Groq

# Initialize Groq client
try:
    groq_client = Groq(api_key=GROQ_API_KEY)
except Exception as e:
    groq_client = None
    print(f"Failed to initialize Groq client: {e}")


class AnswerQualityScorer:
    """Scores the quality of an AI tutoring response using Gemini API."""

    def score(
        self,
        question: str,
        ai_response: str,
        ground_truth: Optional[str] = None,
        subject: str = "general",
        grade_level: int = 8,
    ) -> Tuple[QualityBreakdown, float]:
        """
        Evaluate an AI response and return a detailed breakdown plus composite
        score (0-100).
        """
        # Edge case: empty or extremely short response
        if not ai_response or len(ai_response.strip()) < 5:
            breakdown = QualityBreakdown(
                factual_accuracy=0.0,
                completeness=0.0,
                clarity=0.0,
                pedagogical_value=0.0,
                age_appropriateness=0.0,
            )
            return breakdown, 0.0

        if not ground_truth and len(question.split()) > 1:
            try:
                # Augment missing ground truth using Wikipedia
                search_results = wikipedia.search(question)
                if search_results:
                    try:
                        ground_truth = wikipedia.summary(search_results[0], sentences=2, auto_suggest=False)
                    except (wikipedia.DisambiguationError, wikipedia.PageError):
                        if len(search_results) > 1:
                            ground_truth = wikipedia.summary(search_results[1], sentences=2, auto_suggest=False)
                    if ground_truth:
                        print(f"Augmented ground truth via Wikipedia: {ground_truth[:120]}...")
            except Exception as e:
                print(f"Wikipedia lookup failed: {e}")

        prompt = f"""
You are an expert educational evaluator. Evaluate the AI Tutor's response to the student's question.

Subject: {subject}
Student Grade Level: {grade_level}
Student Question: {question}

AI Tutor Response:
{ai_response}
"""
        if ground_truth:
            prompt += f"\nReference Ground Truth Answer:\n{ground_truth}\n"

        prompt += """
Evaluate the AI Tutor's response on the following dimensions (0-100 scale each):
1. factual_accuracy: Factually correct and sound. (Compare to ground truth if available).
2. completeness: Covers all parts of the question.
3. clarity: Easy to read and understand.
4. pedagogical_value: Uses analogies, explanations (why, not just what), and engages the student.
5. age_appropriateness: Language and concepts are suitable for the student's grade level.

Respond ONLY with a valid JSON object in this format (no markdown code blocks, just raw JSON):
{
  "factual_accuracy": 95.0,
  "completeness": 90.0,
  "clarity": 85.0,
  "pedagogical_value": 80.0,
  "age_appropriateness": 100.0
}
"""

        try:
            if not groq_client:
                raise ValueError("Groq client not initialized")

            # Generate the response using Groq
            response = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are a JSON-only evaluation bot."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            
            # Parse response
            text = response.choices[0].message.content
            if text.startswith("```json"):
                text = text[7:-3]
            elif text.startswith("```"):
                text = text[3:-3]
                
            data = json.loads(text.strip())

            accuracy = float(data.get("factual_accuracy", 50.0))
            completeness = float(data.get("completeness", 50.0))
            clarity = float(data.get("clarity", 50.0))
            pedagogical = float(data.get("pedagogical_value", 50.0))
            age_app = float(data.get("age_appropriateness", 50.0))

        except Exception as e:
            print(f"Error calling Groq for Answer Quality: {e}")
            accuracy = completeness = clarity = pedagogical = age_app = 0.0

        breakdown = QualityBreakdown(
            factual_accuracy=round(accuracy, 2),
            completeness=round(completeness, 2),
            clarity=round(clarity, 2),
            pedagogical_value=round(pedagogical, 2),
            age_appropriateness=round(age_app, 2),
        )

        composite = (
            accuracy * 0.30
            + completeness * 0.25
            + clarity * 0.20
            + pedagogical * 0.15
            + age_app * 0.10
        )

        return breakdown, round(composite, 2)
