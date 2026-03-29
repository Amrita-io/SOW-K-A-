import React from 'react';
import { CheckIcon } from '../shared/icons/index';

const steps = [
  { id: 1, label: 'Partner A', sub: 'Personal & salary details' },
  { id: 2, label: 'Partner B', sub: 'Personal & salary details' },
  { id: 3, label: 'Goals', sub: 'Life goals & portfolio' },
  { id: 4, label: 'Portfolio', sub: 'Investment holdings' },
  { id: 5, label: 'Analysis', sub: 'AI-powered insights' },
];

export default function ProgressBar({ currentStep }) {
  return (
    <div className="flex flex-col gap-10 relative">
      <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-border/40" />
      
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        
        return (
          <div key={step.label} className="flex items-start gap-4 group relative">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all duration-300
                ${isCompleted ? 'bg-accent text-white' : isCurrent ? 'bg-accent/10 border-2 border-accent text-prime shadow-lg shadow-accent/10' : 'bg-surface-muted text-text-muted border border-border/60'}`}
            >
              {isCompleted ? <CheckIcon className="w-4 h-4" /> : stepNum}
            </div>
            
            <div className="flex flex-col pt-0.5">
              <span className={`text-sm font-bold tracking-tight transition-colors duration-300 ${isCurrent ? 'text-prime uppercase' : 'text-text-light'}`}>
                {step.label}
              </span>
              <span className={`text-[11px] font-medium leading-tight ${isCurrent ? 'text-text-light' : 'text-text-muted/60'}`}>
                {step.sub}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
