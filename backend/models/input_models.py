"""
CoupleWealth — Pydantic Input Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class EmploymentType(str, Enum):
    salaried = "salaried"
    self_employed = "self_employed"
    business = "business"


class TaxRegime(str, Enum):
    old = "old"
    new = "new"
    auto = "auto"


class RiskProfile(str, Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"


class PartnerInput(BaseModel):
    name: str
    age: int = Field(ge=22, le=65)
    employment_type: EmploymentType
    annual_ctc: float
    basic_pct: float = Field(default=0.45, ge=0.40, le=0.60)
    hra_pct: float = Field(default=0.40, ge=0.0, le=0.50)
    city: str
    is_metro: bool
    monthly_rent: float = 0
    existing_80c: float = 0
    nps_contribution: float = 0
    monthly_sip: float = 0
    tax_regime: TaxRegime = TaxRegime.auto
    monthly_emi: float = 0
    term_cover: float = 0
    health_premium: float = 0
    parent_health_premium: float = 0
    parents_senior_citizen: bool = False


class GoalInput(BaseModel):
    name: str
    target_year: int
    present_cost: float
    goal_type: str  # house, education, retirement, emergency, custom


class MFHolding(BaseModel):
    fund_name: str
    invested_amount: float
    current_value: float
    start_date: str


class AnalysisRequest(BaseModel):
    partner_a: PartnerInput
    partner_b: PartnerInput
    goals: List[GoalInput] = []
    holdings: List[MFHolding] = []
    risk_profile: RiskProfile = RiskProfile.moderate
    monthly_expenses: float = 0
    emergency_fund_existing: float = 0
