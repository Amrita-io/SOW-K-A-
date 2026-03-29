"""
SOW — Strategy Optimization Workspace — Indian Tax & Financial Constants FY 2025-26
All values in INR unless otherwise noted.
"""

# ═══════════════════════════════════════════════════════════
# TAX SLABS FY 2025-26
# ═══════════════════════════════════════════════════════════

OLD_REGIME_SLABS = [
    (250000, 0.00),
    (500000, 0.05),
    (1000000, 0.20),
    (float("inf"), 0.30),
]

NEW_REGIME_SLABS = [
    (300000, 0.00),
    (700000, 0.05),
    (1000000, 0.10),
    (1200000, 0.15),
    (1500000, 0.20),
    (float("inf"), 0.30),
]

# Standard deductions
OLD_REGIME_STANDARD_DEDUCTION = 50000
NEW_REGIME_STANDARD_DEDUCTION = 75000

# Rebate under section 87A
OLD_REGIME_REBATE_LIMIT = 500000  # taxable income threshold
NEW_REGIME_REBATE_LIMIT = 700000
OLD_REGIME_MAX_REBATE = 12500
NEW_REGIME_MAX_REBATE = 25000

# Cess
HEALTH_EDUCATION_CESS_RATE = 0.04

# ═══════════════════════════════════════════════════════════
# DEDUCTION LIMITS
# ═══════════════════════════════════════════════════════════

SECTION_80C_LIMIT = 150000
SECTION_80CCD_1B_LIMIT = 50000  # NPS extra deduction
SECTION_80D_SELF_LIMIT = 25000
SECTION_80D_PARENTS_LIMIT = 25000
SECTION_80D_PARENTS_SENIOR_LIMIT = 50000

# ═══════════════════════════════════════════════════════════
# HRA CONSTANTS
# ═══════════════════════════════════════════════════════════

HRA_METRO_PERCENT = 0.50
HRA_NON_METRO_PERCENT = 0.40

METRO_CITIES = [
    "mumbai", "delhi", "new delhi", "chennai", "kolkata",
]

# ═══════════════════════════════════════════════════════════
# INFLATION RATES (for goal planning)
# ═══════════════════════════════════════════════════════════

INFLATION_RATES = {
    "property": 0.08,
    "house": 0.08,
    "education": 0.10,
    "healthcare": 0.07,
    "general": 0.06,
    "retirement": 0.06,
    "emergency": 0.06,
    "wedding": 0.07,
    "vehicle": 0.05,
    "travel": 0.06,
    "custom": 0.06,
}

# ═══════════════════════════════════════════════════════════
# ASSET CLASS RETURN ASSUMPTIONS (CAGR)
# ═══════════════════════════════════════════════════════════

RETURN_RATES = {
    "equity": 0.12,
    "debt": 0.07,
    "hybrid": 0.10,
    "gold": 0.08,
}

RISK_PROFILE_RETURNS = {
    "conservative": 0.08,
    "moderate": 0.10,
    "aggressive": 0.12,
}

# Monthly return rates for SIP calculations
MONTHLY_RETURN_RATES = {
    "conservative": RISK_PROFILE_RETURNS["conservative"] / 12,
    "moderate": RISK_PROFILE_RETURNS["moderate"] / 12,
    "aggressive": RISK_PROFILE_RETURNS["aggressive"] / 12,
}

# ═══════════════════════════════════════════════════════════
# INSURANCE CONSTANTS
# ═══════════════════════════════════════════════════════════

HLV_INCOME_REPLACEMENT_FACTOR = 0.70  # 70% of income for dependents
MINIMUM_HEALTH_COVER_METRO = 1000000   # ₹10L
MINIMUM_HEALTH_COVER_NON_METRO = 500000  # ₹5L
CRITICAL_ILLNESS_MULTIPLE = 2  # 2x annual income
RETIREMENT_AGE_DEFAULT = 60

# ═══════════════════════════════════════════════════════════
# FIRE CONSTANTS
# ═══════════════════════════════════════════════════════════

FIRE_WITHDRAWAL_RATE = 0.04  # 4% rule
FIRE_MULTIPLIER = 25  # = 1 / 0.04

# ═══════════════════════════════════════════════════════════
# EXPENSE RATIO THRESHOLDS
# ═══════════════════════════════════════════════════════════

MAX_EQUITY_EXPENSE_RATIO = 0.015  # 1.5%
MAX_DEBT_EXPENSE_RATIO = 0.005   # 0.5%
OVERLAP_WARNING_THRESHOLD = 0.60  # 60%

# ═══════════════════════════════════════════════════════════
# HEALTH SCORE WEIGHTS
# ═══════════════════════════════════════════════════════════

HEALTH_SCORE_DIMENSIONS = {
    "emergency_preparedness": {"max": 20, "target_months": 6},
    "insurance_coverage": {"max": 20, "gap_penalty": 4},
    "investment_diversification": {"max": 15},
    "tax_efficiency": {"max": 15},
    "debt_health": {"max": 15, "safe_emi_ratio": 0.30},
    "retirement_readiness": {"max": 15},
}

HEALTH_GRADES = [
    (90, "A+"),
    (80, "A"),
    (70, "B"),
    (60, "C"),
    (0, "D"),
]

# ═══════════════════════════════════════════════════════════
# BENCHMARK
# ═══════════════════════════════════════════════════════════

NIFTY_50_TRI_3Y_CAGR = 0.14  # approximate 3Y CAGR fallback

# ═══════════════════════════════════════════════════════════
# APP META
# ═══════════════════════════════════════════════════════════

APP_VERSION = "2.0.0"
APP_NAME = "SOW"
