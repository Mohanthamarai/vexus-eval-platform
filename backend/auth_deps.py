"""
FastAPI dependencies for authentication, role verification, and session validation.
Strictly validates tokens against the database with revocation and expiration checks.
"""

from datetime import datetime
from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import User, UserSession, Student, get_db
from security import decode_access_token

security_bearer = HTTPBearer(auto_error=False)


def get_token_from_request(
    request: Request,
    bearer_creds: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Optional[str]:
    """Extract token from Authorization header or 'vexus_session' cookie."""
    if bearer_creds and bearer_creds.credentials:
        return bearer_creds.credentials.strip()

    # Check cookies
    cookie_token = request.cookies.get("vexus_session")
    if cookie_token:
        return cookie_token.strip()

    # Check query param for download endpoints if needed
    query_token = request.query_params.get("token")
    if query_token:
        return query_token.strip()

    return None


def get_current_user(
    token: Optional[str] = Depends(get_token_from_request),
    db: Session = Depends(get_db)
) -> User:
    """
    Validate token and return active User or raise 401.
    Supports both HMAC-SHA256 signed stateless tokens (for serverless resilience)
    and stateful database sessions.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Attempt stateless HMAC-SHA256 token verification
    payload = decode_access_token(token)
    if payload:
        uid = payload.get("uid")
        username = payload.get("sub")
        user = db.query(User).filter(User.id == uid, User.is_active == True).first()  # noqa: E712
        if not user and username:
            user = db.query(User).filter(User.username == username, User.is_active == True).first()  # noqa: E712
        if user:
            # Check if this token was explicitly revoked
            revoked_session = (
                db.query(UserSession)
                .filter(UserSession.session_token == token, UserSession.is_revoked == True)  # noqa: E712
                .first()
            )
            if revoked_session:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session has been revoked. Please log in again.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return user

    # 2. Fallback to stateful database session lookup
    db_session = (
        db.query(UserSession)
        .filter(
            UserSession.session_token == token,
            UserSession.is_revoked == False,  # noqa: E712
            UserSession.expires_at > datetime.utcnow()
        )
        .first()
    )

    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or been revoked. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == db_session.user_id, User.is_active == True).first()  # noqa: E712
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated or not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_optional_user(
    token: Optional[str] = Depends(get_token_from_request),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Return current User if valid token is provided, otherwise None without raising 401."""
    if not token:
        return None
    try:
        return get_current_user(token=token, db=db)
    except HTTPException:
        return None


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Enforce that the authenticated user possesses the 'admin' role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Administrator privileges required."
        )
    return current_user


def require_student(current_user: User = Depends(get_current_user)) -> User:
    """Enforce that the authenticated user possesses the 'student' role."""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Student privileges required."
        )
    if not current_user.student_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile associated with this account was not found."
        )
    return current_user
