import React from 'react';
import { CheckIcon } from '../shared/icons/index';

const steps = ['Welcome', 'Partner A', 'Partner B', 'Goals', 'Portfolio', 'Analysis', 'Results'];

export default function ProgressBar({ currentStep }) {
  return (
    <div className="w-full bg-surface border-b border-border px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((label, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${isCompleted ? 'bg-gold text-navy' : isCurrent ? 'bg-navy text-gold ring-2 ring-gold/30' : 'bg-gray-100 text-muted'}`}>
                    {isCompleted ? <CheckIcon className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium hidden sm:block ${isCurrent ? 'text-navy' : 'text-muted'}`}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-6 sm:w-12 h-0.5 mx-1 ${isCompleted ? 'bg-gold' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
