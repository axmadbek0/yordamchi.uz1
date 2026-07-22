/**
 * TypingIndicator — Classic 3-dot height bounce animation when AI is thinking
 */

import React from 'react';
import { motion } from 'motion/react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1 px-3.5 py-2.5 bg-white rounded-2xl border border-primary/10 w-fit shadow-xs">
      <span className="text-xs text-muted font-medium mr-1.5">AI javob tayyorlamoqda</span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-coral inline-block"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
