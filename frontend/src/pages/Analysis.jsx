import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '../store/useAppStore';
import useAnalysisStore from '../store/useAnalysisStore';
import { analyzeCouple } from '../api/client';

const STATUS_MESSAGES = [
  "Analyzing 47 tax scenarios...",
  "Running dual-regime optimization across both incomes...",
  "Calculating HRA arbitrage — finding the better claimant...",
  "Building joint SIP allocation with linear programming...",
  "Auditing term cover using Human Life Value method...",
  "Constructing 15-year goal roadmap with inflation modeling...",
  "Fetching live market signals for your fund portfolio...",
  "Computing true XIRR and fund overlap matrix...",
  "Scoring your money health across 6 dimensions...",
  "Synthesizing all findings with Gemini AI...",
];

const AGENTS = [
  'Tax Optimizer', 'Investment LP', 'Insurance Audit', 'Goal Planner',
  'Market Intel', 'Portfolio Analyzer', 'Health Scorer',
];

export default function Analysis() {
  const { partnerA, partnerB, goals, holdings, riskProfile, monthlyExpenses, emergencyFundExisting, setStep } = useAppStore();
  const { setResults, setLoading, setError } = useAnalysisStore();
  const [statusIdx, setStatusIdx] = useState(0);
  const [completedAgents, setCompletedAgents] = useState([]);
  const [failed, setFailed] = useState(false);
  const called = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIdx(prev => (prev + 1) % STATUS_MESSAGES.length);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const agentTimer = setInterval(() => {
      setCompletedAgents(prev => prev.length < AGENTS.length ? [...prev, AGENTS[prev.length]] : prev);
    }, 1800);
    return () => clearInterval(agentTimer);
  }, []);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    setLoading(true);

    const payload = {
      partner_a: partnerA,
      partner_b: partnerB,
      goals,
      holdings,
      risk_profile: riskProfile,
      monthly_expenses: monthlyExpenses,
      emergency_fund_existing: emergencyFundExisting,
    };

    analyzeCouple(payload)
      .then(data => {
        setResults(data);
        setTimeout(() => setStep(6), 500);
      })
      .catch(err => {
        console.error('Analysis failed:', err);
        setError(err.message || 'Analysis failed');
        setFailed(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-4">
      <motion.div
        className="w-24 h-24 rounded-full border-4 border-gold/30 flex items-center justify-center mb-8 gold-glow"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gold animate-pulse" />
        </div>
      </motion.div>

      <motion.p
        key={statusIdx}
        className="text-white text-lg text-center mb-8 max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {STATUS_MESSAGES[statusIdx]}
      </motion.p>

      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {AGENTS.map(agent => (
          <div key={agent}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500 ${
              completedAgents.includes(agent)
                ? 'bg-gold text-navy'
                : 'bg-white/10 text-white/40'
            }`}>
            {agent}
          </div>
        ))}
      </div>

      {failed && (
        <div className="mt-8 text-center">
          <p className="text-danger mb-4">Analysis encountered an error. Please try again.</p>
          <button onClick={() => { called.current = false; setFailed(false); setLoading(true); }}
            className="btn-primary">
            Retry Analysis
          </button>
          <button onClick={() => setStep(4)} className="ml-4 text-white/60 hover:text-white text-sm">
            Go Back
          </button>
        </div>
      )}
    </div>
  );
}
