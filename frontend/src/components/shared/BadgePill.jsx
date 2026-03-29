import React from 'react';

const colorClasses = {
  accent: 'bg-accent/10 text-accent border border-accent/20',
  emerald: 'bg-emerald/10 text-emerald-dark border border-emerald/20',
  danger: 'bg-danger/10 text-danger border border-danger/20',
  amber: 'bg-amber/10 text-amber border border-amber/20',
  prime: 'bg-prime/5 text-prime border border-prime/10',
  gray: 'bg-surface-muted text-text-light border border-border/50',
};

export default function BadgePill({ children, color = 'accent', icon: Icon, className = '' }) {
  return (
    <span className={`${colorClasses[color] || colorClasses.accent} ${className} inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}
