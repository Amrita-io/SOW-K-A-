"""
SOW — Hybrid Agentic Orchestrator (Local Math + AI Synthesis)
To minimize API usage and avoid 429 Quota errors, this orchestrator:
1. Executes all financial agents locally in Python.
2. Collects all deterministic data.
3. Uses Gemini for a SINGLE-turn synthesis to provide the premium narrative.
"""

import json
import os
import logging
from typing import Optional,List,Dict, Any

# Local Agents
from agents.tax_agent import analyze_tax_optimization
from agents.investment_agent import optimize_investments
from agents.insurance_agent import audit_insurance
from agents.goal_agent import plan_financial_goals
from agents.market_agent import analyze_market_signals
from agents.portfolio_agent import analyze_mf_portfolio
from agents.health_agent import calculate_health_score

# Fallback Engine
from agents.orchestrator_fallback import run_math_fallback

logger = logging.getLogger(__name__)

SYNTHESIS_PROMPT = """
You are the Master Financial Intelligence Strategist for SOW (Strategy Optimization Workspace), India's premier joint wealth optimization platform.
You have been provided with detailed results from 7 specialized financial agents for a couple.

YOUR TASK:
1. Synthesize these separate data points into a cohesive, high-IQ, and empathetic "Couple's Story".
2. NO GENERIC ADVICE. Use actual numbers (₹ values, percentages) from the provided data to explain your points.
3. Highlight the "Wealth Leakage" (Tax, Market Drag, Under-Insurance) with specific amounts.
4. Generate a list of "Priority Actions" (3-5 actions) each with a rank, title, detail, annual_saving, effort, and timeframe.
5. Create a "Regime Explanation" that compares Old vs New regime for BOTH partners and explicitly recommends the winning combination.
6. Create 3-5 "What-If Scenarios" tailored to this couple. Each must have:
   - "scenario": A clear title (e.g., "If you increase SIP by ₹20k")
   - "impact": A detailed narrative result (e.g., "This would add ₹1.2 Cr to your retirement corpus in 15 years")
   - "annual_saving": The hard financial gain or tax saving identified from this move.
7. Provide a SINGLE JSON response matching the structure below.

CRITICAL JSON RULES:
- "annual_saving" MUST be a plain integer. DO NOT use commas (e.g., use 50000, NOT 50,000).
- Ensure all keys and string values are enclosed in double quotes.
- No trailing commas.

FINAL RESPONSE JSON SCHEMA (USE ONLY THIS FORMAT):
{
  "ai_agentic_loop": true,
  "status": "Success",
  "priority_actions": [
    { "rank": 1, "title": "Priority Action Title", "detail": "Action Detail", "annual_saving": 50000, "effort": "Low", "timeframe": "Instant" }
  ],
  "regime_explanation": "...",
  "hra_explanation": "...",
  "encouragement": "...",
  "what_if_scenarios": [
    { "scenario": "Saving 10k more monthly", "impact": "Goal met 2 years early", "annual_saving": 12000 }
  ]
}

AVOID COMMON MISTAKES:
- DO NOT use unquoted keys.
- DO NOT put commas in numbers (e.g. 50,000 is WRONG, 50000 is CORRECT).
- DO NOT add preamble text like 'Here is the JSON...'.
- DO NOT use single quotes for strings.
"""

def _clean_json(raw: str) -> str:
    """Robustly extracts JSON from LLM output by finding outer braces."""
    import re
    try:
        # 1. Find the outer boundary (the most likely valid object)
        start = raw.find('{')
        end = raw.rfind('}')
        if start == -1 or end == -1: return raw
        raw = raw[start:end+1]
        
        # 2. Add quotes to unquoted keys: { key: "val" } -> { "key": "val" }
        # Regex: find a sequence of word characters preceded by punctuation or space
        # and followed by a colon. 
        # (This avoids replacing values that might look like names but aren't because of the colon)
        def quote_key(match):
            return f'"{match.group(1)}":'
        # Match word bounds + name + possible space + colon
        raw = re.sub(r'(\b[a-zA-Z_][a-zA-Z0-9_]*\b)\s*:', quote_key, raw)

        # 3. Final polish for JSON validity
        # Remove trailing commas
        raw = re.sub(r',\s*\}', '}', raw)
        raw = re.sub(r',\s*\]', ']', raw)
        # Fix numbers with commas
        raw = re.sub(r'(:\s*\d+),(\d+)', r'\1\2', raw)
        # Handle single quotes (approximate)
        raw = re.sub(r":\s*'([^']*)'", r': "\1"', raw)
        
        return raw.strip()
    except:
        return raw

