"""
Administrator bootstrap and initial account provisioning routine for VEXUS.
Runs on startup to ensure an administrator account exists, and links legacy
student records to secure student user accounts without data loss.
"""

from datetime import datetime
from sqlalchemy.orm import Session
from database import User, Student, AuditLog
from security import hash_password
from config import BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_PASSWORD


def bootstrap_system_accounts(db: Session):
    """
    Ensures an administrator exists based on environment configuration.
    Links existing unlinked student records to student user accounts.
    Idempotent: will never overwrite an existing administrator password.
    """
    # 1. Check if an admin already exists
    existing_admin = db.query(User).filter(User.role == "admin").first()
    if not existing_admin:
        admin_username = BOOTSTRAP_ADMIN_USERNAME or "admin"
        admin_password = BOOTSTRAP_ADMIN_PASSWORD or "AdminSecureVexus2026!"

        admin_user = User(
            username=admin_username,
            email=f"{admin_username}@vexus.internal",
            password_hash=hash_password(admin_password),
            role="admin",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(admin_user)
        db.flush()

        db.add(AuditLog(
            user_id=admin_user.id,
            action="BOOTSTRAP_ADMIN_CREATED",
            target_type="user",
            target_id=str(admin_user.id),
            details=f"Initialized primary administrator: '{admin_username}'"
        ))
        db.commit()
        print(f"\n[VEXUS AUTH] Primary administrator created: '{admin_username}'")
    else:
        print(f"[VEXUS AUTH] Administrator account verified: '{existing_admin.username}'")

    # 2. Check for legacy/seeded students without user accounts and provision them
    unlinked_students = db.query(Student).filter(Student.user_id == None).all()  # noqa: E711
    if unlinked_students:
        print(f"[VEXUS AUTH] Provisioning login accounts for {len(unlinked_students)} student records...")
        for student in unlinked_students:
            # Generate deterministic username, e.g. 'alicesmith' or 'student_1'
            clean_name = "".join(c.lower() for c in student.name if c.isalnum())
            base_username = clean_name if clean_name else f"student_{student.id}"

            # Ensure uniqueness
            username = base_username
            counter = 1
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username}{counter}"
                counter += 1

            # Default initial password for existing seeded students
            student_password = f"{username.capitalize()}2026!"
            user = User(
                username=username,
                email=f"{username}@student.vexus.internal",
                password_hash=hash_password(student_password),
                role="student",
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(user)
            db.flush()

            student.user_id = user.id
            db.add(AuditLog(
                user_id=None,
                action="STUDENT_USER_PROVISIONED",
                target_type="student",
                target_id=str(student.id),
                details=f"Provisioned login account '{username}' for student '{student.name}'"
            ))

        db.commit()
        print(f"[VEXUS AUTH] Successfully provisioned student login accounts.")
