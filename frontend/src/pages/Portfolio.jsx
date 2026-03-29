import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '../store/useAppStore';
import NavButtons from '../components/layout/NavButtons';
import CAMSUpload from '../components/inputs/CAMSUpload';
import CurrencyInput from '../components/inputs/CurrencyInput';
import { ChartIcon, CloseIcon } from '../components/shared/icons/index';
import { uploadCAMS } from '../api/client';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Portfolio() {
  const { holdings, setHoldings, setStep } = useAppStore();
  const [mode, setMode] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [manualHoldings, setManualHoldings] = useState(holdings.length > 0 ? holdings : [
    { fund_name: '', invested_amount: 0, current_value: 0, start_date: '2023-01-01' },
  ]);

  const handleUpload = async (file) => {
    setIsUploading(true);
    try {
      const result = await uploadCAMS(file);
      setUploadResult(result);
      if (result.holdings) setHoldings(result.holdings);
    } catch (err) {
      setUploadResult({ error: 'Failed to parse PDF. Try manual entry.' });
    }
    setIsUploading(false);
  };

  const addRow = () => {
    setManualHoldings([...manualHoldings, { fund_name: '', invested_amount: 0, current_value: 0, start_date: '2023-01-01' }]);
  };

  const removeRow = (i) => {
    setManualHoldings(manualHoldings.filter((_, idx) => idx !== i));
  };

  const updateRow = (i, field, val) => {
    const updated = [...manualHoldings];
    updated[i] = { ...updated[i], [field]: val };
    setManualHoldings(updated);
  };

  const handleNext = () => {
    if (mode === 'manual') {
      const valid = manualHoldings.filter(h => h.fund_name && h.invested_amount > 0);
      setHoldings(valid);
    }
    setStep(5);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-16 pb-20">
      {/* Left: Portfolio Inputs */}
      <div className="flex-1 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-prime leading-tight">Your investment portfolio</h1>
          <p className="text-text-muted mt-2 text-lg">Upload your CAMS statement or list major holdings manually.</p>
        </div>

        <motion.div variants={fadeUp} className="flex p-1.5 bg-surface-muted border border-border/40 rounded-2xl mb-12 max-w-sm">
          <button onClick={() => setMode('upload')}
            className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${mode === 'upload' ? 'bg-prime text-white shadow-lg shadow-prime/20' : 'text-text-muted hover:text-prime'}`}>
            CAMS Upload
          </button>
          <button onClick={() => setMode('manual')}
            className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${mode === 'manual' ? 'bg-prime text-white shadow-lg shadow-prime/20' : 'text-text-muted hover:text-prime'}`}>
            Manual Entry
          </button>
        </motion.div>

        {mode === 'upload' && (
          <motion.div variants={fadeUp} className="space-y-8">
            <div className="card !p-10 border-2 border-dashed border-accent/20 bg-accent/[0.02] hover:bg-accent/[0.05] transition-colors rounded-[32px]">
              <CAMSUpload onUpload={handleUpload} isLoading={isUploading} />
            </div>
            {uploadResult?.holdings && (
              <div className="card shadow-2xl shadow-prime/5 border-prime/5">
                <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-5">
                  <h4 className="text-xl font-bold text-prime">Parsed Holdings ({uploadResult.holdings.length})</h4>
                  <ChartIcon className="w-6 h-6 text-accent" />
                </div>
                <div className="space-y-5">
                  {uploadResult.holdings.map((h, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <span className="text-sm font-semibold text-text-light group-hover:text-prime transition-colors">{h.fund_name}</span>
                      <span className="text-sm font-black text-prime ml-4 tracking-tighter">₹{h.current_value?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {uploadResult?.error && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <CloseIcon className="w-5 h-5 text-red-600" />
                 </div>
                 <p className="text-sm font-bold text-red-700">{uploadResult.error}</p>
              </div>
            )}
          </motion.div>
        )}

        {mode === 'manual' && (
          <motion.div variants={fadeUp} className="space-y-8">
            {manualHoldings.map((h, i) => (
              <div key={i} className="card relative group border-prime/5 shadow-xl shadow-prime/5">
                {manualHoldings.length > 1 && (
                  <button onClick={() => removeRow(i)} className="absolute -top-3 -right-3 w-10 h-10 flex items-center justify-center bg-white border border-border shadow-xl rounded-full text-text-light hover:text-red-500 hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100">
                    <CloseIcon className="w-5 h-5" />
                  </button>
                )}
                <div className="space-y-10">
                  <div>
                    <label className="block text-[10px] font-black text-prime uppercase tracking-widest mb-3">Scheme Name</label>
                    <input className="input-field !text-lg !font-bold" value={h.fund_name} onChange={(e) => updateRow(i, 'fund_name', e.target.value)}
                      placeholder="e.g. Parag Parikh Flexicap Fund" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <CurrencyInput label="Invested Capital" value={h.invested_amount} onChange={(v) => updateRow(i, 'invested_amount', v)} />
                    <CurrencyInput label="Current Valuation" value={h.current_value} onChange={(v) => updateRow(i, 'current_value', v)} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addRow} className="group w-full py-8 border-2 border-dashed border-border hover:border-accent hover:bg-accent/[0.02] rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] text-text-muted hover:text-prime transition-all duration-500">
              <span className="flex items-center justify-center gap-3">
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform text-lg leading-none">+</span>
                Add investment scheme
              </span>
            </button>
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="mt-16 flex flex-col items-center lg:items-start">
          <NavButtons onBack={() => setStep(3)} onNext={handleNext} nextLabel="Run Portfolio Analysis" />
          <button onClick={handleNext} className="mt-8 text-xs font-black text-text-muted hover:text-prime tracking-widest uppercase transition-colors underline underline-offset-8 decoration-border/40 hover:decoration-accent/40">
            Skip for now
          </button>
        </motion.div>
      </div>

      {/* Right: Portfolio Sidebar */}
      <aside className="hidden lg:block w-96 flex-shrink-0">
        <div className="sticky top-12 space-y-6">
          <div className="card !p-8 border-prime/10 shadow-2xl shadow-prime/5 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-[100px]" />
            <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-8">Portfolio Intelligence</p>
            
            <div className="space-y-12">
              <div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3 opacity-60">Total Invested (Manual)</p>
                <p className="text-4xl font-black text-prime tracking-tighter">₹{manualHoldings.reduce((sum, h) => sum + (h.invested_amount || 0), 0).toLocaleString('en-IN')}</p>
              </div>

              <div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3 opacity-60">Current Market Value</p>
                <p className="text-4xl font-black text-emerald-600 tracking-tighter">₹{manualHoldings.reduce((sum, h) => sum + (h.current_value || 0), 0).toLocaleString('en-IN')}</p>
              </div>

              <div className="pt-8 border-t border-border/40">
                <p className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-6">Security & Audit</p>
                <div className="space-y-5">
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-surface-muted flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-prime" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                     </div>
                     <div>
                        <p className="text-[11px] font-bold text-prime">Local-First Parsing</p>
                        <p className="text-[10px] text-text-muted mt-1 leading-relaxed">PDF statements are parsed on-device. No data is stored on our servers.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-surface-muted flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-prime" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <div>
                        <p className="text-[11px] font-bold text-prime">Smart Asset Grouping</p>
                        <p className="text-[10px] text-text-muted mt-1 leading-relaxed">Intelligence agents automatically categorize your funds into Risk Buckets.</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[32px] bg-prime flex items-center justify-between shadow-xl shadow-prime/20 border border-white/5">
            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Portfolio Analysis</p>
              <p className="text-sm font-black text-white">READY FOR AUDIT</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <ChartIcon className="w-5 h-5 text-accent" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
