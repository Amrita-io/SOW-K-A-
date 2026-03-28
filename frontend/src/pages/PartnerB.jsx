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

export default function PartnerB() {
  const { partnerA, partnerB, setPartnerB, setStep } = useAppStore();
  const p = partnerB;
  const set = (field, val) => setPartnerB({ [field]: val });

  // Pre-fill city from Partner A
  React.useEffect(() => {
    if (!p.city && partnerA.city) {
      set('city', partnerA.city);
      set('is_metro', partnerA.is_metro);
    }
  }, []);

  const basicMonthly = Math.round((p.annual_ctc * p.basic_pct) / 12);
  const hraMonthly = Math.round((p.annual_ctc * p.basic_pct * p.hra_pct) / 12);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <StepHeader icon={PartnerIcon} title={`Tell us about ${partnerA.name ? partnerA.name + "'s partner" : 'the second partner'}`}
        subtitle="Different incomes and regimes can be optimized jointly" />

      {/* Identity */}
      <div className="card mb-6">
        <h3 className="heading-sm mb-4">Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name <span className="text-danger">*</span></label>
            <input className="input-field" value={p.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Priya" />
          </div>
          <SliderInput label="Age" value={p.age} onChange={(v) => set('age', v)} min={22} max={65} preview={`${60 - p.age} working years left`} />
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
            {partnerA.monthly_rent > 0 && (
              <div className="p-3 bg-gold/5 border border-gold/20 rounded-input">
                <p className="text-sm text-navy font-medium">
                  {partnerA.name || 'Partner A'} pays ₹{formatINR(partnerA.monthly_rent)}/month rent. HRA analysis will optimize who should claim it.
                </p>
              </div>
            )}
            <CurrencyInput label="Monthly Rent Paid (if separate from partner)" value={p.monthly_rent} onChange={(v) => set('monthly_rent', v)}
              helpText="0 if shared rent or living with family" />
          </div>
        </div>
      )}

      {/* Investments */}
      <div className="card mb-6">
        <h3 className="heading-sm mb-4">Current Investments</h3>
        <div className="space-y-4">
          <CurrencyInput label="Total 80C investments" value={p.existing_80c} onChange={(v) => set('existing_80c', v)} />
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${Math.min(100, (p.existing_80c / 150000) * 100)}%` }} />
          </div>
          <p className="text-xs text-muted">₹{formatINR(p.existing_80c)} of ₹1,50,000 used ({Math.round((p.existing_80c / 150000) * 100)}%)</p>
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
          <CurrencyInput label="Term Life Cover" value={p.term_cover} onChange={(v) => set('term_cover', v)} helpText="0 if no term insurance" />
          <CurrencyInput label="Health Insurance Premium (per year)" value={p.health_premium} onChange={(v) => set('health_premium', v)} />
        </div>
      </div>

      <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} disableNext={!p.name || !p.annual_ctc} />
    </div>
  );
}
