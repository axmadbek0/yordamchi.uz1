/**
 * ParentAiChatPage — AI Maslahatchi (/parent/ai-chat)
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../lib/auth';
import { getStudents } from '../../lib/db';
import { Student, ChatMessage } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Send, Sparkles } from 'lucide-react';
import { useChatContext } from '../../components/ai-chat/ChatContext';

export function ParentAiChatPage() {
  const { user } = useAuth();
  const { setContextInfo } = useChatContext();
  const [student, setStudent] = useState<Student | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: "Salom! Men Yordamchi med sun'iy intellekt maslahatchisiman. Men sizga Daun sindromi, aqli zaiflik yoki boshqa maxsus ehtiyojli bolalar tarbiyasi, uy sharoitidagi mashg‘ulotlar va pedagogika bo‘yicha yordam bera olaman. Bugun sizga qanday ko‘mak bera olaman?",
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContextInfo('parent', '/parent/ai-chat');
  }, [setContextInfo]);

  useEffect(() => {
    if (user?.associatedStudentId) {
      getStudents().then((students) => {
        const matched = students.find((s) => s.id === user.associatedStudentId);
        if (matched) setStudent(matched);
      });
    }
  }, [user]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isChatLoading) return;

    const userMsgText = userInput;
    setUserInput('');

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setIsChatLoading(true);

    try {
      const chatHistory = chatMessages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          history: chatHistory,
          studentName: student?.fullName || 'bola',
          studentClass: student?.className || 'maxsus sinf',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('Server returned an error');
      }
    } catch {
      setTimeout(() => {
        let text =
          "Tushundim, maxsus parvarish jarayonida bunday holatlar tabiiy. Farzandingiz bilan uyda mayda motorikani rivojlantiruvchi o‘yinlar (plastilin bilan ishlash, tugmalarni saralash) o‘ynashingiz va har bir muvaffaqiyatida uni quchoqlab, shirin so‘zlar bilan maqtab rag‘batlantirishingiz uning emotsional barqarorligini ancha oshiradi. Yana qanday savollaringiz bor?";
        if (
          userMsgText.toLowerCase().includes('motorika') ||
          userMsgText.toLowerCase().includes('harakat')
        ) {
          text =
            "Mayda motorikani oshirish uchun uydagi oddiy asboblardan foydalanish mumkin. Masalan, quruq loviya yoki no‘xatlarni alohida idishlarga saralash, ipga rangli munchoqlarni o‘tkazish juda yaxshi yordam beradi. Mashg‘ulotlarni kuniga 10-15 daqiqa davomida sokin muhitda o‘tkazing va bolani majburlamang.";
        } else if (
          userMsgText.toLowerCase().includes('tashvish') ||
          userMsgText.toLowerCase().includes("qo'rq") ||
          userMsgText.toLowerCase().includes('sens')
        ) {
          text =
            "Sensor yuklanishlar (baland ovozlar, ortiqcha yorug‘lik) maxsus ehtiyojli bolalarda tashvish uyg‘otishi mumkin. Bunday holatda uydagi sokin va uning uchun xavfsiz bo‘lgan maxsus burchak (masalan, yumshoq yostiqlar bilan to‘ldirilgan burchak) yaratib bering. Uni quchoqlab, nafas olish mashqlarini sokin ovozda birgalikda bajaring.";
        }

        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            text,
            timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 1500);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <header>
        <h2 className="text-2xl sm:text-3xl font-serif text-deep font-bold">AI Pedagog Maslahatchi</h2>
        <p className="text-muted text-xs sm:text-sm mt-1">
          Aqli zaif va daun sindromiga ega bolalar tarbiyasi bo‘yicha maxsus AI pedagog-metodist
        </p>
      </header>

      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-cardBlue overflow-hidden h-[500px] md:h-[600px] w-full">
        <div className="bg-[#D3E6F5]/20 p-4 border-b border-cardBlue/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary text-white rounded-full">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-deep text-sm leading-tight">
                AI Pedagog-Metodist va Ruhshunos
              </h4>
              <p className="text-[10px] text-muted font-medium">
                Daun sindromi va maxsus ta’lim bo‘yicha professional yordamchi
              </p>
            </div>
          </div>
          <Badge variant="coral" className="text-[10px] py-0.5 px-2 font-bold uppercase tracking-wider">
            Online
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-bg/10">
          {chatMessages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  isAi ? 'self-start items-start' : 'self-end items-end'
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    isAi
                      ? 'bg-white text-deep border border-cardBlue rounded-tl-none shadow-sm'
                      : 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[9px] text-muted font-mono mt-1 px-1">{msg.timestamp}</span>
              </div>
            );
          })}

          {isChatLoading && (
            <div className="self-start items-start flex flex-col">
              <div className="bg-white text-deep border border-cardBlue px-4 py-3 rounded-2xl rounded-tl-none text-sm flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-muted font-bold pl-1">Maslahatchi javob bermoqda...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        <form
          onSubmit={handleSendChatMessage}
          className="p-3 border-t border-cardBlue/50 bg-white flex gap-2 shrink-0"
        >
          <input
            type="text"
            required
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Bu yerga maxsus mashg‘ulotlar yoki bolangiz bo‘yicha savolingizni yozing..."
            className="flex-1 px-4 py-2.5 bg-bg/50 border border-cardBlue rounded-xl focus:border-primary focus:outline-none text-sm placeholder-muted/50"
          />
          <Button
            variant="primary"
            size="sm"
            type="submit"
            className="!p-3.5 min-h-0 min-w-0 rounded-xl"
            disabled={isChatLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
