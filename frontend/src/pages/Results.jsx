import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAnalysisStore from '../store/useAnalysisStore';
import useAppStore from '../store/useAppStore';
import { formatINR, shortINR } from '../components/inputs/CurrencyInput';
import SectionTab from '../components/shared/SectionTab';
import BadgePill from '../components/shared/BadgePill';
import MetricCard from '../components/shared/MetricCard';
import {
  TaxIcon, InvestIcon, InsuranceIcon, GoalIcon, MarketIcon,
  HealthIcon, WhatIfIcon, DownloadIcon, CheckIcon, AlertIcon,
  ShieldIcon, ChartIcon, ArrowRightIcon,
} from '../components/shared/icons/index';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend,
  LineChart, Line, ComposedChart, Area,
} from 'recharts';
import { downloadReport } from '../api/client';

const TABS = [
  { id: 'actions', label: 'Action Plan', icon: CheckIcon },
  { id: 'tax', label: 'Tax Breakdown', icon: TaxIcon },
  { id: 'invest', label: 'Investments', icon: InvestIcon },
  { id: 'goals', label: 'Goal Roadmap', icon: GoalIcon },
  { id: 'insurance', label: 'Insurance', icon: InsuranceIcon },
  { id: 'market', label: 'Market Intel', icon: MarketIcon },
  { id: 'whatif', label: 'What-If', icon: WhatIfIcon },
  { id: 'report', label: 'Report', icon: DownloadIcon },
];

