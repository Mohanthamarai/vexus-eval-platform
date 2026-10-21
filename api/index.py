"""
Vercel Serverless Function Entry Point for VEXUS.
Exposes the FastAPI 'app' instance to the Vercel Python runtime.
"""

import sys
import os

# Add the backend directory to Python system path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app
