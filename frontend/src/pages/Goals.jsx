import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';
import StepHeader from '../components/layout/StepHeader';
import NavButtons from '../components/layout/NavButtons';
import GoalCard from '../components/inputs/GoalCard';
import CurrencyInput from '../components/inputs/CurrencyInput';
import { GoalIcon } from '../components/shared/icons/index';

const GOAL_TEMPLATES = [
  { type: 'house', label: 'House Purchase', desc: 'Dream home savings' },
  { type: 'education', label: 'Child Education', desc: 'University fund' },
  { type: 'retirement', label: 'Retirement / FIRE', desc: 'Financial independence' },
  { type: 'emergency', label: 'Emergency Fund', desc: '6 months safety net' },
  { type: 'wedding', label: 'Wedding', desc: 'Celebration fund' },
  { type: 'vehicle', label: 'Vehicle', desc: 'Car or bike purchase' },
  { type: 'travel', label: 'Travel', desc: 'Dream vacation' },
  { type: 'custom', label: 'Custom Goal', desc: 'Any other goal' },
];

export default function Goals() {
  const { goals, setGoals, riskProfile, setRiskProfile, monthlyExpenses, setMonthlyExpenses,
    emergencyFundExisting, setEmergencyFundExisting, partnerA, partnerB, setStep } = useAppStore();

  const [activeGoals, setActiveGoals] = useState(
    goals.map(g => g.goal_type || g.name?.toLowerCase())
  );
  const [goalData, setGoalData] = useState(() => {
    const data = {};
    goals.forEach(g => { data[g.goal_type || 'custom'] = { present_cost: g.present_cost, target_year: g.target_year }; });
    return data;
  });

  const toggleGoal = (type) => {
    setActiveGoals(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const updateGoalData = (type, update) => {
    setGoalData(prev => ({ ...prev, [type]: { ...(prev[type] || {}), ...update } }));
  };

  const handleNext = () => {
    const newGoals = activeGoals.map(type => {
      const template = GOAL_TEMPLATES.find(t => t.type === type);
      const data = goalData[type] || {};
      return {
        name: template?.label || type,
        goal_type: type,
        target_year: data.target_year || 2030,
        present_cost: data.present_cost || 0,
      };
    });
    setGoals(newGoals);
    if (goalData.emergency?.existing) setEmergencyFundExisting(goalData.emergency.existing);
    setStep(4);
  };

  const combinedIncomeMonthly = (partnerA.annual_ctc + partnerB.annual_ctc) / 12;
  const combinedSIP = partnerA.monthly_sip + partnerB.monthly_sip;
  const combinedEMI = partnerA.monthly_emi + partnerB.monthly_emi;
  const surplus = Math.max(0, combinedIncomeMonthly - monthlyExpenses - combinedEMI - combinedSIP);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <StepHeader icon={GoalIcon} title="Plan your goals together" subtitle="Select the goals that matter to your family" />

      <div className="grid grid-cols-2 gap-4 mb-8">
        {GOAL_TEMPLATES.map(tmpl => (
          <GoalCard
            key={tmpl.type}
            goal={{ ...tmpl, data: goalData[tmpl.type] }}
            isActive={activeGoals.includes(tmpl.type)}
            onToggle={() => toggleGoal(tmpl.type)}
            onUpdate={(data) => updateGoalData(tmpl.type, data)}
          />
        ))}
      </div>

      <div className="card mb-6">
        <h3 className="heading-sm mb-4">Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Risk Profile</label>
            <div className="grid grid-cols-3 gap-2">
              {['conservative', 'moderate', 'aggressive'].map(r => (
                <button key={r} type="button" onClick={() => setRiskProfile(r)}
                  className={`py-2.5 rounded-input border text-sm font-medium transition-all ${riskProfile === r ? 'border-gold bg-gold/5 text-navy' : 'border-border text-muted'}`}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <CurrencyInput label="Monthly Household Expenses" value={monthlyExpenses} onChange={setMonthlyExpenses} />
          {monthlyExpenses > 0 && (
            <div className="p-3 bg-navy/5 rounded-input">
              <p className="text-xs text-muted">
                Combined monthly income: ₹{Math.round(combinedIncomeMonthly).toLocaleString('en-IN')} |
                After expenses + EMIs + SIPs: <span className="font-semibold text-emerald">₹{Math.round(surplus).toLocaleString('en-IN')}</span> surplus
              </p>
            </div>
          )}
        </div>
      </div>

      <NavButtons onBack={() => setStep(2)} onNext={handleNext} />
    </div>
  );
}
