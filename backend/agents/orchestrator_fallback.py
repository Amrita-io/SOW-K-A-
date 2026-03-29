"""
CoupleWealth — Math-Only Fallback Engine
Returns a JSON-compatible dictionary formatted for the dashboard.
Matches the schema expected by the frontend (Results.jsx).
"""

import logging
from agents.tax_agent import analyze_tax_optimization
from agents.investment_agent import optimize_investments
from agents.insurance_agent import audit_insurance
from agents.goal_agent import plan_financial_goals
from agents.market_agent import analyze_market_signals
from agents.portfolio_agent import analyze_mf_portfolio
from agents.health_agent import calculate_health_score

logger = logging.getLogger(__name__)

def run_math_fallback(
    partner_a: dict, partner_b: dict,
    goals: list, holdings: list = None,
    risk_profile: str = "moderate",
    monthly_expenses: float = 0,
    emergency_fund_existing: float = 0,
) -> dict:
    """Executes a legacy math analysis with corrected schema."""
    logger.info("Executing math-only fallback analyzer.")
    
    try:
        # 1. Run Agents
        tax_res = analyze_tax_optimization(partner_a, partner_b)
        
        total_income = (partner_a.get("annual_ctc", 0) + partner_b.get("annual_ctc", 0)) / 12
        investable_budget = max(0, total_income - monthly_expenses)
        
        invest_res = optimize_investments(partner_a, partner_b, investable_budget, risk_profile)
        insurance_res = audit_insurance(partner_a, partner_b)
        goals_res = plan_financial_goals(
            partner_a=partner_a, partner_b=partner_b, goals=goals, 
            risk_profile=risk_profile, monthly_expenses=monthly_expenses,
            emergency_fund_existing=emergency_fund_existing
        )
        market_res = analyze_market_signals(holdings or [], risk_profile)
        portfolio_res = analyze_mf_portfolio(holdings or [], partner_a.get("age", 30))
        
        health_res = calculate_health_score(
            partner_a=partner_a, partner_b=partner_b,
            tax_result=tax_res, insurance_result=insurance_res, 
            goal_result=goals_res, portfolio_result=portfolio_res,
            monthly_expenses=monthly_expenses, emergency_fund=emergency_fund_existing
        )

        # 2. Aggregate Metrics
        total_tax_saving = tax_res.get("total_tax_saving", 0)
        insurance_saving = insurance_res.get("summary", {}).get("total_insurance_saving", 0)
        market_alpha = market_res.get("total_market_alpha_recovery", 0)
        investment_gain = invest_res.get("total_yield_gain", 0)
        
        headline_saving = total_tax_saving + investment_gain + insurance_saving + market_alpha

        # 3. Assemble Final Response (Schema-Perfect)
        return {
            "ai_agentic_loop": False,
            "status": "Success",
            "engine": "Math Fallback",
            "partner_a": tax_res["partner_a"],
            "partner_b": tax_res["partner_b"],
            "headline_saving": headline_saving,
            "headline_breakdown": {
                "tax_saving": total_tax_saving,
                "investment_gain": investment_gain,
                "insurance_saving": insurance_saving,
                "market_alpha_recovery": market_alpha
            },
            "health_score": health_res,
            "goal_plans": goals_res["goals"],
            "retirement": goals_res["retirement"],
            "insurance": {
                "partner_a": insurance_res["partner_a"]["term_insurance"],
                "partner_b": insurance_res["partner_b"]["term_insurance"],
                "annual_80d_saving_available": insurance_res["summary"]["combined_80d_saving_available"]
            },
            "portfolio": {
                **portfolio_res,
                "fund_signals": market_res.get("fund_signals", []),
                "overlap_warnings": market_res.get("overlap_warnings", [])
            },
            "market_signals": market_res.get("opportunity_alerts", []),
            "priority_actions": _generate_math_actions(tax_res, insurance_res, market_res),
            "regime_explanation": "SOW Math Optimizer successfully calculated your financial roadmap.",
            "hra_explanation": "HRA calculated via local tax engine rules.",
            "encouragement": "Statistical stability achieved. Review your optimization plan.",
            "what_if_scenarios": []
        }
        
    except Exception as e:
        logger.error(f"Fatal error in math fallback: {e}", exc_info=True)
        raise e

def _generate_math_actions(tax_res, ins_res, mkt_res) -> list:
    """Semi-intelligent local action generator."""
    actions = []
    if tax_res.get("total_tax_saving", 0) > 1000:
        actions.append({
            "rank": 1, "title": "Shift Tax Regime", 
            "detail": "Our local engine confirms that switching regimes will recover thousands in dead income tax.",
            "annual_saving": tax_res["total_tax_saving"], "effort": "Low", "timeframe": "Instant"
        })
    
    ins_gap = ins_res.get("summary", {}).get("total_term_gap", 0)
    if ins_gap > 0:
        actions.append({
            "rank": 2, "title": "Fill Coverage Deficit",
            "detail": f"HLV audit shows a gap of ₹{ins_gap:,.0f} in joint term cover. This is a critical risk.",
            "annual_saving": 0, "effort": "Medium", "timeframe": "1 Week"
        })
        
    mkt_drag = mkt_res.get("total_expense_drag", 0)
    if mkt_drag > 2000:
        actions.append({
            "rank": 3, "title": "Prune Expense Drag",
            "detail": f"Found ₹{mkt_drag:,.0f} in annual leak via regular-plan mutual fund commissions.",
            "annual_saving": mkt_drag, "effort": "Medium", "timeframe": "Instant"
        })
        
    return actions
