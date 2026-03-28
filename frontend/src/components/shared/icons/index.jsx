import React from 'react';

const icon = (path, vb = '0 0 24 24') => ({ className = 'w-5 h-5', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {path}
  </svg>
);

export const TaxIcon = icon(<><path d="M9 7h6m-6 4h6m-4 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/><path d="M9 3v18"/></>);
export const InvestIcon = icon(<><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></>);
export const InsuranceIcon = icon(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>);
export const GoalIcon = icon(<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>);
export const MarketIcon = icon(<><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-6"/></>);
export const HealthIcon = icon(<><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>);
export const WhatIfIcon = icon(<><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="12" r="10"/><path d="M12 17h.01"/></>);
export const CheckIcon = icon(<><polyline points="20 6 9 17 4 12"/></>);
export const AlertIcon = icon(<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>);
export const ArrowRightIcon = icon(<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>);
export const DownloadIcon = icon(<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>);
export const GoldCoinIcon = icon(<><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h6M9 15h6"/></>);
export const ShieldIcon = icon(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>);
export const ChartIcon = icon(<><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></>);
export const HomeIcon = icon(<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>);
export const ChildIcon = icon(<><circle cx="12" cy="5" r="3"/><path d="M12 8v4m-4 4h8m-6-4l-2 4m6-4l2 4"/></>);
export const RetirementIcon = icon(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>);
export const EmergencyIcon = icon(<><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></>);
export const PartnerIcon = icon(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>);
export const UploadIcon = icon(<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>);
export const CloseIcon = icon(<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>);
export const CopyIcon = icon(<><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>);
export const SparkleIcon = icon(<><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" fill="currentColor" stroke="none"/></>);
