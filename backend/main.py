from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import sys
import subprocess
from contextlib import asynccontextmanager

from database import engine, SessionLocal, ensure_database_schema
from routes import (
    auth,
    student_portal,
    admin_portal,
    evaluation,
    students,
    dashboard,
    alerts,
    simulator,
    health,
)
import seed_data
import bootstrap
from auth_deps import get_optional_user

# Ensure database schema is migrated safely on module load
ensure_database_schema(engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        # Seed initial data if empty
        seed_data.seed_database(db)
        # Ensure administrator exists and legacy students have credentials
        bootstrap.bootstrap_system_accounts(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="VEXUS — AI Tutoring Evaluation & Safety Platform",
    description="Real-time monitoring of Answer Quality, Hallucination Risk, Student Dependency & Learning Outcomes",
    version="2.5.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(student_portal.router)
app.include_router(admin_portal.router)
app.include_router(evaluation.router)
app.include_router(students.router)
app.include_router(dashboard.router)
app.include_router(alerts.router)
app.include_router(simulator.router)
app.include_router(health.router)


@app.get("/api/download-pptx")
def download_pptx():
    """Generates and serves the dynamic PowerPoint presentation."""
    base_path = os.path.dirname(os.path.abspath(__file__))
    pptx_path = os.path.join(base_path, "Vexus_Project_Review.pptx")
    script_path = os.path.join(base_path, "generate_pptx.py")

    # Run the generation script to ensure it is always up-to-date
    try:
        subprocess.run([sys.executable, script_path, pptx_path], check=True, timeout=30)
    except Exception as e:
        print(f"Warning: PPTX generator returned error: {e}")

    if not os.path.exists(pptx_path):
        raise HTTPException(status_code=404, detail="Presentation file could not be generated")

    return FileResponse(
        pptx_path,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        filename="Vexus_Project_Review.pptx"
    )


# Mount the frontend directory to serve the UI
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend")


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    ico_path = os.path.join(FRONTEND_DIR, "favicon.ico")
    if os.path.exists(ico_path):
        return FileResponse(ico_path, media_type="image/x-icon")
    svg_path = os.path.join(FRONTEND_DIR, "favicon.svg")
    if os.path.exists(svg_path):
        return FileResponse(svg_path, media_type="image/svg+xml")
    from fastapi.responses import Response
    return Response(status_code=204)


if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8050)
