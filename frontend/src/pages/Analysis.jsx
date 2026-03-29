import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../store/useAppStore';
import useAnalysisStore from '../store/useAnalysisStore';
import { analyzeCouple } from '../api/client';

/* ─── Agent definitions ─────────────────────────────────── */
const AGENTS = [
  { id: 'tax',       label: 'Tax Engine',        detail: 'Dual-regime optimization & HRA arbitrage' },
  { id: 'invest',    label: 'Investment LP',      detail: 'Linear programming SIP allocator' },
  { id: 'insurance', label: 'Insurance Auditor',  detail: 'Human Life Value coverage gap analysis' },
  { id: 'goals',     label: 'Goal Planner',       detail: 'Inflation-adjusted SIP projections' },
  { id: 'market',    label: 'Market Probe',       detail: 'XIRR audit & expense ratio detection' },
  { id: 'portfolio', label: 'Portfolio Scanner',  detail: 'Fund overlap matrix & alpha recovery' },
  { id: 'health',    label: 'Health Scorer',      detail: 'Combining 42+ financial metrics' },
];

/* ─── Synthesis messages ─────────────────────────────────── */
const SYNTHESIS_MSGS = [
  'Connecting agent results…',
  'Building your couple\'s financial story…',
  'Crafting AI narrative via Ollama…',
  'Finalizing priority action plan…',
];

