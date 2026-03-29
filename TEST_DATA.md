# SOW v2.0.0 — Step-by-Step Testing Guide

Use these exact values in the SOW interface to verify the intelligence engine's performance.

---

## 🟢 SCENARIO A: The "Synergy House" (Salary Optimization)
**Objective**: Move Partner A to a lower tax bracket using rent, while Partner B switches to the New Regime for maximum savings.

| Input Field | Partner A (Arjun) | Partner B (Priya) |
| :--- | :--- | :--- |
| **Age** | 30 | 28 |
| **Employment** | Salaried | Salaried |
| **Annual CTC** | ₹32,00,000 | ₹24,00,000 |
| **Basic %** | 50% | 50% |
| **HRA %** | 40% | 40% |
| **City** | Mumbai (Metro) | Mumbai (Metro) |
| **Monthly Rent** | ₹65,000 | ₹0 |
| **Split Rent** | OFF | OFF |
| **Section 80C** | ₹1,50,000 | ₹1,50,000 |
| **NPS** | ₹50,000 | ₹0 |
| **Monthly SIP** | ₹1,00,000 | ₹50,000 |
| **Monthly EMI** | ₹0 | ₹0 |
| **Emergency Fund** | ₹15,00,000 | ₹10,00,000 |

---

## 🟡 SCENARIO B: The "Entrepreneur Duo" (Tax Arbitrage)
**Objective**: Test **Section 80GG** for Business and **Household Synergy**.

| Input Field | Partner A (Vikram) | Partner B (Isha) |
| :--- | :--- | :--- |
| **Age** | 35 | 32 |
| **Employment** | **Business** | Salaried |
| **Annual Income** | ₹45,00,000 | ₹18,00,000 |
| **Basic %** | N/A (Business) | 50% |
| **HRA %** | N/A (Business) | 40% |
| **City** | Bangalore | Bangalore |
| **Monthly Rent** | ₹75,000 | ₹0 |
| **Split Rent** | **ON (Enabled)** | **ON (Enabled)** |
| **Section 80C** | ₹1,50,000 | ₹1,50,000 |
| **NPS** | ₹0 | ₹50,000 |
| **Monthly SIP** | ₹50,000 | ₹20,000 |
| **Monthly EMI** | ₹80,000 | ₹0 |
| **Emergency Fund** | ₹5,00,000 | ₹5,00,000 |

---

## 🔴 SCENARIO C: The "Wealth Builders" (Risk Audit)
**Objective**: Trigger Grade D Health Score due to liquidity gap.

| Input Field | Partner A (Rahul) | Partner B (Ananya) |
| :--- | :--- | :--- |
| **Age** | 40 | 38 |
| **Employment** | Salaried | Salaried |
| **Annual CTC** | ₹65,00,000 | ₹45,00,000 |
| **Monthly EMI** | ₹2,50,000 | ₹0 |
| **Emergency Fund** | **₹1,00,000** | **₹1,00,000** |
| **Monthly Rent** | ₹1,20,000 | ₹0 |
| **SIP** | ₹3,00,000 | ₹2,00,000 |

---

## 🚀 How to Test properly:
1.  **Start Services**: Ensure `python main.py` and `npm run dev` are running.
2.  **Input Data**: Open the SOW dashboard and carefully fill in the values for **Scenario B**.
3.  **The "Synergy" Moment**: Observe that even though Vikram is a Business owner (No HRA), the SOW agent will recommend he claim **Section 80GG** for his ₹75,000 rent.
4.  **The "Health" Moment**: In Scenario C, notice that despite a combined income of **₹1.1 Crore**, the SOW "Money Health Score" will be **RED (Grade D/E)** because the Emergency Fund (₹2 Lakh) cannot even cover ONE month of their massive EMI (₹2.5 Lakh).
5.  **Generate Report**: Click the "Strategy Optimization" button and download the PDF. Verify the header says **SOW v2.0.0**.
