# SOW v2.0.0 — Strategy Optimization Workspace

SOW is a private-first, agent-driven intelligence workspace designed to optimize the shared financial trajectories of modern Indian households. It leverages local Large Language Models (LLMs) and deterministic tax-engines to deliver high-fidelity, actionable dossiers for wealth optimization.

---

## ⚡ Core Intelligence Features

### 1. Household Tax Arbitrage (Agentic)
*   **HRA Synergy**: Automatically identifies the optimal rent-claimant in a two-partner household for maximum bracket efficiency.
*   **Section 80GG Support**: Specialized relief for entrepreneurs and business profiles without formal HRA components.
*   **Dual-Regime Audit**: Direct comparison of Old vs. New Tax Regimes (FY 2025-26) with automated investment suggestions.

### 2. SOW Money Health Score
*   **6-Dimensional Wellness Audit**: Evaluates Emergency Liquidity, Insurance Adequacy, Investment Maturity, Tax Efficiency, Debt Health, and Retirement Readiness.
*   **Risk Intelligence**: Proactively flags "Grade D/E" alerts for high-CTC households with insufficient liquid buffers.

### 3. Local-First AI (Privacy First)
*   **Zero-Egress Analysis**: All narrative synthesis is performed locally via **Ollama (Mistral)**. No financial data leaves your local machine.
*   **JSON Resilience**: Features a built-in repair orchestrator to guarantee stable outputs from non-deterministic local model responses.

### 4. Premium Reporting
*   **Executive Dossiers**: Generates professional PDF dossiers with priority action plans and long-term goal roadmaps.
*   **Unicode Safe**: Fully optimized for Indian financial symbols and complex multi-partner data structures.

---

## 🚀 Quick Start

### Prerequisites
*   **Python 3.10+** & **Node.js 18+**
*   **Ollama**: Pull the mistral model (`ollama pull mistral`)

### Installation
1.  **Clone repo** and navigate to root.
2.  **Start Backend**: `cd backend && pip install -r requirements.txt && python main.py`
3.  **Start Frontend**: `cd frontend && npm install && npm run dev`

---

## 📋 Testing
Use the `TEST_DATA.md` dossier to stress-test the engine with high-fidelity scenarios (Salaried Synergy, Entrepreneur Arbitrage, and High-Wealth Risk).

---

## 🔒 Security
Designed for local intelligence. By default, SOW routes all synthesis to `localhost:11434`. Data stays in-memory; zero persistent local storage of sensitive identifiers.

---
*Created by the SOW Intelligence Team — 2026*
