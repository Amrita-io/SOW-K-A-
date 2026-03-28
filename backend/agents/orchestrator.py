"""
CoupleWealth — Gemini Orchestrator
Custom agentic loop using google-generativeai SDK with function calling.
Falls back to math-only results if Gemini API is unavailable.
"""

import json
import os
import logging
from typing import Optional

from agents.tax_agent import analyze_tax_optimization, TOOL_SCHEMA as TAX_SCHEMA
from agents.investment_agent import optimize_investments, TOOL_SCHEMA as INVEST_SCHEMA
from agents.insurance_agent import audit_insurance, TOOL_SCHEMA as INSURANCE_SCHEMA
from agents.goal_agent import plan_financial_goals, TOOL_SCHEMA as GOAL_SCHEMA
from agents.market_agent import analyze_market_signals, TOOL_SCHEMA as MARKET_SCHEMA
from agents.portfolio_agent import analyze_mf_portfolio, TOOL_SCHEMA as PORTFOLIO_SCHEMA
from agents.health_agent import calculate_health_score, TOOL_SCHEMA as HEALTH_SCHEMA

logger = logging.getLogger(__name__)

TOOL_REGISTRY = {
    "analyze_tax_optimization": analyze_tax_optimization,
    "optimize_investments": optimize_investments,
    "audit_insurance": audit_insurance,
    "plan_financial_goals": plan_financial_goals,
    "analyze_market_signals": analyze_market_signals,
    "analyze_mf_portfolio": analyze_mf_portfolio,
    "calculate_health_score": calculate_health_score,
}

ORCHESTRATOR_SYSTEM_PROMPT = """
You are CoupleWealth's master financial intelligence orchestrator for Indian 
married couples. You have 7 specialized financial analysis tools available.

RULES:
1. Call ALL 7 tools — never skip any. Every tool contributes to the headline saving number.
2. Pass the full partner data to each tool as needed.
3. After all tools complete, synthesize results into ONE unified JSON response.
4. The headline_saving field = sum of all individual savings identified.
5. Sort priority_actions by annual_rupee_impact descending.
6. Speak in warm, jargon-free English. Use partner names, not "Partner A/B".
7. ALWAYS return valid JSON only. No markdown. No preamble. No backticks.

RESPONSE SCHEMA (return exactly this structure):
{
  "headline_saving": int,
  "headline_breakdown": {
    "tax_saving": int,
    "investment_gain": int,
    "insurance_saving": int,
    "market_alpha_recovery": int
  },
  "partner_a": {
    "name": str,
    "recommended_regime": "old" or "new",
    "current_tax": int,
    "optimized_tax": int,
    "tax_saving": int,
    "hra_exemption_available": int
  },
  "partner_b": { same structure },
  "hra_winner": str,
  "hra_annual_saving": int,
  "health_score": {
    "total": int,
    "grade": str,
    "dimensions": [{"name": str, "score": int, "max": int, "tip": str}],
    "projected_score": int
  },
  "priority_actions": [
    {
      "rank": int,
      "title": str,
      "detail": str,
      "annual_saving": int,
      "effort": "Low" or "Medium" or "High",
      "timeframe": "This month" or "This quarter" or "This year"
    }
  ],
  "regime_explanation": str,
  "hra_explanation": str,
  "goal_plans": [
    {
      "name": str,
      "target_year": int,
      "present_cost": int,
      "future_cost": int,
      "required_monthly_sip": int,
      "current_sip_allocated": int,
      "on_track": bool
    }
  ],
  "retirement": {
    "fire_number": int,
    "projected_corpus": int,
    "current_retirement_age": int,
    "optimized_retirement_age": int
  },
  "insurance": {
    "partner_a": {"required_term": int, "existing_term": int, "gap": int},
    "partner_b": {"required_term": int, "existing_term": int, "gap": int},
    "health_cover_gap": int,
    "annual_80d_saving_available": int
  },
  "market_signals": [
    {"type": str, "description": str, "annual_impact": int}
  ],
  "portfolio": {
    "total_value": int,
    "xirr": float,
    "benchmark_xirr": float,
    "expense_drag_annual": int,
    "overlap_warnings": [str],
    "recommended_switches": [{"from": str, "to": str, "reason": str}]
  },
  "what_if_scenarios": [
    {"scenario": str, "impact": str, "annual_saving": int}
  ],
  "encouragement": str
}
"""


