import React, { useState } from 'react';
import { HomeIcon, ChildIcon, RetirementIcon, EmergencyIcon, GoalIcon } from '../shared/icons/index';
import CurrencyInput from './CurrencyInput';
import SliderInput from './SliderInput';

const GOAL_ICONS = {
  house: HomeIcon, education: ChildIcon, retirement: RetirementIcon,
  emergency: EmergencyIcon, wedding: GoalIcon, vehicle: GoalIcon,
  travel: GoalIcon, custom: GoalIcon,
};

export default function GoalCard({ goal, isActive, onToggle, onUpdate }) {
  const Icon = GOAL_ICONS[goal.type] || GoalIcon;
  const [expanded, setExpanded] = useState(isActive);

  const handleToggle = () => { onToggle(); setExpanded(!expanded); };

  return (
    <div className={`card cursor-pointer transition-all ${isActive ? 'ring-2 ring-gold/30 border-gold' : 'opacity-70'}`}>
      <div className="flex items-center gap-3" onClick={handleToggle}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-gold/10' : 'bg-gray-100'}`}>
          <Icon className={`w-5 h-5 ${isActive ? 'text-gold' : 'text-muted'}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{goal.label}</h3>
          <p className="text-xs text-muted">{goal.desc}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'border-gold bg-gold' : 'border-gray-300'}`}>
          {isActive && <svg className="w-3 h-3 text-navy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
      </div>

      {expanded && isActive && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          {goal.type === 'house' && (
            <>
              <SliderInput label="Target Year" value={goal.data?.target_year || 2030} onChange={(v) => onUpdate({ target_year: v })} min={2026} max={2055} />
              <CurrencyInput label="Estimated property cost today" value={goal.data?.present_cost || 0} onChange={(v) => onUpdate({ present_cost: v })} />
            </>
          )}
          {goal.type === 'education' && (
            <>
              <SliderInput label="Child's current age" value={goal.data?.child_age || 5} onChange={(v) => onUpdate({ child_age: v, target_year: 2026 + (18 - v) })} min={0} max={15} />
              <CurrencyInput label="Estimated education cost today" value={goal.data?.present_cost || 0} onChange={(v) => onUpdate({ present_cost: v })} />
            </>
          )}
          {goal.type === 'retirement' && (
            <>
              <SliderInput label="Target retirement age" value={goal.data?.retirement_age || 55} onChange={(v) => onUpdate({ retirement_age: v })} min={45} max={65} />
              <CurrencyInput label="Expected monthly expenses in retirement" value={goal.data?.monthly_expenses || 0} onChange={(v) => onUpdate({ monthly_expenses: v })} />
            </>
          )}
          {goal.type === 'emergency' && (
            <CurrencyInput label="Current emergency fund" value={goal.data?.existing || 0} onChange={(v) => onUpdate({ existing: v })} />
          )}
          {(goal.type === 'custom' || goal.type === 'wedding' || goal.type === 'vehicle' || goal.type === 'travel') && (
            <>
              <SliderInput label="Target Year" value={goal.data?.target_year || 2030} onChange={(v) => onUpdate({ target_year: v })} min={2026} max={2055} />
              <CurrencyInput label="Target amount today" value={goal.data?.present_cost || 0} onChange={(v) => onUpdate({ present_cost: v })} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
