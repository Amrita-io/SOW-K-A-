"""
CoupleWealth — Insurance Calculation Engine
HLV method, health cover adequacy, critical illness, 80D optimization.
"""

from core.config import (
    HLV_INCOME_REPLACEMENT_FACTOR,
    MINIMUM_HEALTH_COVER_METRO,
    MINIMUM_HEALTH_COVER_NON_METRO,
    CRITICAL_ILLNESS_MULTIPLE,
    RETIREMENT_AGE_DEFAULT,
    SECTION_80D_SELF_LIMIT,
    SECTION_80D_PARENTS_LIMIT,
    SECTION_80D_PARENTS_SENIOR_LIMIT,
)


def calculate_hlv(
    annual_income: float,
    current_age: int,
    retirement_age: int = RETIREMENT_AGE_DEFAULT,
    income_replacement_factor: float = HLV_INCOME_REPLACEMENT_FACTOR,
    income_growth_rate: float = 0.06,
    discount_rate: float = 0.08,
) -> float:
    working_years = max(0, retirement_age - current_age)
    if working_years == 0:
        return 0
    replacement_income = annual_income * income_replacement_factor
    total = 0.0
    for t in range(1, working_years + 1):
        future_income = replacement_income * ((1 + income_growth_rate) ** t)
        pv = future_income / ((1 + discount_rate) ** t)
        total += pv
    return round(total)


def calculate_term_cover_gap(
    annual_income: float,
    current_age: int,
    existing_term_cover: float,
    retirement_age: int = RETIREMENT_AGE_DEFAULT,
) -> dict:
    required = calculate_hlv(annual_income, current_age, retirement_age)
    gap = max(0, required - existing_term_cover)
    premium_per_lakh = _estimate_term_premium_per_lakh(current_age)
    estimated_monthly_premium = round((gap / 100000) * premium_per_lakh / 12) if gap > 0 else 0
    return {
        "required_cover": required,
        "existing_cover": existing_term_cover,
        "gap": gap,
        "is_covered": gap == 0,
        "over_insured_by": max(0, existing_term_cover - required),
        "estimated_monthly_premium": estimated_monthly_premium,
        "hlv_breakdown": {
            "annual_income": annual_income,
            "replacement_factor": HLV_INCOME_REPLACEMENT_FACTOR,
            "working_years": max(0, retirement_age - current_age),
        },
    }


def check_health_cover_adequacy(existing_cover: float, is_metro: bool, family_size: int = 2) -> dict:
    minimum = MINIMUM_HEALTH_COVER_METRO if is_metro else MINIMUM_HEALTH_COVER_NON_METRO
    adjusted_minimum = minimum + max(0, (family_size - 2)) * 200000
    gap = max(0, adjusted_minimum - existing_cover)
    needs_super_topup = existing_cover > 0 and existing_cover < adjusted_minimum
    return {
        "existing_cover": existing_cover,
        "minimum_recommended": adjusted_minimum,
        "gap": gap,
        "is_adequate": gap == 0,
        "city_type": "metro" if is_metro else "non-metro",
        "needs_super_topup": needs_super_topup,
        "super_topup_amount": gap if needs_super_topup else 0,
        "recommendation": (
            f"Health cover of ₹{existing_cover:,.0f} is adequate."
            if gap == 0
            else f"Increase health cover by ₹{gap:,.0f}. "
            f"{'Consider a super top-up plan.' if needs_super_topup else 'Consider a family floater plan.'}"
        ),
    }


def calculate_critical_illness_need(annual_income: float, existing_ci_cover: float = 0) -> dict:
    recommended = annual_income * CRITICAL_ILLNESS_MULTIPLE
    gap = max(0, recommended - existing_ci_cover)
    return {"recommended_cover": recommended, "existing_cover": existing_ci_cover, "gap": gap, "is_covered": gap == 0}


def optimize_80d(
    health_premium_self: float = 0,
    health_premium_parents: float = 0,
    parents_senior_citizen: bool = False,
) -> dict:
    self_limit = SECTION_80D_SELF_LIMIT
    parent_limit = SECTION_80D_PARENTS_SENIOR_LIMIT if parents_senior_citizen else SECTION_80D_PARENTS_LIMIT
    self_used = min(health_premium_self, self_limit)
    self_remaining = max(0, self_limit - self_used)
    parent_used = min(health_premium_parents, parent_limit)
    parent_remaining = max(0, parent_limit - parent_used)
    total_available = self_remaining + parent_remaining
    potential_saving_30 = round(total_available * 0.30)
    return {
        "self_spouse": {"limit": self_limit, "used": self_used, "remaining": self_remaining},
        "parents": {"limit": parent_limit, "used": parent_used, "remaining": parent_remaining, "is_senior_citizen": parents_senior_citizen},
        "total_remaining": total_available,
        "potential_saving_30pct": potential_saving_30,
        "potential_saving_20pct": round(total_available * 0.20),
        "recommendation": (
            f"Claim ₹{total_available:,.0f} more under 80D — saves ₹{potential_saving_30:,.0f} at 30% slab."
        ) if total_available > 0 else "80D fully utilized.",
    }


def full_insurance_audit(partner: dict) -> dict:
    name = partner.get("name", "Partner")
    annual_income = partner.get("annual_ctc", 0)
    age = partner.get("age", 30)
    is_metro = partner.get("is_metro", False)
    term_result = calculate_term_cover_gap(annual_income, age, partner.get("term_cover", 0))
    health_premium = partner.get("health_premium", 0)
    estimated_health_cover = _estimate_cover_from_premium(health_premium)
    health_result = check_health_cover_adequacy(estimated_health_cover, is_metro)
    ci_result = calculate_critical_illness_need(annual_income)
    d80_result = optimize_80d(
        health_premium, partner.get("parent_health_premium", 0), partner.get("parents_senior_citizen", False)
    )
    return {"name": name, "term_insurance": term_result, "health_insurance": health_result, "critical_illness": ci_result, "section_80d": d80_result}


def _estimate_term_premium_per_lakh(age: int) -> float:
    if age < 30: return 80
    elif age < 35: return 100
    elif age < 40: return 140
    elif age < 45: return 200
    elif age < 50: return 300
    else: return 450


def _estimate_cover_from_premium(annual_premium: float) -> float:
    if annual_premium <= 0: return 0
    elif annual_premium <= 10000: return 300000
    elif annual_premium <= 15000: return 500000
    elif annual_premium <= 25000: return 1000000
    elif annual_premium <= 40000: return 2000000
    else: return 3000000
