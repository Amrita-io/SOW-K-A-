# SOW v2.0.0 — Strategy Optimization Workspace

SOW is a private-first, agent-driven intelligence workspace designed to optimize the shared financial trajectories of modern Indian households. It leverages local Large Language Models (LLMs) and deterministic tax-engines to deliver high-fidelity, actionable dossiers for wealth optimization.

---

## 🔥 Key Capabilities

1.  **Agentic Household Synergy**: Orchestrates 7 financial agents to find the optimal tax-regime and rent-claimant strategy for couples.
2.  **6-Dimensional Health Audit**: Quantifies and grades financial wellness based on liquidity, debt, insurance, and retirement readiness.
3.  **Local Intelligence (Mistral)**: Zero-data egress. All synthesis is handled locally via Ollama to ensure complete financial privacy.
4.  **Premium Dossiers**: Generates professional, executive-style PDF reports using deterministic math and AI-synthesized action plans.
5.  **Market Intelligence**: Analyzes portfolio overlap and identifies high-expense fund leakages via live market data.

---

## 🛠 Setup & Installation Guide

### 1. Prerequisites
- **Python 3.10+**: Core backend logic.
- **Node.js 18+**: Frontend dashboard.
- **Ollama**: Required for local AI synthesis. [Download here](https://ollama.com).
  - *Post-installation:* Run `ollama pull mistral` to download the recommended model.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Unix/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=mistral
GEMINI_API_KEY=your_optional_key_here
BACKEND_PORT=8000
```
*Note: `GEMINI_API_KEY` is completely optional; the system defaults to local Ollama if missing.*

### 4. Frontend Setup
```bash
cd frontend
npm install
```

---

## 🚀 Running SOW

You need to have **three services** running concurrently:

| Service | Command | Purpose |
| :--- | :--- | :--- |
| **Ollama** | `ollama serve` | Local LLM hosting |
| **Backend** | `cd backend && python main.py` | Agentic Orchestrator (FastAPI) |
| **Frontend** | `cd frontend && npm run dev` | User Dashboard (Vite) |

Once started, navigate to **http://localhost:5173** to begin your analysis.

---

## 📋 Recommended Testing Workflow
We provide a comprehensive `TEST_DATA.md` file at the root. Use the **Scenario B (Entrepreneur Duo)** values to verify:
1.  **80GG Arbitrage**: Confirm the engine recommends rent-relief for business profiles.
2.  **JSON Resilience**: Observe the "JSON Repair" protocol in backend logs when Ollama returns non-deterministic output.

---

## 🔒 Security & Privacy
SOW is built for **zero-trust local-only** environments.
- **No Persistence**: Data is kept in-memory; no database or identifiers are stored.
- **Local AI**: Narrative analysis never hits third-party servers.
- **Confidential Reporting**: PDF generation is handled within the backend container.

---
*Developed by the SOW Intelligence Team — Precision Financial Optimization.*

---

## 🔒 Security
Designed for local intelligence. By default, SOW routes all synthesis to `localhost:11434`. Data stays in-memory; zero persistent local storage of sensitive identifiers.

---
*Created by the SOW Intelligence Team — 2026*
