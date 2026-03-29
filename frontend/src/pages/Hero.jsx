import React from 'react';
import { motion } from 'framer-motion';
import useAppStore from '../store/useAppStore';
import { TaxIcon, InvestIcon, InsuranceIcon, GoalIcon, MarketIcon, ArrowRightIcon } from '../components/shared/icons/index';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } };
const fadeIn  = { hidden: { opacity: 0 },        show: { opacity: 1,        transition: { duration: 0.8, ease: 'easeOut' } } };

const STATS = [
  { value: '7',    label: 'AI Agents' },
  { value: '42+',  label: 'Metrics Tracked' },
  { value: '100%', label: 'Local & Private' },
  { value: '₹0',   label: 'Cloud Cost' },
];

export default function Hero() {
  const setStep = useAppStore((s) => s.setStep);

  return (
    <div className="min-h-screen bg-white overflow-hidden flex flex-col">

      {/* ── Ambient glows ──────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(30,41,59,0.04) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'radial-gradient(#1E293B 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* ── Top nav strip ───────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-6 border-b border-border/10 backdrop-blur-sm bg-white/50">
        <div className="flex items-center gap-4">
          <img src="/sow.svg" width="34" height="34" className="rounded-xl shadow-lg shadow-black/5" alt="SOW Logo" />
          <span className="font-extrabold text-prime text-2xl tracking-tighter">SOW</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          Neural Engine Active
        </div>
      </nav>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row max-w-screen-2xl mx-auto w-full px-12 lg:px-24 gap-20 py-16 lg:py-32 items-center">

        {/* ── LEFT: Hero copy + CTA ──────────────────────────────── */}
        <motion.div
          className="flex-1 flex flex-col justify-center max-w-2xl text-center lg:text-left"
          variants={stagger} initial="hidden" animate="show"
        >
          <motion.div variants={fadeUp} className="mb-8 flex justify-center lg:justify-start">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-prime text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-prime/10">
              India's first Local-AI Platform
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black text-prime tracking-tight leading-[0.95] mb-10 max-w-xl mx-auto lg:mx-0">
            Stop losing <span className="text-accent italic">wealth</span> as a couple.
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-text-muted leading-relaxed mb-12 max-w-lg mx-auto lg:mx-0">
            SOW is an agent-driven optimizer that finds every leak in your household finance — from <span className="text-prime font-bold">tax inefficiencies</span> to <span className="text-prime font-bold">alpha-dragging portfolios.</span>
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center lg:items-start gap-6 mb-16">
            <motion.button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-4 bg-prime text-white text-[11px] font-black uppercase tracking-[0.3em] px-12 py-6 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:bg-black hover:-translate-y-1 transition-all duration-500"
              whileTap={{ scale: 0.96 }}
            >
              Initialize Audit
              <ArrowRightIcon className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-text-muted/60">
              <div className="p-2 h-10 w-10 flex items-center justify-center rounded-2xl bg-surface-muted/50 border border-border/40">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 </svg>
              </div>
              On-Device Confidentiality
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex gap-12 border-t border-border/20 pt-10 justify-center lg:justify-start">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-black text-prime tracking-tighter mb-1">{value}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── RIGHT: Hero Product Asset ────────────────────────── */}
        <motion.div
           className="flex-1 relative h-full flex items-center justify-center"
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-accent/5 rounded-full blur-3xl" />
           
           <div className="relative card !p-2 bg-white/40 backdrop-blur-2xl border-white/50 shadow-[0_40px_100px_rgba(0,0,0,0.08)] rounded-[48px] overflow-hidden transform lg:rotate-[-2deg] hover:rotate-0 transition-transform duration-1000">
             <div className="relative overflow-hidden rounded-[44px]">
               <img 
                 src="/hero_asset.png" 
                 alt="SOW Brand Asset" 
                 className="w-full max-w-lg aspect-square object-cover" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-prime/20 to-transparent" />
             </div>
             
             <div className="absolute -bottom-8 -right-8 p-10 rounded-[40px] bg-white border border-border/10 shadow-2xl shadow-prime/10">
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-2">Alpha Engine v2</p>
                <p className="text-xl font-black text-prime mb-4">42+ Micro-agents</p>
                <div className="flex gap-1.5">
                   {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent/20" />)}
                </div>
             </div>
           </div>
        </motion.div>

      </div>
    </div>
  );
}