def _build_tool_declarations():
    """Build Gemini-compatible tool declarations."""
    try:
        import google.generativeai as genai
        tools = []
        schemas = [TAX_SCHEMA, INVEST_SCHEMA, INSURANCE_SCHEMA,
                    GOAL_SCHEMA, MARKET_SCHEMA, PORTFOLIO_SCHEMA, HEALTH_SCHEMA]
        for schema in schemas:
            tools.append(genai.protos.Tool(
                function_declarations=[
                    genai.protos.FunctionDeclaration(
                        name=schema["name"],
                        description=schema["description"],
                        parameters=genai.protos.Schema(
                            type=genai.protos.Type.OBJECT,
                            properties={
                                k: genai.protos.Schema(type=genai.protos.Type.OBJECT)
                                for k in schema["parameters"].get("properties", {})
                            },
                        ),
                    )
                ]
            ))
        return tools
    except Exception as e:
        logger.warning(f"Failed to build tool declarations: {e}")
        return []


def run_orchestrator(
    partner_a: dict, partner_b: dict,
    goals: list, holdings: list = None,
    risk_profile: str = "moderate",
    monthly_expenses: float = 0,
    emergency_fund_existing: float = 0,
) -> dict:
    """
    Main orchestrator — tries Gemini AI first, falls back to math-only.
    """
    # Always run math engines first (guaranteed results)
    math_results = _run_math_only(
        partner_a, partner_b, goals, holdings or [],
        risk_profile, monthly_expenses, emergency_fund_existing
    )

    # Try Gemini AI enhancement
    gemini_api_key = os.environ.get("GEMINI_API_KEY", "")
    if gemini_api_key and gemini_api_key != "your_gemini_api_key_here":
        try:
            ai_result = _run_gemini_orchestration(
                partner_a, partner_b, goals, holdings or [],
                risk_profile, monthly_expenses, emergency_fund_existing,
                math_results
            )
            if ai_result:
                # Merge AI narrative with math results (math numbers take priority)
                return _merge_results(math_results, ai_result)
        except Exception as e:
            logger.warning(f"Gemini orchestration failed: {e}")
            math_results["ai_narrative_available"] = False

    math_results["ai_narrative_available"] = False
    return math_results