const COLORS = ['#EAB308', '#1E293B', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B'];

export default function Results() {
  const results = useAnalysisStore(s => s.results);
  const { setStep } = useAppStore();
  const [activeTab, setActiveTab] = useState('actions');

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-text-muted mb-4 font-bold uppercase tracking-widest text-xs">No analysis results available.</p>
          <button onClick={() => setStep(0)} className="btn-primary">Start Over</button>
        </div>
      </div>
    );
  }

  const r = results;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Summary */}
      <div className="bg-white border-b border-border/40 pb-20 pt-10">
        <div className="max-w-screen-2xl mx-auto px-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-16">
            <div className="flex-1">
               <p className="text-accent font-black uppercase tracking-[0.4em] text-[10px] mb-4">Neural Intelligence Summary</p>
               <h1 className="text-6xl md:text-8xl font-black text-prime tracking-tighter leading-[0.9] mb-6">
                 Joint Household<br/><span className="text-accent">Optimization</span>
               </h1>
               <div className="flex flex-wrap gap-3">
                 <div className="badge border-accent/20 bg-accent/5 text-prime">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                   {r.partner_a?.name}: {r.partner_a?.recommended_regime?.toUpperCase()}
                 </div>
                 <div className="badge border-accent/20 bg-accent/5 text-prime">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse" />
                   {r.partner_b?.name}: {r.partner_b?.recommended_regime?.toUpperCase()}
                 </div>
               </div>
            </div>

            <div className="text-left md:text-right">
               <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-2 opacity-60">Annual Recovery Potential</p>
               <div className="text-6xl md:text-8xl font-black text-prime tracking-tighter leading-none">
                 ₹{formatINR(r.headline_saving)}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-4">
            <MetricCard label="Tax Recovery" value={`₹${shortINR(r.headline_breakdown?.tax_saving)}`} color="accent" icon={TaxIcon} />
            <MetricCard label="Wealth Gain" value={`₹${shortINR(r.headline_breakdown?.investment_gain)}`} color="emerald" icon={InvestIcon} />
            <MetricCard label="Risk Audit" value={`₹${shortINR(r.headline_breakdown?.insurance_saving)}`} color="prime" icon={InsuranceIcon} />
            <MetricCard label="Market Intel" value={`₹${shortINR(r.headline_breakdown?.market_alpha_recovery)}`} color="amber" icon={MarketIcon} />
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-10 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Navigation */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="sticky top-20 space-y-1">
              <div className="card !p-5 mb-6 shadow-xl shadow-prime/5 text-center bg-white border border-border/40 relative overflow-hidden group hover:border-accent/40 transition-all">
                <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-2 opacity-60">Finance Score</p>
                <div className="text-4xl font-black text-prime leading-none mb-1 group-hover:text-accent transition-colors">{r.health_score?.total || 0}</div>
                <div className="text-[9px] font-black tracking-widest text-accent uppercase px-3 py-1 bg-accent/5 rounded-full inline-block border border-accent/10">Grade {r.health_score?.grade || 'B'}</div>
                
                {/* Engine Intelligence Proof */}
                <div className="mt-8 pt-4 border-t border-border/40">
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-60 italic">Intelligence Engine</p>
                  <div className={`badge ${r.engine?.includes('Ollama') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'} flex flex-col items-center justify-center gap-1.5 py-2 px-3 mx-auto max-w-fit rounded-xl border`}>
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${r.engine?.includes('Ollama') ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                       <span className="text-[9px] font-black whitespace-nowrap">{r.engine || 'Local Math Engine'}</span>
                    </div>
                    {r.debug_trace && !r.engine?.includes('Ollama') && (
                      <p className="text-[7px] leading-tight opacity-70 mt-1 max-w-[150px] overflow-hidden text-center">{r.debug_trace}</p>
                    )}
                  </div>
                </div>
              </div>

              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-accent/10 text-prime shadow-lg shadow-accent/5 -translate-x-2 border-l-4 border-accent' 
                      : 'text-text-muted hover:text-prime hover:bg-surface-muted/50'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-accent' : 'text-text-light opacity-50'}`} />
                  {tab.label}
                  {activeTab === tab.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                </button>
              ))}
            </div>
          </div>

          {/* Panel */}
          <div className="flex-1 min-h-[600px]">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'actions' && <ActionsTab actions={r.priority_actions} />}
              {activeTab === 'tax' && <TaxTab data={r} />}
              {activeTab === 'invest' && <InvestTab data={r} />}
              {activeTab === 'goals' && <GoalsTab data={r} />}
              {activeTab === 'insurance' && <InsuranceTab data={r} />}
              {activeTab === 'market' && <MarketTab data={r} />}
              {activeTab === 'whatif' && <WhatIfTab data={r} />}
              {activeTab === 'report' && <ReportTab data={r} />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TAB 1: ACTION PLAN ──────────────────────────────── */
function ActionsTab({ actions = [] }) {
  return (
    <div className="space-y-12">
       <div className="flex items-center gap-6 mb-12">
         <h3 className="text-4xl font-black text-prime tracking-tight">Priority Execution</h3>
         <div className="px-5 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-black text-accent uppercase tracking-widest italic animate-pulse">Neural Audit Ready</div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
         {actions.map((a, i) => (
          <motion.div
            key={a.rank}
            className="card p-10 flex flex-col gap-8 group relative overflow-hidden h-full shadow-2xl shadow-prime/5 border-border/40 hover:border-accent/40"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Background design */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <span className="text-9xl font-black text-prime select-none">{a.rank}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="w-16 h-16 rounded-[28px] bg-prime text-white flex items-center justify-center text-2xl font-black shadow-2xl shadow-prime/20 transition-all group-hover:bg-accent group-hover:text-prime">
                {a.rank}
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold text-sm tracking-tighter">
                ₹{formatINR(a.annual_saving)}/yr
              </div>
            </div>
            
            <div className="flex-1">
               <h4 className="text-2xl font-black text-prime mb-5 leading-tight">{a.title}</h4>
               <p className="text-sm font-medium text-text-muted leading-relaxed mb-10">{a.detail}</p>
            </div>

            <div className="mt-auto flex items-center gap-8 border-t border-border/40 pt-10 text-[10px] font-black uppercase tracking-widest text-text-light/60">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-accent" />
                 Effort: {a.effort}
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-slate-400" />
                 Time: {a.timeframe}
               </div>
            </div>
          </motion.div>
        ))}
       </div>
    </div>
  );
}

/* ─── TAB 2: TAX BREAKDOWN ─────────────────────────────── */
function TaxTab({ data }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
         <h3 className="text-2xl font-black text-prime tracking-tight">Tax Optimization</h3>
         <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[9px] font-black text-accent uppercase tracking-widest italic">AI Insight</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard label={`${data.partner_a?.name} Saving`} value={`₹${formatINR(data.partner_a?.tax_saving)}`} subtext={`${data.partner_a?.recommended_regime?.toUpperCase()} is optimal`} icon={TaxIcon} />
        <MetricCard label={`${data.partner_b?.name} Saving`} value={`₹${formatINR(data.partner_b?.tax_saving)}`} subtext={`${data.partner_b?.recommended_regime?.toUpperCase()} is optimal`} icon={TaxIcon} />
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-12">
        <div className="flex-1 card p-8 bg-white border-2 border-border/40 group hover:border-accent/20 transition-all relative overflow-hidden">
           <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all" />
           <div className="flex items-center justify-between mb-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-text-light">Current Scenario</h4>
              <div className="badge bg-red-50 text-red-600 border-red-100">Baseline</div>
           </div>
           <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-text-light uppercase mb-1">Combined Monthly Tax</p>
                <p className="text-2xl font-black text-prime">₹{formatINR((data.partner_a?.current_tax + data.partner_b?.current_tax) / 12)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-text-light uppercase mb-1">Effective Leakage</p>
                <p className="text-2xl font-black text-red-500">₹{formatINR(data.headline_saving / 12)}<span className="text-xs font-bold text-text-muted ml-1 italic">/month</span></p>
              </div>
           </div>
        </div>

        <div className="flex-1 card p-8 bg-accent/[0.03] border-2 border-accent/20 relative overflow-hidden group hover:border-accent/40 transition-all">
           <div className="absolute top-0 right-0 p-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <TaxIcon className="w-5 h-5 text-accent" />
              </div>
           </div>
           <div className="flex items-center justify-between mb-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-accent">AI Strategy</h4>
              <div className="badge bg-emerald-50 text-emerald-600 border-emerald-100 italic">Optimized</div>
           </div>
           <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-accent uppercase mb-1">Optimized Monthly Tax</p>
                <p className="text-2xl font-black text-prime">₹{formatINR((data.partner_a?.optimized_tax + data.partner_b?.optimized_tax) / 12)}</p>
              </div>
              <div className="p-4 bg-white/50 border border-accent/10 rounded-xl relative z-10">
                <p className="text-[9px] font-black text-accent uppercase mb-2">AI Recommendation</p>
                <p className="text-[11px] font-bold text-prime leading-relaxed italic line-clamp-2">"{data.regime_explanation}"</p>
              </div>
           </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
           <span className="w-2 h-2 rounded-full bg-accent animate-ping inline-block" />
           Technical Yield Comparison
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ name: 'Status Quo', Old: (data.partner_a?.current_tax + data.partner_b?.current_tax), Optimized: 0 }, { name: 'SOW Optimized', Old: 0, Optimized: (data.partner_a?.optimized_tax + data.partner_b?.optimized_tax) }]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748B' }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="Old" fill="#FCA5A5" radius={[6,6,0,0]} name="Baseline Tax" barSize={60} />
              <Bar dataKey="Optimized" fill="#EAB308" radius={[6,6,0,0]} name="Optimized Tax" barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ─── TAB 3: INVESTMENTS ───────────────────────────────── */
function InvestTab({ data }) {
  const savingA = data.partner_a?.tax_saving || 0;
  const savingB = data.partner_b?.tax_saving || 0;
  
  const pieData = [
    { name: data.partner_a?.name, value: savingA },
    { name: data.partner_b?.name, value: savingB },
  ].filter(d => d.value > 0);

  const totalSaving = savingA + savingB;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
         <h3 className="text-2xl font-black text-prime tracking-tight">Investment Audit</h3>
         <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[9px] font-black text-accent uppercase tracking-widest italic">AI Insight</div>
      </div>
      
      <div className="card p-10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
        {totalSaving > 0 ? (
          <>
            <div className="w-full md:w-1/2 h-[260px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={70} 
                    outerRadius={100} 
                    paddingAngle={10} 
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#EAB308" />
                    <Cell fill="#FDE047" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    formatter={(v) => `₹${formatINR(v)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-black text-text-light uppercase tracking-widest opacity-40">Portfolio Value</p>
                <p className="text-2xl font-black text-prime tracking-tighter">₹{formatINR(totalSaving)}</p>
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-text-light opacity-60 mb-8 italic">Saving Contribution</h4>
              <div className="space-y-8">
                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                     <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                     <span className="text-sm font-bold text-prime group-hover:text-accent transition-colors">{data.partner_a?.name}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-sm font-black text-prime block leading-none">₹{formatINR(savingA)}</span>
                     <span className="text-[9px] font-black text-text-light opacity-40 uppercase tracking-widest">Target Contribution</span>
                   </div>
                </div>
                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                     <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
                     <span className="text-sm font-bold text-prime group-hover:text-accent transition-colors">{data.partner_b?.name}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-sm font-black text-prime block leading-none">₹{formatINR(savingB)}</span>
                     <span className="text-[9px] font-black text-text-light opacity-40 uppercase tracking-widest">Target Contribution</span>
                   </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center text-text-muted mb-6">
               <InvestIcon className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-black text-prime uppercase italic">No savings identified yet.</p>
            <p className="text-xs text-text-muted mt-2">Try re-running the tax optimizer or providing more deduction data.</p>
          </div>
        )}
      </div>

      {data.hra_explanation && (
        <div className="p-10 border-4 border-prime rounded-[40px] bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
             <ShieldIcon className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-prime shadow-lg shadow-accent/20">
              <ShieldIcon className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-prime">HRA INTELLIGENCE AGENT</h4>
          </div>
          <p className="text-base font-medium text-text-muted leading-relaxed italic pr-12">“{data.hra_explanation}”</p>
        </div>
      )}
    </div>
  );
}

/* ─── TAB 4: GOAL ROADMAP ──────────────────────────────── */
function GoalsTab({ data }) {
  const retirement = data.retirement;
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
         <h3 className="text-2xl font-black text-prime tracking-tight">Goal Roadmap</h3>
         <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[9px] font-black text-accent uppercase tracking-widest italic">AI Insight</div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {(data.goal_plans || []).map(g => (
          <div key={g.name} className="card p-8 group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                   <GoalIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-prime leading-none mb-2">{g.name}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-light opacity-60">Target Year: {g.target_year}</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${g.on_track ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                {g.on_track ? 'On Track' : 'Gap Identified'}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div><span className="text-[10px] font-black uppercase tracking-widest text-text-light mb-1 block opacity-60">Future Cost</span><span className="text-sm font-black text-prime">₹{formatINR(g.future_cost)}</span></div>
              <div><span className="text-[10px] font-black uppercase tracking-widest text-text-light mb-1 block opacity-60">Req. SIP</span><span className="text-sm font-black text-accent">₹{formatINR(g.required_monthly_sip)}</span></div>
              <div><span className="text-[10px] font-black uppercase tracking-widest text-text-light mb-1 block opacity-60">Allocated</span><span className="text-sm font-black text-prime">₹{formatINR(g.current_sip_allocated)}</span></div>
              <div><span className="text-[10px] font-black uppercase tracking-widest text-text-light mb-1 block opacity-60">Today's Cost</span><span className="text-sm font-bold text-text-muted">₹{formatINR(g.present_cost)}</span></div>
            </div>

            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min(100, g.required_monthly_sip > 0 ? (g.current_sip_allocated / g.required_monthly_sip) * 100 : 0)}%` }}
                 className={`absolute inset-0 rounded-full ${g.on_track ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-accent shadow-[0_0_12px_rgba(234,179,8,0.4)]'}`}
               />
            </div>
          </div>
        ))}
      </div>

      {retirement && (
         <div className="mt-12 card p-10 bg-white border-4 border-accent/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <InvestIcon className="w-32 h-32 text-accent" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-10">Retirement (FIRE) Engine</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-text-light">FIRE Independence No.</p>
                 <p className="text-3xl font-black text-accent tracking-tighter">₹{formatINR(retirement.fire_number)}</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-text-light">Projected Corpus</p>
                 <p className="text-3xl font-black text-prime tracking-tighter">₹{formatINR(retirement.projected_corpus)}</p>
              </div>
               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-light">Retirement Age</p>
                  <div className="flex items-center gap-4">
                     <div className="text-center">
                        <p className="text-[10px] font-black text-red-400">Current</p>
                        <p className="text-xl font-black text-prime">{retirement.current_retirement_age}</p>
                     </div>
                     <div className="w-8 h-px bg-border" />
                     <div className="text-center">
                        <p className="text-[10px] font-black text-emerald-600">Optimized</p>
                        <p className="text-xl font-black text-accent">{retirement.optimized_retirement_age}</p>
                     </div>
                  </div>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}

/* ─── TAB 5: INSURANCE ─────────────────────────────────── */
function InsuranceTab({ data }) {
  const ins = data.insurance || {};
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
         <h3 className="text-2xl font-black text-prime tracking-tight">Insurance Audit</h3>
         <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[9px] font-black text-accent uppercase tracking-widest italic">AI Insight</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[{ key: 'partner_a', label: data.partner_a?.name }, { key: 'partner_b', label: data.partner_b?.name }].map(({ key, label }) => {
          const p = ins[key] || {};
          const hasGap = (p.gap || 0) > 0;
          return (
            <div key={key} className="card p-8 border-2 border-slate-50 flex flex-col justify-between hover:border-accent/30 transition-all shadow-xl shadow-prime/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-[22px] flex items-center justify-center transition-colors ${hasGap ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <ShieldIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-prime leading-none">{label}</h4>
                </div>
                <div className={`badge font-black px-4 py-1.5 rounded-xl border ${hasGap ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                  {hasGap ? 'Coverage Gap' : 'Fully Covered'}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div><p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1 opacity-60">Required</p><p className="text-lg font-black text-prime tracking-tighter">₹{shortINR(p.required_term)}</p></div>
                <div><p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1 opacity-60">Active</p><p className="text-lg font-black text-prime tracking-tighter">₹{shortINR(p.existing_term)}</p></div>
                <div><p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1 opacity-60">Deficit</p><p className={`text-lg font-black tracking-tighter ${hasGap ? 'text-red-600' : 'text-emerald-600'}`}>₹{shortINR(p.gap)}</p></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-8 bg-accent/5 border-2 border-accent/20 rounded-3xl flex justify-between items-center">
         <h4 className="text-xs font-black uppercase tracking-widest text-prime">80D Tax Recovery Available</h4>
         <p className="text-2xl font-black text-prime">₹{formatINR(ins.annual_80d_saving_available)}<span className="text-xs opacity-40 ml-1">/yr</span></p>
      </div>
    </div>
  );
}

/* ─── TAB 6: MARKET INTELLIGENCE ───────────────────────── */
function MarketTab({ data }) {
  const portfolio = data.portfolio || {};
  const signals = data.market_signals || [];
  const overlaps = portfolio.overlap_warnings || [];

  const hasHoldings = portfolio.fund_signals && portfolio.fund_signals.length > 0;
  const fundNames = (portfolio.fund_signals || []).map(f => f.fund_name.split(' ').slice(0, 2).join(' '));
  const matrixSize = Math.max(3, fundNames.length);
  const matrix = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
  
  for (let i = 0; i < matrixSize; i++) matrix[i][i] = 100;
  
  overlaps.forEach(o => {
    const idxA = (portfolio.fund_signals || []).findIndex(f => f.fund_name === o.fund_a);
    const idxB = (portfolio.fund_signals || []).findIndex(f => f.fund_name === o.fund_b);
    if (idxA !== -1 && idxB !== -1) {
       matrix[idxA][idxB] = o.overlap_pct;
       matrix[idxB][idxA] = o.overlap_pct;
    }
  });

  if (!hasHoldings) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-surface-muted flex items-center justify-center text-text-muted">
           <MarketIcon className="w-8 h-8 opacity-20" />
        </div>
        <h3 className="text-xl font-black text-prime uppercase italic">Mirroring Empty Vaults</h3>
        <p className="text-sm text-text-muted max-w-sm">No portfolio holdings provided. Provide your direct mutual fund portfolio for a deep-regime risk audit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4 mb-8">
         <h3 className="text-2xl font-black text-prime tracking-tight">Market Intelligence</h3>
         <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[9px] font-black text-accent uppercase tracking-widest italic">AI Insight</div>
      </div>

      <div className="bg-bg border-4 border-prime rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-5">
            <ChartIcon className="w-32 h-32" />
         </div>
         <div className="border-r border-border pr-12">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2">Portfolio XIRR</p>
            <p className="text-4xl font-black text-prime tracking-tighter">{portfolio.xirr || 0}%</p>
         </div>
         <div className="border-r border-border pr-12">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2">Benchmark Δ</p>
            <p className="text-4xl font-black text-prime tracking-tighter">{(portfolio.xirr - portfolio.benchmark_xirr).toFixed(1)}% <span className="text-xs text-emerald-500 font-black">↑</span></p>
         </div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2">Alpha Recovery</p>
            <p className="text-4xl font-black text-accent tracking-tighter">₹{formatINR(portfolio.total_market_alpha_recovery || 0)}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-6">
           <h4 className="text-xs font-black uppercase tracking-[0.2em] text-text-light opacity-60 italic">Active Holdings Analysis</h4>
           <div className="overflow-x-auto border-t border-border/60">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="py-6 text-[10px] font-black uppercase tracking-widest text-text-light opacity-60">Instrument</th>
                    <th className="py-6 text-[10px] font-black uppercase tracking-widest text-text-light opacity-60 text-right">Return (3Y)</th>
                    <th className="py-6 text-[10px] font-black uppercase tracking-widest text-text-light opacity-60 text-right">Exp. Ratio</th>
                    <th className="py-6 text-[10px] font-black uppercase tracking-widest text-text-light opacity-60 text-right">Target Signal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {portfolio.fund_signals.map((f, i) => (
                    <tr key={i} className="group hover:bg-surface-muted/30 transition-colors">
                      <td className="py-6 pr-4">
                        <p className="font-bold text-prime text-lg leading-none mb-1">{f.fund_name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-light opacity-60">{f.category?.toUpperCase()} STRATEGY</p>
                      </td>
                      <td className="py-6 text-right font-black text-prime">{f.return_3y}%</td>
                      <td className="py-6 text-right font-black text-emerald-600">{f.expense_ratio}%</td>
                      <td className="py-6 text-right">
                         <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${
                           f.signal === 'Switch' 
                            ? 'bg-red-50 text-red-600 border-red-100' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                         }`}>
                           {f.signal === 'Switch' ? 'SWITCH' : 'RETAIN'}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>

        <div className="space-y-6">
           <h4 className="text-xs font-black uppercase tracking-[0.2em] text-text-light opacity-60 italic">Overlap Matrix</h4>
           <div className="grid gap-1 shadow-2xl shadow-prime/5 p-1 rounded-2xl bg-border/20" style={{ gridTemplateColumns: `repeat(${matrixSize}, 1fr)` }}>
              {matrix.map((row, i) => (
                row.map((val, j) => (
                  <div 
                    key={`${i}-${j}`} 
                    className={`aspect-square flex items-center justify-center text-[10px] font-black rounded-sm transition-all duration-500 hover:scale-110 cursor-pointer ${
                      val === 100 ? 'bg-accent/80 text-prime' : 
                      val > 40 ? 'bg-accent/40 text-prime' : 
                      val > 10 ? 'bg-accent/20 text-prime' : 'bg-white text-text-light opacity-40'
                    }`}
                  >
                    {val}%
                  </div>
                ))
              ))}
           </div>
           <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-text-light opacity-60">
              {fundNames.slice(0, 3).map(n => <span key={n}>{n}</span>)}
              {fundNames.length < 3 && <span>DIVERSIFIED</span>}
           </div>
        </div>
      </div>
      
      {signals.length > 0 && (
        <>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-text-light opacity-60 italic mt-12 pb-4 border-b border-border/40">Market Opportunities</h4>
          <div className="space-y-3">
            {signals.map((s, i) => (
              <div key={i} className="card p-8 group relative overflow-hidden bg-white border-2 border-slate-50 hover:border-accent transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${s.type === 'underperformance' ? 'bg-red-500' : 'bg-accent'}`} />
                <div className="flex-1 max-w-2xl">
                  <h5 className="text-lg font-black text-prime mb-2 leading-none uppercase italic tracking-tighter">{s.type?.replace('_', ' ') || 'Optimization Alert'}</h5>
                  <p className="text-sm font-medium text-text-muted leading-relaxed">{s.description}</p>
                </div>
                {s.annual_impact > 0 && (
                  <div className="text-right shrink-0">
                    <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-1">Impact potential</p>
                    <p className="text-xl font-black text-prime">₹{formatINR(s.annual_impact)}/yr</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── TAB 7: WHAT-IF SIMULATOR ─────────────────────────── */
function WhatIfTab({ data }) {
  const scenarios = data.what_if_scenarios || [];
  const [sipIncrease, setSipIncrease] = useState(0);
  const [npsA, setNpsA] = useState(0);
  const [npsB, setNpsB] = useState(0);
  const additionalSaving = Math.round(sipIncrease * 12 * 0.1 + npsA * 0.3 + npsB * 0.2);

  return (
    <div className="space-y-12">
      <h3 className="text-2xl font-black text-prime tracking-tight mb-8">Joint Simulator</h3>
      {scenarios.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-text-light">Pre-built Scenarios</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((s, i) => (
              <div key={i} className="card p-6 border-2 border-slate-100">
                <h5 className="font-black text-prime mb-2">{s.scenario}</h5>
                <p className="text-sm text-text-muted mb-4">{s.impact}</p>
                {s.annual_saving > 0 && (
                  <div className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">Saves ₹{formatINR(s.annual_saving)}/yr</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="card p-8 border-2 border-slate-100">
        <h4 className="text-lg font-black text-prime mb-8">Custom Simulator</h4>
        <div className="space-y-8">
          <div>
            <div className="flex justify-between text-sm mb-3">
              <span className="font-black text-text-light uppercase tracking-widest text-[10px]">Additional Monthly SIP</span><span className="font-black text-prime">₹{formatINR(sipIncrease)}</span>
            </div>
            <input type="range" min={0} max={20000} step={500} value={sipIncrease} onChange={(e) => setSipIncrease(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-accent" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-3">
              <span className="font-black text-text-light uppercase tracking-widest text-[10px]">NPS Increase ({data.partner_a?.name})</span><span className="font-black text-prime">₹{formatINR(npsA)}/yr</span>
            </div>
            <input type="range" min={0} max={50000} step={5000} value={npsA} onChange={(e) => setNpsA(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-accent" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-3">
              <span className="font-black text-text-light uppercase tracking-widest text-[10px]">NPS Increase ({data.partner_b?.name})</span><span className="font-black text-prime">₹{formatINR(npsB)}/yr</span>
            </div>
            <input type="range" min={0} max={50000} step={5000} value={npsB} onChange={(e) => setNpsB(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-accent" />
          </div>
        </div>
        <motion.div className="mt-10 p-10 bg-accent/5 border-2 border-accent/20 rounded-3xl text-center shadow-xl shadow-accent/5" animate={{ scale: additionalSaving > 0 ? [1, 1.01, 1] : 1 }}>
          <p className="text-text-light text-[10px] font-black uppercase tracking-widest mb-2">New combined annual saving</p>
          <p className="text-5xl font-black text-prime tracking-tighter">₹{formatINR((data.headline_saving || 0) + additionalSaving)}</p>
          {additionalSaving > 0 && <p className="text-emerald-600 text-sm font-bold mt-4">+₹{formatINR(additionalSaving)} additional</p>}
        </motion.div>
      </div>
    </div>
  );
}


/* ─── TAB 8: REPORT ────────────────────────────────────── */
function ReportTab({ data }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded]   = useState(false);
  const [copied, setCopied]           = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadReport(data);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    } catch (e) {
      console.error('PDF download failed:', e);
    }
    setDownloading(false);
  };

  const handleCopy = () => {
    const lines = [
      `SOW — Joint Financial Intelligence Report`,
      `${'─'.repeat(48)}`,
      `Couple:          ${data.partner_a?.name} & ${data.partner_b?.name}`,
      `Annual Recovery: Rs ${formatINR(data.headline_saving)}`,
      `Finance Score:   ${data.health_score?.total}/100 (Grade ${data.health_score?.grade})`,
      ``,
      `BREAKDOWN`,
      `  Tax Saving:       Rs ${formatINR(data.headline_breakdown?.tax_saving)}`,
      `  Investment Gain:  Rs ${formatINR(data.headline_breakdown?.investment_gain)}`,
      `  Insurance Saving: Rs ${formatINR(data.headline_breakdown?.insurance_saving)}`,
      `  Market Alpha:     Rs ${formatINR(data.headline_breakdown?.market_alpha_recovery)}`,
      ``,
      `PRIORITY ACTIONS`,
      ...(data.priority_actions || []).map(a => `  #${a.rank}. ${a.title} — Rs ${formatINR(a.annual_saving)}/yr`),
      ``,
      `Engine: ${data.engine || 'Local Math Engine'}`,
      `Generated: ${new Date().toLocaleString('en-IN')}`,
    ].join('\n');
    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const pages = [
    { no: 1, title: 'Cover',          desc: 'Headline figures & AI engine badge' },
    { no: 2, title: 'Health Score',   desc: '6-dimensional wellness breakdown' },
    { no: 3, title: 'Tax',            desc: 'Old vs New regime & HRA arbitrage' },
    { no: 4, title: 'Investments',    desc: 'SIP, NPS & 80C strategy' },
    { no: 5, title: 'Goal Roadmap',   desc: 'FIRE number & milestone SIPs' },
    { no: 6, title: 'Insurance',      desc: 'HLV coverage gap analysis' },
    { no: 7, title: 'Market Intel',   desc: 'XIRR audit & overlap matrix' },
    { no: 8, title: 'Action Plan',    desc: 'AI What-If scenarios & ranked actions' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-2xl font-black text-prime tracking-tight">Financial Dossier</h3>
        <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[9px] font-black text-accent uppercase tracking-widest italic">8 Pages</div>
      </div>

      {/* PDF Preview card */}
      <div className="card p-10 bg-white border-2 border-border/40 relative overflow-hidden shadow-2xl shadow-prime/5">
        {/* Top accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-yellow-300 to-accent" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Left — mock cover preview + engine badge */}
          <div className="space-y-8">
            {/* Mini PDF cover mockup */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 shadow-xl" style={{ width: 160, aspectRatio: '0.707' }}>
              <div className="absolute inset-0 bg-prime" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 space-y-1.5">
                <p className="text-accent font-black text-2xl tracking-tighter">SOW</p>
                <p className="text-white/50 text-[6px] uppercase tracking-[0.15em] text-center">Strategy Optimization<br/>Workspace</p>
                <div className="w-full h-px bg-white/10 my-2" />
                <p className="text-white/80 text-[7px] font-bold">{data.partner_a?.name} & {data.partner_b?.name}</p>
                <p className="text-accent font-black text-sm">₹{shortINR(data.headline_saving)}</p>
                <p className="text-white/30 text-[6px] uppercase tracking-widest">Annual Recovery</p>
                <div className="mt-3 flex gap-1">
                  {[...Array(3)].map((_,i) => <div key={i} className="w-8 h-0.5 bg-white/10 rounded" />)}
                </div>
              </div>
            </div>

            {/* Engine badge */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border max-w-xs ${
              data.engine?.includes('Ollama') ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-border/40'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${data.engine?.includes('Ollama') ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-60">Intelligence Engine</p>
                <p className={`text-xs font-black ${data.engine?.includes('Ollama') ? 'text-emerald-700' : 'text-prime'}`}>
                  {data.engine || 'Local Math Engine'}
                </p>
              </div>
            </div>

            {/* Encouragement quote */}
            {data.encouragement && (
              <blockquote className="text-sm font-medium text-text-muted italic leading-relaxed border-l-4 border-accent/30 pl-4">
                "{data.encouragement}"
              </blockquote>
            )}
          </div>

          {/* Right — stats + page list + CTAs */}
          <div className="space-y-8">
            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Annual Recovery',  val: `₹${shortINR(data.headline_saving)}`,   accent: true },
                { label: 'Finance Score',    val: `${data.health_score?.total}/100 · ${data.health_score?.grade}` },
                { label: 'Tax Saving',       val: `₹${shortINR(data.headline_breakdown?.tax_saving)}` },
                { label: 'Report Pages',     val: '8 Sections' },
              ].map(({ label, val, accent }) => (
                <div key={label} className={`p-4 rounded-xl border ${accent ? 'bg-accent/5 border-accent/20' : 'bg-slate-50 border-border/40'}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">{label}</p>
                  <p className={`text-sm font-black ${accent ? 'text-accent' : 'text-prime'}`}>{val}</p>
                </div>
              ))}
            </div>

            {/* Page directory */}
            <div className="space-y-0.5 border-t border-border/40 pt-6">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-text-muted opacity-50 mb-3">Document Contents</p>
              {pages.map(p => (
                <div key={p.no} className="flex items-center gap-3 py-1.5 group">
                  <span className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center text-[9px] font-black text-accent flex-shrink-0 group-hover:bg-accent group-hover:text-prime transition-colors">{p.no}</span>
                  <span className="text-xs font-bold text-prime leading-none">{p.title}</span>
                  <span className="text-[9px] text-text-muted ml-auto hidden md:block opacity-60">{p.desc}</span>
                </div>
              ))}
            </div>

            {/* Download CTA */}
            <div className="space-y-3 pt-2">
              <motion.button
                onClick={handleDownload}
                disabled={downloading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg transition-all duration-300 ${
                  downloaded
                    ? 'bg-emerald-500 text-white shadow-emerald-200'
                    : downloading
                    ? 'bg-accent/70 text-prime cursor-not-allowed'
                    : 'bg-accent text-prime hover:bg-yellow-400 shadow-accent/20'
                }`}
              >
                <DownloadIcon className="w-5 h-5" />
                {downloading ? 'Generating PDF…' : downloaded ? '✓ Downloaded Successfully!' : 'Export PDF Dossier'}
              </motion.button>

              <button
                onClick={handleCopy}
                className="w-full py-4 bg-white border-2 border-border/60 text-prime rounded-2xl font-black uppercase tracking-widest text-xs hover:border-prime transition-all flex items-center justify-center gap-3"
              >
                {copied ? '✓ Copied to Clipboard!' : 'Copy Summary Text'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
