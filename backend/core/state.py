import json
import os
from pathlib import Path

# File-based persistence for cross-process and reload safety
CACHE_DIR = Path(__file__).parent.parent / "data"
CACHE_FILE = CACHE_DIR / "last_analysis.json"

def set_last_analysis(result: dict):
    """Persist analysis result to disk."""
    try:
        CACHE_DIR.mkdir(exist_ok=True, parents=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(result, f)
    except Exception as e:
        print(f"Failed to persist analysis: {e}")

def get_last_analysis() -> dict:
    """Read analysis result from disk."""
    try:
        if CACHE_FILE.exists():
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"Failed to load analysis: {e}")
    return {}
