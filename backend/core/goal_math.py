"""
CoupleWealth — Goal Mathematics Engine
FV/PMT calculations, FIRE projections, goal conflict detection.
Uses numpy-financial for precise calculations.
"""

import numpy_financial as npf
from datetime import datetime
from core.config import (
    INFLATION_RATES,
    RISK_PROFILE_RETURNS,
    MONTHLY_RETURN_RATES,
    FIRE_MULTIPLIER,
)


def calculate_future_value(
    present_cost: float,
    years: int,
    goal_type: str = "general",
) -> float:
    """
    Calculate inflation-adjusted future cost.
    FV = PV * (1 + inflation)^years
    """
    inflation = INFLATION_RATES.get(goal_type, INFLATION_RATES["general"])
    fv = present_cost * ((1 + inflation) ** years)
    return round(fv)


def calculate_required_sip(
    future_value: float,
    years: int,
    risk_profile: str = "moderate",
) -> float:
    """
    Calculate monthly SIP required to reach target corpus.
    PMT = FV * r / ((1+r)^n - 1)
    where r = monthly return rate, n = total months
    """
    if years <= 0 or future_value <= 0:
        return 0.0

    monthly_rate = MONTHLY_RETURN_RATES.get(
        risk_profile, MONTHLY_RETURN_RATES["moderate"]
    )
    n_months = years * 12

    # Using numpy-financial PMT (returns negative for outflow)
    # PMT expects rate, nper, pv, fv
    # We want to find PMT such that FV of annuity = future_value
    sip = -npf.pmt(monthly_rate, n_months, 0, future_value)
    return round(max(0, sip))


def calculate_fire_number(
    annual_retirement_expenses: float,
    inflation_rate: float = 0.06,
    years_to_retirement: int = 25,
) -> dict:
    """
    Calculate FIRE number = Annual expenses at retirement * 25 (4% rule).
    Adjusts expenses for inflation.
    """
    inflated_expenses = annual_retirement_expenses * (
        (1 + inflation_rate) ** years_to_retirement
    )
    fire_number = inflated_expenses * FIRE_MULTIPLIER

    return {
        "current_annual_expenses": annual_retirement_expenses,
        "inflated_annual_expenses": round(inflated_expenses),
        "fire_number": round(fire_number),
        "years_to_retirement": years_to_retirement,
        "withdrawal_rate": 0.04,
    }


def project_corpus(
    current_savings: float,
    monthly_sip: float,
    years: int,
    annual_return: float = 0.10,
) -> float:
    """
    Project future corpus from current savings + ongoing SIP.
    FV = current * (1+r)^n + SIP * [((1+r)^n - 1) / r]
    """
    if years <= 0:
        return current_savings

    monthly_rate = annual_return / 12
    n_months = years * 12

    # FV of lump sum
    fv_lump = current_savings * ((1 + monthly_rate) ** n_months)

    # FV of SIP annuity
    if monthly_rate > 0:
        fv_sip = monthly_sip * (((1 + monthly_rate) ** n_months - 1) / monthly_rate)
    else:
        fv_sip = monthly_sip * n_months

    return round(fv_lump + fv_sip)


def calculate_retirement_age(
    current_age: int,
    fire_number: float,
    current_savings: float,
    monthly_sip: float,
    annual_return: float = 0.10,
    max_age: int = 70,
) -> int:
    """
    Find the age at which projected corpus reaches FIRE number.
    """
    for age in range(current_age + 1, max_age + 1):
        years = age - current_age
        corpus = project_corpus(current_savings, monthly_sip, years, annual_return)
        if corpus >= fire_number:
            return age
    return max_age  # Not achievable before max_age


def plan_single_goal(
    name: str,
    present_cost: float,
    target_year: int,
    goal_type: str = "general",
    risk_profile: str = "moderate",
    current_sip_allocated: float = 0,
    current_year: int = None,
) -> dict:
    """
    Complete analysis for a single financial goal.
    """
    if current_year is None:
        current_year = datetime.now().year

    years = max(1, target_year - current_year)
    future_cost = calculate_future_value(present_cost, years, goal_type)
    required_sip = calculate_required_sip(future_cost, years, risk_profile)

    on_track = current_sip_allocated >= required_sip
    sip_gap = max(0, required_sip - current_sip_allocated)

    # Generate monthly milestones (quarterly for chart data)
    milestones = _generate_milestones(
        future_cost, years, risk_profile, current_sip_allocated
    )

    return {
        "name": name,
        "goal_type": goal_type,
        "target_year": target_year,
        "years_remaining": years,
        "present_cost": present_cost,
        "future_cost": future_cost,
        "inflation_rate": INFLATION_RATES.get(goal_type, INFLATION_RATES["general"]),
        "required_monthly_sip": required_sip,
        "current_sip_allocated": current_sip_allocated,
        "sip_gap": sip_gap,
        "on_track": on_track,
        "milestones": milestones,
    }


