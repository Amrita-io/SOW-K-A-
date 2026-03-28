"""
CoupleWealth — scipy LP Optimizer for Joint SIP/NPS/ELSS Allocation
Minimizes combined tax liability across both partners.
"""

from scipy.optimize import linprog
from core.config import SECTION_80C_LIMIT, SECTION_80CCD_1B_LIMIT


def optimize_joint_allocation(
    partner_a: dict,
    partner_b: dict,
    monthly_budget: float,
) -> dict:
    """
    Use linear programming to optimally allocate SIP/ELSS/NPS between partners
    to minimize combined tax outflow.

    Decision variables (6):
        x0 = sip_a     (monthly SIP for Partner A)
        x1 = sip_b     (monthly SIP for Partner B)
        x2 = elss_a    (annual ELSS for Partner A, part of 80C)
        x3 = elss_b    (annual ELSS for Partner B, part of 80C)
        x4 = nps_a     (annual NPS for Partner A, 80CCD(1B))
        x5 = nps_b     (annual NPS for Partner B, 80CCD(1B))

    Objective: maximize tax savings = maximize (rate_a * deductions_a + rate_b * deductions_b)
    Since linprog minimizes, we negate the coefficients.
    """
    annual_budget = monthly_budget * 12

    a_gross = partner_a.get("annual_ctc", 0)
    b_gross = partner_b.get("annual_ctc", 0)

    # Marginal tax rates
    a_rate = _marginal_rate(a_gross)
    b_rate = _marginal_rate(b_gross)

    # Existing deductions under 80C
    a_existing_80c = partner_a.get("existing_80c", 0)
    b_existing_80c = partner_b.get("existing_80c", 0)
    a_existing_nps = partner_a.get("nps_contribution", 0)
    b_existing_nps = partner_b.get("nps_contribution", 0)

    # Remaining 80C headroom
    a_80c_room = max(0, SECTION_80C_LIMIT - a_existing_80c)
    b_80c_room = max(0, SECTION_80C_LIMIT - b_existing_80c)

    # Remaining NPS headroom
    a_nps_room = max(0, SECTION_80CCD_1B_LIMIT - a_existing_nps)
    b_nps_room = max(0, SECTION_80CCD_1B_LIMIT - b_existing_nps)

    # Objective: minimize -1 * (tax_saving)
    # SIP itself doesn't save tax, but ELSS and NPS do
    # SIP allocation still matters for returns but tax-wise only ELSS/NPS count
    # c = [0 (sip_a), 0 (sip_b), -a_rate (elss_a), -b_rate (elss_b),
    #      -a_rate (nps_a), -b_rate (nps_b)]
    c = [0, 0, -a_rate, -b_rate, -a_rate, -b_rate]

    # Inequality constraints (A_ub @ x <= b_ub)
    A_ub = []
    b_ub = []

    # 1. Total annual allocation <= annual budget
    # sip_a*12 + sip_b*12 + elss_a + elss_b + nps_a + nps_b <= annual_budget
    A_ub.append([12, 12, 1, 1, 1, 1])
    b_ub.append(annual_budget)

    # 2. ELSS_a <= 80C remaining room for A
    A_ub.append([0, 0, 1, 0, 0, 0])
    b_ub.append(a_80c_room)

    # 3. ELSS_b <= 80C remaining room for B
    A_ub.append([0, 0, 0, 1, 0, 0])
    b_ub.append(b_80c_room)

    # 4. NPS_a <= NPS room for A
    A_ub.append([0, 0, 0, 0, 1, 0])
    b_ub.append(a_nps_room)

    # 5. NPS_b <= NPS room for B
    A_ub.append([0, 0, 0, 0, 0, 1])
    b_ub.append(b_nps_room)

    # Bounds: all non-negative
    bounds = [
        (0, None),  # sip_a
        (0, None),  # sip_b
        (0, a_80c_room),  # elss_a
        (0, b_80c_room),  # elss_b
        (0, a_nps_room),  # nps_a
        (0, b_nps_room),  # nps_b
    ]

    result = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")

    if result.success:
        x = result.x
        sip_a, sip_b = round(x[0]), round(x[1])
        elss_a, elss_b = round(x[2]), round(x[3])
        nps_a, nps_b = round(x[4]), round(x[5])

        tax_saving_a = round((elss_a * a_rate) + (nps_a * a_rate))
        tax_saving_b = round((elss_b * b_rate) + (nps_b * b_rate))
        total_tax_saving = tax_saving_a + tax_saving_b

        return {
            "success": True,
            "allocation": {
                "partner_a": {
                    "name": partner_a.get("name", "Partner A"),
                    "monthly_sip": sip_a,
                    "annual_elss": elss_a,
                    "annual_nps": nps_a,
                    "tax_saving": tax_saving_a,
                },
                "partner_b": {
                    "name": partner_b.get("name", "Partner B"),
                    "monthly_sip": sip_b,
                    "annual_elss": elss_b,
                    "annual_nps": nps_b,
                    "tax_saving": tax_saving_b,
                },
            },
            "total_tax_saving": total_tax_saving,
            "total_annual_allocation": round(
                sip_a * 12 + sip_b * 12 + elss_a + elss_b + nps_a + nps_b
            ),
            "recommendation": _generate_recommendation(
                partner_a, partner_b, elss_a, elss_b, nps_a, nps_b, a_rate, b_rate
            ),
        }
    else:
        return {
            "success": False,
            "error": "Optimization did not converge",
            "allocation": None,
            "total_tax_saving": 0,
            "recommendation": "Unable to optimize — please check input values.",
        }


