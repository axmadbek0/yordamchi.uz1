/**
 * VoiceInputButton — Microphone UI with pulsing audio wave animation
 */

import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceInputButtonProps {
  onVoiceInput?: (text: string) => void;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onVoiceInput }) => {
  const [isListening, setIsListening] = useState(false);

  const handleMicClick = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate Speech-To-Text active state for 3.5 seconds
      setTimeout(() => {
        setIsListening(false);
        if (onVoiceInput) {
          onVoiceInput("Farzandimning motorikasi va sensor xotirasi haqida tavsiya bering");
        }
      }, 3500);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        {isListening && (
          <>
            <motion.span
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              className="absolute w-8 h-8 rounded-full bg-coral/40"
            />
            <motion.span
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 2.3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3, ease: 'easeOut' }}
              className="absolute w-8 h-8 rounded-full bg-coral/20"
            />
          </>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={handleMicClick}
        title={isListening ? "Ovoz yozilmoqda... Qayta bosing" : "Ovozli kiritish (Mikrofon)"}
        className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer relative z-10 ${
          isListening
            ? 'bg-coral text-white shadow-lg shadow-coral/30'
            : 'bg-bg text-muted hover:text-coral hover:bg-coral/10'
        }`}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
    </div>
  );
};
