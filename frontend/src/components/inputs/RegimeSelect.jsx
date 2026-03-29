import React from 'react';

const options = [
  { value: 'old', label: 'Old Regime', desc: 'More deductions' },
  { value: 'new', label: 'New Regime', desc: 'Lower rates' },
  { value: 'auto', label: 'Let AI Decide', desc: 'Optimize' },
];

export default function RegimeSelect({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text">Tax Regime</label>
      <div className="grid grid-cols-3 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`p-3 rounded-button border text-center transition-all ${
              value === opt.value
                ? 'border-accent bg-accent/5 text-prime ring-2 ring-accent/20 shadow-sm'
                : 'border-border text-text-muted hover:border-accent/50 bg-surface'
            }`}
          >
            <div className="text-sm font-semibold">{opt.label}</div>
            <div className="text-[10px] sm:text-xs text-text-light mt-1">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