def calculate_instrument_mix(
    remaining_80c: float,
    risk_profile: str = "moderate",
    liquidity_needs: str = "medium",
) -> dict:
    """
    Recommend 80C instrument mix based on risk profile and liquidity needs.
    ELSS: 3Y lock-in, market-linked
    PPF: 15Y lock-in, guaranteed ~7.1%
    NPS: till retirement, market-linked
    """
    if remaining_80c <= 0:
        return {"elss": 0, "ppf": 0, "epf": 0, "total": 0}

    if risk_profile == "aggressive":
        elss_pct = 0.70
        ppf_pct = 0.20
        epf_pct = 0.10
    elif risk_profile == "moderate":
        elss_pct = 0.50
        ppf_pct = 0.30
        epf_pct = 0.20
    else:  # conservative
        elss_pct = 0.20
        ppf_pct = 0.50
        epf_pct = 0.30

    # Adjust for liquidity — shift away from PPF toward ELSS
    if liquidity_needs == "high":
        elss_pct = min(0.80, elss_pct + 0.20)
        ppf_pct = max(0.10, ppf_pct - 0.20)

    return {
        "elss": round(remaining_80c * elss_pct),
        "ppf": round(remaining_80c * ppf_pct),
        "epf": round(remaining_80c * epf_pct),
        "total": remaining_80c,
        "rationale": (
            f"{'ELSS-heavy' if elss_pct > 0.5 else 'Balanced'} mix: "
            f"ELSS {elss_pct:.0%} (3Y lock-in, ~12% returns), "
            f"PPF {ppf_pct:.0%} (safe, 7.1%), "
            f"EPF {epf_pct:.0%} (employer + tax benefit)"
        ),
    }


def _marginal_rate(gross_income: float) -> float:
    """Determine marginal old-regime tax rate."""
    if gross_income > 1000000:
        return 0.30
    elif gross_income > 500000:
        return 0.20
    elif gross_income > 250000:
        return 0.05
    return 0.0


def _generate_recommendation(
    partner_a: dict,
    partner_b: dict,
    elss_a: float, elss_b: float,
    nps_a: float, nps_b: float,
    rate_a: float, rate_b: float,
) -> str:
    """Generate human-readable allocation recommendation."""
    parts = []
    name_a = partner_a.get("name", "Partner A")
    name_b = partner_b.get("name", "Partner B")

    if rate_a > rate_b:
        parts.append(
            f"{name_a} is in a higher tax slab ({rate_a:.0%}) — "
            f"allocating more ELSS/NPS to {name_a} saves more tax."
        )
    elif rate_b > rate_a:
        parts.append(
            f"{name_b} is in a higher tax slab ({rate_b:.0%}) — "
            f"allocating more ELSS/NPS to {name_b} saves more tax."
        )
    else:
        parts.append(
            f"Both partners are in the same tax slab ({rate_a:.0%}) — "
            f"allocation is balanced."
        )

    if elss_a > 0:
        parts.append(f"{name_a}: invest ₹{elss_a:,.0f} in ELSS this year.")
    if elss_b > 0:
        parts.append(f"{name_b}: invest ₹{elss_b:,.0f} in ELSS this year.")
    if nps_a > 0:
        parts.append(f"{name_a}: contribute ₹{nps_a:,.0f} to NPS for 80CCD(1B).")
    if nps_b > 0:
        parts.append(f"{name_b}: contribute ₹{nps_b:,.0f} to NPS for 80CCD(1B).")

    return " ".join(parts)
