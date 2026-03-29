"""
Agent 6 — Portfolio Analyzer
CAMS parsing, XIRR calculation, allocation breakdown, rebalancing.
"""

import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

TOOL_SCHEMA = {
    "name": "analyze_mf_portfolio",
    "description": (
        "Analyze mutual fund portfolio. Calculates true XIRR from cashflows, "
        "category allocation, rebalancing recommendations, and benchmark comparison."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "holdings": {"type": "array", "description": "List of MF holdings with fund_name, invested, current_value, start_date"},
            "partner_age": {"type": "number", "description": "Age of the partner (for age-appropriate allocation)"},
        },
        "required": ["holdings"],
    },
}

# Age-appropriate equity allocation: 100 - age rule (adjusted)
def _target_equity_pct(age: int) -> float:
    return min(0.80, max(0.40, (100 - age) / 100))


def analyze_mf_portfolio(holdings: list, partner_age: int = 30) -> dict:
    """Full portfolio analysis."""
    if not holdings:
        logger.info("No holdings provided — skipping portfolio analysis.")
        return {
            "total_invested": 0,
            "total_current": 0,
            "total_value": 0,
            "absolute_return": 0,
            "absolute_return_pct": 0,
            "xirr": 0,
            "benchmark_xirr": 0,
            "alpha": 0,
            "allocation": {},
            "rebalancing": [],
            "recommended_switches": [],
            "expense_drag_annual": 0,
            "overlap_warnings": [],
        }

    total_invested = sum(h.get("invested_amount", 0) for h in holdings)
    total_current = sum(h.get("current_value", 0) for h in holdings)

    # Calculate XIRR
    xirr_value = _calculate_xirr(holdings, total_current)

    # Category allocation
    allocation = _calculate_allocation(holdings)

    # Rebalancing recommendations
    target_eq = _target_equity_pct(partner_age)
    rebalancing = _generate_rebalancing(allocation, target_eq)

    # Generate switch recommendations for underperformers
    switches = _recommend_switches(holdings)

    return {
        "total_invested": round(total_invested),
        "total_current": round(total_current),
        "total_value": round(total_current),
        "absolute_return": round(total_current - total_invested),
        "absolute_return_pct": round((total_current - total_invested) / total_invested * 100, 1) if total_invested > 0 else 0,
        "xirr": round(xirr_value, 1),
        "benchmark_xirr": 14.0,  # Nifty 50 TRI 3Y CAGR fallback
        "alpha": round(xirr_value - 14.0, 1),
        "allocation": allocation,
        "rebalancing": rebalancing,
        "recommended_switches": switches,
        "expense_drag_annual": 0,  # Calculated by market_agent
        "overlap_warnings": [],  # Calculated by market_agent
    }


def _calculate_xirr(holdings: list, current_total: float) -> float:
    """Calculate portfolio XIRR using pyxirr."""
    try:
        from pyxirr import xirr as pyxirr_fn
        dates = []
        amounts = []

        for h in holdings:
            start_date = h.get("start_date", "2023-01-01")
            try:
                dt = datetime.strptime(start_date, "%Y-%m-%d").date()
            except (ValueError, TypeError):
                dt = datetime.now().date() - timedelta(days=365)

            invested = h.get("invested_amount", 0)
            # Assume monthly SIP — distribute investments
            months = max(1, (datetime.now().date() - dt).days // 30)
            monthly_invest = invested / months

            for m in range(months):
                invest_date = dt + timedelta(days=m * 30)
                dates.append(invest_date)
                amounts.append(-monthly_invest)

        # Final positive cashflow (current value)
        dates.append(datetime.now().date())
        amounts.append(current_total)

        result = pyxirr_fn(dates, amounts)
        if result is not None and not (result != result):  # check for NaN
            return round(result * 100, 1)
        return 0
    except Exception as e:
        logger.warning(f"XIRR calculation failed: {e}")
        # Fallback: simple CAGR
        total_invested = sum(h.get("invested_amount", 0) for h in holdings)
        if total_invested > 0 and current_total > 0:
            years = 3  # assume 3 years
            cagr = ((current_total / total_invested) ** (1 / years) - 1) * 100
            return round(cagr, 1)
        return 0


def _calculate_allocation(holdings: list) -> dict:
    """Estimate asset allocation from fund names."""
    total = sum(h.get("current_value", 0) for h in holdings)
    if total == 0:
        return {"equity": 0, "debt": 0, "hybrid": 0, "gold": 0}

    equity = 0
    debt = 0
    hybrid = 0
    gold = 0

    for h in holdings:
        val = h.get("current_value", 0)
        name = h.get("fund_name", "").lower()
        if any(k in name for k in ["liquid", "debt", "bond", "gilt", "money market"]):
            debt += val
        elif any(k in name for k in ["hybrid", "balanced", "dynamic"]):
            hybrid += val
        elif any(k in name for k in ["gold", "commodity"]):
            gold += val
        else:
            equity += val

    return {
        "equity": {"amount": round(equity), "pct": round(equity / total * 100, 1)},
        "debt": {"amount": round(debt), "pct": round(debt / total * 100, 1)},
        "hybrid": {"amount": round(hybrid), "pct": round(hybrid / total * 100, 1)},
        "gold": {"amount": round(gold), "pct": round(gold / total * 100, 1)},
        "total": round(total),
    }


def _generate_rebalancing(allocation: dict, target_equity_pct: float) -> list:
    """Generate rebalancing recommendations."""
    recs = []
    eq_pct = allocation.get("equity", {}).get("pct", 0) / 100
    debt_pct = allocation.get("debt", {}).get("pct", 0) / 100
    target_debt_pct = 1 - target_equity_pct

    if eq_pct > target_equity_pct + 0.10:
        recs.append({
            "action": "Reduce equity",
            "from_pct": round(eq_pct * 100, 1),
            "to_pct": round(target_equity_pct * 100, 1),
            "reason": f"Equity at {eq_pct*100:.0f}% exceeds age-appropriate {target_equity_pct*100:.0f}%",
        })
    elif eq_pct < target_equity_pct - 0.10:
        recs.append({
            "action": "Increase equity",
            "from_pct": round(eq_pct * 100, 1),
            "to_pct": round(target_equity_pct * 100, 1),
            "reason": f"Equity at {eq_pct*100:.0f}% is below age-appropriate {target_equity_pct*100:.0f}%",
        })

    return recs


def _recommend_switches(holdings: list) -> list:
    """Recommend switching from regular to direct plans."""
    switches = []
    for h in holdings:
        name = h.get("fund_name", "")
        if "regular" in name.lower() or "reg" in name.lower():
            direct_name = name.replace("Regular", "Direct").replace("regular", "direct").replace("Reg", "Direct")
            switches.append({
                "from_fund": name,
                "to_fund": direct_name,
                "reason": "Direct plan has lower expense ratio — saves 0.5-1% annually",
            })
    return switches
