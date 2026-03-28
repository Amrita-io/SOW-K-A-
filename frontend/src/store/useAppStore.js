import { create } from 'zustand';

const DEMO_PARTNER_A = {
  name: 'Aditya', age: 32, employment_type: 'salaried',
  annual_ctc: 1800000, basic_pct: 0.45, hra_pct: 0.40,
  city: 'Bangalore', is_metro: false, monthly_rent: 20000,
  existing_80c: 80000, nps_contribution: 0, monthly_sip: 10000,
  tax_regime: 'old', monthly_emi: 0,
  term_cover: 1000000, health_premium: 15000,
  parent_health_premium: 0, parents_senior_citizen: false,
};

const DEMO_PARTNER_B = {
  name: 'Priya', age: 29, employment_type: 'salaried',
  annual_ctc: 1100000, basic_pct: 0.45, hra_pct: 0.40,
  city: 'Bangalore', is_metro: false, monthly_rent: 0,
  existing_80c: 40000, nps_contribution: 0, monthly_sip: 5000,
  tax_regime: 'new', monthly_emi: 0,
  term_cover: 0, health_premium: 0,
  parent_health_premium: 0, parents_senior_citizen: false,
};

const DEMO_GOALS = [
  { name: 'Home purchase', target_year: 2030, present_cost: 8000000, goal_type: 'house' },
  { name: 'Child education', target_year: 2040, present_cost: 5000000, goal_type: 'education' },
];

const emptyPartner = {
  name: '', age: 30, employment_type: 'salaried',
  annual_ctc: 0, basic_pct: 0.45, hra_pct: 0.40,
  city: '', is_metro: false, monthly_rent: 0,
  existing_80c: 0, nps_contribution: 0, monthly_sip: 0,
  tax_regime: 'auto', monthly_emi: 0,
  term_cover: 0, health_premium: 0,
  parent_health_premium: 0, parents_senior_citizen: false,
};

const useAppStore = create((set, get) => ({
  // Navigation
  currentStep: 0,
  totalSteps: 6,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, s.totalSteps) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

  // Partner data
  partnerA: { ...emptyPartner },
  partnerB: { ...emptyPartner },
  setPartnerA: (data) => set({ partnerA: { ...get().partnerA, ...data } }),
  setPartnerB: (data) => set({ partnerB: { ...get().partnerB, ...data } }),

  // Goals
  goals: [],
  setGoals: (goals) => set({ goals }),
  addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),
  removeGoal: (name) => set((s) => ({ goals: s.goals.filter(g => g.name !== name) })),
  updateGoal: (name, data) => set((s) => ({
    goals: s.goals.map(g => g.name === name ? { ...g, ...data } : g),
  })),

  // Portfolio
  holdings: [],
  setHoldings: (holdings) => set({ holdings }),

  // Settings
  riskProfile: 'moderate',
  monthlyExpenses: 0,
  emergencyFundExisting: 0,
  setRiskProfile: (p) => set({ riskProfile: p }),
  setMonthlyExpenses: (v) => set({ monthlyExpenses: v }),
  setEmergencyFundExisting: (v) => set({ emergencyFundExisting: v }),

  // Demo data
  loadDemoData: () => set({
    partnerA: { ...DEMO_PARTNER_A },
    partnerB: { ...DEMO_PARTNER_B },
    goals: [...DEMO_GOALS],
    holdings: [],
    riskProfile: 'moderate',
    monthlyExpenses: 60000,
    emergencyFundExisting: 200000,
    currentStep: 1,
  }),

  // Reset
  reset: () => set({
    currentStep: 0,
    partnerA: { ...emptyPartner },
    partnerB: { ...emptyPartner },
    goals: [],
    holdings: [],
    riskProfile: 'moderate',
    monthlyExpenses: 0,
    emergencyFundExisting: 0,
  }),
}));

export default useAppStore;
export { DEMO_PARTNER_A, DEMO_PARTNER_B, DEMO_GOALS };
