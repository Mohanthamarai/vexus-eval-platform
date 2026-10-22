"""
Security utility module for VEXUS.
Provides bcrypt password hashing, cryptographically secure session token generation,
and in-memory rate limiting for authentication endpoints.
"""

import time
import secrets
import bcrypt
import hmac
import hashlib
import base64
import json
from typing import Dict, Tuple, Optional
from config import SECRET_KEY

# In-memory rate limiting store: key -> list of timestamp floats
_LOGIN_ATTEMPTS: Dict[str, list] = {}
RATE_LIMIT_WINDOW_SECONDS = 300  # 5 minutes
MAX_ATTEMPTS_PER_WINDOW = 10     # Max 10 failed attempts per 5 minutes per IP/identifier


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt with salt."""
    if not password:
        raise ValueError("Password cannot be empty")
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def create_access_token(user_id: int, username: str, role: str, expires_hours: int = 24) -> str:
    """
    Generate a tamper-proof HMAC-SHA256 signed stateless session token.
    Ensures seamless authentication across ephemeral serverless containers.
    """
    exp = int(time.time() + (expires_hours * 3600))
    payload = {
        "uid": user_id,
        "sub": username,
        "rol": role,
        "exp": exp,
        "nonce": secrets.token_hex(8)
    }
    raw_payload = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    b64_payload = base64.urlsafe_b64encode(raw_payload).decode('utf-8').rstrip('=')
    sig = hmac.new(SECRET_KEY.encode('utf-8'), b64_payload.encode('utf-8'), hashlib.sha256).hexdigest()
    return f"vx1_{b64_payload}.{sig}"


def decode_access_token(token: str) -> Optional[dict]:
    """
    Verify and decode an HMAC-SHA256 signed token.
    Returns payload dictionary if valid and not expired, else None.
    """
    if not token or not token.startswith("vx1_") or "." not in token:
        return None
    try:
        parts = token[4:].split(".", 1)
        if len(parts) != 2:
            return None
        b64_payload, signature = parts
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), b64_payload.encode('utf-8'), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None
        padding = '=' * (-len(b64_payload) % 4)
        raw_payload = base64.urlsafe_b64decode((b64_payload + padding).encode('utf-8'))
        payload = json.loads(raw_payload.decode('utf-8'))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


def generate_session_token() -> str:
    """Generate a high-entropy 256-bit URL-safe session token (legacy)."""
    return secrets.token_urlsafe(48)


def check_rate_limit(client_identifier: str) -> Tuple[bool, int]:
    """
    Check if a client has exceeded login attempt threshold.
    Returns (is_allowed, remaining_seconds_if_blocked).
    """
    now = time.time()
    attempts = _LOGIN_ATTEMPTS.get(client_identifier, [])
    # Filter attempts within the window
    attempts = [t for t in attempts if now - t < RATE_LIMIT_WINDOW_SECONDS]
    _LOGIN_ATTEMPTS[client_identifier] = attempts

    if len(attempts) >= MAX_ATTEMPTS_PER_WINDOW:
        oldest_attempt = attempts[0]
        cooldown_remaining = int(RATE_LIMIT_WINDOW_SECONDS - (now - oldest_attempt))
        return False, max(1, cooldown_remaining)

    return True, 0


def record_failed_attempt(client_identifier: str):
    """Record a failed login attempt for rate limiting."""
    now = time.time()
    if client_identifier not in _LOGIN_ATTEMPTS:
        _LOGIN_ATTEMPTS[client_identifier] = []
    _LOGIN_ATTEMPTS[client_identifier].append(now)


def clear_failed_attempts(client_identifier: str):
    """Clear recorded attempts on successful login."""
    if client_identifier in _LOGIN_ATTEMPTS:
        _LOGIN_ATTEMPTS.pop(client_identifier, None)
