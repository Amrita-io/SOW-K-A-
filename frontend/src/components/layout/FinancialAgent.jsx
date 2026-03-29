import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../store/useAppStore';
import { SparkleIcon } from '../shared/icons/index';

const TIPS = {
  1: [
    "Basic salary typically ranges from 40-50% of CTC for maximum tax efficiency.",
    "Make sure you have a valid rent agreement for HRA exemption.",
    "EPF and ELSS are among the most popular Section 80C choices.",
  ],
  2: [
    "I'll find the most tax-efficient rent allocation between you and your partner.",
    "NPS offers an extra ₹50,000 deduction. Highly recommended for long-term wealth.",
    "Parents' insurance can save you as much as ₹50,000 in taxes.",
  ],
  3: [
    "Most couples under-budget for travel. I've added a 10% inflation buffer for your goals.",
    "Aim for an emergency fund covering at least 6 months of joint expenses.",
  ],
  4: [
    "Scanning for 'Expense Drag'. Switching to direct funds can save lakhs over time.",
    "Reducing fund overlap increases your portfolio's diversification strength.",
  ]
};

export default function FinancialAgent() {
  const { currentStep } = useAppStore();
  const [currentTip, setCurrentTip] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % (TIPS[currentStep]?.length || 1));
    }, 10000);
    return () => clearInterval(interval);
  }, [currentStep]);

  if (!TIPS[currentStep]) return null;

  return (
    <motion.div
      layout
      className={`bg-slate-50 rounded-[24px] border border-border/60 overflow-hidden transition-all duration-500 ${isMinimized ? 'p-3' : 'p-5'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
              <SparkleIcon className="w-3 h-3 text-prime" />
           </div>
           {!isMinimized && <span className="text-[9px] font-black uppercase tracking-widest text-accent">Intelligence Agent</span>}
        </div>
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-text-muted hover:text-prime transition-colors"
        >
          {isMinimized ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isMinimized && (
          <motion.div
            key={`${currentStep}-${currentTip}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-prime/80 text-[11px] font-medium leading-relaxed italic">
              "{TIPS[currentStep][currentTip]}"
            </p>
            
            <div className="mt-4 flex gap-1">
               {TIPS[currentStep].map((_, i) => (
                 <div key={i} className={`h-0.5 rounded-full transition-all duration-300 ${i === currentTip ? 'w-3 bg-accent' : 'w-1 bg-prime/10'}`} />
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
