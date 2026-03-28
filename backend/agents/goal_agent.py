"""
Agent 4 — Goal Planner
Goal corpus calculations, FIRE projection, conflict detection.
"""

from core.goal_math import plan_all_goals, calculate_fire_projection

TOOL_SCHEMA = {
    "name": "plan_financial_goals",
    "description": (
        "Plan all financial goals for the couple. Calculates inflation-adjusted "
        "future costs, required monthly SIPs, FIRE projection, and detects goal "
        "conflicts when total needed exceeds investable surplus."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "partner_a": {"type": "object", "description": "Partner A financial data"},
            "partner_b": {"type": "object", "description": "Partner B financial data"},
            "goals": {"type": "array", "description": "List of goal dicts with name, target_year, present_cost, goal_type"},
            "risk_profile": {"type": "string", "description": "conservative, moderate, or aggressive"},
            "monthly_expenses": {"type": "number", "description": "Monthly household expenses"},
            "emergency_fund_existing": {"type": "number", "description": "Current emergency fund amount"},
        },
        "required": ["partner_a", "partner_b", "goals"],
    },
}


def plan_financial_goals(
    partner_a: dict, partner_b: dict, goals: list,
    risk_profile: str = "moderate",
    monthly_expenses: float = 0,
    emergency_fund_existing: float = 0,
) -> dict:
    """Plan all goals + FIRE projection."""

    combined_income_monthly = (
        partner_a.get("annual_ctc", 0) + partner_b.get("annual_ctc", 0)
    ) / 12
    combined_sip = partner_a.get("monthly_sip", 0) + partner_b.get("monthly_sip", 0)
    combined_emi = partner_a.get("monthly_emi", 0) + partner_b.get("monthly_emi", 0)

    investable_surplus = max(0, combined_income_monthly - monthly_expenses - combined_emi - combined_sip)

    # Plan all goals
    goal_result = plan_all_goals(goals, risk_profile, investable_surplus + combined_sip)

    # FIRE projection
    retirement_goal = next(
        (g for g in goals if g.get("goal_type") in ("retirement", "fire")), None
    )
    retirement_age_target = 55
    monthly_retirement_expenses = monthly_expenses if monthly_expenses > 0 else 100000

    if retirement_goal:
        retirement_age_target = retirement_goal.get("target_year", 55)
        if retirement_age_target > 2000:
            # target_year is a calendar year, convert to age
            younger_age = min(partner_a.get("age", 30), partner_b.get("age", 30))
            from datetime import datetime
            current_year = datetime.now().year
            retirement_age_target = younger_age + (retirement_age_target - current_year)
        if retirement_goal.get("present_cost", 0) > 0:
            monthly_retirement_expenses = retirement_goal["present_cost"] / 12

    fire = calculate_fire_projection(
        partner_a, partner_b,
        retirement_age_target=retirement_age_target,
        monthly_retirement_expenses=monthly_retirement_expenses,
        current_corpus=0,
        risk_profile=risk_profile,
    )

    # Emergency fund analysis
    emergency_target = monthly_expenses * 6 if monthly_expenses > 0 else 300000
    emergency_gap = max(0, emergency_target - emergency_fund_existing)

    return {
        "goals": goal_result["goals"],
        "total_monthly_sip_needed": goal_result["total_monthly_sip_needed"],
        "investable_surplus": investable_surplus + combined_sip,
        "sip_shortfall": goal_result["sip_shortfall"],
        "has_conflict": goal_result["has_conflict"],
        "conflict_message": goal_result.get("conflict_message"),
        "retirement": fire,
        "emergency": {
            "target": emergency_target,
            "existing": emergency_fund_existing,
            "gap": emergency_gap,
            "months_covered": round(emergency_fund_existing / monthly_expenses, 1) if monthly_expenses > 0 else 0,
        },
    }
