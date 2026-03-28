import React from 'react';

export default function SliderInput({ label, value, onChange, min = 0, max = 100, step = 1, suffix = '', preview }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text">{label}</label>
        <span className="text-sm font-semibold text-navy">
          {value}{suffix}
          {preview && <span className="text-xs text-muted ml-2">({preview})</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold"
      />
      <div className="flex justify-between text-[10px] text-muted">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}
