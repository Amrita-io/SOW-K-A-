import React from 'react';

export default function LoadingDots({ text = 'Loading' }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted">{text}</span>
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </div>
  );
}
