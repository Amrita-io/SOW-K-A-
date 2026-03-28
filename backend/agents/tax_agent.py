"""
Agent 1 — Tax Optimizer
Dual-regime comparison, HRA arbitrage, missed deductions.
"""

import json
from core.tax_engine import (
    calculate_partner_tax_full,
    calculate_hra_arbitrage,
)

TOOL_SCHEMA = {
    "name": "analyze_tax_optimization",
    "description": (
        "Analyze tax optimization for an Indian couple. Compares old vs new regime "
        "for each partner, calculates HRA arbitrage, finds missed deductions, and "
        "recommends the optimal regime per partner."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "partner_a": {
                "type": "object",
                "description": "Partner A financial data including CTC, deductions, HRA, city, etc."
            },
            "partner_b": {
                "type": "object",
                "description": "Partner B financial data including CTC, deductions, HRA, city, etc."
            },
        },
        "required": ["partner_a", "partner_b"],
    },
}


def analyze_tax_optimization(partner_a: dict, partner_b: dict) -> dict:
    """Run full tax analysis for both partners."""

    a_result = calculate_partner_tax_full(partner_a)
    b_result = calculate_partner_tax_full(partner_b)

    # HRA arbitrage
    hra_arb = calculate_hra_arbitrage(partner_a, partner_b)

    # Total tax saving from regime optimization
    total_regime_saving = a_result["regime_saving"] + b_result["regime_saving"]

    # Total missed deduction saving (only for old-regime partners)
    total_missed_saving = 0
    if a_result["recommended_regime"] == "old":
        total_missed_saving += a_result["total_missed_saving"]
    if b_result["recommended_regime"] == "old":
        total_missed_saving += b_result["total_missed_saving"]

    total_tax_saving = total_regime_saving + total_missed_saving + hra_arb.get("annual_saving_delta", 0)

    return {
        "partner_a": {
            "name": a_result["name"],
            "recommended_regime": a_result["recommended_regime"],
            "current_tax": a_result["current_tax"],
            "optimized_tax": a_result["optimized_tax"],
            "tax_saving": a_result["regime_saving"],
            "hra_exemption": a_result["hra_exemption"],
            "missed_deductions": a_result["missed_deductions"],
            "total_missed_saving": a_result["total_missed_saving"],
            "regime_comparison": a_result["regime_comparison"],
        },
        "partner_b": {
            "name": b_result["name"],
            "recommended_regime": b_result["recommended_regime"],
            "current_tax": b_result["current_tax"],
            "optimized_tax": b_result["optimized_tax"],
            "tax_saving": b_result["regime_saving"],
            "hra_exemption": b_result["hra_exemption"],
            "missed_deductions": b_result["missed_deductions"],
            "total_missed_saving": b_result["total_missed_saving"],
            "regime_comparison": b_result["regime_comparison"],
        },
        "hra_arbitrage": hra_arb,
        "total_tax_saving": total_tax_saving,
        "total_regime_saving": total_regime_saving,
        "total_missed_saving": total_missed_saving,
    }
