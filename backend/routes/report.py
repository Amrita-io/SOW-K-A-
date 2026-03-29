"""
GET /api/report/pdf — PDF report generation endpoint.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from report.pdf_generator import generate_couple_report
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/api/report/pdf")
async def get_report_pdf(analysis: dict):
    """Stateless PDF generation: Takes analysis JSON and returns PDF bytes."""
    if not analysis:
        raise HTTPException(status_code=400, detail="No analysis data provided in request body.")

    try:
        pdf_bytes = generate_couple_report(analysis)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=SOW_Financial_Report.pdf"
            },
        )
    except Exception as e:
        logger.error(f"PDF generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
