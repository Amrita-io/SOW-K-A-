"""
CoupleWealth — Pure Python Tax Computation Engine
No AI, no external API calls. Just math.
"""

from typing import Optional
from core.config import (
    OLD_REGIME_SLABS,
    NEW_REGIME_SLABS,
    OLD_REGIME_STANDARD_DEDUCTION,
    NEW_REGIME_STANDARD_DEDUCTION,
    OLD_REGIME_REBATE_LIMIT,
    NEW_REGIME_REBATE_LIMIT,
    OLD_REGIME_MAX_REBATE,
    NEW_REGIME_MAX_REBATE,
    HEALTH_EDUCATION_CESS_RATE,
    SECTION_80C_LIMIT,
    SECTION_80CCD_1B_LIMIT,
    SECTION_80D_SELF_LIMIT,
    SECTION_80D_PARENTS_LIMIT,
    SECTION_80D_PARENTS_SENIOR_LIMIT,
    HRA_METRO_PERCENT,
    HRA_NON_METRO_PERCENT,
    METRO_CITIES,
)


def _calculate_tax_from_slabs(taxable_income: float, slabs: list) -> float:
    """Calculate tax using progressive slab rates."""
    tax = 0.0
    prev_limit = 0
    for limit, rate in slabs:
        if taxable_income <= prev_limit:
            break
        bracket_income = min(taxable_income, limit) - prev_limit
        tax += bracket_income * rate
        prev_limit = limit
    return tax


def calculate_old_regime_tax(
    gross_income: float,
    deductions_80c: float = 0,
    nps_80ccd_1b: float = 0,
    health_premium_self: float = 0,
    health_premium_parents: float = 0,
    parents_senior_citizen: bool = False,
    hra_exemption: float = 0,
    other_deductions: float = 0,
) -> dict:
    """
    Calculate tax under the old regime with all applicable deductions.
    Returns breakdown dict with taxable income, tax, cess, and total.
    """
    # Standard deduction
    total_deductions = OLD_REGIME_STANDARD_DEDUCTION

    # Section 80C (capped)
    total_deductions += min(deductions_80c, SECTION_80C_LIMIT)

    # NPS 80CCD(1B) (capped)
    total_deductions += min(nps_80ccd_1b, SECTION_80CCD_1B_LIMIT)

    # Section 80D — health insurance
    parent_limit = (
        SECTION_80D_PARENTS_SENIOR_LIMIT
        if parents_senior_citizen
        else SECTION_80D_PARENTS_LIMIT
    )
    total_deductions += min(health_premium_self, SECTION_80D_SELF_LIMIT)
    total_deductions += min(health_premium_parents, parent_limit)

    # HRA exemption
    total_deductions += hra_exemption

    # Other deductions (LTA, etc.)
    total_deductions += other_deductions

    taxable_income = max(0, gross_income - total_deductions)
    base_tax = _calculate_tax_from_slabs(taxable_income, OLD_REGIME_SLABS)

    # Rebate u/s 87A
    if taxable_income <= OLD_REGIME_REBATE_LIMIT:
        base_tax = max(0, base_tax - OLD_REGIME_MAX_REBATE)

    cess = base_tax * HEALTH_EDUCATION_CESS_RATE
    total_tax = base_tax + cess

    return {
        "gross_income": gross_income,
        "total_deductions": total_deductions,
        "taxable_income": taxable_income,
        "base_tax": base_tax,
        "cess": cess,
        "total_tax": round(total_tax),
        "effective_rate": round(total_tax / gross_income * 100, 2) if gross_income > 0 else 0,
    }


def calculate_new_regime_tax(gross_income: float) -> dict:
    """
    Calculate tax under the new regime.
    Only standard deduction applies — no other deductions.
    """
    taxable_income = max(0, gross_income - NEW_REGIME_STANDARD_DEDUCTION)
    base_tax = _calculate_tax_from_slabs(taxable_income, NEW_REGIME_SLABS)

    # Rebate u/s 87A
    if taxable_income <= NEW_REGIME_REBATE_LIMIT:
        base_tax = max(0, base_tax - NEW_REGIME_MAX_REBATE)

    cess = base_tax * HEALTH_EDUCATION_CESS_RATE
    total_tax = base_tax + cess

    return {
        "gross_income": gross_income,
        "total_deductions": NEW_REGIME_STANDARD_DEDUCTION,
        "taxable_income": taxable_income,
        "base_tax": base_tax,
        "cess": cess,
        "total_tax": round(total_tax),
        "effective_rate": round(total_tax / gross_income * 100, 2) if gross_income > 0 else 0,
    }


