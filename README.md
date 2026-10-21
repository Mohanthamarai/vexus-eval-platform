# VEXUS 2.5 — Secure, Role-Based AI Tutoring Evaluation Platform
### Real-Time Monitoring of Answer Quality, Hallucination Risk, Student Dependency & Learning Outcomes

VEXUS (EvalTutor) is an enterprise-grade AI tutoring evaluation platform designed to assess, audit, and safeguard AI pedagogical assistants across five core dimensions:
1. **Answer Quality (Pedagogical Efficacy)**
2. **Hallucination Risk (Factuality & Safety)**
3. **Student Dependency (Over-reliance Telemetry)**
4. **Learning Outcomes (Knowledge Progression & Retention)**
5. **Multilingual Parity (Equitable Cross-Lingual Tutoring)**

---

## 🏛️ System Architecture

VEXUS operates with two distinct, dedicated experiences sharing a unified AI evaluation engine and persistent SQLite database:

### 1. Admin Portal
- **Executive Analytics Dashboard**: Platform-wide KPIs, 30-day temporal trend lines, subject-wise comparisons, and score distributions.
- **Student Directory & Account Management**: Full longitudinal telemetry, student creation, and password reset tools.
- **AI Evaluations Audit**: Filterable logs with detailed quality radar and hallucination breakdown.
- **Safety Alerts**: Real-time threshold monitoring with one-click resolution.
- **AI Simulator Testing Sandbox**: Controlled sandbox for admin evaluation of prompts and rubrics.
- **Subsystem Health & Diagnostics**: Real-time latency and connectivity monitoring for all 8 subsystems.
- **Report Export**: Dynamic generation and download of executive PowerPoint presentations (`/api/download-pptx`).

### 2. Student Portal
- **AI Tutor Workspace**: Real-time conversational tutoring with Socratic scaffolding prompts and Markdown formatting.
- **Live Pedagogical Evaluation**: Every student interaction is automatically evaluated by the 4 modules, persisted to the database, and accompanied by transparent educational quality feedback.
- **My Progress**: Personal learning analytics, completed sessions, average answer quality, and independence scores.
- **My History**: Searchable, chronological archive of all previous tutoring sessions.
- **Assessments & Mastery**: Tracking Pre-test, Post-test, and Retention performance across Bloom's Taxonomy cognitive levels.
- **Account & Security**: Student credential updates and language preferences.

---

## 🔒 Security & Data Isolation Model

- **Bcrypt Password Hashing**: Salted password hashing with 12 rounds.
- **Expiring Server-Side Sessions**: 256-bit URL-safe tokens stored in SQLite with explicit expiration and instant revocation on logout.
- **Role-Based Access Control (RBAC)**: Backend dependencies enforce strict data boundaries on every endpoint (`require_admin`, `require_student`).
- **Student Data Isolation**: Students can strictly access only their own sessions and assessments; direct ID queries for foreign records return `HTTP 403 Forbidden`.
- **Brute-Force Rate Limiting**: Built-in sliding-window throttling for authentication endpoints.
- **Audit Logging**: Sensitive administrative and security events are recorded in `audit_logs`.

---

## 🚀 Quick Start

### 1. Environment & Setup
The project uses Python 3.12 with dependencies installed in the virtual environment `.venv`.

To install dependencies manually:
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configuration (`backend/.env`)
Configure your environment variables in `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b
VEXUS_ADMIN_USERNAME=admin
VEXUS_ADMIN_PASSWORD=AdminSecureVexus2026!
```

### 3. Run the Server
From the `backend` directory:
```bash
python main.py
```
*The server will start on **http://127.0.0.1:8050** and automatically migrate the SQLite database schema and bootstrap system accounts.*

### 4. Access the Web Application
Open your browser to:
```
http://localhost:8050
```

---

## 🔑 Default Credentials for Testing

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `AdminSecureVexus2026!` | Full executive dashboard, student management, alert resolution |
| **Student (Demo 1)** | `alicesmith` | `Alicesmith2026!` | AI tutoring workspace, personal progress, history, assessments |
| **Student (Demo 2)** | `bobjones` | `Bobjones2026!` | Secondary student profile for cross-student testing |

*(The login modal also includes one-click "Quick Role Select" buttons to easily switch roles during testing).*

---

## 🧪 Running Diagnostic & Integration Tests

### 1. Platform Health Diagnostics (8 Subsystems)
Audits SQLite database, Groq inference, Answer Quality, Hallucination Guard, Dependency Telemetry, Learning Outcomes, Multilingual layer, and Tutor Simulator:
```bash
python test_vexus_health.py
```

### 2. Security & Role Separation Test Suite
Tests authentication, student isolation (403 on foreign data), admin account creation, and the live student evaluation persistence loop:
```bash
python backend/test_auth_and_portals.py
```
