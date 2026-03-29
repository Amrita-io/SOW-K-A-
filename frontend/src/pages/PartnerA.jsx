import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../store/useAppStore';
import NavButtons from '../components/layout/NavButtons';
import CurrencyInput, { formatINR } from '../components/inputs/CurrencyInput';
import SliderInput from '../components/inputs/SliderInput';
import { 
  PlusIcon, MinusIcon, ChevronDownIcon, ChevronUpIcon, 
  InvestIcon, InsuranceIcon, TaxIcon 
} from '../components/shared/icons/index';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Gurgaon', 'Noida', 'Other',
];
const METRO = ['mumbai', 'delhi', 'new delhi', 'chennai', 'kolkata'];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Accordion = ({ id, title, icon: Icon, isOpen, onToggle, children }) => {
  return (
    <motion.div variants={fadeUp} className="card !p-0 mb-6 overflow-hidden">
      <button 
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-8 hover:bg-surface-muted/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-500 ${isOpen ? 'bg-accent text-prime' : 'bg-surface-muted text-text-muted'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-prime">{title}</h3>
        </div>
        {isOpen ? <ChevronUpIcon className="w-5 h-5 text-prime/40 transition-transform" /> : <ChevronDownIcon className="w-5 h-5 text-prime/40 transition-transform" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="p-8 pt-0 border-t border-border/40">
              <div className="space-y-10 mt-8">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function PartnerA() {
  const { partnerA, partnerB, setPartnerA, setStep } = useAppStore();
  const [openSections, setOpenSections] = useState(['salary']);
  
  const p = partnerA;
  const set = (field, val) => setPartnerA({ [field]: val });

  const basicMonthly = Math.round((p.annual_ctc * p.basic_pct) / 12);
  const hraMonthly = Math.round((p.annual_ctc * p.basic_pct * p.hra_pct) / 12);

  const toggleSection = (id) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-16 pb-20">
      {/* Left: Form Column */}
      <div className="flex-1 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-prime">Details for {p.name || 'Partner A'}</h1>
          <p className="text-text-muted mt-2">Personalize your financial identity for the orchestrator.</p>
        </div>

        {/* Identity Card */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="card mb-8">
          <div className="flex items-center gap-4 mb-10">
             <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">A</div>
             <div className="flex-1">
               <input 
                 className="input-field !py-4" 
                 value={p.name} 
                 onChange={(e) => set('name', e.target.value)} 
                 placeholder="Full Name" 
               />
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <SliderInput label="Age" value={p.age} onChange={(v) => set('age', v)} min={22} max={65} suffix=" years" />
            
            <div className="sm:col-span-2 space-y-4">
              <label className="block text-sm font-bold text-prime uppercase tracking-wider">Employment Type</label>
              <div className="grid grid-cols-3 gap-3">
                {['salaried', 'self_employed', 'business'].map((t) => (
                  <button key={t} type="button" onClick={() => set('employment_type', t)}
                    className={`py-3 px-4 rounded-xl border-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${p.employment_type === t ? 'border-accent bg-accent/10 text-prime shadow-md scale-[1.02]' : 'border-border/40 text-text-muted hover:border-accent/20 bg-white'}`}>
                    {t === 'self_employed' ? 'Self Employed' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Salary/Income & Rent */}
        <Accordion 
          id="salary" 
          title={p.employment_type === 'salaried' ? "Salary & Rent" : "Business & Rent"} 
          icon={TaxIcon} 
          isOpen={openSections.includes('salary')} 
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <CurrencyInput 
              label={p.employment_type === 'salaried' ? "Annual CTC" : "Gross Annual Income"} 
              value={p.annual_ctc} 
              onChange={(v) => set('annual_ctc', v)} 
              required 
            />
            {p.employment_type === 'salaried' ? (
              <SliderInput label="Basic Salary" value={Math.round(p.basic_pct * 100)} onChange={(v) => set('basic_pct', v / 100)} min={40} max={60} suffix="%" />
            ) : (
              <div className="bg-surface-muted/30 p-4 rounded-xl border border-dashed border-border/40 flex items-center justify-center">
                <span className="text-xs text-text-muted italic text-center">Standard deductions do not apply to business income.</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {p.employment_type === 'salaried' && (
              <SliderInput label="HRA % of basic" value={Math.round(p.hra_pct * 100)} onChange={(v) => set('hra_pct', v / 100)} min={0} max={50} suffix="%" />
            )}
            <div>
              <label className="block text-sm font-bold text-prime uppercase tracking-wider mb-2">City</label>
              <select className="input-field" value={p.city} onChange={(e) => {
                const city = e.target.value;
                set('city', city);
                set('is_metro', METRO.includes(city.toLowerCase()));
              }}>
                <option value="">Select city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c} {METRO.includes(c.toLowerCase()) ? '(Metro)' : ''}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-end mt-4">
            <CurrencyInput label="Monthly Rent" value={p.monthly_rent} onChange={(v) => set('monthly_rent', v)} />
            
            <div className="flex flex-col h-full justify-end">
              <label className="block text-xs font-bold text-prime uppercase tracking-wider mb-2 opacity-60">Household Synergy</label>
              <button 
                type="button"
                onClick={() => set('shares_rent', !p.shares_rent)}
                className={`w-full flex items-center justify-between px-6 py-3.5 rounded-2xl border transition-all duration-300 ${p.shares_rent ? 'border-accent bg-accent/5 shadow-sm shadow-accent/5' : 'border-border/60 bg-surface-muted/30 hover:border-accent/30'}`}
              >
                <div className="flex flex-col items-start">
                  <span className={`text-[11px] font-bold uppercase tracking-tight ${p.shares_rent ? 'text-prime' : 'text-prime-light'}`}>Split Rent</span>
                  <span className="text-[9px] text-text-muted leading-tight whitespace-nowrap">Shares rent with Partner</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all duration-500 shadow-inner ${p.shares_rent ? 'bg-accent shadow-accent/20' : 'bg-border/30'}`}>
                  <div className={`absolute top-[3px] left-[4px] w-3.5 h-3.5 bg-white rounded-full shadow-md transition-all duration-500 ${p.shares_rent ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>
          </div>
        </Accordion>

        {/* Investments */}
        <Accordion id="investments" title="Investments & Deductions" icon={InvestIcon} isOpen={openSections.includes('investments')} onToggle={toggleSection}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <CurrencyInput label="Section 80C (EPF, ELSS, Insurance)" value={p.existing_80c} onChange={(v) => set('existing_80c', v)} />
            <CurrencyInput label="NPS (80CCD 1B)" value={p.nps_contribution} onChange={(v) => set('nps_contribution', v)} />
            <CurrencyInput label="Monthly SIP" value={p.monthly_sip} onChange={(v) => set('monthly_sip', v)} />
            <CurrencyInput label="Monthly EMI (Loans)" value={p.monthly_emi} onChange={(v) => set('monthly_emi', v)} />
          </div>
        </Accordion>

        {/* Insurance */}
        <Accordion id="insurance" title="Insurance Audit" icon={InsuranceIcon} isOpen={openSections.includes('insurance')} onToggle={toggleSection}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <CurrencyInput label="Term Insurance Cover" value={p.term_cover} onChange={(v) => set('term_cover', v)} />
            <CurrencyInput label="Self/Family Health Premium" value={p.health_premium} onChange={(v) => set('health_premium', v)} />
            <CurrencyInput label="Parents Health Premium" value={p.parent_health_premium} onChange={(v) => set('parent_health_premium', v)} />
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => set('parents_senior_citizen', !p.parents_senior_citizen)}
                className={`w-12 h-6 rounded-full transition-colors relative ${p.parents_senior_citizen ? 'bg-accent' : 'bg-surface-muted'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${p.parents_senior_citizen ? 'left-7' : 'left-1'}`} />
              </button>
              <span className="text-sm font-semibold text-prime">Parents are Senior Citizens</span>
            </div>
          </div>
        </Accordion>

        {/* Regime */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="card mb-8">
          <label className="block text-sm font-bold text-prime uppercase tracking-wider mb-6">Tax Regime Preference</label>
          <div className="grid grid-cols-3 gap-3">
            {['old', 'new', 'auto'].map((r) => (
              <button key={r} type="button" onClick={() => set('tax_regime', r)}
                className={`py-4 px-4 rounded-xl border-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${p.tax_regime === r ? 'border-accent bg-accent/10 text-prime shadow-md scale-[1.02]' : 'border-border/40 text-text-muted hover:border-accent/20 bg-white'}`}>
                {r === 'auto' ? 'Recommend Me' : r.charAt(0).toUpperCase() + r.slice(1) + ' Regime'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="pt-8">
          <NavButtons 
            showBack={false} 
            onNext={() => setStep(2)} 
            nextLabel={`Continue to ${partnerB.name || 'Partner B'}`}
            disableNext={!p.name || (p.employment_type === 'salaried' && !p.annual_ctc)} 
          />
        </motion.div>
      </div>

      {/* Right: Live Intel Sidebar */}
      <aside className="hidden lg:block w-96 flex-shrink-0">
        <div className="sticky top-12 space-y-6">
          <div className="card !p-8 border-prime/10 shadow-2xl shadow-prime/5 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-[100px]" />
            <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-6">Live Intelligence Audit</p>
            
            <div className="space-y-10">
              <div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 opacity-60">Estimated Monthly Basic</p>
                <p className="text-3xl font-black text-prime tracking-tighter">₹{formatINR(basicMonthly)}</p>
              </div>

              <div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 opacity-60">Max HRA Eligible</p>
                <p className="text-3xl font-black text-prime tracking-tighter">₹{formatINR(hraMonthly)}/mo</p>
                <div className="mt-2 h-1 w-full bg-border/40 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-accent" 
                    initial={{ width: 0 }}
                    animate={{ width: p.monthly_rent > 0 ? `${Math.min(100, (p.monthly_rent / hraMonthly) * 100)}%` : '0%' }}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border/40">
                <p className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-4">Immediate Gaps Detected</p>
                <div className="space-y-4">
                  {p.existing_80c < 150000 && (
                     <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                        <p className="text-[11px] text-text-muted leading-relaxed font-medium">80C not fully utilized. <span className="text-prime font-bold">₹{formatINR(150000 - p.existing_80c)} shortfall.</span></p>
                     </div>
                  )}
                  {p.nps_contribution === 0 && (
                     <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                        <p className="text-[11px] text-text-muted leading-relaxed font-medium">Extra ₹50k NPS deduction not claimed. <span className="text-prime font-bold">~₹15k tax lost.</span></p>
                     </div>
                  )}
                  {p.term_cover < (p.annual_ctc * 15) && (
                     <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                        <p className="text-[11px] text-text-muted leading-relaxed font-medium">Insurance looks low (<span className="text-prime font-bold">{(p.term_cover/p.annual_ctc).toFixed(1)}x income</span>). Goal: 15x-20x.</p>
                     </div>
                  )}
                  {p.annual_ctc > 0 && (
                    <div className="flex gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                       <p className="text-[11px] text-text-muted leading-relaxed font-medium italic">Agents are calculating {p.city || 'local'} cost-of-living index...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[32px] bg-prime flex items-center justify-between group cursor-default shadow-xl shadow-prime/20">
            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Tax Audit Engine</p>
              <p className="text-sm font-black text-white">READY</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <TaxIcon className="w-5 h-5 text-accent" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
