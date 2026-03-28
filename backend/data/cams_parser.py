"""
CAMS Statement PDF Parser
Extracts mutual fund holdings from CAMS/KFintech PDF statements.
"""

import logging
from typing import List, Dict
from datetime import datetime

logger = logging.getLogger(__name__)


def parse_cams_pdf(pdf_bytes: bytes) -> Dict:
    """
    Parse CAMS/KFintech consolidated account statement PDF.
    Returns structured holdings data.
    """
    try:
        import pdfplumber

        holdings = []
        total_invested = 0
        total_current = 0

        with pdfplumber.open(pdf_bytes) as pdf:
            full_text = ""
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"

            # Parse fund entries
            holdings = _extract_holdings_from_text(full_text)

            for h in holdings:
                total_invested += h.get("invested_amount", 0)
                total_current += h.get("current_value", 0)

        return {
            "success": True,
            "holdings": holdings,
            "total_invested": round(total_invested),
            "total_current": round(total_current),
            "fund_count": len(holdings),
        }

    except ImportError:
        logger.error("pdfplumber not installed")
        return {"success": False, "error": "PDF parsing library not available", "holdings": []}
    except Exception as e:
        logger.error(f"CAMS parsing failed: {e}")
        return {"success": False, "error": str(e), "holdings": []}


def _extract_holdings_from_text(text: str) -> List[Dict]:
    """Extract fund holdings from parsed PDF text."""
    import re

    holdings = []
    lines = text.split("\n")

    # Common patterns in CAMS statements
    fund_pattern = re.compile(
        r"([\w\s\-\.]+(?:Fund|Plan|Growth|Dividend|Direct|Regular)[\w\s\-\.]*)",
        re.IGNORECASE,
    )
    amount_pattern = re.compile(r"₹?\s*([\d,]+\.?\d*)")
    nav_pattern = re.compile(r"NAV[:\s]*([\d,]+\.?\d*)")

    current_fund = None
    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Try to find fund name
        fund_match = fund_pattern.search(line)
        if fund_match:
            fund_name = fund_match.group(1).strip()
            if len(fund_name) > 10:  # reasonable length
                current_fund = fund_name

        # Try to extract amounts
        if current_fund:
            amounts = amount_pattern.findall(line)
            if len(amounts) >= 2:
                try:
                    invested = float(amounts[0].replace(",", ""))
                    current = float(amounts[1].replace(",", ""))
                    if invested > 100 and current > 100:  # Sanity check
                        holdings.append({
                            "fund_name": current_fund,
                            "invested_amount": invested,
                            "current_value": current,
                            "start_date": "2023-01-01",  # Default, CAMS dates vary
                        })
                        current_fund = None
                except (ValueError, IndexError):
                    pass

    return holdings
