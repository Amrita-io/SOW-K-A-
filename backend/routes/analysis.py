from fastapi import APIRouter, HTTPException
from models.input_models import AnalysisRequest
from agents.orchestrator import run_orchestrator
from core.state import set_last_analysis
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/api/analyze")
async def analyze(request: AnalysisRequest):
    """Run complete financial analysis for the couple."""
    try:
        partner_a = request.partner_a.model_dump()
        partner_b = request.partner_b.model_dump()
        goals = [g.model_dump() for g in request.goals]
        holdings = [h.model_dump() for h in request.holdings]

        result = run_orchestrator(
            partner_a=partner_a,
            partner_b=partner_b,
            goals=goals,
            holdings=holdings,
            risk_profile=request.risk_profile.value,
            monthly_expenses=request.monthly_expenses,
            emergency_fund_existing=request.emergency_fund_existing,
        )

        # Cache the result for PDF generation
        set_last_analysis(result)

        return result

    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        # Return a cleaner error message to the frontend
        raise HTTPException(
            status_code=500, 
            detail="Our AI agents encountered a temporary bottleneck. Please wait a moment and try again, or switch to a higher-tier plan."
        )
