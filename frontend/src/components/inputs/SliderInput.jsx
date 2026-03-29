import React from 'react';

export default function SliderInput({ label, value, onChange, min = 0, max = 100, step = 1, suffix = '', preview }) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <label className="text-sm font-bold text-prime block mb-1">{label}</label>
          {preview && <p className="text-[11px] text-text-light font-medium">{preview}</p>}
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-accent">
            {value}{suffix}
          </span>
        </div>
      </div>
      
      <div className="relative group py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none bg-surface-muted transition-all range-gold"
          style={{
            background: `linear-gradient(to right, #EAB308 ${percentage}%, #F1F5F9 ${percentage}%)`
          }}
        />
      </div>
      
      <div className="flex justify-between text-[11px] text-text-muted font-medium opacity-60 px-1">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}
