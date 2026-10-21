from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from config import GROQ_API_KEY, GROQ_MODEL
from modules.multilingual import multilingual
from groq import Groq
import hashlib
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Simulator"])

# In-memory cache to prevent duplicate Groq API calls
_SIM_CACHE = {}

# Initialize Groq client
try:
    groq_client = Groq(api_key=GROQ_API_KEY)
except Exception as e:
    groq_client = None
    logger.error(f"Failed to initialize Groq client in simulator: {e}")

FALLBACK_MODELS = [GROQ_MODEL, "qwen/qwen3.8-27b", "openai/gpt-oss-120b"]

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    subject: str = "general"
    grade_level: int = 8
    history: List[ChatMessage] = []
    message: str
    tone: Optional[str] = "encouraging"

class ChatResponse(BaseModel):
    response: str
    model_used: Optional[str] = GROQ_MODEL
    latency_ms: Optional[float] = 0.0

@router.post("/simulator/chat", response_model=ChatResponse)
def simulate_chat(req: ChatRequest) -> ChatResponse:
    import time
    start_time = time.time()

    # 1. Check in-memory cache
    cache_payload = {
        "subject": req.subject,
        "grade_level": req.grade_level,
        "history": [m.model_dump() for m in req.history[-6:]],
        "message": req.message
    }
    cache_key = hashlib.md5(json.dumps(cache_payload, sort_keys=True).encode()).hexdigest()
    if cache_key in _SIM_CACHE:
        return ChatResponse(
            response=_SIM_CACHE[cache_key],
            model_used=f"{GROQ_MODEL} (cached)",
            latency_ms=round((time.time() - start_time) * 1000, 1)
        )

    # 2. System instruction
    system_instruction = f"""You are Vexus, an elite AI Pedagogical Tutor supporting a Grade {req.grade_level} student in {req.subject.title()}.
Your Core Teaching Objectives:
1. Direct Clarity: State the precise, direct answer or core concept clearly in your opening 1-2 sentences.
2. Conceptual Depth: Provide a crystal-clear explanation suited specifically for a Grade {req.grade_level} mindset. Use intuitive analogies or real-world examples.
3. Structured Formatting: Use clean Markdown (bold text for keywords, concise bullet points, formatted formulas with mathematical symbols, and code blocks if relevant).
4. Pedagogical Check: Conclude with a quick, engaging follow-up question or thought challenge to reinforce understanding without being overwhelming.
5. Tone: Be motivating, respectful, and authoritative yet warm."""

    # 3. Language detection & translation
    native_lang = multilingual.detect_language(req.message)
    english_message = multilingual.translate_to_english(req.message, native_lang)

    messages = [{"role": "system", "content": system_instruction}]

    for msg in req.history[-8:]:
        role = "assistant" if msg.role in ("tutor", "assistant") else "user"
        messages.append({"role": role, "content": msg.content})

    messages.append({"role": "user", "content": english_message})

    # 4. Generate response with model fallback
    ai_text = None
    model_used = GROQ_MODEL

    if groq_client:
        models_to_try = [GROQ_MODEL] + [m for m in FALLBACK_MODELS if m != GROQ_MODEL]
        for candidate_model in models_to_try:
            try:
                chat_completion = groq_client.chat.completions.create(
                    model=candidate_model,
                    messages=messages,
                    temperature=0.6,
                    max_tokens=650,
                    timeout=20.0
                )
                english_ai_text = chat_completion.choices[0].message.content
                if english_ai_text and len(english_ai_text.strip()) > 10:
                    ai_text = multilingual.translate_to_native(english_ai_text, native_lang)
                    model_used = candidate_model
                    break
            except Exception as model_err:
                logger.warning(f"Model {candidate_model} failed: {model_err}")
                continue

    # 5. High-quality pedagogical fallback if remote LLM is offline
    if not ai_text:
        ai_text = _generate_offline_pedagogical_response(req.message, req.subject, req.grade_level)
        model_used = "vexus-pedagogy-engine (offline fallback)"

    _SIM_CACHE[cache_key] = ai_text
    latency_ms = round((time.time() - start_time) * 1000, 1)
    return ChatResponse(response=ai_text, model_used=model_used, latency_ms=latency_ms)


def _generate_offline_pedagogical_response(question: str, subject: str, grade_level: int) -> str:
    """Provides a structured, high-value pedagogical response when remote API is unreachable."""
    q_clean = question.strip().rstrip('?')
    return f"""### {q_clean.title()}

**Key Answer:**
{q_clean} is a foundational concept in **{subject.title()}** for Grade {grade_level}.

**Core Principles to Understand:**
- **Definition & Context:** In {subject.lower()}, this concept explains how fundamental forces, biological processes, or mathematical relationships interact.
- **Why It Matters:** Mastering this allows you to solve real-world problems and build toward advanced topics.
- **Step-by-Step Breakdown:**
  1. Identify the given variables and known formulas.
  2. Apply the foundational theorem systematically.
  3. Verify the units, logic, and conclusions.

*Practice Challenge for Grade {grade_level}:* Can you describe a real-world scenario where you would apply this concept directly?"""
