import React from 'react';
import useAppStore from './store/useAppStore';
import ProgressBar from './components/layout/ProgressBar';
import Hero from './pages/Hero';
import PartnerA from './pages/PartnerA';
import PartnerB from './pages/PartnerB';
import Goals from './pages/Goals';
import Portfolio from './pages/Portfolio';
import Analysis from './pages/Analysis';
import Results from './pages/Results';

function App() {
  const currentStep = useAppStore((s) => s.currentStep);

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <Hero />;
      case 1: return <PartnerA />;
      case 2: return <PartnerB />;
      case 3: return <Goals />;
      case 4: return <Portfolio />;
      case 5: return <Analysis />;
      case 6: return <Results />;
      default: return <Hero />;
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {currentStep > 0 && currentStep < 6 && <ProgressBar currentStep={currentStep} />}
      <main>{renderStep()}</main>
    </div>
  );
}

export default App;
