import React from 'react';
import useAppStore from '../store/useAppStore';
import StepHeader from '../components/layout/StepHeader';
import NavButtons from '../components/layout/NavButtons';
import CurrencyInput, { formatINR, shortINR } from '../components/inputs/CurrencyInput';
import SliderInput from '../components/inputs/SliderInput';
import RegimeSelect from '../components/inputs/RegimeSelect';
import { PartnerIcon } from '../components/shared/icons/index';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Gurgaon', 'Noida', 'Other',
];
const METRO = ['mumbai', 'delhi', 'new delhi', 'chennai', 'kolkata'];

export default function PartnerA() {
  const { partnerA, setPartnerA, setStep } = useAppStore();
  const p = partnerA;
  const set = (field, val) => setPartnerA({ [field]: val });

  const basicMonthly = Math.round((p.annual_ctc * p.basic_pct) / 12);
  const hraMonthly = Math.round((p.annual_ctc * p.basic_pct * p.hra_pct) / 12);
  const utilization80c = p.existing_80c;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <StepHeader icon={PartnerIcon} title="Tell us about the first partner" subtitle="We'll use this to calculate the optimal tax strategy" />

      {/* Identity */}
      <div className="card mb-6">
        <h3 className="heading-sm mb-4">Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name <span className="text-danger">*</span></label>
            <input className="input-field" value={p.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Aditya" />
          </div>
          <SliderInput label="Age" value={p.age} onChange={(v) => set('age', v)} min={22} max={65}
            preview={`${60 - p.age} working years left`} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Employment</label>
            <div className="grid grid-cols-3 gap-2">
              {['salaried', 'self_employed', 'business'].map((t) => (
                <button key={t} type="button" onClick={() => set('employment_type', t)}
                  className={`py-2 rounded-input border text-xs font-medium transition-all ${p.employment_type === t ? 'border-gold bg-gold/5 text-navy' : 'border-border text-muted'}`}>
                  {t === 'self_employed' ? 'Self-employed' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <CurrencyInput label="Annual Gross CTC" value={p.annual_ctc} onChange={(v) => set('annual_ctc', v)} required />
        </div>
      </div>

      {/* Salary Structure */}
      {p.employment_type === 'salaried' && (
        <div className="card mb-6">
          <h3 className="heading-sm mb-4">Salary Structure</h3>
          <div className="space-y-4">
            <SliderInput label="Basic Salary (% of CTC)" value={Math.round(p.basic_pct * 100)} onChange={(v) => set('basic_pct', v / 100)}
              min={40} max={60} suffix="%" preview={`₹${shortINR(basicMonthly)}/mo`} />
            <SliderInput label="HRA (% of Basic)" value={Math.round(p.hra_pct * 100)} onChange={(v) => set('hra_pct', v / 100)}
              min={0} max={50} suffix="%" preview={`₹${shortINR(hraMonthly)}/mo`} />
            <div>
              <label className="block text-sm font-medium mb-1.5">City</label>
              <select className="input-field" value={p.city} onChange={(e) => {
                const city = e.target.value;
                set('city', city);
                set('is_metro', METRO.includes(city.toLowerCase()));
              }}>
                <option value="">Select city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c} {METRO.includes(c.toLowerCase()) ? '(Metro)' : ''}</option>)}
              </select>
            </div>
            <CurrencyInput label="Monthly Rent Paid" value={p.monthly_rent} onChange={(v) => set('monthly_rent', v)}
              helpText="0 if living with family or own house" />
          </div>
        </div>
      )}

      {/* Current Investments */}
      <div className="card mb-6">
        <h3 className="heading-sm mb-4">Current Investments</h3>
        <div className="space-y-4">
          <CurrencyInput label="Total 80C investments this year" value={p.existing_80c} onChange={(v) => set('existing_80c', v)}
            helpText="EPF + ELSS + PPF + LIC + Home loan principal" />
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${Math.min(100, (utilization80c / 150000) * 100)}%` }} />
          </div>
          <p className="text-xs text-muted">₹{formatINR(utilization80c)} of ₹1,50,000 used ({Math.round((utilization80c / 150000) * 100)}%)</p>

          <CurrencyInput label="NPS Contribution (per year)" value={p.nps_contribution} onChange={(v) => set('nps_contribution', v)} />
          <CurrencyInput label="Monthly SIP" value={p.monthly_sip} onChange={(v) => set('monthly_sip', v)} />
          <RegimeSelect value={p.tax_regime} onChange={(v) => set('tax_regime', v)} />
          <CurrencyInput label="Monthly EMIs" value={p.monthly_emi} onChange={(v) => set('monthly_emi', v)} />
        </div>
      </div>

      {/* Insurance */}
      <div className="card mb-6">
        <h3 className="heading-sm mb-4">Insurance</h3>
        <div className="space-y-4">
          <CurrencyInput label="Term Life Cover" value={p.term_cover} onChange={(v) => set('term_cover', v)} suffix="in ₹" helpText="0 if no term insurance" />
          <CurrencyInput label="Health Insurance Premium (per year)" value={p.health_premium} onChange={(v) => set('health_premium', v)} />
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={p.parent_health_premium > 0}
              onChange={(e) => set('parent_health_premium', e.target.checked ? 25000 : 0)}
              className="w-4 h-4 accent-gold" />
            <span className="text-sm">Parents included in health cover?</span>
          </div>
          {p.parent_health_premium > 0 && (
            <>
              <CurrencyInput label="Parent Health Premium (per year)" value={p.parent_health_premium} onChange={(v) => set('parent_health_premium', v)} />
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={p.parents_senior_citizen} onChange={(e) => set('parents_senior_citizen', e.target.checked)} className="w-4 h-4 accent-gold" />
                <span className="text-sm">Parents are senior citizens (60+)?</span>
              </div>
            </>
          )}
        </div>
      </div>

      <NavButtons showBack={true} onBack={() => setStep(0)} onNext={() => setStep(2)} disableNext={!p.name || !p.annual_ctc} />
    </div>
  );
}
