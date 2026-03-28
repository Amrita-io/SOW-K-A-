import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAnalysisStore from '../store/useAnalysisStore';
import useAppStore from '../store/useAppStore';
import { formatINR } from '../components/inputs/CurrencyInput';
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

const COLORS = ['#E8B84B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B'];

export default function Results() {
  const results = useAnalysisStore(s => s.results);
  const { setStep } = useAppStore();
  const [activeTab, setActiveTab] = useState('actions');

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">No analysis results available.</p>
          <button onClick={() => setStep(0)} className="btn-primary">Start Over</button>
        </div>
      </div>
    );
  }

  const r = results;

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <div className="bg-navy text-white px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 mb-2">
            {r.partner_a?.name} & {r.partner_b?.name} — Your Financial Analysis
          </p>
          <motion.div
            className="my-6"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <span className="text-6xl md:text-7xl font-black text-gold tracking-tight-heading">
              ₹{formatINR(r.headline_saving)}
            </span>
          </motion.div>
          <p className="text-gray-300 text-lg mb-6">you are currently losing every year as a couple</p>
          <p className="text-gray-500 text-sm mb-8">Here is your complete recovery plan, powered by 7 AI agents</p>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <BadgePill color="gold" icon={TaxIcon}>Tax: ₹{formatINR(r.headline_breakdown?.tax_saving)}</BadgePill>
            <BadgePill color="emerald" icon={InvestIcon}>Investment: ₹{formatINR(r.headline_breakdown?.investment_gain)}</BadgePill>
            <BadgePill color="amber" icon={InsuranceIcon}>Insurance: ₹{formatINR(r.headline_breakdown?.insurance_saving)}</BadgePill>
            <BadgePill color="gold" icon={MarketIcon}>Market: ₹{formatINR(r.headline_breakdown?.market_alpha_recovery)}</BadgePill>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <span className="badge bg-white/10 text-white">{r.partner_a?.name}: {r.partner_a?.recommended_regime?.toUpperCase()} Regime</span>
            <span className="badge bg-white/10 text-white">{r.partner_b?.name}: {r.partner_b?.recommended_regime?.toUpperCase()} Regime</span>
            {r.hra_winner && <span className="badge bg-gold/20 text-gold">HRA: {r.hra_winner} claims — saves ₹{formatINR(r.hra_annual_saving)} more</span>}
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" data={[{ value: r.health_score?.total || 0, fill: '#E8B84B' }]} startAngle={180} endAngle={0}>
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#F3F4F6' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                <span className="text-4xl font-black text-navy">{r.health_score?.total || 0}</span>
                <span className="text-3xl font-black text-gold">{r.health_score?.grade || 'D'}</span>
              </div>
              <p className="text-emerald text-sm font-medium">
                After recommendations: {r.health_score?.projected_score || 0}/100
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              {(r.health_score?.dimensions || []).map(d => (
                <div key={d.name} className="text-xs">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-muted">{d.name}</span>
                    <span className="font-medium">{d.score}/{d.max}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full bg-gold rounded-full" style={{ width: `${(d.score / d.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <SectionTab tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        {activeTab === 'actions' && <ActionsTab actions={r.priority_actions} />}
        {activeTab === 'tax' && <TaxTab data={r} />}
        {activeTab === 'invest' && <InvestTab data={r} />}
        {activeTab === 'goals' && <GoalsTab data={r} />}
        {activeTab === 'insurance' && <InsuranceTab data={r} />}
        {activeTab === 'market' && <MarketTab data={r} />}
        {activeTab === 'whatif' && <WhatIfTab data={r} />}
        {activeTab === 'report' && <ReportTab data={r} />}
      </div>
    </div>
  );
}

/* ─── TAB 1: ACTION PLAN ──────────────────────────────── */
function ActionsTab({ actions = [] }) {
  return (
    <div className="space-y-4">
      {actions.map((a, i) => (
        <motion.div
          key={a.rank}
          className={`card flex gap-4 ${i < 3 ? 'border-l-4 border-l-gold' : ''}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
            <span className="text-gold font-bold text-sm">#{a.rank}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-navy mb-1">{a.title}</h4>
            <p className="text-sm text-muted mb-3">{a.detail}</p>
            <div className="flex flex-wrap gap-2">
              <BadgePill color="gold">₹{formatINR(a.annual_saving)}/yr</BadgePill>
              <BadgePill color={a.effort === 'Low' ? 'emerald' : a.effort === 'Medium' ? 'amber' : 'danger'}>
                Effort: {a.effort}
              </BadgePill>
              <BadgePill color="gray">{a.timeframe}</BadgePill>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── TAB 2: TAX BREAKDOWN ─────────────────────────────── */
function TaxTab({ data }) {
  const chartData = [
    { name: data.partner_a?.name, Old: data.partner_a?.current_tax, Optimized: data.partner_a?.optimized_tax },
    { name: data.partner_b?.name, Old: data.partner_b?.current_tax, Optimized: data.partner_b?.optimized_tax },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard label={`${data.partner_a?.name} Tax Saving`} value={`₹${formatINR(data.partner_a?.tax_saving)}`} subtext={`Recommended: ${data.partner_a?.recommended_regime?.toUpperCase()} regime`} icon={TaxIcon} />
        <MetricCard label={`${data.partner_b?.name} Tax Saving`} value={`₹${formatINR(data.partner_b?.tax_saving)}`} subtext={`Recommended: ${data.partner_b?.recommended_regime?.toUpperCase()} regime`} icon={TaxIcon} />
      </div>
      <div className="card">
        <h4 className="heading-sm mb-4">Regime Comparison</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={(v) => `₹${formatINR(v)}`} />
            <Bar dataKey="Old" fill="#EF4444" radius={[4,4,0,0]} name="Current Tax" />
            <Bar dataKey="Optimized" fill="#10B981" radius={[4,4,0,0]} name="Optimized Tax" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {data.regime_explanation && (
        <div className="card bg-navy/5">
          <p className="text-sm text-navy">{data.regime_explanation}</p>
        </div>
      )}
    </div>
  );
}

/* ─── TAB 3: INVESTMENTS ───────────────────────────────── */
function InvestTab({ data }) {
  const pieData = [
    { name: data.partner_a?.name, value: data.partner_a?.current_tax || 0 },
    { name: data.partner_b?.name, value: data.partner_b?.current_tax || 0 },
  ];
  return (
    <div className="space-y-6">
      <div className="card">
        <h4 className="heading-sm mb-4">SIP Allocation</h4>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `₹${formatINR(v)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {data.hra_explanation && (
        <div className="card border-l-4 border-l-gold">
          <h4 className="heading-sm mb-2">HRA Optimization</h4>
          <p className="text-sm text-muted">{data.hra_explanation}</p>
        </div>
      )}
    </div>
  );
}

/* ─── TAB 4: GOAL ROADMAP ──────────────────────────────── */
function GoalsTab({ data }) {
  const retirement = data.retirement;
  return (
    <div className="space-y-4">
      {(data.goal_plans || []).map(g => (
        <div key={g.name} className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GoalIcon className="w-5 h-5 text-gold" />
              <h4 className="font-semibold">{g.name}</h4>
              <span className="text-xs text-muted">Target: {g.target_year}</span>
            </div>
            <BadgePill color={g.on_track ? 'emerald' : 'danger'}>
              {g.on_track ? 'On Track' : 'Needs Attention'}
            </BadgePill>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-muted block">Today</span><span className="font-semibold">₹{formatINR(g.present_cost)}</span></div>
            <div><span className="text-muted block">Future Cost</span><span className="font-semibold">₹{formatINR(g.future_cost)}</span></div>
            <div><span className="text-muted block">SIP Needed</span><span className="font-semibold text-gold">₹{formatINR(g.required_monthly_sip)}/mo</span></div>
            <div><span className="text-muted block">Current SIP</span><span className="font-semibold">₹{formatINR(g.current_sip_allocated)}/mo</span></div>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full">
            <div className={`h-full rounded-full ${g.on_track ? 'bg-emerald' : 'bg-amber'}`}
              style={{ width: `${Math.min(100, g.required_monthly_sip > 0 ? (g.current_sip_allocated / g.required_monthly_sip) * 100 : 0)}%` }} />
          </div>
        </div>
      ))}
      {retirement && (
        <div className="card border-l-4 border-l-gold">
          <h4 className="heading-sm mb-3">FIRE Projection</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-muted block">FIRE Number</span><span className="font-bold text-gold">₹{formatINR(retirement.fire_number)}</span></div>
            <div><span className="text-muted block">Projected</span><span className="font-bold">₹{formatINR(retirement.projected_corpus)}</span></div>
            <div><span className="text-muted block">Current Ret. Age</span><span className="font-bold text-danger">{retirement.current_retirement_age}</span></div>
            <div><span className="text-muted block">Optimized Ret. Age</span><span className="font-bold text-emerald">{retirement.optimized_retirement_age}</span></div>
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
    <div className="space-y-4">
      {[{ key: 'partner_a', label: data.partner_a?.name }, { key: 'partner_b', label: data.partner_b?.name }].map(({ key, label }) => {
        const p = ins[key] || {};
        const hasGap = (p.gap || 0) > 0;
        return (
          <div key={key} className="card">
            <div className="flex items-center gap-2 mb-3">
              <ShieldIcon className={`w-5 h-5 ${hasGap ? 'text-danger' : 'text-emerald'}`} />
              <h4 className="heading-sm">{label}</h4>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><span className="text-muted block">Required</span><span className="font-semibold">₹{formatINR(p.required_term)}</span></div>
              <div><span className="text-muted block">Existing</span><span className="font-semibold">₹{formatINR(p.existing_term)}</span></div>
              <div><span className="text-muted block">Gap</span><span className={`font-bold ${hasGap ? 'text-danger' : 'text-emerald'}`}>₹{formatINR(p.gap)}</span></div>
            </div>
          </div>
        );
      })}
      <div className="card">
        <h4 className="heading-sm mb-2">80D Tax Saving Available</h4>
        <p className="text-2xl font-bold text-gold">₹{formatINR(ins.annual_80d_saving_available)}/yr</p>
      </div>
    </div>
  );
}

/* ─── TAB 6: MARKET INTELLIGENCE ───────────────────────── */
function MarketTab({ data }) {
  const portfolio = data.portfolio || {};
  const signals = data.market_signals || [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Portfolio Value" value={`₹${formatINR(portfolio.total_value)}`} icon={ChartIcon} />
        <MetricCard label="Your XIRR" value={`${portfolio.xirr || 0}%`} color={portfolio.xirr >= portfolio.benchmark_xirr ? 'emerald' : 'danger'} icon={InvestIcon} />
        <MetricCard label="Benchmark" value={`${portfolio.benchmark_xirr || 0}%`} color="navy" icon={MarketIcon} />
        <MetricCard label="Expense Drag" value={`₹${formatINR(portfolio.expense_drag_annual)}/yr`} color="danger" icon={AlertIcon} />
      </div>
      {signals.length > 0 && (
        <div className="card">
          <h4 className="heading-sm mb-4">Opportunity Alerts</h4>
          <div className="space-y-3">
            {signals.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-amber/5 border border-amber/20 rounded-input">
                <AlertIcon className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-navy">{s.description}</p>
                  {s.annual_impact > 0 && <BadgePill color="amber" className="mt-2">₹{formatINR(s.annual_impact)}/yr impact</BadgePill>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {(portfolio.overlap_warnings || []).length > 0 && (
        <div className="card">
          <h4 className="heading-sm mb-3">Overlap Warnings</h4>
          {portfolio.overlap_warnings.map((w, i) => (
            <p key={i} className="text-sm text-muted mb-2">- {w}</p>
          ))}
        </div>
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
    <div className="space-y-6">
      {scenarios.length > 0 && (
        <div className="space-y-3">
          <h4 className="heading-sm">Pre-built Scenarios</h4>
          {scenarios.map((s, i) => (
            <div key={i} className="card">
              <h5 className="font-semibold text-navy mb-1">{s.scenario}</h5>
              <p className="text-sm text-muted mb-2">{s.impact}</p>
              {s.annual_saving > 0 && (
                <BadgePill color="emerald">Saves ₹{formatINR(s.annual_saving)}/yr</BadgePill>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="card">
        <h4 className="heading-sm mb-4">Custom Simulator</h4>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Additional Monthly SIP</span><span className="font-semibold">₹{formatINR(sipIncrease)}</span>
            </div>
            <input type="range" min={0} max={20000} step={500} value={sipIncrease} onChange={(e) => setSipIncrease(Number(e.target.value))} className="w-full accent-gold" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>NPS Increase ({data.partner_a?.name})</span><span className="font-semibold">₹{formatINR(npsA)}/yr</span>
            </div>
            <input type="range" min={0} max={50000} step={5000} value={npsA} onChange={(e) => setNpsA(Number(e.target.value))} className="w-full accent-gold" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>NPS Increase ({data.partner_b?.name})</span><span className="font-semibold">₹{formatINR(npsB)}/yr</span>
            </div>
            <input type="range" min={0} max={50000} step={5000} value={npsB} onChange={(e) => setNpsB(Number(e.target.value))} className="w-full accent-gold" />
          </div>
        </div>
        <motion.div className="mt-6 p-4 bg-navy rounded-card text-center" animate={{ scale: additionalSaving > 0 ? [1, 1.02, 1] : 1 }}>
          <p className="text-gray-400 text-sm">New combined annual saving:</p>
          <p className="text-3xl font-black text-gold">₹{formatINR((data.headline_saving || 0) + additionalSaving)}</p>
          {additionalSaving > 0 && <p className="text-emerald text-sm mt-1">+₹{formatINR(additionalSaving)} additional</p>}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── TAB 8: REPORT ────────────────────────────────────── */
function ReportTab({ data }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try { await downloadReport(); } catch (e) { console.error(e); }
    setDownloading(false);
  };

  const handleCopy = () => {
    const text = `CoupleWealth Report: ${data.partner_a?.name} & ${data.partner_b?.name}\n` +
      `Annual Recovery: ₹${formatINR(data.headline_saving)}\n` +
      `Health Score: ${data.health_score?.total}/100 (${data.health_score?.grade})\n` +
      `Tax Saving: ₹${formatINR(data.headline_breakdown?.tax_saving)}\n` +
      `Investment Gain: ₹${formatINR(data.headline_breakdown?.investment_gain)}\n`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h4 className="heading-sm mb-4">Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted">Headline Saving</span><br /><span className="font-bold text-gold text-lg">₹{formatINR(data.headline_saving)}/yr</span></div>
          <div><span className="text-muted">Health Score</span><br /><span className="font-bold text-lg">{data.health_score?.total}/100 ({data.health_score?.grade})</span></div>
          <div><span className="text-muted">{data.partner_a?.name} Regime</span><br /><span className="font-bold">{data.partner_a?.recommended_regime?.toUpperCase()}</span></div>
          <div><span className="text-muted">{data.partner_b?.name} Regime</span><br /><span className="font-bold">{data.partner_b?.recommended_regime?.toUpperCase()}</span></div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={handleDownload} disabled={downloading} className="btn-primary flex-1">
          <DownloadIcon className="w-4 h-4" />
          {downloading ? 'Generating PDF...' : 'Download PDF Report'}
        </button>
        <button onClick={handleCopy} className="btn-secondary flex-1">
          {copied ? 'Copied!' : 'Copy Summary'}
        </button>
      </div>
      {data.encouragement && (
        <div className="card bg-gold/5 border-gold/20">
          <p className="text-sm text-navy font-medium">{data.encouragement}</p>
        </div>
      )}
    </div>
  );
}
