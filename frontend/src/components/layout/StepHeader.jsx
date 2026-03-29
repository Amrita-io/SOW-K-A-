import React from 'react';
import { motion } from 'framer-motion';

export default function StepHeader({ title, subtitle, icon: Icon }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-12"
    >
      <div className="flex items-center gap-5 mb-3">
        {Icon && (
          <div className="w-14 h-14 rounded-[20px] bg-white border border-border/40 shadow-sm flex items-center justify-center">
            <Icon className="w-7 h-7 text-accent" />
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-prime">{title}</h1>
      </div>
      {subtitle && <p className="text-lg text-text-muted font-normal ml-0 md:ml-[76px] leading-relaxed max-w-2xl">{subtitle}</p>}
    </motion.div>
  );
}
