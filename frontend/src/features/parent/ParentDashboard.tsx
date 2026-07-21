/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../lib/auth';
import { getStudents, getReportsForStudent } from '../../lib/db';
import { Student, DailyStatusEntry, ChatMessage } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AIReportChart } from '../../components/charts/AIReportChart';
import {
  Heart,
  School,
  LogOut,
  Send,
  MessageSquare,
  Sparkles,
  User,
  Calendar,
  Activity,
  Award,
  Video,
  Bell,
  Settings,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ParentDashboard() {
  const { user, logout } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [studentReports, setStudentReports] = useState<DailyStatusEntry[]>([]);

  // Active view tab (dashboard or AI chat assistant)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'cameras'>('dashboard');

  // AI chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: "Salom! Men Yordamchi.uz sun'iy intellekt maslahatchisiman. Men sizga Daun sindromi, aqli zaiflik yoki boshqa maxsus ehtiyojli bolalar tarbiyasi, uy sharoitidagi mashg‘ulotlar va pedagogika bo‘yicha yordam bera olaman. Bugun sizga qanday ko‘mak bera olaman?",
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.associatedStudentId) {
      const students = getStudents();
      const matched = students.find((s) => s.id === user.associatedStudentId);
      if (matched) {
        setStudent(matched);
        setStudentReports(getReportsForStudent(matched.id));
      }
    }
  }, [user]);

  // Scroll chat to bottom when message arrives
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setIsChatLoading(true);

    try {
      // Create chat request body carrying current message history and context
      const chatHistory = chatMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          history: chatHistory,
          studentName: student?.fullName || 'bola',
          studentClass: student?.className || 'maxsus sinf'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('Server returned an error');
      }
    } catch (err) {
      console.error('Chat AI failed, falling back to offline special education generator:', err);
      // Local highly detailed localized fallback replies
      setTimeout(() => {
        let text = "Tushundim, maxsus parvarish jarayonida bunday holatlar tabiiy. Farzandingiz bilan uyda mayda motorikani rivojlantiruvchi o‘yinlar (plastilin bilan ishlash, tugmalarni saralash) o‘ynashingiz va har bir muvaffaqiyatida uni quchoqlab, shirin so‘zlar bilan maqtab rag‘batlantirishingiz uning emotsional barqarorligini ancha oshiradi. Yana qanday savollaringiz bor?";
        if (userMsgText.toLowerCase().includes('motorika') || userMsgText.toLowerCase().includes('harakat')) {
          text = "Mayda motorikani oshirish uchun uydagi oddiy asboblardan foydalanish mumkin. Masalan, quruq loviya yoki no‘xatlarni alohida idishlarga saralash, ipga rangli munchoqlarni o‘tkazish juda yaxshi yordam beradi. Mashg‘ulotlarni kuniga 10-15 daqiqa davomida sokin muhitda o‘tkazing va bolani majburlamang.";
        } else if (userMsgText.toLowerCase().includes('tashvish') || userMsgText.toLowerCase().includes('qo\'rq') || userMsgText.toLowerCase().includes('sens')) {
          text = "Sensor yuklanishlar (baland ovozlar, ortiqcha yorug‘lik) maxsus ehtiyojli bolalarda tashvish uyg‘otishi mumkin. Bunday holatda uydagi sokin va uning uchun xavfsiz bo‘lgan maxsus burchak (masalan, yumshoq yostiqlar bilan to‘ldirilgan burchak) yaratib bering. Uni quchoqlab, nafas olish mashqlarini sokin ovozda birgalikda bajaring.";
        }

        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: text,
          timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      }, 1500);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getTodayReport = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return studentReports.find(r => r.date === todayStr);
  };

  const todayReport = getTodayReport();

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row font-sans text-ink">
      {/* Sidebar Navigation for Desktop */}
      <aside className="w-64 bg-deep flex flex-col h-screen sticky top-0 shrink-0 text-[#D3E6F5] hidden md:flex z-20 shadow-xl border-r border-cardBlue/10">
        <div className="p-6">
          <h1 className="text-white font-serif text-2xl italic tracking-tight">Yordamchi.uz</h1>
          <p className="text-[#D3E6F5] text-[10px] uppercase tracking-widest mt-1 opacity-70">Ota-ona Kabineti</p>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
              activeTab === 'dashboard' ? 'bg-[#1B6FA8] text-white font-medium shadow-md shadow-primary/25' : 'text-[#D3E6F5] hover:bg-[#1B6FA8]/20'
            }`}
          >
            <Activity className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">Kundalik Hisobot</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
              activeTab === 'chat' ? 'bg-[#1B6FA8] text-white font-medium shadow-md shadow-primary/25' : 'text-[#D3E6F5] hover:bg-[#1B6FA8]/20'
            }`}
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">AI Maslahatchi</span>
          </button>
          <button
            onClick={() => setActiveTab('cameras')}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
              activeTab === 'cameras' ? 'bg-[#1B6FA8] text-white font-medium shadow-md shadow-primary/25' : 'text-[#D3E6F5] hover:bg-[#1B6FA8]/20'
            }`}
          >
            <Video className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">Yotoqxona kuzatuvi</span>
          </button>
        </nav>
        
        {/* Child Profile Widget inside Sidebar Bottom */}
        {student && (
          <div className="p-4 mx-4 mb-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#1B6FA8] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
              {student.fullName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-white leading-tight">{student.fullName}</p>
              <p className="text-[10px] text-[#D3E6F5] opacity-60 truncate">{student.className} o‘quvchisi</p>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-[#D3E6F5]/10 flex flex-col gap-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-coral/30 text-coral hover:bg-coral/10 hover:border-coral rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Chiqish
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-primary/5 sticky top-0 z-10 shadow-sm flex items-center justify-between p-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-coral text-white rounded-full p-2">
            <Heart className="w-4 h-4" fill="currentColor" />
          </div>
          <div>
            <span className="text-sm font-black text-deep block leading-tight font-serif">YORDAMCHI.UZ</span>
            <span className="text-[10px] text-muted">Ota-ona kabineti • Maktab №{user?.schoolNumber || 12}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className="text-coral text-xs font-bold py-1.5 px-3 hover:bg-coral/5 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Chiqish
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Navigation tabs for Mobile Only */}
        <div className="flex md:hidden bg-white rounded-2xl p-1 mb-6 shadow-sm border border-cardBlue/50 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-[#1B6FA8] text-white shadow-md' : 'text-muted'
            }`}
          >
            <Activity className="w-4 h-4 hidden sm:block" /> Hisobot
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'chat' ? 'bg-[#1B6FA8] text-white shadow-md' : 'text-muted'
            }`}
          >
            <MessageSquare className="w-4 h-4 hidden sm:block" /> Maslahatchi
          </button>
          <button
            onClick={() => setActiveTab('cameras')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'cameras' ? 'bg-[#1B6FA8] text-white shadow-md' : 'text-muted'
            }`}
          >
            <Video className="w-4 h-4 hidden sm:block" /> Kameralar
          </button>
        </div>

        {/* Dynamic Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif text-deep font-bold">
              {activeTab === 'dashboard' && 'Farzandingiz Kundalik Qaydlari'}
              {activeTab === 'chat' && 'AI Pedagog Maslahatchi'}
            </h2>
            <p className="text-muted text-xs sm:text-sm mt-1">
              {activeTab === 'dashboard' && `${student?.fullName || 'O‘quvchi'} bo‘yicha maktab-internatdan olingan har kungi hisobotlar ko‘rsatkichi`}
              {activeTab === 'chat' && 'Aqli zaif va daun sindromiga ega bolalar tarbiyasi bo‘yicha maxsus AI pedagog-metodist'}
            </p>
          </div>
        </header>

        {/* Tab 1: Dashboard View (High Density Layout) */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* Left Column (takes 2 columns): Daily status details + History line chart */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Today's report widget */}
              <div className="bg-white rounded-3xl border border-cardBlue p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-lg font-bold text-deep font-serif flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-coral" /> Bugungi kunlik holat tahlili
                </h3>
                {todayReport ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-bold bg-[#EAF3FB] text-primary px-3 py-1.5 rounded-full border border-cardBlue flex items-center gap-1.5">
                        <span>{todayReport.mood === 'xursand' ? '🌟' : todayReport.mood === 'oddiy' ? '🙂' : todayReport.mood === 'tashvishli' ? '😟' : '😴'}</span>
                        Kayfiyati: <strong className="capitalize">{todayReport.mood}</strong>
                      </span>
                      <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1.5">
                        <span>✅</span> Salomatligi: <strong className="capitalize">{todayReport.healthStatus}</strong>
                      </span>
                    </div>
                    
                    <div className="bg-[#EAF3FB]/30 p-4 rounded-2xl border border-cardBlue/50 text-sm leading-relaxed text-deep">
                      <strong className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">O‘qituvchi izohi:</strong>
                      "{todayReport.teacherNote}"
                    </div>

                    {todayReport.aiAnalysis && (
                      <div className="bg-[#1B6FA8] text-white p-5 rounded-3xl relative overflow-hidden shadow-lg">
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">✨</span>
                            <strong className="text-xs uppercase tracking-wider text-[#D3E6F5]">Sun’iy Intellekt Tahlili & Maslahati</strong>
                          </div>
                          <p className="text-sm leading-relaxed text-[#EAF3FB] font-medium">{todayReport.aiAnalysis}</p>
                        </div>
                        <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-white/5 rounded-full pointer-events-none"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted bg-[#EAF3FB]/20 border border-dashed border-cardBlue rounded-2xl flex flex-col items-center justify-center gap-2">
                    <Bell className="w-10 h-10 text-primary/30 animate-bounce" />
                    <p className="font-semibold text-deep">Bugun uchun ma’lumotlar hali kiritilmadi</p>
                    <p className="text-xs">Maktab rahbariyati yoki o‘qituvchi hisobot kiritishi bilan bu yerda tahlillar shakllanadi.</p>
                  </div>
                )}
              </div>

              {/* Chart container */}
              <div className="bg-white rounded-3xl border border-cardBlue p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-lg font-bold text-deep font-serif flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Farzandingiz faolligi va dinamikasi ko‘rsatkichlari
                </h3>
                {studentReports.length === 0 ? (
                  <div className="text-center py-12 text-muted bg-[#EAF3FB]/10 border border-dashed border-cardBlue rounded-2xl">
                    <Calendar className="w-10 h-10 text-primary/20 mx-auto mb-2" />
                    <p className="font-semibold text-lg text-deep">Tarixiy ma’lumotlar hozircha mavjud emas</p>
                    <p className="text-xs">Dars davomidagi qaydlar tarixiy jadvalga yig‘ilib boradi.</p>
                  </div>
                ) : (
                  <AIReportChart entries={studentReports} />
                )}
              </div>
            </div>

            {/* Right Column: Profile details & AI Maslahatchi CTA Banner */}
            <div className="flex flex-col space-y-6">
              {/* Profile card */}
              <div className="bg-white rounded-3xl border border-cardBlue p-6 shadow-sm flex flex-col gap-4 text-center items-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#D3E6F5] bg-bg flex items-center justify-center">
                    {student?.avatarUrl ? (
                      <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-primary font-bold text-3xl">{student?.fullName[0]}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-coral text-white p-1.5 rounded-full shadow-md">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-base text-deep">{student?.fullName}</h4>
                  <p className="text-xs text-muted">Sinfi: {student?.className} • Maktab №{student?.schoolNumber}</p>
                </div>
                <div className="w-full pt-3 border-t border-cardBlue/50 text-left space-y-2 text-xs text-muted">
                  <div className="flex justify-between">
                    <span>Tug‘ilgan kuni:</span>
                    <span className="font-semibold text-deep">{student?.birthDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ota-ona logini:</span>
                    <span className="font-mono font-bold text-deep">{student?.parentLogin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Telefon raqam:</span>
                    <span className="font-semibold text-deep">{student?.parentPhone}</span>
                  </div>
                </div>
              </div>

              {/* AI Maslahatchi Quick CTA Banner */}
              <div className="bg-[#E8734A] text-white rounded-3xl p-6 relative overflow-hidden shadow-lg flex flex-col gap-3">
                <div className="relative z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/80">Maxsus Pedagogika AI</span>
                  <h4 className="text-lg font-bold font-serif leading-tight mt-1">Uydagi tarbiya va mashg‘ulotlar haqida so‘rang</h4>
                  <p className="text-xs text-white/95 mt-1 leading-relaxed">AI pedagog sizga bolaning emotsiyalarini boshqarish va uydagi mashqlar bo‘yicha professional maslahat beradi.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className="relative z-10 self-start bg-white text-coral text-xs font-bold px-4 py-2.5 rounded-full hover:bg-white/90 transition-all cursor-pointer shadow-md"
                >
                  AI Maslahatlashish →
                </button>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full pointer-events-none"></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Pedagog Maslahatchi Chat (High Density Layout) */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-cardBlue overflow-hidden h-[500px] md:h-[600px] w-full">
            {/* Chat header */}
            <div className="bg-[#D3E6F5]/20 p-4 border-b border-cardBlue/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary text-white rounded-full">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-deep text-sm leading-tight">AI Pedagog-Metodist va Ruhshunos</h4>
                  <p className="text-[10px] text-muted font-medium">Daun sindromi va maxsus ta’lim bo‘yicha professional yordamchi</p>
                </div>
              </div>
              <Badge variant="coral" className="text-[10px] py-0.5 px-2 font-bold uppercase tracking-wider">Online</Badge>
            </div>

            {/* Chat messages stream */}
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
                    <span className="text-[9px] text-muted font-mono mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {/* Typing Indicator */}
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

            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-cardBlue/50 bg-white flex gap-2 shrink-0">
              <input
                type="text"
                required
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Bu yerga maxsus mashg‘ulotlar yoki bolangiz bo‘yicha savolingizni yozing..."
                className="flex-1 px-4 py-2.5 bg-bg/50 border border-cardBlue rounded-xl focus:border-primary focus:outline-none text-sm placeholder-muted/50"
              />
              <Button variant="primary" size="sm" type="submit" className="!p-3.5 min-h-0 min-w-0 rounded-xl" disabled={isChatLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}

        {/* Tab 3: Cameras View */}
        {activeTab === 'cameras' && (
          <div className="flex-1 flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((camNum) => (
                <div key={camNum} className="bg-white rounded-3xl border border-cardBlue overflow-hidden shadow-sm flex flex-col">
                  <div className="bg-black relative aspect-video flex items-center justify-center">
                    {/* Dummy camera feed */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="text-white text-xs font-mono bg-black/50 px-2 py-1 rounded">LIVE</span>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="text-white/80 text-xs font-mono bg-black/50 px-2 py-1 rounded">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    <Video className="w-12 h-12 text-white/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                  </div>
                  <div className="p-4 flex items-center justify-between bg-white border-t border-cardBlue/50">
                    <div>
                      <h4 className="font-bold text-deep text-sm">Kamera #{camNum}</h4>
                      <p className="text-xs text-muted">Yotoqxona {camNum}-sektori</p>
                    </div>
                    <Badge variant="success" className="text-[10px] uppercase">Faol</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
