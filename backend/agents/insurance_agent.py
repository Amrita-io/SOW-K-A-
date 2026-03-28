"""
Agent 3 — Insurance Auditor
HLV term cover, health adequacy, critical illness, 80D optimization.
"""

from core.insurance_calc import full_insurance_audit, optimize_80d

TOOL_SCHEMA = {
    "name": "audit_insurance",
    "description": (
        "Audit insurance coverage for both partners. Calculates term cover gaps "
        "using HLV method, health cover adequacy, critical illness needs, and "
        "80D tax saving opportunities."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "partner_a": {"type": "object", "description": "Partner A financial data"},
            "partner_b": {"type": "object", "description": "Partner B financial data"},
        },
        "required": ["partner_a", "partner_b"],
    },
}


def audit_insurance(partner_a: dict, partner_b: dict) -> dict:
    """Run full insurance audit for both partners."""
    a_audit = full_insurance_audit(partner_a)
    b_audit = full_insurance_audit(partner_b)

    # Total gaps
    term_gap_a = a_audit["term_insurance"]["gap"]
    term_gap_b = b_audit["term_insurance"]["gap"]
    health_gap_a = a_audit["health_insurance"]["gap"]
    health_gap_b = b_audit["health_insurance"]["gap"]

    # Combined 80D saving
    d80_a = a_audit["section_80d"]["total_remaining"]
    d80_b = b_audit["section_80d"]["total_remaining"]
    combined_80d_saving = round((d80_a + d80_b) * 0.30)  # at 30% slab

    # Premium restructuring saving (if over-insured)
    over_a = a_audit["term_insurance"]["over_insured_by"]
    over_b = b_audit["term_insurance"]["over_insured_by"]
    restructuring_saving = 0
    if over_a > 0:
        restructuring_saving += round(over_a / 100000 * 100)  # rough annual premium savings
    if over_b > 0:
        restructuring_saving += round(over_b / 100000 * 100)

    return {
        "partner_a": a_audit,
        "partner_b": b_audit,
        "summary": {
            "total_term_gap": term_gap_a + term_gap_b,
            "total_health_gap": health_gap_a + health_gap_b,
            "combined_80d_saving_available": combined_80d_saving,
            "restructuring_saving": restructuring_saving,
            "total_insurance_saving": combined_80d_saving + restructuring_saving,
        },
    }
