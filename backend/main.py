"""
SOW — Strategy Optimization Workspace — FastAPI Main Application
"""

import os
import sys
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Load environment variables
load_dotenv()

from core.config import APP_NAME, APP_VERSION
from routes.analysis import router as analysis_router
from routes.upload import router as upload_router
from routes.report import router as report_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info(f"{APP_NAME} v{APP_VERSION} starting...")
    logger.info("Local Intelligence Engine (Ollama) initialized.")
    yield
    logger.info(f"{APP_NAME} shutting down.")


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="SOW — Strategy Optimization Workspace — Indian joint financial intelligence",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Rate limiting
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded

    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    logger.info("Rate limiting enabled.")
except ImportError:
    logger.warning("slowapi not installed — rate limiting disabled.")

# Register routes
app.include_router(analysis_router)
app.include_router(upload_router)
app.include_router(report_router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": APP_VERSION, "app": APP_NAME}


@app.middleware("http")
async def cache_analysis_middleware(request: Request, call_next):
    """Cache analysis results for PDF report generation."""
    response = await call_next(request)

    # If this was a successful analysis request, cache the result
    if request.url.path == "/api/analyze" and response.status_code == 200:
        try:
            # The response body is already formatted; we cache via the route
            pass
        except Exception:
            pass

    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("BACKEND_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
