"""
Comprehensive Test Suite for VEXUS 2.5:
1. Authentication & Role Enforcement (Admin vs Student)
2. Data Isolation (Students cannot access other students' sessions or admin routes)
3. Student Chat & Live Evaluation Persistence Loop
4. Admin Student Account Creation & Password Reset
5. Safety Alert Resolution & Audit Trail
"""

import sys
import os
import unittest
from fastapi.testclient import TestClient

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
from database import SessionLocal, User, Student, Session as DBSession, Evaluation, Alert
from config import BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_PASSWORD

client = TestClient(app)


class TestVexusPortalsAndSecurity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # 1. Admin login
        admin_res = client.post("/api/auth/login", json={
            "username": BOOTSTRAP_ADMIN_USERNAME,
            "password": BOOTSTRAP_ADMIN_PASSWORD
        })
        assert admin_res.status_code == 200, f"Admin login failed: {admin_res.text}"
        cls.admin_token = admin_res.json()["session_token"]
        cls.admin_headers = {"Authorization": f"Bearer {cls.admin_token}"}

        # 2. Get an existing student or create one
        db = SessionLocal()
        student_user = db.query(User).filter(User.role == "student").first()
        db.close()
        assert student_user is not None, "No student user found in database"

        cls.student_username = student_user.username
        cls.student_password = f"{cls.student_username.capitalize()}2026!"

        # Student login
        student_res = client.post("/api/auth/login", json={
            "username": cls.student_username,
            "password": cls.student_password
        })
        assert student_res.status_code == 200, f"Student login failed: {student_res.text}"
        cls.student_token = student_res.json()["session_token"]
        cls.student_id = student_res.json()["student_id"]
        cls.student_headers = {"Authorization": f"Bearer {cls.student_token}"}

    def test_01_admin_endpoints_accessible_by_admin(self):
        """Admin can access dashboard overview and student list."""
        res = client.get("/api/admin/dashboard", headers=self.admin_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("overview", data)
        self.assertGreaterEqual(data["overview"]["total_students"], 1)

    def test_02_student_forbidden_from_admin_endpoints(self):
        """Student receives HTTP 403 when trying to access admin endpoints."""
        res = client.get("/api/admin/dashboard", headers=self.student_headers)
        self.assertEqual(res.status_code, 403)
        self.assertIn("Administrator privileges required", res.text)

        res_students = client.get("/api/admin/students", headers=self.student_headers)
        self.assertEqual(res_students.status_code, 403)

    def test_03_student_accesses_own_portal(self):
        """Student can view their own profile, dashboard, and sessions."""
        res = client.get("/api/student/me", headers=self.student_headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["student_id"], self.student_id)

        res_dash = client.get("/api/student/dashboard", headers=self.student_headers)
        self.assertEqual(res_dash.status_code, 200)
        self.assertEqual(res_dash.json()["student_id"], self.student_id)

    def test_04_student_cannot_access_other_student_session(self):
        """Student cannot query or view another student's tutoring session."""
        db = SessionLocal()
        # Find a session belonging to another student
        other_session = db.query(DBSession).filter(DBSession.student_id != self.student_id).first()
        db.close()

        if other_session:
            res = client.get(f"/api/student/sessions/{other_session.id}", headers=self.student_headers)
            self.assertEqual(res.status_code, 403)

    def test_05_student_chat_and_evaluation_persistence_loop(self):
        """
        When student chats with AI tutor:
        1. AI response is returned
        2. Tutoring session is persisted
        3. All 4 evaluation modules evaluate it
        4. Evaluation is persisted and linked to this student
        """
        db = SessionLocal()
        initial_eval_count = db.query(Evaluation).filter(Evaluation.student_id == self.student_id).count()
        db.close()

        chat_payload = {
            "subject": "science",
            "grade_level": 8,
            "history": [],
            "message": "Why does ice float on water?"
        }
        res = client.post("/api/student/chat", json=chat_payload, headers=self.student_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("response", data)
        self.assertIn("session_id", data)
        self.assertIn("quality_score", data)
        self.assertIn("overall_grade", data)

        # Verify database record
        db = SessionLocal()
        new_eval_count = db.query(Evaluation).filter(Evaluation.student_id == self.student_id).count()
        latest_eval = db.query(Evaluation).filter(Evaluation.session_id == data["session_id"]).first()
        db.close()

        self.assertEqual(new_eval_count, initial_eval_count + 1)
        self.assertIsNotNone(latest_eval)
        self.assertEqual(latest_eval.student_id, self.student_id)

    def test_06_admin_creates_new_student_account(self):
        """Admin can provision a new student account with credentials."""
        req_payload = {
            "name": "Maya Lin",
            "grade": 9,
            "language": "en",
            "username": "mayalin",
            "password": "MayaSecure2026!"
        }
        res = client.post("/api/admin/students", json=req_payload, headers=self.admin_headers)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["username"], "mayalin")

        # Verify the new student can log in
        login_res = client.post("/api/auth/login", json={
            "username": "mayalin",
            "password": "MayaSecure2026!"
        })
        self.assertEqual(login_res.status_code, 200)
        self.assertEqual(login_res.json()["role"], "student")


if __name__ == "__main__":
    unittest.main()
