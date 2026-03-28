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
    if (value) setDisplayValue(value.toString());
  }, [value]);

  const handleBlur = useCallback(() => {
    setDisplayValue(value ? formatINR(value) : '');
  }, [value]);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-medium">₹</span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="input-field pl-8"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs">{suffix}</span>
        )}
      </div>
      {helpText && <p className="text-xs text-muted">{helpText}</p>}
      {value > 0 && (
        <p className="text-xs text-gold font-medium">₹{shortINR(value)}</p>
      )}
    </div>
  );
}
