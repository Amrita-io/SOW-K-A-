"""
Market Data Fetcher — yfinance + mftool.
Graceful degradation if APIs unavailable.
"""

import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)


def fetch_fund_nav(scheme_code: str) -> Optional[float]:
    """Fetch latest NAV for a mutual fund scheme."""
    try:
        from mftool import Mftool
        mf = Mftool()
        data = mf.get_scheme_quote(scheme_code)
        if data and "nav" in data:
            return float(data["nav"])
    except Exception as e:
        logger.warning(f"Failed to fetch NAV for {scheme_code}: {e}")
    return None


def fetch_nifty_returns(period: str = "3y") -> Optional[float]:
    """Fetch Nifty 50 TRI returns for benchmark comparison."""
    try:
        import yfinance as yf
        nifty = yf.Ticker("^NSEI")
        hist = nifty.history(period=period)
        if len(hist) > 1:
            start = hist["Close"].iloc[0]
            end = hist["Close"].iloc[-1]
            years = len(hist) / 252  # trading days
            cagr = ((end / start) ** (1 / years) - 1) * 100
            return round(cagr, 1)
    except Exception as e:
        logger.warning(f"Failed to fetch Nifty returns: {e}")
    return None


def fetch_stock_info(ticker: str) -> Optional[Dict]:
    """Fetch stock info (52W high, PE, sector)."""
    try:
        import yfinance as yf
        stock = yf.Ticker(ticker)
        info = stock.info
        return {
            "ticker": ticker,
            "name": info.get("longName", ticker),
            "sector": info.get("sector", "Unknown"),
            "pe_ratio": info.get("trailingPE"),
            "week_52_high": info.get("fiftyTwoWeekHigh"),
            "week_52_low": info.get("fiftyTwoWeekLow"),
            "current_price": info.get("currentPrice"),
        }
    except Exception as e:
        logger.warning(f"Failed to fetch stock info for {ticker}: {e}")
    return None
