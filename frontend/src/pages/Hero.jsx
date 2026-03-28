import React from 'react';
import { motion } from 'framer-motion';
import useAppStore from '../store/useAppStore';
import { TaxIcon, InvestIcon, InsuranceIcon, GoalIcon, MarketIcon, SparkleIcon, ArrowRightIcon } from '../components/shared/icons/index';

const features = [
  { icon: TaxIcon, label: 'Tax Optimizer' },
  { icon: InvestIcon, label: 'Investment Engine' },
  { icon: InsuranceIcon, label: 'Insurance Audit' },
  { icon: GoalIcon, label: 'Goal Planner' },
  { icon: MarketIcon, label: 'Market Intel' },
];

export default function Hero() {
  const { setStep, loadDemoData } = useAppStore();

  const handleStart = () => setStep(1);
  const handleDemo = () => { loadDemoData(); setStep(5); };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />
      
      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Logo */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tight-heading text-gold">
            CoupleWealth
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-white mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          India's First Joint Financial Intelligence Engine
        </motion.h2>

        <motion.p
          className="text-gray-400 text-lg mb-10 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Discover exactly how much money you're losing together — and recover it
        </motion.p>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm">
              <Icon className="w-4 h-4 text-gold" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button onClick={handleStart} className="btn-primary text-lg px-10 py-4 shadow-gold">
            Start your financial analysis
            <ArrowRightIcon className="w-5 h-5" />
          </button>
          <button onClick={handleDemo} className="btn-secondary text-lg px-10 py-4 border-white/30 text-white hover:bg-white hover:text-navy">
            <SparkleIcon className="w-5 h-5" />
            Try with demo data
          </button>
        </motion.div>

        {/* Bottom strip */}
        <motion.p
          className="text-gray-500 text-xs max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Unlike Monarch Money or ET Money — built exclusively for Indian couples with dual-income tax optimization and CAMS intelligence
        </motion.p>
      </motion.div>
    </div>
  );
}
