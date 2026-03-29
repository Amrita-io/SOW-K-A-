import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from './store/useAppStore';
import ProgressBar from './components/layout/ProgressBar';
import Hero from './pages/Hero';
import PartnerA from './pages/PartnerA';
import PartnerB from './pages/PartnerB';
import Goals from './pages/Goals';
import Portfolio from './pages/Portfolio';
import Analysis from './pages/Analysis';
import Results from './pages/Results';

import FinancialAgent from './components/layout/FinancialAgent';

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

  const showSidebar = currentStep > 0 && currentStep < 5;

  return (
    <div className="min-h-screen ambient-bg flex overflow-hidden">
      {showSidebar && (
        <aside className="w-80 bg-white border-r border-border/40 hidden lg:flex flex-col flex-shrink-0 z-20">
          <div className="p-10 flex-grow">
             <div className="mb-20">
                <h1 className="text-4xl font-black tracking-tighter text-prime leading-none">
                  SOW
                </h1>
             </div>
             <ProgressBar currentStep={currentStep} />
          </div>
          
          <div className="mt-auto p-10">
            <div className="bg-prime rounded-[32px] p-6 shadow-2xl shadow-prime/20 border border-prime/10 mb-6 font-medium">
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-accent flex-shrink-0 flex items-center justify-center">
                    <svg className="w-5 h-5 text-prime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                 </div>
                 <div>
                   <p className="text-white text-[11px] font-black uppercase tracking-widest leading-relaxed">Identity Protected</p>
                   <p className="text-white/60 text-[10px] font-medium mt-1 leading-normal">Data stays in-memory. Zero local storage.</p>
                 </div>
              </div>
            </div>
            <FinancialAgent />
          </div>
        </aside>
      )}

      <main className={`flex-grow h-screen overflow-y-auto ${!showSidebar ? 'w-full' : ''}`}>
        <div className={`mx-auto ${
          currentStep === 0 || currentStep === 6 ? 'max-w-none p-0' : 'max-w-screen-2xl py-12 px-8'
        }`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={currentStep === 0 ? { opacity: 0 } : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