def calculate_hra_exemption(
    basic_annual: float,
    hra_received_annual: float,
    rent_paid_annual: float,
    city: str,
) -> float:
    """
    Calculate HRA exemption using the triple-minimum rule.
    HRA exemption = min(
        HRA received,
        Rent paid - 10% of basic,
        50% of basic (metro) or 40% of basic (non-metro)
    )
    """
    if rent_paid_annual <= 0 or hra_received_annual <= 0:
        return 0.0

    is_metro = city.lower().strip() in METRO_CITIES
    metro_pct = HRA_METRO_PERCENT if is_metro else HRA_NON_METRO_PERCENT

    component_1 = hra_received_annual
    component_2 = rent_paid_annual - 0.10 * basic_annual
    component_3 = metro_pct * basic_annual

    exemption = max(0, min(component_1, component_2, component_3))
    return round(exemption)


def recommend_regime(
    gross_income: float,
    deductions_80c: float = 0,
    nps_80ccd_1b: float = 0,
    health_premium_self: float = 0,
    health_premium_parents: float = 0,
    parents_senior_citizen: bool = False,
    hra_exemption: float = 0,
    other_deductions: float = 0,
) -> dict:
    """
    Compare both tax regimes and recommend the better one.
    Returns dict with both calculations + recommendation.
    """
    old_tax = calculate_old_regime_tax(
        gross_income=gross_income,
        deductions_80c=deductions_80c,
        nps_80ccd_1b=nps_80ccd_1b,
        health_premium_self=health_premium_self,
        health_premium_parents=health_premium_parents,
        parents_senior_citizen=parents_senior_citizen,
        hra_exemption=hra_exemption,
        other_deductions=other_deductions,
    )
    new_tax = calculate_new_regime_tax(gross_income)

    saving = new_tax["total_tax"] - old_tax["total_tax"]
    recommended = "old" if old_tax["total_tax"] <= new_tax["total_tax"] else "new"

    return {
        "old_regime": old_tax,
        "new_regime": new_tax,
        "recommended": recommended,
        "saving": abs(saving),
        "explanation": (
            f"Old regime saves ₹{abs(saving):,} more"
            if recommended == "old"
            else f"New regime saves ₹{abs(saving):,} more"
        ),
    }


def find_missed_deductions(
    existing_80c: float = 0,
    existing_nps: float = 0,
    existing_health_self: float = 0,
    existing_health_parents: float = 0,
    parents_senior_citizen: bool = False,
    tax_slab_rate: float = 0.30,
) -> list:
    """
    Find all unused deduction headroom and potential savings.
    """
    missed = []

    # 80C gap
    gap_80c = max(0, SECTION_80C_LIMIT - existing_80c)
    if gap_80c > 0:
        missed.append({
            "section": "80C",
            "current": existing_80c,
            "limit": SECTION_80C_LIMIT,
            "gap": gap_80c,
            "potential_saving": round(gap_80c * tax_slab_rate),
            "instruments": ["ELSS", "PPF", "EPF", "LIC", "Home Loan Principal"],
        })

    # NPS 80CCD(1B) gap
    gap_nps = max(0, SECTION_80CCD_1B_LIMIT - existing_nps)
    if gap_nps > 0:
        missed.append({
            "section": "80CCD(1B)",
            "current": existing_nps,
            "limit": SECTION_80CCD_1B_LIMIT,
            "gap": gap_nps,
            "potential_saving": round(gap_nps * tax_slab_rate),
            "instruments": ["NPS Tier-1"],
        })

    # 80D self gap
    gap_health_self = max(0, SECTION_80D_SELF_LIMIT - existing_health_self)
    if gap_health_self > 0:
        missed.append({
            "section": "80D (Self + Spouse)",
            "current": existing_health_self,
            "limit": SECTION_80D_SELF_LIMIT,
            "gap": gap_health_self,
            "potential_saving": round(gap_health_self * tax_slab_rate),
            "instruments": ["Health insurance premium"],
        })

    # 80D parents gap
    parent_limit = (
        SECTION_80D_PARENTS_SENIOR_LIMIT
        if parents_senior_citizen
        else SECTION_80D_PARENTS_LIMIT
    )
    gap_health_parents = max(0, parent_limit - existing_health_parents)
    if gap_health_parents > 0:
        missed.append({
            "section": "80D (Parents)",
            "current": existing_health_parents,
            "limit": parent_limit,
            "gap": gap_health_parents,
            "potential_saving": round(gap_health_parents * tax_slab_rate),
            "instruments": ["Parent health insurance premium"],
        })

    return missed


