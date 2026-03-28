"""
Agent 7 — Health Scorer
6-dimension Money Health Score (0-100).
"""

from core.config import HEALTH_SCORE_DIMENSIONS, HEALTH_GRADES, FIRE_MULTIPLIER

TOOL_SCHEMA = {
    "name": "calculate_health_score",
    "description": (
        "Calculate the couple's Money Health Score (0-100) across 6 dimensions: "
        "emergency preparedness, insurance coverage, investment diversification, "
        "tax efficiency, debt health, and retirement readiness."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "tax_result": {"type": "object", "description": "Results from tax agent"},
            "insurance_result": {"type": "object", "description": "Results from insurance agent"},
            "goal_result": {"type": "object", "description": "Results from goal agent"},
            "portfolio_result": {"type": "object", "description": "Results from portfolio agent"},
            "partner_a": {"type": "object", "description": "Partner A data"},
            "partner_b": {"type": "object", "description": "Partner B data"},
            "monthly_expenses": {"type": "number"},
            "emergency_fund": {"type": "number"},
        },
        "required": ["partner_a", "partner_b"],
    },
}


def calculate_health_score(
    partner_a: dict, partner_b: dict,
    tax_result: dict = None, insurance_result: dict = None,
    goal_result: dict = None, portfolio_result: dict = None,
    monthly_expenses: float = 0, emergency_fund: float = 0,
) -> dict:
    """Calculate 6-dimension health score."""

    dimensions = []
    total_score = 0

    # 1. Emergency Preparedness (0-20)
    em_max = HEALTH_SCORE_DIMENSIONS["emergency_preparedness"]["max"]
    target_months = HEALTH_SCORE_DIMENSIONS["emergency_preparedness"]["target_months"]
    if monthly_expenses > 0:
        months_covered = emergency_fund / monthly_expenses
        em_score = min(em_max, round((months_covered / target_months) * em_max))
    else:
        em_score = 10  # Unknown — neutral
    dimensions.append({
        "name": "Emergency Preparedness",
        "score": em_score, "max": em_max,
        "tip": f"{'Maintain 6 months expenses.' if em_score >= em_max else f'Build emergency fund to ₹{int(monthly_expenses * 6):,}.'}" if monthly_expenses > 0 else "Set up an emergency fund of 6 months expenses."
    })
    total_score += em_score

    # 2. Insurance Coverage (0-20)
    ins_max = HEALTH_SCORE_DIMENSIONS["insurance_coverage"]["max"]
    gap_penalty = HEALTH_SCORE_DIMENSIONS["insurance_coverage"]["gap_penalty"]
    ins_score = ins_max
    ins_tips = []
    if insurance_result:
        a_ins = insurance_result.get("partner_a", {})
        b_ins = insurance_result.get("partner_b", {})
        if a_ins.get("term_insurance", {}).get("gap", 0) > 0:
            ins_score -= gap_penalty
            ins_tips.append(f"{a_ins.get('name', 'Partner A')} needs ₹{a_ins['term_insurance']['gap']:,} more term cover.")
        if b_ins.get("term_insurance", {}).get("gap", 0) > 0:
            ins_score -= gap_penalty
            ins_tips.append(f"{b_ins.get('name', 'Partner B')} needs ₹{b_ins['term_insurance']['gap']:,} more term cover.")
        if a_ins.get("health_insurance", {}).get("gap", 0) > 0:
            ins_score -= gap_penalty
            ins_tips.append("Increase family health cover.")
        if b_ins.get("health_insurance", {}).get("gap", 0) > 0:
            ins_score -= gap_penalty
    else:
        ins_score = 8  # No data — assume poor
        ins_tips.append("Review insurance coverage.")
    ins_score = max(0, ins_score)
    dimensions.append({
        "name": "Insurance Coverage",
        "score": ins_score, "max": ins_max,
        "tip": ins_tips[0] if ins_tips else "Insurance coverage is adequate."
    })
    total_score += ins_score

    # 3. Investment Diversification (0-15)
    div_max = HEALTH_SCORE_DIMENSIONS["investment_diversification"]["max"]
    if portfolio_result:
        alloc = portfolio_result.get("allocation", {})
        eq_pct = alloc.get("equity", {}).get("pct", 0) / 100 if isinstance(alloc.get("equity"), dict) else 0
        # Penalize extreme concentration
        if 0.3 <= eq_pct <= 0.8:
            div_score = div_max
        elif eq_pct > 0.8:
            div_score = round(div_max * 0.6)
        else:
            div_score = round(div_max * 0.7)
    else:
        div_score = 7
    dimensions.append({
        "name": "Investment Diversification",
        "score": div_score, "max": div_max,
        "tip": "Maintain balanced equity-debt allocation." if div_score >= div_max else "Rebalance portfolio for better diversification."
    })
    total_score += div_score

    # 4. Tax Efficiency (0-15)
    tax_max = HEALTH_SCORE_DIMENSIONS["tax_efficiency"]["max"]
    if tax_result:
        a_tax = tax_result.get("partner_a", {})
        b_tax = tax_result.get("partner_b", {})
        # Efficiency = 1 - (actual_missed_savings / total_possible_savings)
        total_possible = a_tax.get("total_missed_saving", 0) + b_tax.get("total_missed_saving", 0)
        a_regime = a_tax.get("regime_comparison", {})
        b_regime = b_tax.get("regime_comparison", {})
        max_tax = max(1, a_regime.get("old_regime", {}).get("total_tax", 1) + b_regime.get("old_regime", {}).get("total_tax", 1))
        optimized_tax = min(a_regime.get("old_regime", {}).get("total_tax", 0), a_regime.get("new_regime", {}).get("total_tax", 0)) + \
                        min(b_regime.get("old_regime", {}).get("total_tax", 0), b_regime.get("new_regime", {}).get("total_tax", 0))
        efficiency = 1 - (optimized_tax / max_tax) if max_tax > 0 else 0.5
        tax_score = round(tax_max * min(1, efficiency + 0.3))  # Boost baseline
    else:
        tax_score = 7
    tax_score = min(tax_max, max(0, tax_score))
    dimensions.append({
        "name": "Tax Efficiency",
        "score": tax_score, "max": tax_max,
        "tip": "Maximize all deductions under 80C, 80D, and NPS." if tax_score < tax_max else "Tax planning is well optimized."
    })
    total_score += tax_score

    # 5. Debt Health (0-15)
    debt_max = HEALTH_SCORE_DIMENSIONS["debt_health"]["max"]
    safe_ratio = HEALTH_SCORE_DIMENSIONS["debt_health"]["safe_emi_ratio"]
    combined_emi = partner_a.get("monthly_emi", 0) + partner_b.get("monthly_emi", 0)
    combined_income = (partner_a.get("annual_ctc", 0) + partner_b.get("annual_ctc", 0)) / 12
    if combined_income > 0:
        emi_ratio = combined_emi / combined_income
        if emi_ratio <= safe_ratio:
            debt_score = debt_max
        else:
            debt_score = max(0, round(debt_max * (1 - (emi_ratio - safe_ratio) / 0.30)))
    else:
        debt_score = debt_max  # No income data means no EMI concern
    dimensions.append({
        "name": "Debt Health",
        "score": debt_score, "max": debt_max,
        "tip": "EMI-to-income ratio is healthy." if debt_score >= debt_max else f"EMI-to-income ratio is {emi_ratio*100:.0f}% — aim for under 30%."
    })
    total_score += debt_score

    # 6. Retirement Readiness (0-15)
    ret_max = HEALTH_SCORE_DIMENSIONS["retirement_readiness"]["max"]
    if goal_result and goal_result.get("retirement"):
        fire_data = goal_result["retirement"]
        fire_number = fire_data.get("fire_number", 1)
        projected = fire_data.get("projected_corpus", 0)
        ratio = min(1, projected / fire_number) if fire_number > 0 else 0
        ret_score = round(ret_max * ratio)
    else:
        ret_score = 5
    dimensions.append({
        "name": "Retirement Readiness",
        "score": ret_score, "max": ret_max,
        "tip": "On track for retirement." if ret_score >= ret_max * 0.8 else "Increase SIP contributions for retirement."
    })
    total_score += ret_score

    # Grade
    grade = "D"
    for threshold, g in HEALTH_GRADES:
        if total_score >= threshold:
            grade = g
            break

    # Projected score after recommendations (+15 to +25 points typically)
    projected_boost = min(30, (100 - total_score) * 0.5)
    projected_score = min(100, round(total_score + projected_boost))

    # 3 weakest dimensions
    dimensions.sort(key=lambda d: d["score"] / d["max"])
    weakest_3 = [d["name"] for d in dimensions[:3]]

    # Re-sort by original order
    dim_order = ["Emergency Preparedness", "Insurance Coverage", "Investment Diversification",
                 "Tax Efficiency", "Debt Health", "Retirement Readiness"]
    dimensions.sort(key=lambda d: dim_order.index(d["name"]) if d["name"] in dim_order else 99)

    projected_grade = "D"
    for threshold, g in HEALTH_GRADES:
        if projected_score >= threshold:
            projected_grade = g
            break

    return {
        "total": total_score,
        "grade": grade,
        "dimensions": dimensions,
        "projected_score": projected_score,
        "projected_grade": projected_grade,
        "weakest_dimensions": weakest_3,
        "improvement_tips": [d["tip"] for d in dimensions if d["score"] < d["max"] * 0.7],
    }
