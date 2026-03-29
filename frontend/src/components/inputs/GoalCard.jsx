import React, { useState } from 'react';
import { 
  HomeIcon, GraduationIcon, BriefcaseIcon, ShieldIcon, 
  HeartIcon, CarIcon, PlaneIcon, TargetIcon, GoalIcon 
} from '../shared/icons/index';
import CurrencyInput from './CurrencyInput';
import SliderInput from './SliderInput';
import { motion, AnimatePresence } from 'framer-motion';

const GOAL_ICONS = {
  house: HomeIcon, 
  education: GraduationIcon, 
  retirement: BriefcaseIcon,
  emergency: ShieldIcon, 
  wedding: HeartIcon, 
  vehicle: CarIcon,
  travel: PlaneIcon, 
  custom: TargetIcon,
};

export default function GoalCard({ goal, isActive, onToggle, onUpdate }) {
  const Icon = GOAL_ICONS[goal.type] || GoalIcon;
  const [expanded, setExpanded] = useState(isActive);

  const handleToggle = () => { onToggle(); setExpanded(!expanded); };

  return (
    <div 
      className={`card p-0 transition-all duration-500 overflow-hidden ${isActive ? 'border-accent bg-accent/[0.02] ring-4 ring-accent/5' : 'border-border/60 hover:border-accent/30'}`}
    >
      <div 
        onClick={handleToggle}
        className="flex items-start gap-6 p-6 cursor-pointer hover:bg-accent/[0.03] transition-colors"
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${isActive ? 'bg-accent text-prime shadow-accent/20' : 'bg-surface-muted text-text-light'}`}>
          <Icon className="w-8 h-8" />
        </div>
        
        <div className="flex-1 pt-1">
          <h3 className={`text-xl font-bold tracking-tight transition-colors duration-300 ${isActive ? 'text-prime uppercase' : 'text-text'}`}>
            {goal.label}
          </h3>
          <p className="text-[12px] font-medium text-text-muted mt-1 leading-relaxed max-w-xs">{goal.desc}</p>
        </div>

        <div className={`mt-2 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isActive ? 'border-accent bg-accent text-prime scale-110 shadow-lg shadow-accent/20' : 'border-border'}`}>
           {isActive && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
        </div>
      </div>

      <AnimatePresence>
        {expanded && isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-8 pb-10 border-t border-accent/10 space-y-10 bg-white"
          >
             <div className="pt-8">
               {goal.type === 'house' && (
                  <>
                    <SliderInput label="Projected Year of Purchase" value={goal.data?.target_year || 2030} onChange={(v) => onUpdate({ target_year: v })} min={2026} max={2055} />
                    <CurrencyInput label="Estimated Property Value Today" value={goal.data?.present_cost || 0} onChange={(v) => onUpdate({ present_cost: v })} />
                  </>
                )}
                {goal.type === 'education' && (
                  <>
                    <SliderInput label="Child's Current Age" value={goal.data?.child_age || 5} onChange={(v) => onUpdate({ child_age: v, target_year: 2026 + (18 - v) })} min={0} max={15} suffix=" years" />
                    <CurrencyInput label="Total Education Corpus (Present Value)" value={goal.data?.present_cost || 0} onChange={(v) => onUpdate({ present_cost: v })} />
                  </>
                )}
                {goal.type === 'retirement' && (
                  <>
                    <SliderInput label="Target Retirement Age" value={goal.data?.retirement_age || 55} onChange={(v) => onUpdate({ retirement_age: v })} min={45} max={65} suffix=" years" />
                    <CurrencyInput label="Monthly Expenses Post-Retirement" value={goal.data?.monthly_expenses || 0} onChange={(v) => onUpdate({ monthly_expenses: v })} />
                  </>
                )}
                {goal.type === 'emergency' && (
                  <CurrencyInput label="Existing Emergency Savings" value={goal.data?.existing || 0} onChange={(v) => onUpdate({ existing: v })} />
                )}
                {(goal.type === 'custom' || goal.type === 'wedding' || goal.type === 'vehicle' || goal.type === 'travel') && (
                  <>
                    <SliderInput label="Target Date (Year)" value={goal.data?.target_year || 2030} onChange={(v) => onUpdate({ target_year: v })} min={2026} max={2055} />
                    <CurrencyInput label="Total Required (at Today's Cost)" value={goal.data?.present_cost || 0} onChange={(v) => onUpdate({ present_cost: v })} />
                  </>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
