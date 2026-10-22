"""
Authentication API routes for VEXUS.
Provides secure login, logout, profile inspection, and password changes.
Enforces rate limiting, bcrypt verification, and server-side session persistence.
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from database import User, UserSession, AuditLog, get_db
from models import LoginRequest, LoginResponse, UserResponse, ChangePasswordRequest
from security import (
    verify_password,
    hash_password,
    generate_session_token,
    create_access_token,
    check_rate_limit,
    record_failed_attempt,
    clear_failed_attempts,
)
from auth_deps import get_current_user, get_token_from_request
from config import SESSION_EXPIRE_HOURS

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(
    req: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
) -> LoginResponse:
    """Authenticate user credentials and issue a secure session token."""
    client_ip = request.client.host if request.client else "unknown"
    rate_key = f"{client_ip}:{req.username.lower()}"

    # Rate limiting check
    is_allowed, cooldown = check_rate_limit(rate_key)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Please wait {cooldown} seconds before trying again."
        )

    # Find user by username or email
    user = (
        db.query(User)
        .filter(
            (User.username == req.username.strip()) |
            (User.email == req.username.strip().lower())
        )
        .first()
    )

    if not user or not user.is_active or not verify_password(req.password, user.password_hash):
        record_failed_attempt(rate_key)
        # Audit failed login
        db.add(AuditLog(
            user_id=user.id if user else None,
            action="LOGIN_FAILED",
            target_type="auth",
            target_id=req.username,
            details=f"Failed login attempt from IP {client_ip}"
        ))
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Success: clear failed rate limiting attempts
    clear_failed_attempts(rate_key)

    # Create signed session token (works seamlessly across serverless instances)
    token = create_access_token(user.id, user.username, user.role, SESSION_EXPIRE_HOURS)
    expires_at = datetime.utcnow() + timedelta(hours=SESSION_EXPIRE_HOURS)

    user_agent = request.headers.get("user-agent", "")[:250]
    db_session = UserSession(
        session_token=token,
        user_id=user.id,
        created_at=datetime.utcnow(),
        expires_at=expires_at,
        is_revoked=False,
        user_agent=user_agent,
        ip_address=client_ip
    )
    db.add(db_session)

    # Audit successful login
    db.add(AuditLog(
        user_id=user.id,
        action="LOGIN_SUCCESS",
        target_type="auth",
        target_id=str(user.id),
        details=f"Successful login as {user.role} from {client_ip}"
    ))
    db.commit()

    # Set secure cookie
    response.set_cookie(
        key="vexus_session",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # Suitable for local http development
        max_age=SESSION_EXPIRE_HOURS * 3600
    )

    student_id = user.student_profile.id if user.student_profile else None
    student_name = user.student_profile.name if user.student_profile else None

    return LoginResponse(
        session_token=token,
        user_id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        student_id=student_id,
        student_name=student_name
    )


@router.post("/logout")
def logout(
    response: Response,
    token: str = Depends(get_token_from_request),
    db: Session = Depends(get_db)
):
    """Revoke session token and clear authentication cookie."""
    if token:
        db_session = (
            db.query(UserSession)
            .filter(UserSession.session_token == token)
            .first()
        )
        if db_session:
            db_session.is_revoked = True
            db.commit()

    response.delete_cookie(key="vexus_session")
    return {"status": "success", "message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Return currently authenticated user profile."""
    student_id = current_user.student_profile.id if current_user.student_profile else None
    student_name = current_user.student_profile.name if current_user.student_profile else None

    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        student_id=student_id,
        student_name=student_name
    )


@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allow an authenticated user to change their password."""
    if not verify_password(req.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed"
        )

    if len(req.new_password.strip()) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters"
        )

    current_user.password_hash = hash_password(req.new_password.strip())
    current_user.updated_at = datetime.utcnow()

    # Log password change
    db.add(AuditLog(
        user_id=current_user.id,
        action="PASSWORD_CHANGED",
        target_type="user",
        target_id=str(current_user.id),
        details="User successfully changed password"
    ))
    db.commit()

    return {"status": "success", "message": "Password changed successfully"}