def _map_insurance_for_ui(agent_res: dict) -> dict:
    """Correct terminology mismatch between backend and UI."""
    return {
        "required_term": agent_res["required_cover"],
        "existing_term": agent_res["existing_cover"],
        "gap": agent_res["gap"]
    }

def _call_ollama(prompt: str) -> tuple[Optional[dict], Optional[str]]:
    """Helper to call local Ollama instance for premium synthesis. Returns (result, error_msg)."""
    import requests
    err_info = None
    try:
        url = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate")
        model = os.environ.get("OLLAMA_MODEL", "mistral")
        
        logger.info(f"Ollama synthesis: contacting {url} with model {model}")
        
        payload = {
            "model": model, 
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {"temperature": 0.4, "num_ctx": 4096}
        }
        response = requests.post(url, json=payload, timeout=90)
        
        if response.status_code == 200:
            res_json = response.json()
            raw_response = res_json.get("response", "").strip()
            if raw_response:
                cleaned = _clean_json(raw_response)
                return json.loads(cleaned), None
        else:
            err_info = f"Ollama HTTP {response.status_code}: {response.text[:100]}"
    except Exception as e:
        err_info = f"Exception: {str(e)}"
    
    logger.warning(f"Ollama synthesis failed: {err_info}")
    return None, err_info

def run_orchestrator(
    partner_a: dict, partner_b: dict,
    goals: list, holdings: list = None,
    risk_profile: str = "moderate",
    monthly_expenses: float = 0,
    emergency_fund_existing: float = 0,
) -> dict:
    """
    SOW Strategy Orchestrator: Local Agents + Local AI Synthesis (Ollama).
    """
    try:
        # STEP 1: Execute all Agents Locally (Zero API Cost)
        logger.info("Running local-first analysis pass...")
        
        tax_res = analyze_tax_optimization(partner_a, partner_b)
        
        # Estimate investable budget
        total_income = partner_a.get("annual_ctc", 0) / 12 + partner_b.get("annual_ctc", 0) / 12
        investable_budget = max(0, total_income - monthly_expenses)
        
        invest_res = optimize_investments(partner_a, partner_b, investable_budget, risk_profile)
        insurance_res = audit_insurance(partner_a, partner_b)
        goals_res = plan_financial_goals(
            partner_a=partner_a, 
            partner_b=partner_b, 
            goals=goals, 
            risk_profile=risk_profile,
            monthly_expenses=monthly_expenses,
            emergency_fund_existing=emergency_fund_existing
        )
        market_res = analyze_market_signals(holdings or [], risk_profile)
        portfolio_res = analyze_mf_portfolio(holdings or [], partner_a.get("age", 30))
        
        health_res = calculate_health_score(
            partner_a=partner_a,
            partner_b=partner_b,
            tax_result=tax_res, 
            insurance_result=insurance_res, 
            goal_result=goals_res, 
            portfolio_result=portfolio_res,
            monthly_expenses=monthly_expenses, 
            emergency_fund=emergency_fund_existing
        )

        intermediate_data = {
            "tax_analysis": tax_res,
            "investment_strategy": invest_res,
            "insurance_audit": insurance_res,
            "goal_roadmap": goals_res,
            "market_intelligence": market_res,
            "portfolio_health": portfolio_res,
            "overall_health_score": health_res,
        }

        # Calculate Headline Metrics (Mapped to Frontend)
        total_tax_saving = tax_res.get("total_tax_saving", 0)
        insurance_saving = insurance_res.get("summary", {}).get("total_insurance_saving", 0)
        market_alpha = market_res.get("total_market_alpha_recovery", 0)
        investment_gain = invest_res.get("total_yield_gain", 0) # Assumes core.optimizer returns this
        
        headline_saving = total_tax_saving + investment_gain + insurance_saving + market_alpha

        # Base structure matching frontend
        final_result = {
            "ai_agentic_loop": True,
            "status": "Success",
            "partner_a": tax_res["partner_a"],
            "partner_b": tax_res["partner_b"],
            "headline_saving": headline_saving,
            "headline_breakdown": {
                "tax_saving": total_tax_saving,
                "investment_gain": investment_gain,
                "insurance_saving": insurance_saving,
                "market_alpha_recovery": market_alpha
            },
            "health_score": health_res,
            "goal_plans": goals_res["goals"],
            "retirement": goals_res["retirement"],
            "insurance": {
                "partner_a": _map_insurance_for_ui(insurance_res["partner_a"]["term_insurance"]),
                "partner_b": _map_insurance_for_ui(insurance_res["partner_b"]["term_insurance"]),
                "annual_80d_saving_available": insurance_res["summary"]["combined_80d_saving_available"]
            },
            "portfolio": {
                **portfolio_res,
                "fund_signals": market_res.get("fund_signals", []),
                "overlap_warnings": market_res.get("overlap_warnings", [])
            },
            "market_signals": market_res.get("opportunity_alerts", []),
            # Default placeholders for AI-generated narrative
            "priority_actions": _generate_math_actions(tax_res, insurance_res, market_res),
            "regime_explanation": "Optimizing based on your combined income structures.",
            "hra_explanation": "Standard HRA exemptions applied locally.",
            "encouragement": "You are on the path to financial freedom.",
            "what_if_scenarios": []
        }

        # STEP 2: Premium Intelligent Synthesis Loop
        # 2a. Priority 1: Ollama (Local AI - User Preference)
        logger.info("Attempting local synthesis via Ollama.")
        synthesis_context = f"FINANCIAL DATA FROM AGENTS:\n{json.dumps(intermediate_data)}\n\n{SYNTHESIS_PROMPT}"
        ollama_res, ollama_err = _call_ollama(synthesis_context)
        if ollama_res:
            _apply_synthesis(final_result, ollama_res, f"Ollama ({os.environ.get('OLLAMA_MODEL', 'local')})")
            return final_result
        
        final_result["debug_trace"] = f"Ollama failed: {ollama_err}"
        logger.warning(f"Ollama failed: {ollama_err}. Falling back to SOW-Math.")

        # FINAL FALLBACK (Strict Local Math)
        final_result["ai_agentic_loop"] = False
        final_result["engine"] = "SOW Math Optimizer"
        return final_result

    except Exception as e:
        logger.error(f"Hybrid orchestration failed: {e}", exc_info=True)
        # Final safety net using the fallback logic (which also should match this schema now)
        return run_math_fallback(partner_a, partner_b, goals, holdings, risk_profile, monthly_expenses, emergency_fund_existing)

