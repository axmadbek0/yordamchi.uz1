/**
 * ChatWidget — Global Floating Action Button (FAB) + AI Assistant Bottom Sheet / Side Panel
 */

import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from './ChatContext';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { SuggestedPrompts } from './SuggestedPrompts';
import { VoiceInputButton } from './VoiceInputButton';
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Heart,
  Sparkles,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const ChatWidget: React.FC = () => {
  const {
    isOpen,
    toggleOpen,
    setIsOpen,
    messages,
    sendMessage,
    retryLastMessage,
    isTyping,
    role,
    currentPage,
    clearHistory,
  } = useChatContext();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom when messages or typing changes
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isTyping) return;
    const text = inputVal;
    setInputVal('');
    sendMessage(text);
  };

  const handleSelectPrompt = (promptText: string) => {
    sendMessage(promptText);
  };

  const handleNavigateLink = (url: string) => {
    setIsOpen(false);
    navigate(url);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Subtle tooltip callout when closed */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-deep text-xs font-bold shadow-lg border border-primary/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-coral" />
            AI Maslahatchi
          </motion.div>
        )}

        <motion.button
          type="button"
          onClick={toggleOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full bg-coral text-white shadow-xl shadow-coral/30 flex items-center justify-center cursor-pointer relative overflow-hidden group"
          title="AI Maslahatchini ochish"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center relative"
              >
                <MessageSquare className="w-6 h-6 fill-white/20" />
                {/* Micro pulse indicator ring */}
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-coral animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat Window Panel / Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 flex items-end sm:items-auto justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full sm:w-[420px] h-[92vh] sm:h-[620px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-primary/10 flex flex-col pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-deep text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <Heart className="w-5 h-5 fill-coral text-coral" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm font-serif">AI Maslahatchi</h3>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-[11px] text-white/70 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Professional Yordamchi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    title="Tarixni tozalash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ChevronDown className="w-5 h-5 sm:hidden" />
                    <X className="w-5 h-5 hidden sm:block" />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto bg-bg/40 space-y-1">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onRetry={retryLastMessage}
                    onNavigate={handleNavigateLink}
                  />
                ))}

                {isTyping && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </div>

              {/* Dynamic Suggested Prompts */}
              <div className="px-4 bg-bg/80 border-t border-primary/5">
                <SuggestedPrompts
                  role={role}
                  currentPage={currentPage}
                  onSelectPrompt={handleSelectPrompt}
                />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-primary/10 flex items-center gap-2">
                <VoiceInputButton onVoiceInput={(sttText) => setInputVal(sttText)} />

                <input
                  type="text"
                  placeholder="Savolingizni yozing..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  disabled={isTyping}
                  className="flex-1 bg-bg px-4 py-2.5 rounded-2xl text-xs sm:text-sm text-deep border border-primary/10 focus:outline-none focus:border-coral transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputVal.trim() || isTyping}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    inputVal.trim() && !isTyping
                      ? 'bg-coral text-white shadow-md shadow-coral/20'
                      : 'bg-bg text-muted/50 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
