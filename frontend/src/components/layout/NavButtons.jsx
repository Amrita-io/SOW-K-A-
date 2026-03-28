import React from 'react';
import { ArrowRightIcon } from '../shared/icons/index';

export default function NavButtons({ onBack, onNext, nextLabel = 'Continue', backLabel = 'Back', disableNext = false, showBack = true }) {
  return (
    <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
      {showBack ? (
        <button onClick={onBack} className="text-muted hover:text-text font-medium transition-colors px-4 py-2">
          {backLabel}
        </button>
      ) : <div />}
      <button
        onClick={onNext}
        disabled={disableNext}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {nextLabel}
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