def plan_all_goals(
    goals: list,
    risk_profile: str = "moderate",
    investable_surplus: float = 0,
) -> dict:
    """
    Plan all goals and detect conflicts.
    """
    current_year = datetime.now().year
    planned = []
    total_sip_needed = 0

    for goal in goals:
        result = plan_single_goal(
            name=goal.get("name", "Goal"),
            present_cost=goal.get("present_cost", 0),
            target_year=goal.get("target_year", current_year + 10),
            goal_type=goal.get("goal_type", "general"),
            risk_profile=risk_profile,
            current_sip_allocated=goal.get("current_sip_allocated", 0),
            current_year=current_year,
        )
        planned.append(result)
        total_sip_needed += result["required_monthly_sip"]

    # Conflict detection
    has_conflict = total_sip_needed > investable_surplus > 0
    sip_shortfall = max(0, total_sip_needed - investable_surplus) if investable_surplus > 0 else 0

    # Priority ranking (shorter timeline = higher priority for funding)
    planned.sort(key=lambda g: g["years_remaining"])

    return {
        "goals": planned,
        "total_monthly_sip_needed": total_sip_needed,
        "investable_surplus": investable_surplus,
        "sip_shortfall": sip_shortfall,
        "has_conflict": has_conflict,
        "conflict_message": (
            f"Your goals need ₹{total_sip_needed:,}/month but you have "
            f"₹{investable_surplus:,}/month available. "
            f"Shortfall: ₹{sip_shortfall:,}/month. Consider prioritizing "
            f"or extending timelines."
        ) if has_conflict else None,
    }


def calculate_fire_projection(
    partner_a: dict,
    partner_b: dict,
    retirement_age_target: int = 55,
    monthly_retirement_expenses: float = 100000,
    current_corpus: float = 0,
    risk_profile: str = "moderate",
) -> dict:
    """
    Full FIRE analysis for the couple.
    """
    younger_age = min(partner_a.get("age", 30), partner_b.get("age", 30))
    years_to_retirement = max(1, retirement_age_target - younger_age)

    annual_expenses = monthly_retirement_expenses * 12
    fire_result = calculate_fire_number(
        annual_expenses, years_to_retirement=years_to_retirement
    )
    fire_number = fire_result["fire_number"]

    # Combined current SIP
    combined_sip = (
        partner_a.get("monthly_sip", 0) + partner_b.get("monthly_sip", 0)
    )
    annual_return = RISK_PROFILE_RETURNS.get(risk_profile, 0.10)

    # Projected corpus at target age
    projected = project_corpus(
        current_corpus, combined_sip, years_to_retirement, annual_return
    )

    # Current retirement age (when corpus hits FIRE number)
    current_ret_age = calculate_retirement_age(
        younger_age, fire_number, current_corpus, combined_sip, annual_return
    )

    # Optimized: if they increase SIP by 50%
    optimized_sip = round(combined_sip * 1.5)
    optimized_ret_age = calculate_retirement_age(
        younger_age, fire_number, current_corpus, optimized_sip, annual_return
    )

    # Generate trajectory data for charts
    trajectory_current = []
    trajectory_fire = []
    for year_offset in range(0, years_to_retirement + 5, 1):
        age = younger_age + year_offset
        corpus = project_corpus(
            current_corpus, combined_sip, year_offset, annual_return
        )
        trajectory_current.append({"age": age, "corpus": corpus})

        # FIRE target line (constant)
        trajectory_fire.append({"age": age, "corpus": fire_number})

    return {
        "fire_number": fire_number,
        "projected_corpus": projected,
        "on_track": projected >= fire_number,
        "gap": max(0, fire_number - projected),
        "current_retirement_age": current_ret_age,
        "optimized_retirement_age": optimized_ret_age,
        "target_retirement_age": retirement_age_target,
        "current_monthly_sip": combined_sip,
        "required_additional_sip": max(0, calculate_required_sip(
            max(0, fire_number - project_corpus(current_corpus, 0, years_to_retirement, annual_return)),
            years_to_retirement,
            risk_profile,
        ) - combined_sip),
        "trajectory_current": trajectory_current,
        "trajectory_fire": trajectory_fire,
    }


def _generate_milestones(
    target: float,
    years: int,
    risk_profile: str,
    monthly_sip: float,
) -> list:
    """Generate quarterly milestone data for goal progress charts."""
    annual_return = RISK_PROFILE_RETURNS.get(risk_profile, 0.10)
    monthly_rate = annual_return / 12
    milestones = []

    quarters = min(years * 4, 60)  # Cap at 60 quarters (15 years)
    for q in range(1, quarters + 1):
        months = q * 3
        if monthly_rate > 0:
            accumulated = monthly_sip * (
                ((1 + monthly_rate) ** months - 1) / monthly_rate
            )
        else:
            accumulated = monthly_sip * months

        milestones.append({
            "quarter": q,
            "months": months,
            "accumulated": round(accumulated),
            "target": target,
            "progress_pct": round(min(100, accumulated / target * 100), 1) if target > 0 else 0,
        })

    return milestones
