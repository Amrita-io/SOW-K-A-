import React from 'react';

export default function StepHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className="w-6 h-6 text-gold" />}
        <h1 className="heading-lg text-navy">{title}</h1>
      </div>
      {subtitle && <p className="text-muted text-body ml-9">{subtitle}</p>}
    </div>
  );
}