def _apply_synthesis(final_result: dict, ai_synth: dict, engine_name: str):
    """Internal helper to apply AI synthesis to the final result."""
    final_result["priority_actions"] = ai_synth.get("priority_actions", final_result["priority_actions"])
    final_result["regime_explanation"] = ai_synth.get("regime_explanation", final_result["regime_explanation"])
    final_result["hra_explanation"] = ai_synth.get("hra_explanation", final_result["hra_explanation"])
    final_result["encouragement"] = ai_synth.get("encouragement", final_result["encouragement"])
    final_result["what_if_scenarios"] = ai_synth.get("what_if_scenarios", [])
    final_result["engine"] = engine_name

def _generate_math_actions(tax_res, ins_res, mkt_res) -> list:
    """Semi-intelligent local action generator if AI fails."""
    actions = []
    if tax_res.get("total_tax_saving", 0) > 1000:
        actions.append({
            "rank": 1, "title": "Optimize Tax Regimes", 
            "detail": f"Switch to the recommended regimes to unlock ₹{tax_res['total_tax_saving']:,.0f} in annual savings.",
            "annual_saving": tax_res["total_tax_saving"], "effort": "Low", "timeframe": "Instant"
        })
    
    ins_gap = ins_res.get("summary", {}).get("total_term_gap", 0)
    if ins_gap > 0:
        actions.append({
            "rank": 2, "title": "Fix Insurance Gap",
            "detail": f"You are under-insured by ₹{ins_gap:,.0f}. Get appropriate term cover to protect your family.",
            "annual_saving": 0, "effort": "Medium", "timeframe": "1 Week"
        })
        
    mkt_drag = mkt_res.get("total_expense_drag", 0)
    if mkt_drag > 2000:
        actions.append({
            "rank": 3, "title": "Stop Fee Leakage",
            "detail": f"You are losing ₹{mkt_drag:,.0f} to high expense ratios. Consider switching to Direct plans.",
            "annual_saving": mkt_drag, "effort": "Medium", "timeframe": "Instant"
        })
        
    return actions
