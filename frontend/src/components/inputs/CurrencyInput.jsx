import React, { useState, useCallback } from 'react';

/** Format number in Indian numbering system: 1,23,456 */
export function formatINR(num) {
  if (num === null || num === undefined || num === '') return '';
  const n = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
  if (isNaN(n)) return '';
  const isNeg = n < 0;
  const abs = Math.abs(Math.round(n));
  const s = abs.toString();
  if (s.length <= 3) return (isNeg ? '-' : '') + s;
  let result = s.slice(-3);
  let rem = s.slice(0, -3);
  while (rem.length > 0) {
    result = rem.slice(-2) + ',' + result;
    rem = rem.slice(0, -2);
  }
  return (isNeg ? '-' : '') + result;
}

/** Display human-friendly short format: 18L, 1.2Cr */
export function shortINR(num) {
  if (!num) return '0';
  const abs = Math.abs(num);
  if (abs >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return formatINR(num);
}

export default function CurrencyInput({ label, value, onChange, placeholder = '0', suffix, helpText, required = false }) {
  const [displayValue, setDisplayValue] = useState(value ? formatINR(value) : '');

  const handleChange = useCallback((e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    setDisplayValue(raw ? formatINR(num) : '');
    onChange(num);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    if (value) setDisplayValue(value.toString().replace(/,/g, ''));
  }, [value]);

  const handleBlur = useCallback(() => {
    setDisplayValue(value ? formatINR(value) : '');
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-sm font-bold text-prime uppercase tracking-wider block">
            {label} {required && <span className="text-danger">*</span>}
          </label>
        )}
        {value > 0 && (
          <p className="text-xs text-accent font-bold uppercase tracking-widest px-2 py-0.5 bg-accent/5 rounded-md border border-accent/10 transition-all duration-300">
            ₹{shortINR(value)}
          </p>
        )}
      </div>

      <div className="relative group">
        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-light/40 font-bold text-lg select-none group-focus-within:text-prime transition-colors duration-300">₹</span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="input-field pl-12 pr-12 text-lg font-semibold"
        />
        {suffix && (
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-text-light/40 text-xs font-bold uppercase tracking-widest">{suffix}</span>
        )}
      </div>
      {helpText && <p className="text-[11px] text-text-light/60 font-medium px-1 leading-relaxed">{helpText}</p>}
    </div>
  );
}
