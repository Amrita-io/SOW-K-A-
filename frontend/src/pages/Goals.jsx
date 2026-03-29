import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '../store/useAppStore';
import StepHeader from '../components/layout/StepHeader';
import NavButtons from '../components/layout/NavButtons';
import GoalCard from '../components/inputs/GoalCard';
import CurrencyInput from '../components/inputs/CurrencyInput';
import { 
  GoalIcon, SettingsIcon, HeartIcon, CarIcon, PlaneIcon, TargetIcon, 
  HomeIcon, GraduationIcon, ShieldIcon, BriefcaseIcon 
} from '../components/shared/icons/index';

const GOAL_TEMPLATES = [
  { type: 'house', label: 'House Purchase', desc: 'Dream home savings', icon: HomeIcon },
  { type: 'education', label: 'Child Education', desc: 'University fund', icon: GraduationIcon },
  { type: 'retirement', label: 'Retirement / FIRE', desc: 'Financial independence', icon: BriefcaseIcon },
  { type: 'emergency', label: 'Emergency Fund', desc: '6 months safety net', icon: ShieldIcon },
  { type: 'wedding', label: 'Wedding', desc: 'Celebration fund', icon: HeartIcon },
  { type: 'vehicle', label: 'Vehicle', desc: 'Car or bike purchase', icon: CarIcon },
  { type: 'travel', label: 'Travel', desc: 'Dream vacation', icon: PlaneIcon },
  { type: 'custom', label: 'Custom Goal', desc: 'Any other goal', icon: TargetIcon },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
    <div className="flex flex-col lg:flex-row gap-16 pb-20">
      {/* Left: Goals Grid */}
      <div className="flex-1 max-w-4xl">
        <div className="mb-16">
           <h1 className="text-4xl font-bold tracking-tight text-prime leading-tight">Plan your family goals</h1>
           <p className="text-text-muted mt-2 text-lg">Select milestones and let agents calculate the required SIPs.</p>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12"
        >
          {GOAL_TEMPLATES.map(tmpl => (
            <GoalCard
              key={tmpl.type}
              goal={{ ...tmpl, data: goalData[tmpl.type] }}
              isActive={activeGoals.includes(tmpl.type)}
              onToggle={() => toggleGoal(tmpl.type)}
              onUpdate={(data) => updateGoalData(tmpl.type, data)}
            />
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="pt-12">
          <NavButtons onBack={() => setStep(2)} onNext={handleNext} />
        </motion.div>
      </div>

      {/* Right: Budget Sidebar */}
      <aside className="hidden lg:block w-96 flex-shrink-0">
        <div className="sticky top-12 space-y-6">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="card shadow-2xl shadow-prime/5 bg-white border-prime/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Budget Console</p>
                <h3 className="text-xl font-bold text-prime">Family Cashflow</h3>
              </div>
              <SettingsIcon className="w-6 h-6 text-prime/20" />
            </div>
            
            <div className="space-y-10">
              <div className="p-6 bg-surface-muted/30 rounded-2xl border border-border/40">
                <label className="block text-[10px] font-black text-prime uppercase tracking-widest mb-4">Risk Profile</label>
                <div className="flex gap-2">
                  {['conservative', 'moderate', 'aggressive'].map(r => (
                    <button key={r} type="button" onClick={() => setRiskProfile(r)}
                      className={`flex-1 py-3 rounded-xl border-2 text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${riskProfile === r ? 'border-accent bg-accent/20 text-prime shadow-sm' : 'border-transparent text-text-muted hover:bg-white bg-white/50'}`}>
                      {r.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>
              
              <CurrencyInput label="Monthly Joint Expenses" value={monthlyExpenses} onChange={setMonthlyExpenses} helpText="Rent, groceries, utilities, etc." />
              
              <div className="pt-6 border-t border-border/40">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-bold text-text-muted/60 uppercase tracking-wider">
                     <span>Combined Income</span>
                     <span>₹{Math.round(combinedIncomeMonthly).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-3xl font-black text-prime tracking-tighter">
                     <span className="text-sm font-black text-prime/40 pb-1">SURPLUS</span>
                     <span className="text-emerald-600">₹{Math.round(surplus).toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                    <p className="text-[10px] text-emerald-700 font-bold leading-relaxed">
                      {surplus > 0 
                        ? `You have ₹${Math.round(surplus).toLocaleString('en-IN')} available for new SIPs towards the ${activeGoals.length} goals selected.`
                        : "Your current budget has no surplus. AI agents will suggest leaks to fix this."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="p-8 rounded-[32px] bg-prime flex items-center justify-between shadow-xl shadow-prime/20">
            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Financial Intelligence</p>
              <p className="text-sm font-black text-white">CORE ACTIVE</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <TargetIcon className="w-5 h-5 text-accent" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