def calculate_partner_tax_full(partner: dict) -> dict:
    """
    Full tax analysis for a single partner.
    Accepts partner dict matching PartnerInput schema.
    """
    gross = partner["annual_ctc"]
    basic_annual = gross * partner.get("basic_pct", 0.45)
    hra_received_annual = basic_annual * partner.get("hra_pct", 0.40)
    rent_annual = partner.get("monthly_rent", 0) * 12

    # Calculate HRA exemption
    hra_exemption = 0
    if partner.get("employment_type") == "salaried" and rent_annual > 0:
        hra_exemption = calculate_hra_exemption(
            basic_annual=basic_annual,
            hra_received_annual=hra_received_annual,
            rent_paid_annual=rent_annual,
            city=partner.get("city", ""),
        )

    # The marginal slab rate (for missed deduction calculations)
    if gross > 1000000:
        marginal_rate = 0.30
    elif gross > 500000:
        marginal_rate = 0.20
    else:
        marginal_rate = 0.05

    # Regime comparison
    regime_result = recommend_regime(
        gross_income=gross,
        deductions_80c=partner.get("existing_80c", 0),
        nps_80ccd_1b=partner.get("nps_contribution", 0),
        health_premium_self=partner.get("health_premium", 0),
        health_premium_parents=partner.get("parent_health_premium", 0),
        parents_senior_citizen=partner.get("parents_senior_citizen", False),
        hra_exemption=hra_exemption,
    )

    # Missed deductions (relevant only if old regime is better)
    missed = find_missed_deductions(
        existing_80c=partner.get("existing_80c", 0),
        existing_nps=partner.get("nps_contribution", 0),
        existing_health_self=partner.get("health_premium", 0),
        existing_health_parents=partner.get("parent_health_premium", 0),
        parents_senior_citizen=partner.get("parents_senior_citizen", False),
        tax_slab_rate=marginal_rate,
    )

    # Calculate the "current" tax based on their stated regime
    stated_regime = partner.get("tax_regime", "auto")
    if stated_regime == "old":
        current_tax = regime_result["old_regime"]["total_tax"]
    elif stated_regime == "new":
        current_tax = regime_result["new_regime"]["total_tax"]
    else:
        # Auto — show the worse of the two as "current"
        current_tax = max(
            regime_result["old_regime"]["total_tax"],
            regime_result["new_regime"]["total_tax"],
        )

    optimized_tax = min(
        regime_result["old_regime"]["total_tax"],
        regime_result["new_regime"]["total_tax"],
    )

    return {
        "name": partner.get("name", "Partner"),
        "gross_income": gross,
        "hra_exemption": hra_exemption,
        "regime_comparison": regime_result,
        "recommended_regime": regime_result["recommended"],
        "current_tax": current_tax,
        "optimized_tax": optimized_tax,
        "regime_saving": abs(current_tax - optimized_tax),
        "missed_deductions": missed,
        "total_missed_saving": sum(m["potential_saving"] for m in missed),
        "marginal_rate": marginal_rate,
    }


def calculate_hra_arbitrage(partner_a: dict, partner_b: dict) -> dict:
    """
    Determine which partner should claim HRA for maximum tax benefit.
    Both partners share the same rent; only one should claim for optimization.
    """
    a_gross = partner_a["annual_ctc"]
    b_gross = partner_b["annual_ctc"]
    a_basic = a_gross * partner_a.get("basic_pct", 0.45)
    b_basic = b_gross * partner_b.get("basic_pct", 0.45)
    a_hra_received = a_basic * partner_a.get("hra_pct", 0.40)
    b_hra_received = b_basic * partner_b.get("hra_pct", 0.40)

    # Use the higher rent between the two (or the one paying rent)
    rent_a = partner_a.get("monthly_rent", 0) * 12
    rent_b = partner_b.get("monthly_rent", 0) * 12
    total_rent = max(rent_a, rent_b)  # whichever is the actual rent being paid

    if total_rent <= 0:
        return {
            "winner": None,
            "annual_saving_delta": 0,
            "explanation": "No rent paid — HRA exemption not applicable.",
        }

    city_a = partner_a.get("city", "")
    city_b = partner_b.get("city", city_a)

    hra_a = calculate_hra_exemption(a_basic, a_hra_received, total_rent, city_a)
    hra_b = calculate_hra_exemption(b_basic, b_hra_received, total_rent, city_b)

    # Apply marginal tax rate to see actual tax saving
    a_rate = 0.30 if a_gross > 1000000 else (0.20 if a_gross > 500000 else 0.05)
    b_rate = 0.30 if b_gross > 1000000 else (0.20 if b_gross > 500000 else 0.05)

    a_saving = round(hra_a * a_rate)
    b_saving = round(hra_b * b_rate)

    if a_saving >= b_saving:
        winner = partner_a.get("name", "Partner A")
        delta = a_saving - b_saving
    else:
        winner = partner_b.get("name", "Partner B")
        delta = b_saving - a_saving

    return {
        "winner": winner,
        "partner_a_hra_exemption": hra_a,
        "partner_b_hra_exemption": hra_b,
        "partner_a_tax_saving": a_saving,
        "partner_b_tax_saving": b_saving,
        "annual_saving_delta": delta,
        "explanation": (
            f"{winner} should claim HRA — saves ₹{delta:,} more annually "
            f"due to higher tax slab."
        ),
    }
