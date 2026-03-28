import React from 'react';

export default function SectionTab({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex flex-wrap gap-1.5 p-1.5 bg-gray-50 rounded-xl border border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={activeTab === tab.id ? 'section-tab-active' : 'section-tab-inactive'}
        >
          <span className="flex items-center gap-1.5">
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
