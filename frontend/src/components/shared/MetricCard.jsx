import React from 'react';

export default function MetricCard({ label, value, subtext, icon: Icon, color = 'gold', className = '' }) {
  const colorMap = {
    gold: 'text-gold',
    emerald: 'text-emerald',
    danger: 'text-danger',
    amber: 'text-amber',
    navy: 'text-navy',
  };

  return (
    <div className={`card flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2 text-muted text-sm font-medium">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
      </div>
      <div className={`metric-value ${colorMap[color] || 'text-gold'}`}>
        {value}
      </div>
      {subtext && <p className="text-muted text-xs">{subtext}</p>}
    </div>
  );
}
