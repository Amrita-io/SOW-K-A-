"""
Agent 2 — Investment LP Optimizer
Joint SIP/NPS/ELSS allocation using scipy linear programming.
"""

from core.optimizer import optimize_joint_allocation, calculate_instrument_mix
from core.config import SECTION_80C_LIMIT

TOOL_SCHEMA = {
    "name": "optimize_investments",
    "description": (
        "Optimize joint investment allocation between partners using linear programming. "
        "Splits SIP, ELSS, and NPS contributions to minimize combined tax."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "partner_a": {"type": "object", "description": "Partner A financial data"},
            "partner_b": {"type": "object", "description": "Partner B financial data"},
            "monthly_budget": {"type": "number", "description": "Total monthly investable budget"},
            "risk_profile": {"type": "string", "description": "conservative, moderate, or aggressive"},
        },
        "required": ["partner_a", "partner_b", "monthly_budget"],
    },
}


def optimize_investments(
    partner_a: dict, partner_b: dict,
    monthly_budget: float, risk_profile: str = "moderate"
) -> dict:
    """Run LP optimization for joint investment allocation."""

    result = optimize_joint_allocation(partner_a, partner_b, monthly_budget)

    # Instrument mix recommendations
    a_80c_remaining = max(0, SECTION_80C_LIMIT - partner_a.get("existing_80c", 0))
    b_80c_remaining = max(0, SECTION_80C_LIMIT - partner_b.get("existing_80c", 0))

    a_mix = calculate_instrument_mix(a_80c_remaining, risk_profile)
    b_mix = calculate_instrument_mix(b_80c_remaining, risk_profile)

    result["instrument_mix"] = {
        "partner_a": {
            "name": partner_a.get("name", "Partner A"),
            "remaining_80c": a_80c_remaining,
            **a_mix,
        },
        "partner_b": {
            "name": partner_b.get("name", "Partner B"),
            "remaining_80c": b_80c_remaining,
            **b_mix,
        },
    }

    return result
