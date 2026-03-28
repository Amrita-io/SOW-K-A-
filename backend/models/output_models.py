"""
CoupleWealth — Pydantic Output Schemas
"""

from pydantic import BaseModel
from typing import List, Optional


class HeadlineBreakdown(BaseModel):
    tax_saving: int = 0
    investment_gain: int = 0
    insurance_saving: int = 0
    market_alpha_recovery: int = 0


class PartnerTaxResult(BaseModel):
    name: str
    recommended_regime: str
    current_tax: int
    optimized_tax: int
    tax_saving: int
    hra_exemption_available: int = 0


class HealthDimension(BaseModel):
    name: str
    score: int
    max: int
    tip: str = ""


class HealthScore(BaseModel):
    total: int
    grade: str
    dimensions: List[HealthDimension]
    projected_score: int


class PriorityAction(BaseModel):
    rank: int
    title: str
    detail: str
    annual_saving: int
    effort: str
    timeframe: str


class GoalPlan(BaseModel):
    name: str
    target_year: int
    present_cost: int
    future_cost: int
    required_monthly_sip: int
    current_sip_allocated: int = 0
    on_track: bool = False


class RetirementResult(BaseModel):
    fire_number: int
    projected_corpus: int
    current_retirement_age: int
    optimized_retirement_age: int


class PartnerInsurance(BaseModel):
    required_term: int
    existing_term: int
    gap: int


class InsuranceResult(BaseModel):
    partner_a: PartnerInsurance
    partner_b: PartnerInsurance
    health_cover_gap: int = 0
    annual_80d_saving_available: int = 0


class MarketSignal(BaseModel):
    type: str
    description: str
    annual_impact: int = 0


class FundSwitch(BaseModel):
    from_fund: str
    to_fund: str
    reason: str


class PortfolioResult(BaseModel):
    total_value: int = 0
    xirr: float = 0.0
    benchmark_xirr: float = 0.0
    expense_drag_annual: int = 0
    overlap_warnings: List[str] = []
    recommended_switches: List[FundSwitch] = []


class WhatIfScenario(BaseModel):
    scenario: str
    impact: str
    annual_saving: int = 0


class AnalysisResponse(BaseModel):
    headline_saving: int
    headline_breakdown: HeadlineBreakdown
    partner_a: PartnerTaxResult
    partner_b: PartnerTaxResult
    hra_winner: str = ""
    hra_annual_saving: int = 0
    health_score: HealthScore
    priority_actions: List[PriorityAction]
    regime_explanation: str = ""
    hra_explanation: str = ""
    goal_plans: List[GoalPlan] = []
    retirement: RetirementResult
    insurance: InsuranceResult
    market_signals: List[MarketSignal] = []
    portfolio: PortfolioResult
    what_if_scenarios: List[WhatIfScenario] = []
    encouragement: str = ""
