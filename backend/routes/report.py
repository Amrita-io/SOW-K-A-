"""
GET /api/report/pdf — PDF report generation endpoint.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from report.pdf_generator import generate_couple_report
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory cache for last analysis result (for demo)
_last_analysis = {}


def cache_analysis(result: dict):
    """Cache the latest analysis result for report generation."""
    global _last_analysis
    _last_analysis = result


@router.get("/api/report/pdf")
async def get_report_pdf():
    """Generate and return PDF report from cached analysis."""
    if not _last_analysis:
        raise HTTPException(status_code=404, detail="No analysis results available. Run analysis first.")

    try:
        pdf_bytes = generate_couple_report(_last_analysis)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=CoupleWealth_Report.pdf"
            },
        )
    except Exception as e:
        logger.error(f"PDF generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
