import os
from pathlib import Path
from dotenv import load_dotenv

# Ensure we load .env from the backend directory regardless of cwd
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# Groq Configuration - loaded strictly from environment or .env file
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

# Database Configuration (supports PostgreSQL DATABASE_URL or SQLite DB_PATH)
DATABASE_URL = os.getenv("DATABASE_URL")

# Handle Vercel serverless environment (read-only filesystem)
if os.getenv("VERCEL"):
    import shutil
    tmp_db = "/tmp/evaluations.db"
    src_db = BASE_DIR / "evaluations.db"
    if not os.path.exists(tmp_db) and os.path.exists(src_db):
        try:
            shutil.copyfile(src_db, tmp_db)
        except Exception as e:
            print(f"Notice: Could not copy seed DB to /tmp: {e}")
    DB_PATH = os.getenv("VEXUS_DB_PATH", tmp_db)
else:
    DB_PATH = os.getenv("VEXUS_DB_PATH", str(BASE_DIR / "evaluations.db"))

# Security Configuration
SECRET_KEY = os.getenv("VEXUS_SECRET_KEY", "vexus-production-secret-key-32-byte-token")
SESSION_EXPIRE_HOURS = int(os.getenv("VEXUS_SESSION_EXPIRE_HOURS", "24"))

# Initial Admin Bootstrap Configuration (Used only during first initialization)
BOOTSTRAP_ADMIN_USERNAME = os.getenv("VEXUS_ADMIN_USERNAME", "admin")
BOOTSTRAP_ADMIN_PASSWORD = os.getenv("VEXUS_ADMIN_PASSWORD", "AdminSecureVexus2026!")

if GROQ_MODEL:
    print(f"Configured to use Groq model '{GROQ_MODEL}'")
