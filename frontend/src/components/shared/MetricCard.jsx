import React from 'react';

export default function MetricCard({ label, value, subtext, icon: Icon, color = 'accent', className = '' }) {
  const colorMap = {
    accent: 'text-accent',
    emerald: 'text-emerald',
    danger: 'text-danger',
    amber: 'text-amber',
    prime: 'text-prime',
  };

  const borderMap = {
    accent: 'border-accent/10',
    emerald: 'border-emerald/10',
    danger: 'border-danger/10',
    amber: 'border-amber/10',
    prime: 'border-prime/10',
  };

  return (
    <div className={`card overflow-hidden relative flex flex-col gap-1 ${borderMap[color] || ''} ${className}`}>
      <div className="flex items-center gap-2 text-text-light text-xs font-medium uppercase tracking-wider">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span>{label}</span>
      </div>
      <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${colorMap[color] || 'text-prime'}`}>
        {value}
      </div>
      {subtext && <p className="text-text-muted text-[11px] leading-tight mt-1">{subtext}</p>}
      
      {/* Subtle background decoration */}
      <div className={`absolute top-0 right-0 p-2 opacity-[0.03] ${colorMap[color] || 'text-prime'}`}>
        {Icon && <Icon className="w-12 h-12" />}
      </div>
    </div>
  );
}
