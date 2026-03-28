import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';
import StepHeader from '../components/layout/StepHeader';
import NavButtons from '../components/layout/NavButtons';
import CAMSUpload from '../components/inputs/CAMSUpload';
import CurrencyInput from '../components/inputs/CurrencyInput';
import { ChartIcon, CloseIcon } from '../components/shared/icons/index';
import { uploadCAMS } from '../api/client';

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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <StepHeader icon={ChartIcon} title="Your investment portfolio" subtitle="Upload CAMS statement or enter manually (optional)" />

      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode('upload')}
          className={`px-4 py-2 rounded-input text-sm font-medium transition-all ${mode === 'upload' ? 'bg-navy text-gold' : 'bg-gray-100 text-muted'}`}>
          Upload CAMS PDF
        </button>
        <button onClick={() => setMode('manual')}
          className={`px-4 py-2 rounded-input text-sm font-medium transition-all ${mode === 'manual' ? 'bg-navy text-gold' : 'bg-gray-100 text-muted'}`}>
          Enter Manually
        </button>
        <button onClick={handleNext}
          className="ml-auto px-4 py-2 rounded-input text-sm text-muted hover:text-text transition-colors">
          Skip this step
        </button>
      </div>

      {mode === 'upload' && (
        <div className="space-y-4">
          <CAMSUpload onUpload={handleUpload} isLoading={isUploading} />
          {uploadResult?.holdings && (
            <div className="card">
              <h4 className="heading-sm mb-3">Parsed Holdings ({uploadResult.holdings.length} funds)</h4>
              <div className="space-y-2">
                {uploadResult.holdings.map((h, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-border last:border-none">
                    <span className="text-text">{h.fund_name}</span>
                    <span className="text-muted">₹{h.current_value?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {uploadResult?.error && (
            <p className="text-sm text-danger">{uploadResult.error}</p>
          )}
        </div>
      )}

      {mode === 'manual' && (
        <div className="space-y-4">
          {manualHoldings.map((h, i) => (
            <div key={i} className="card relative">
              {manualHoldings.length > 1 && (
                <button onClick={() => removeRow(i)} className="absolute top-3 right-3 text-muted hover:text-danger">
                  <CloseIcon className="w-4 h-4" />
                </button>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1">Fund Name</label>
                  <input className="input-field text-sm" value={h.fund_name} onChange={(e) => updateRow(i, 'fund_name', e.target.value)}
                    placeholder="e.g. Axis Bluechip Fund" />
                </div>
                <CurrencyInput label="Invested Amount" value={h.invested_amount} onChange={(v) => updateRow(i, 'invested_amount', v)} />
                <CurrencyInput label="Current Value" value={h.current_value} onChange={(v) => updateRow(i, 'current_value', v)} />
              </div>
            </div>
          ))}
          <button onClick={addRow} className="w-full py-3 border-2 border-dashed border-border rounded-card text-sm text-muted hover:border-gold hover:text-gold transition-all">
            + Add another fund
          </button>
        </div>
      )}

      <NavButtons onBack={() => setStep(3)} onNext={handleNext} nextLabel="Run Analysis" />
    </div>
  );
}
