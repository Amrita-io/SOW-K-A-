import React from 'react';

const colorClasses = {
  gold: 'badge-gold',
  emerald: 'badge-emerald',
  danger: 'badge-danger',
  amber: 'badge-amber',
  navy: 'bg-navy/10 text-navy',
  gray: 'bg-gray-100 text-gray-600',
};

export default function BadgePill({ children, color = 'gold', icon: Icon, className = '' }) {
  return (
    <span className={`${colorClasses[color] || colorClasses.gold} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}
