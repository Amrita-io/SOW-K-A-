# CoupleWealth

**India's first AI-powered joint financial intelligence engine**

> "We don't show you a dashboard. We recover your money."

CoupleWealth analyzes Indian couples' finances across 7 pillars — tax optimization, investment allocation, insurance adequacy, goal planning, market intelligence, portfolio analysis, and money health scoring — to find exactly how much money you're losing every year and how to recover it.

## Features

- **Dual-Income Tax Optimization** — Old vs New regime comparison for each partner independently
- **HRA Arbitrage** — Determines which partner should claim rent for maximum tax benefit
- **Joint SIP Allocation** — scipy linear programming to minimize combined tax via optimal ELSS/NPS splits
- **FIRE Calculator** — Projects retirement age at current vs optimized savings rates
- **Insurance Audit** — HLV-based term cover gap analysis, health cover adequacy, 80D optimization
- **Market Intelligence** — Fund performance signals, expense drag analysis, overlap detection
- **Money Health Score** — 0-100 score across 6 dimensions with projected improvement

## Tech Stack

**Backend:** Python 3.11+ / FastAPI / Google Gemini 2.0 Flash / scipy / numpy-financial / pyxirr  
**Frontend:** React 18 / Vite / Tailwind CSS v3 / Recharts / Framer Motion / Zustand

## Prerequisites

- Python 3.11+
- Node.js 18+
- Google Gemini API key (optional — app works with math-only fallback)

## Setup

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Access

Open [http://localhost:5173](http://localhost:5173)

## Demo

Click **"Try with demo data"** on the landing page to instantly load sample data (Aditya + Priya) and run a full analysis.

## Architecture

```
couplewealth/
├── backend/
│   ├── agents/          # 7 AI agents + Gemini orchestrator
│   ├── core/            # Pure Python calculation engines
│   ├── data/            # CAMS parser, market data fetcher
│   ├── models/          # Pydantic v2 schemas
│   ├── routes/          # FastAPI endpoints
│   ├── report/          # PDF report generator
│   └── main.py          # FastAPI app
└── frontend/
    └── src/
        ├── api/         # Axios client
        ├── components/  # Inputs, layout, results, shared
        ├── pages/       # 6 step-based pages
        └── store/       # Zustand stores
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analyze` | Run complete financial analysis |
| POST | `/api/upload/cams` | Upload CAMS PDF statement |
| GET | `/api/report/pdf` | Download PDF report |
| GET | `/api/health` | Health check |

## License

MIT
