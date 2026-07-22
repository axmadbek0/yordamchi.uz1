/**
 * MessageBubble — User/AI variant message card with action link buttons & avatar pulse
 */

import React from 'react';
import { motion } from 'motion/react';
import { Heart, RefreshCw, Phone, ExternalLink } from 'lucide-react';
import type { ChatMessageItem } from './ChatContext';

interface MessageBubbleProps {
  message: ChatMessageItem;
  onRetry?: () => void;
  onNavigate?: (url: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRetry,
  onNavigate,
}) => {
  const isAI = message.sender === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex items-start gap-2.5 my-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      {/* AI Avatar */}
      {isAI && (
        <div className="relative shrink-0 mt-0.5">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-8 h-8 rounded-full bg-deep text-white flex items-center justify-center shadow-xs"
          >
            <Heart className="w-4 h-4 fill-coral text-coral" />
          </motion.div>
        </div>
      )}

      {/* Bubble Content */}
      <div className={`max-w-[82%] sm:max-w-[75%] flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
            isAI
              ? message.isError
                ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-none'
                : 'bg-white text-deep border border-primary/10 rounded-tl-none'
              : 'bg-coral text-white font-medium rounded-tr-none'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>

          {/* Action Link button inside AI response */}
          {message.actionLink && (
            <div className="mt-2.5 pt-2 border-t border-primary/8">
              {message.actionLink.url.startsWith('tel:') ? (
                <a
                  href={message.actionLink.url}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-coral/10 hover:bg-coral/20 text-coral font-bold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {message.actionLink.label}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate(message.actionLink!.url)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {message.actionLink.label}
                </button>
              )}
            </div>
          )}

          {/* Retry Button on Error */}
          {message.isError && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Qaytadan yuborish
            </button>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-muted mt-1 px-1">{message.timestamp}</span>
      </div>

      {/* User Avatar */}
      {!isAI && (
        <div className="w-7 h-7 rounded-full bg-coral/10 text-coral flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
          Siz
        </div>
      )}
    </motion.div>
  );
};
