/**
 * Support & Inquiries Chat Context — Connects Users Directly with Admin Panel
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '../../api/axios';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  senderLabel?: string;
  isAdminReply?: boolean;
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
  sendMessage: (text: string, contactPhone?: string, contactName?: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  isTyping: boolean;
  role: 'teacher' | 'parent' | 'guest';
  currentPage: string;
  setContextInfo: (role: 'teacher' | 'parent' | 'guest', page: string) => void;
  clearHistory: () => void;
}

const STORAGE_KEY = 'yordamchi_support_chat_history';
const SESSION_KEY = 'yordamchi_support_session_id';

function getOrCreateSessionId(): string {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

const INITIAL_MESSAGES: Record<'teacher' | 'parent' | 'guest', ChatMessageItem[]> = {
  teacher: [
    {
      id: 'm-init-teacher',
      sender: 'ai',
      text: "Assalomu alaykum, hurmatli o'qituvchi! Platforma yoki metodika bo'yicha savollaringiz bo'lsa yozing — administratorlarimiz sizga yordam berishadi.",
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  parent: [
    {
      id: 'm-init-parent',
      sender: 'ai',
      text: "Assalomu alaykum, aziz ota-ona! Yordamchi med platformasi, maktab yoki farzandingiz bo'yicha savollaringiz bormi? Savolingizni yozing, admin tez orada javob qaytaradi.",
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  guest: [
    {
      id: 'm-init-guest',
      sender: 'ai',
      text: "Assalomu alaykum! Yordamchi med platformasiga xush kelibsiz. Qanday savollaringiz yoki takliflaringiz bor? Yozib qoldiring, administratorimiz darhol ko'rib chiqadi.",
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    },
  ],
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<'teacher' | 'parent' | 'guest'>('guest');
  const [currentPage, setCurrentPage] = useState('/');
  const [isTyping, setIsTyping] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');

  const sessionId = getOrCreateSessionId();

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
    return INITIAL_MESSAGES.guest;
  });

  // Save messages to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat history', e);
    }
  }, [messages]);

  // Sync / Poll inquiries from backend to check if admin replied
  const syncWithBackend = useCallback(async () => {
    try {
      const res = await axiosInstance.get<{ success: boolean; data: any[] }>(
        `/support/my-inquiries?sessionId=${sessionId}`
      );
      if (res.data.success && Array.isArray(res.data.data)) {
        const inquiries = res.data.data;
        
        // Check for inquiries with admin_reply
        setMessages((prev) => {
          const newMessages = [...prev];
          let updated = false;

          for (const inq of inquiries) {
            if (inq.admin_reply) {
              const replyId = `admin-reply-${inq.id}`;
              const alreadyExists = newMessages.some((m) => m.id === replyId);
              if (!alreadyExists) {
                newMessages.push({
                  id: replyId,
                  sender: 'ai',
                  isAdminReply: true,
                  senderLabel: 'Super-Admin',
                  text: inq.admin_reply,
                  timestamp: new Date(inq.replied_at || inq.updated_at).toLocaleTimeString('uz-UZ', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                });
                updated = true;
              }
            }
          }

          return updated ? newMessages : prev;
        });
      }
    } catch (err) {
      // Ignore background sync error silently
    }
  }, [sessionId]);

  // Periodic polling when chat is open
  useEffect(() => {
    if (isOpen) {
      void syncWithBackend();
      const interval = setInterval(syncWithBackend, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, syncWithBackend]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const setContextInfo = (newRole: 'teacher' | 'parent' | 'guest', newPage: string) => {
    setRole(newRole);
    setCurrentPage(newPage);
  };

  const clearHistory = () => {
    const initial = INITIAL_MESSAGES[role] || INITIAL_MESSAGES.guest;
    setMessages(initial);
  };

  const executeSend = async (textToSend: string, contactPhone?: string, contactName?: string) => {
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
      // Get logged in user name if available
      let sender = contactName;
      let phone = contactPhone;
      const stored = localStorage.getItem('yordamchi_auth_user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.displayName) sender = u.displayName;
          if (u.phone) phone = u.phone;
        } catch {}
      }

      // Send inquiry to backend database for Super Admin
      await axiosInstance.post('/support/send', {
        sessionId,
        senderName: sender || 'Sayt foydalanuvchisi',
        senderPhone: phone || null,
        role,
        message: textToSend,
      });

      // Show immediate acknowledgment
      setTimeout(() => {
        const ackMsg: ChatMessageItem = {
          id: `ack-${Date.now()}`,
          sender: 'ai',
          text: "Savolingiz qabul qilindi va Super-Admin panelga yetkazildi! Administratorimiz tez orada shu yerda javob qaytaradi.",
          timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, ackMsg]);
        setIsTyping(false);
      }, 500);
    } catch (err) {
      console.error('Support Send Error:', err);
      const errorMsg: ChatMessageItem = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "Xabarni yetkazishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.",
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsTyping(false);
    }
  };

  const sendMessage = async (text: string, contactPhone?: string, contactName?: string) => {
    await executeSend(text, contactPhone, contactName);
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
