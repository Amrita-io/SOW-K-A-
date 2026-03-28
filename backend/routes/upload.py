"""
POST /api/upload/cams — CAMS PDF upload endpoint.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from data.cams_parser import parse_cams_pdf
import logging
import io

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/api/upload/cams")
async def upload_cams(file: UploadFile = File(...)):
    """Upload and parse CAMS/KFintech statement PDF."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    try:
        contents = await file.read()
        pdf_stream = io.BytesIO(contents)
        result = parse_cams_pdf(pdf_stream)

        if not result.get("success"):
            raise HTTPException(
                status_code=422,
                detail=result.get("error", "Failed to parse CAMS statement"),
            )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CAMS upload failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