def _run_gemini_orchestration(
    partner_a, partner_b, goals, holdings,
    risk_profile, monthly_expenses, emergency_fund_existing,
    math_results
) -> Optional[dict]:
    """Run Gemini AI orchestration for narrative enhancement."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])

        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=ORCHESTRATOR_SYSTEM_PROMPT,
        )

        user_message = f"""
        Analyze this Indian couple's financial data and return the complete JSON response.
        Use the pre-computed math results below as the authoritative numbers.
        Add narrative explanations, priority actions, what-if scenarios, and encouragement.

        Partner A: {json.dumps(partner_a)}
        Partner B: {json.dumps(partner_b)}
        Goals: {json.dumps(goals)}
        Risk Profile: {risk_profile}
        Monthly Expenses: {monthly_expenses}

        PRE-COMPUTED MATH RESULTS (use these exact numbers):
        {json.dumps(math_results, default=str)}

        Return ONLY valid JSON matching the response schema. No markdown, no backticks.
        """

        response = model.generate_content(user_message)
        raw = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except Exception as e:
        logger.warning(f"Gemini call failed: {e}")
        return None


def _run_math_only(
    partner_a, partner_b, goals, holdings,
    risk_profile, monthly_expenses, emergency_fund_existing
) -> dict:
    """Run all 7 agents with pure math — no AI required."""

    # Agent 1: Tax optimization
    tax_result = analyze_tax_optimization(partner_a, partner_b)

    # Agent 2: Investment optimization
    combined_sip = partner_a.get("monthly_sip", 0) + partner_b.get("monthly_sip", 0)
    invest_result = optimize_investments(
        partner_a, partner_b,
        monthly_budget=combined_sip,
        risk_profile=risk_profile,
    )

    # Agent 3: Insurance audit
    insurance_result = audit_insurance(partner_a, partner_b)

    # Agent 4: Goal planning
    goal_result = plan_financial_goals(
        partner_a, partner_b, goals,
        risk_profile=risk_profile,
        monthly_expenses=monthly_expenses,
        emergency_fund_existing=emergency_fund_existing,
    )

    # Agent 5: Market intelligence
    market_result = analyze_market_signals(holdings, risk_profile)

    # Agent 6: Portfolio analysis
    avg_age = (partner_a.get("age", 30) + partner_b.get("age", 30)) // 2
    portfolio_result = analyze_mf_portfolio(holdings, avg_age)

    # Agent 7: Health score
    health_result = calculate_health_score(
        partner_a=partner_a, partner_b=partner_b,
        tax_result=tax_result, insurance_result=insurance_result,
        goal_result=goal_result, portfolio_result=portfolio_result,
        monthly_expenses=monthly_expenses,
        emergency_fund=emergency_fund_existing,
    )

    # Compute headline saving
    tax_saving = tax_result.get("total_tax_saving", 0)
    investment_gain = invest_result.get("total_tax_saving", 0)
    insurance_saving = insurance_result.get("summary", {}).get("total_insurance_saving", 0)
    market_alpha = market_result.get("total_market_alpha_recovery", 0)
    headline_saving = tax_saving + investment_gain + insurance_saving + market_alpha

    # Build priority actions from math results
    actions = _build_priority_actions(tax_result, invest_result, insurance_result, goal_result, market_result)

    # Build what-if scenarios
    what_ifs = _build_what_if_scenarios(partner_a, partner_b, tax_result, invest_result)

    # Build goal plans
    goal_plans = []
    for g in goal_result.get("goals", []):
        goal_plans.append({
            "name": g["name"],
            "target_year": g["target_year"],
            "present_cost": int(g["present_cost"]),
            "future_cost": int(g["future_cost"]),
            "required_monthly_sip": int(g["required_monthly_sip"]),
            "current_sip_allocated": int(g.get("current_sip_allocated", 0)),
            "on_track": g.get("on_track", False),
        })

    # Build retirement
    ret = goal_result.get("retirement", {})
    retirement = {
        "fire_number": int(ret.get("fire_number", 0)),
        "projected_corpus": int(ret.get("projected_corpus", 0)),
        "current_retirement_age": ret.get("current_retirement_age", 65),
        "optimized_retirement_age": ret.get("optimized_retirement_age", 60),
    }

    # Build insurance summary
    a_ins = insurance_result.get("partner_a", {}).get("term_insurance", {})
    b_ins = insurance_result.get("partner_b", {}).get("term_insurance", {})
    insurance = {
        "partner_a": {
            "required_term": int(a_ins.get("required_cover", 0)),
            "existing_term": int(a_ins.get("existing_cover", 0)),
            "gap": int(a_ins.get("gap", 0)),
        },
        "partner_b": {
            "required_term": int(b_ins.get("required_cover", 0)),
            "existing_term": int(b_ins.get("existing_cover", 0)),
            "gap": int(b_ins.get("gap", 0)),
        },
        "health_cover_gap": int(insurance_result.get("summary", {}).get("total_health_gap", 0)),
        "annual_80d_saving_available": int(insurance_result.get("summary", {}).get("combined_80d_saving_available", 0)),
    }

    # Build portfolio
    portfolio = {
        "total_value": int(portfolio_result.get("total_value", 0)),
        "xirr": portfolio_result.get("xirr", 0),
        "benchmark_xirr": portfolio_result.get("benchmark_xirr", 14.0),
        "expense_drag_annual": int(market_result.get("total_expense_drag", 0)),
        "overlap_warnings": [w.get("description", "") for w in market_result.get("overlap_warnings", [])],
        "recommended_switches": portfolio_result.get("recommended_switches", []),
    }

    hra_arb = tax_result.get("hra_arbitrage", {})

    return {
        "headline_saving": int(headline_saving),
        "headline_breakdown": {
            "tax_saving": int(tax_saving),
            "investment_gain": int(investment_gain),
            "insurance_saving": int(insurance_saving),
            "market_alpha_recovery": int(market_alpha),
        },
        "partner_a": {
            "name": tax_result["partner_a"]["name"],
            "recommended_regime": tax_result["partner_a"]["recommended_regime"],
            "current_tax": int(tax_result["partner_a"]["current_tax"]),
            "optimized_tax": int(tax_result["partner_a"]["optimized_tax"]),
            "tax_saving": int(tax_result["partner_a"]["tax_saving"]),
            "hra_exemption_available": int(tax_result["partner_a"].get("hra_exemption", 0)),
        },
        "partner_b": {
            "name": tax_result["partner_b"]["name"],
            "recommended_regime": tax_result["partner_b"]["recommended_regime"],
            "current_tax": int(tax_result["partner_b"]["current_tax"]),
            "optimized_tax": int(tax_result["partner_b"]["optimized_tax"]),
            "tax_saving": int(tax_result["partner_b"]["tax_saving"]),
            "hra_exemption_available": int(tax_result["partner_b"].get("hra_exemption", 0)),
        },
        "hra_winner": hra_arb.get("winner", ""),
        "hra_annual_saving": int(hra_arb.get("annual_saving_delta", 0)),
        "health_score": {
            "total": health_result["total"],
            "grade": health_result["grade"],
            "dimensions": health_result["dimensions"],
            "projected_score": health_result["projected_score"],
        },
        "priority_actions": actions,
        "regime_explanation": f"{tax_result['partner_a']['name']}: {tax_result['partner_a']['recommended_regime']} regime saves more. {tax_result['partner_b']['name']}: {tax_result['partner_b']['recommended_regime']} regime saves more.",
        "hra_explanation": hra_arb.get("explanation", ""),
        "goal_plans": goal_plans,
        "retirement": retirement,
        "insurance": insurance,
        "market_signals": market_result.get("opportunity_alerts", []),
        "portfolio": portfolio,
        "what_if_scenarios": what_ifs,
        "encouragement": f"Great start, {partner_a.get('name', '')} and {partner_b.get('name', '')}! By implementing these changes, you can recover a significant amount every year.",
        "ai_narrative_available": True,
        "_agent_results": {
            "tax": tax_result,
            "investment": invest_result,
            "insurance": insurance_result,
            "goals": goal_result,
            "market": market_result,
            "portfolio": portfolio_result,
            "health": health_result,
        },
    }


def _build_priority_actions(tax_result, invest_result, insurance_result, goal_result, market_result):
    """Build ranked priority action list from all agent results."""
    actions = []
    rank = 0

    # Tax actions
    for partner_key in ["partner_a", "partner_b"]:
        p = tax_result.get(partner_key, {})
        if p.get("tax_saving", 0) > 0:
            rank += 1
            actions.append({
                "rank": rank,
                "title": f"Switch {p['name']} to {p['recommended_regime']} regime",
                "detail": f"Switching to the {p['recommended_regime']} tax regime saves ₹{p['tax_saving']:,} annually.",
                "annual_saving": p["tax_saving"],
                "effort": "Low",
                "timeframe": "This month",
            })
        for missed in p.get("missed_deductions", []):
            if missed["potential_saving"] > 0:
                rank += 1
                actions.append({
                    "rank": rank,
                    "title": f"{p['name']}: Use Section {missed['section']} fully",
                    "detail": f"₹{missed['gap']:,} gap in {missed['section']}. Invest in {', '.join(missed.get('instruments', [])[:2])}.",
                    "annual_saving": missed["potential_saving"],
                    "effort": "Low",
                    "timeframe": "This quarter",
                })

    # HRA action
    hra = tax_result.get("hra_arbitrage", {})
    if hra.get("annual_saving_delta", 0) > 0:
        rank += 1
        actions.append({
            "rank": rank,
            "title": f"HRA: {hra['winner']} should claim rent",
            "detail": hra.get("explanation", ""),
            "annual_saving": hra["annual_saving_delta"],
            "effort": "Low",
            "timeframe": "This month",
        })

    # Insurance actions
    for partner_key in ["partner_a", "partner_b"]:
        p_ins = insurance_result.get(partner_key, {})
        name = p_ins.get("name", partner_key)
        if p_ins.get("term_insurance", {}).get("gap", 0) > 0:
            gap = p_ins["term_insurance"]["gap"]
            premium = p_ins["term_insurance"].get("estimated_monthly_premium", 0)
            rank += 1
            actions.append({
                "rank": rank,
                "title": f"{name}: Get ₹{gap//100000}L term cover",
                "detail": f"Current cover is insufficient by ₹{gap:,}. Estimated premium: ₹{premium:,}/month.",
                "annual_saving": 0,
                "effort": "Medium",
                "timeframe": "This month",
            })

    # 80D action
    d80_saving = insurance_result.get("summary", {}).get("combined_80d_saving_available", 0)
    if d80_saving > 0:
        rank += 1
        actions.append({
            "rank": rank,
            "title": "Maximize 80D health insurance deduction",
            "detail": f"₹{d80_saving:,} additional tax saving available through health insurance premiums.",
            "annual_saving": d80_saving,
            "effort": "Low",
            "timeframe": "This quarter",
        })

    # Investment action
    inv_saving = invest_result.get("total_tax_saving", 0)
    if inv_saving > 0:
        rank += 1
        actions.append({
            "rank": rank,
            "title": "Optimize SIP allocation between partners",
            "detail": invest_result.get("recommendation", "Allocate more to higher-slab partner."),
            "annual_saving": inv_saving,
            "effort": "Low",
            "timeframe": "This month",
        })

    # Market alerts
    for alert in market_result.get("opportunity_alerts", [])[:3]:
        if alert.get("annual_impact", 0) > 0:
            rank += 1
            actions.append({
                "rank": rank,
                "title": alert.get("description", "")[:60],
                "detail": alert.get("description", ""),
                "annual_saving": alert["annual_impact"],
                "effort": "Medium",
                "timeframe": "This quarter",
            })

    # Sort by annual saving descending; re-rank
    actions.sort(key=lambda a: a["annual_saving"], reverse=True)
    for i, action in enumerate(actions):
        action["rank"] = i + 1

    return actions


def _build_what_if_scenarios(partner_a, partner_b, tax_result, invest_result):
    """Build what-if scenarios for the simulator."""
    from core.tax_engine import calculate_old_regime_tax, calculate_new_regime_tax

    scenarios = []
    name_a = partner_a.get("name", "Partner A")
    name_b = partner_b.get("name", "Partner B")

    # Scenario 1: Max out 80C for both
    a_gap_80c = 0
    b_gap_80c = 0
    for m in tax_result.get("partner_a", {}).get("missed_deductions", []):
        if m["section"] == "80C":
            a_gap_80c = m["gap"]
    for m in tax_result.get("partner_b", {}).get("missed_deductions", []):
        if m["section"] == "80C":
            b_gap_80c = m["gap"]
    total_80c_saving = round(a_gap_80c * 0.30 + b_gap_80c * 0.20)
    if total_80c_saving > 0:
        scenarios.append({
            "scenario": f"Max out 80C for both {name_a} and {name_b}",
            "impact": f"Invest ₹{a_gap_80c + b_gap_80c:,} more in ELSS/PPF",
            "annual_saving": total_80c_saving,
        })

    # Scenario 2: Both contribute ₹50K to NPS
    nps_a = partner_a.get("nps_contribution", 0)
    nps_b = partner_b.get("nps_contribution", 0)
    nps_gap = (50000 - nps_a) + (50000 - nps_b)
    nps_saving = round((50000 - nps_a) * 0.30 + (50000 - nps_b) * 0.20)
    if nps_saving > 0:
        scenarios.append({
            "scenario": "Both contribute max ₹50,000 to NPS",
            "impact": f"Additional ₹{nps_gap:,} in NPS contributions",
            "annual_saving": nps_saving,
        })

    # Scenario 3: Increase SIP by ₹10,000
    scenarios.append({
        "scenario": "Increase combined SIP by ₹10,000/month",
        "impact": "Accelerates all goals and reduces retirement age by 2-3 years",
        "annual_saving": 0,
    })

    return scenarios


def _merge_results(math_results: dict, ai_results: dict) -> dict:
    """Merge AI narrative with math results. Math numbers always win."""
    merged = math_results.copy()

    # Take narratives from AI
    if ai_results.get("encouragement"):
        merged["encouragement"] = ai_results["encouragement"]
    if ai_results.get("regime_explanation"):
        merged["regime_explanation"] = ai_results["regime_explanation"]
    if ai_results.get("hra_explanation"):
        merged["hra_explanation"] = ai_results["hra_explanation"]

    # If AI generated better priority actions (with narratives), use those
    # but keep the math-computed savings numbers
    if ai_results.get("priority_actions"):
        for ai_action in ai_results["priority_actions"]:
            for math_action in merged["priority_actions"]:
                if ai_action.get("rank") == math_action.get("rank"):
                    math_action["detail"] = ai_action.get("detail", math_action["detail"])
                    break

    if ai_results.get("what_if_scenarios"):
        merged["what_if_scenarios"] = ai_results["what_if_scenarios"]

    merged["ai_narrative_available"] = True
    return merged
