/**
 * AI Chat Context — Global State & Handler for Yordamchi.uz AI Assistant
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionLink?: {
    label: string;
    url: string;
  };
  isError?: boolean;
}

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  messages: ChatMessageItem[];
  sendMessage: (text: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  isTyping: boolean;
  role: 'teacher' | 'parent' | 'guest';
  currentPage: string;
  setContextInfo: (role: 'teacher' | 'parent' | 'guest', page: string) => void;
  clearHistory: () => void;
}

const STORAGE_KEY = 'yordamchi_ai_chat_history';

const INITIAL_MESSAGES: Record<'teacher' | 'parent' | 'guest', ChatMessageItem[]> = {
  teacher: [
    {
      id: 'm-init-teacher',
      sender: 'ai',
      text: "Salom, hurmatli o'qituvchi! Men Yordamchi.uz pedagogik AI yordamchisiman. O'quvchilar holatini yozish, ota-onalar bilan muloqot yoki metodik tavsiyalar bo'yicha qanday yordam bera olaman?",
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  parent: [
    {
      id: 'm-init-parent',
      sender: 'ai',
      text: "Salom, aziz ota-ona! Men Yordamchi.uz sun'iy intellekt maslahatchisiman. Farzandingiz tarbiyasi, kunlik tahlillar, sensor mashqlar va rivojlantirish bo'yicha savollaringizga javob berishga tayyorman.",
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  guest: [
    {
      id: 'm-init-guest',
      sender: 'ai',
      text: "Salom! Yordamchi.uz platformasiga xush kelibsiz. Maxsus ta'lim, Daun sindromi va autizmli bolalar rivojlanishi haqida qanday savollaringiz bor?",
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    },
  ],
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<'teacher' | 'parent' | 'guest'>('parent');
  const [currentPage, setCurrentPage] = useState('/');
  const [isTyping, setIsTyping] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessageItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chat history', e);
    }
    return INITIAL_MESSAGES.parent;
  });

  // Save messages to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat history', e);
    }
  }, [messages]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const setContextInfo = (newRole: 'teacher' | 'parent' | 'guest', newPage: string) => {
    setRole(newRole);
    setCurrentPage(newPage);
  };

  const clearHistory = () => {
    const initial = INITIAL_MESSAGES[role] || INITIAL_MESSAGES.guest;
    setMessages(initial);
  };

  const executeSend = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    setLastUserMessage(textToSend);

    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const chatHistory = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory,
          roleContext: role,
          pageContext: currentPage,
        }),
      });

      if (!res.ok) {
        throw new Error('Server error');
      }

      const data = await res.json();
      let actionLink;

      // Smart contextual links
      const lower = textToSend.toLowerCase();
      if (lower.includes('hisobot') || lower.includes('grafik') || lower.includes('tahlil')) {
        actionLink = {
          label: role === 'parent' ? "Hisobotlar sahifasiga o'tish →" : "Sinf statistikasini ko'rish →",
          url: role === 'parent' ? '/parent/dashboard' : '/teacher/dashboard',
        };
      } else if (lower.includes('bog\'lan') || lower.includes('telefon') || lower.includes('maktab')) {
        actionLink = {
          label: "Maktabga qo'ng'iroq qilish",
          url: 'tel:+998712765432',
        };
      }

      const aiMsg: ChatMessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "Tushundim. Farzandingiz bilan uydagi sensor va motorika mashqlarini bajarishni tavsiya etaman.",
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        actionLink,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      const errorMsg: ChatMessageItem = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "Hozircha javob bera olmadim. Tarmoq aloqasini tekshirib, qaytadan urinib ko'ring.",
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (text: string) => {
    await executeSend(text);
  };

  const retryLastMessage = async () => {
    if (lastUserMessage) {
      await executeSend(lastUserMessage);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        messages,
        sendMessage,
        retryLastMessage,
        isTyping,
        role,
        currentPage,
        setContextInfo,
        clearHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