export default function Analysis() {
  const { partnerA, partnerB, goals, holdings, riskProfile, monthlyExpenses, emergencyFundExisting, setStep } =
    useAppStore();
  const error = useAnalysisStore((s) => s.error);
  const { setResults, setLoading, setError } = useAnalysisStore();

  const [phase, setPhase]               = useState('agents'); // 'agents' | 'synthesis' | 'done' | 'error'
  const [activeAgentIdx, setActiveAgentIdx] = useState(0);
  const [completedIds, setCompletedIds] = useState([]);
  const [synthMsgIdx, setSynthMsgIdx]   = useState(0);

  /* ── Run analysis ─────────────────────────────────────── */
  const runAnalysis = useCallback(() => {
    setPhase('agents');
    setActiveAgentIdx(0);
    setCompletedIds([]);
    setSynthMsgIdx(0);
    setLoading(true);
    setError(null);

    const payload = {
      partner_a: partnerA, partner_b: partnerB, goals, holdings,
      risk_profile: riskProfile, monthly_expenses: monthlyExpenses,
      emergency_fund_existing: emergencyFundExisting,
    };

    analyzeCouple(payload)
      .then((data) => {
        setPhase('done');
        setResults(data);
        setTimeout(() => setStep(6), 800);
      })
      .catch((err) => {
        const detail = err.response?.data?.detail || err.response?.data || err.message;
        setError(typeof detail === 'string' ? detail : 'Connection error — is the backend running?');
        setPhase('error');
        setLoading(false);
      });
  }, [partnerA, partnerB, goals, holdings, riskProfile, monthlyExpenses, emergencyFundExisting,
      setLoading, setError, setResults, setStep]);

  /* ── Agent ticker (cosmetic steps) ────────────────────── */
  useEffect(() => {
    if (phase !== 'agents') return;
    const interval = setInterval(() => {
      setActiveAgentIdx((prev) => {
        const next = prev + 1;
        setCompletedIds((c) => [...c, AGENTS[prev].id]);
        if (next >= AGENTS.length) {
          clearInterval(interval);
          setPhase('synthesis');
          return prev;
        }
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [phase]);

  /* ── Synthesis ticker ──────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'synthesis') return;
    const interval = setInterval(() => {
      setSynthMsgIdx((p) => (p + 1) % SYNTHESIS_MSGS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [phase]);

  /* ── Kick off ──────────────────────────────────────────── */
  useEffect(() => { runAnalysis(); }, []); // eslint-disable-line

  const isError = phase === 'error';

  return (
    <div className="absolute inset-0 bg-white flex items-center justify-center overflow-hidden">

      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(234,179,8,0.06) 0%, transparent 100%)' }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-xl px-8 text-center">

        {/* ─── SOW Logo Orb ── */}
        <div className="relative flex items-center justify-center mb-12" style={{ width: 160, height: 160 }}>
          {/* Breathing rings */}
          {[160, 120, 84].map((size, i) => (
            <motion.div
              key={size}
              className="absolute rounded-full border border-accent/20"
              style={{ width: size, height: size }}
              animate={{ scale: [1, 1 + 0.06 * (i + 1), 1], opacity: [0.5, 0.15, 0.5] }}
              transition={{ duration: 2.4 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            />
          ))}

          {/* Core disc */}
          <motion.div
            className="absolute w-16 h-16 rounded-full bg-accent shadow-[0_0_40px_rgba(234,179,8,0.35)]"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Inline SOW symbol */}
          <svg viewBox="0 0 80 96" width="36" height="44" fill="none" className="relative z-10">
            <ellipse cx="40" cy="22" rx="32" ry="14" fill="#0F172A" />
            <ellipse cx="40" cy="74" rx="32" ry="14" fill="#1E293B" />
            <path d="M8 22 Q8 50 40 50 Q72 50 72 78" stroke="rgba(234,179,8,0.5)" strokeWidth="1.5" fill="none"/>
            <path d="M8 22 Q40 30 72 22" stroke="#EAB308" strokeWidth="1" fill="none" opacity="0.8"/>
            <path d="M8 74 Q40 82 72 74" stroke="#EAB308" strokeWidth="1" fill="none" opacity="0.8"/>
          </svg>
        </div>

        {/* ─── State: Running ── */}
        <AnimatePresence mode="wait">
          {!isError && (
            <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">

              {/* Phase label */}
              <motion.div
                className="inline-block mb-6 px-4 py-1 rounded-full bg-accent/10 border border-accent/20 text-[9px] font-black uppercase tracking-[0.3em] text-accent"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {phase === 'synthesis' ? 'AI Synthesis' : phase === 'done' ? 'Complete' : 'Live Agentic Audit'}
              </motion.div>

              {/* Agent list */}
              {phase === 'agents' && (
                <div className="space-y-2 text-left">
                  {AGENTS.map((agent, idx) => {
                    const done    = completedIds.includes(agent.id);
                    const active  = idx === activeAgentIdx;
                    return (
                      <motion.div
                        key={agent.id}
                        className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-500 ${
                          active  ? 'bg-accent/10 border border-accent/30' :
                          done    ? 'bg-slate-50 border border-border/30 opacity-60' :
                          'opacity-20 border border-transparent'
                        }`}
                        layout
                      >
                        {/* Status dot */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-500 ${
                          done   ? 'bg-emerald-500' :
                          active ? 'bg-accent animate-pulse' :
                          'bg-slate-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-black uppercase tracking-widest leading-none mb-0.5 transition-colors ${active ? 'text-prime' : 'text-text-muted'}`}>
                            {agent.label}
                          </p>
                          {active && (
                            <motion.p
                              className="text-[9px] text-accent/80 leading-none font-medium truncate"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              {agent.detail}
                            </motion.p>
                          )}
                        </div>
                        {done && (
                          <motion.svg
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="w-4 h-4 text-emerald-500 flex-shrink-0"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                          </motion.svg>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Synthesis phase */}
              {(phase === 'synthesis' || phase === 'done') && (
                <motion.div
                  className="mt-4 px-8 py-10 rounded-3xl border-2 border-accent/20 bg-accent/[0.03] text-center"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={synthMsgIdx}
                      className="text-lg font-black text-prime tracking-tight"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {phase === 'done' ? '✓ Analysis Complete!' : SYNTHESIS_MSGS[synthMsgIdx]}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-[10px] text-text-muted uppercase tracking-[0.25em] mt-3 font-bold">
                    {phase === 'done' ? 'Loading your results…' : 'Ollama local intelligence at work'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── State: Error ── */}
          {isError && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-6">
              <div className="p-8 rounded-3xl border-2 border-red-100 bg-red-50 text-left">
                <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-2">Analysis Failed</p>
                <p className="text-sm text-red-700 leading-relaxed">{error}</p>
              </div>
              <div className="flex gap-4">
                <button onClick={runAnalysis} className="flex-1 py-4 bg-prime text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all">
                  Retry
                </button>
                <button onClick={() => setStep(4)} className="flex-1 py-4 bg-white border-2 border-prime/10 text-prime rounded-2xl font-black uppercase tracking-widest text-xs hover:border-prime transition-all">
                  Go Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
