import React from 'react';

const options = [
  { value: 'old', label: 'Old Regime', desc: 'More deductions' },
  { value: 'new', label: 'New Regime', desc: 'Lower rates' },
  { value: 'auto', label: 'Let AI Decide', desc: 'Optimize' },
];

export default function RegimeSelect({ value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">Tax Regime</label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`p-3 rounded-input border text-center transition-all ${
              value === opt.value
                ? 'border-gold bg-gold/5 text-navy ring-2 ring-gold/20'
                : 'border-border text-muted hover:border-gold/50'
            }`}
          >
            <div className="text-sm font-semibold">{opt.label}</div>
            <div className="text-[10px] text-muted mt-0.5">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
