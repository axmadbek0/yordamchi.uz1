/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { saveStudent, getReportsForStudent } from '../../lib/db';
import { submitDailyLog } from '../../api/studentApi';
import { useStudents } from '../../api/hooks/useStudents';
import { generateParentCredentials } from '../../lib/generateCredentials';
import { Student, DailyStatusEntry } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Users,
  UserPlus,
  ClipboardList,
  Search,
  School,
  Smile,
  Meh,
  Frown,
  Activity,
  LogOut,
  Phone,
  FileText,
  Printer,
  Send,
  Sparkles,
  BarChart,
  Calendar,
  User,
  Video,
  Camera,
  Maximize2,
  Volume2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useChatContext } from '../../components/ai-chat/ChatContext';


export function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setContextInfo } = useChatContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<DailyStatusEntry[]>([]);
  const { data: studentsData, refetch: refetchStudents, isLoading: studentsLoading } = useStudents();

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Add Student state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newClassName, setNewClassName] = useState('4-A');
  const [newPhone, setNewPhone] = useState('');
  const [generatedCreds, setGeneratedCreds] = useState<{ login: string; pass: string } | null>(null);

  // Daily entry state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMood, setSelectedMood] = useState<'xursand' | 'oddiy' | 'tashvishli' | 'charchagan'>('xursand');
  const [selectedHealth, setSelectedHealth] = useState<'sog‘lom' | 'yengil bezovta' | 'betob'>('sog‘lom');
  const [teacherNote, setTeacherNote] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'entry' | 'stats' | 'cameras'>('roster');


  useEffect(() => {
    if (studentsData) {
      setStudents(studentsData);
    }
  }, [studentsData]);

  useEffect(() => {
    setContextInfo('teacher', '/teacher/dashboard');
  }, [setContextInfo]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newPhone) return;

    const schoolNum = user?.schoolNumber || 12;
    const nextSeqNum = students.length + 1;
    const creds = generateParentCredentials(schoolNum, nextSeqNum);

    const newStudent: Student = {
      id: `s-${Date.now()}`,
      fullName: newFullName,
      birthDate: newBirthDate,
      className: newClassName,
      schoolNumber: schoolNum,
      sequenceNumber: nextSeqNum,
      parentPhone: newPhone,
      parentLogin: creds.login,
      parentPassword: creds.password,
      credentialsActivated: false
    };

    if (!user?.schoolId) {
      alert('Maktab ma\'lumoti topilmadi. Iltimos, qayta tizimga kiring.');
      return;
    }

    const result = await saveStudent(newStudent, user.schoolId);
    setStudents(result);
    setGeneratedCreds({ login: creds.login, pass: creds.password });
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewFullName('');
    setNewBirthDate('');
    setNewPhone('');
    setGeneratedCreds(null);
  };

  const handleDailyEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !teacherNote) {
      alert("Iltimos, o‘quvchini tanlang va kunlik izohni yozing.");
      return;
    }

    const targetStudent = students.find(s => s.id === selectedStudentId);
    if (!targetStudent) return;

    setIsAnalyzing(true);
    try {
      const health = selectedHealth === 'sog‘lom' ? "sog'lom" : selectedHealth;

      await submitDailyLog({
        studentId: selectedStudentId,
        logText: teacherNote,
        mood: selectedMood,
        health,
      });

      const updatedReports = await getReportsForStudent(selectedStudentId);
      setReports(updatedReports);
      await refetchStudents();

      setTeacherNote('');
      setSelectedStudentId('');
      alert(`AI tahlili yakunlandi! ${targetStudent.fullName} uchun kunlik hisobot ota-ona dashboardida e'lon qilindi.`);
      setActiveTab('roster');
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi. Iltimos qayta urining.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filter students based on search and class filter
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.parentLogin.includes(searchQuery);
    const matchesClass = classFilter === 'all' || s.className === classFilter;
    return matchesSearch && matchesClass;
  });

  const moodEmojis = {
    xursand: '🌟',
    oddiy: '🙂',
    tashvishli: '😟',
    charchagan: '😴'
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row font-sans text-ink">
      {/* Sidebar Navigation for Desktop */}
      <aside className="w-64 bg-deep flex flex-col h-screen sticky top-0 shrink-0 text-[#D3E6F5] hidden md:flex z-20 shadow-xl border-r border-cardBlue/10">
        <div className="p-6">
          <h1 className="text-white font-serif text-2xl italic tracking-tight">Yordamchi <span className="text-red-500 text-sm">med</span></h1>
          <p className="text-[#D3E6F5] text-[10px] uppercase tracking-widest mt-1 opacity-70">O‘qituvchi Kabineti</p>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-2">
          <button
            onClick={() => setActiveTab('roster')}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
              activeTab === 'roster' ? 'bg-[#1B6FA8] text-white font-medium shadow-md shadow-primary/25' : 'text-[#D3E6F5] hover:bg-[#1B6FA8]/20'
            }`}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">Mening Sinfim</span>
          </button>
          <button
            onClick={() => setActiveTab('entry')}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
              activeTab === 'entry' ? 'bg-[#1B6FA8] text-white font-medium shadow-md shadow-primary/25' : 'text-[#D3E6F5] hover:bg-[#1B6FA8]/20'
            }`}
          >
            <ClipboardList className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">Kunlik Qaydlar</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
              activeTab === 'stats' ? 'bg-[#1B6FA8] text-white font-medium shadow-md shadow-primary/25' : 'text-[#D3E6F5] hover:bg-[#1B6FA8]/20'
            }`}
          >
            <BarChart className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">Sinf Hisoboti</span>
          </button>
          <button
            onClick={() => setActiveTab('cameras')}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
              activeTab === 'cameras' ? 'bg-[#1B6FA8] text-white font-medium shadow-md shadow-primary/25' : 'text-[#D3E6F5] hover:bg-[#1B6FA8]/20'
            }`}
          >
            <Video className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">Sinf Kamerasi</span>
          </button>
          <button
            onClick={() => navigate('/teacher/profile')}
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer text-left text-[#D3E6F5] hover:bg-[#1B6FA8]/20"
          >
            <User className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">Mening Profilim</span>
          </button>
        </nav>
        <div className="p-6 border-t border-[#D3E6F5]/10 flex flex-col gap-4">
          <div
            onClick={() => navigate('/teacher/profile')}
            className="flex items-center space-x-3 text-white cursor-pointer hover:bg-white/5 p-1.5 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-coral rounded-full flex items-center justify-center font-bold text-white uppercase shadow-md shadow-coral/25 shrink-0">
              {user?.displayName ? user.displayName.slice(0, 2) : 'O‘'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate leading-tight text-white">{user?.displayName || 'O‘qituvchi'}</p>
              <p className="text-[10px] text-[#D3E6F5] opacity-60 truncate">Sinf rahbari • Profil →</p>
            </div>
          </div>
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
          <div className="bg-primary text-white rounded-full p-2">
            <School className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-black text-deep block leading-tight font-serif">YORDAMCHI <span className="text-red-500 text-[10px]">MED</span></span>
            <span className="text-[10px] text-muted">№{user?.schoolNumber || 12}-Maktab</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/teacher/profile')}
            className="text-primary text-xs font-bold py-1.5 px-3 hover:bg-primary/5 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <User className="w-3.5 h-3.5" /> Profil
          </button>
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
            onClick={() => setActiveTab('roster')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'roster' ? 'bg-primary text-white shadow-md' : 'text-muted'
            }`}
          >
            <Users className="w-4 h-4" /> Sinfim
          </button>
          <button
            onClick={() => setActiveTab('entry')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'entry' ? 'bg-primary text-white shadow-md' : 'text-muted'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Qaydlar
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'stats' ? 'bg-primary text-white shadow-md' : 'text-muted'
            }`}
          >
            <BarChart className="w-4 h-4" /> Hisobot
          </button>
          <button
            onClick={() => setActiveTab('cameras')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'cameras' ? 'bg-primary text-white shadow-md' : 'text-muted'
            }`}
          >
            <Video className="w-4 h-4" /> Kamera
          </button>
        </div>

        {/* Dynamic Section Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif text-deep font-bold">
              {activeTab === 'roster' && 'Mening Sinfim'}
              {activeTab === 'entry' && 'Kunlik Qaydlar'}
              {activeTab === 'stats' && 'Sinf Bo‘yicha Hisobot'}
              {activeTab === 'cameras' && 'Sinf Xonasi Kamerasi'}
            </h2>
            <p className="text-muted text-xs sm:text-sm mt-1">
              {activeTab === 'roster' && `Maktab №${user?.schoolNumber || 12} • Bugun ${students.length} nafar o‘quvchidan ${reports.filter(r => r.date === new Date().toISOString().split('T')[0]).length} tasida qayd etildi`}
              {activeTab === 'entry' && 'O‘quvchilarning dars davomidagi holatini kiritish va tahlil qilish bo‘limi'}
              {activeTab === 'stats' && 'Sinf faolligi va kunlik emotsional ko‘rsatkichlar tahlili'}
              {activeTab === 'cameras' && 'Sinf xonasi va mashg\'ulot hududining real-vaqtdagi kuzatuv kameralari'}
            </p>
          </div>
          {activeTab === 'roster' && (
            <Button variant="coral" size="md" className="gap-2 self-start sm:self-center shadow-lg shadow-coral/10 hover:brightness-110 font-bold" onClick={() => setIsAddModalOpen(true)}>
              <span className="text-xl leading-none font-black">+</span> Yangi o‘quvchi qo‘shish
            </Button>
          )}
        </header>

        {/* Tab 1: Class Roster (High Density Layout) */}
        {activeTab === 'roster' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* Left Column: Student Roster (High Density Table on desktop, cards on mobile) */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-cardBlue overflow-hidden flex flex-col">
              <div className="bg-[#D3E6F5]/30 px-6 py-4 border-b border-cardBlue flex justify-between items-center shrink-0">
                <span className="font-semibold uppercase tracking-wider text-xs text-muted">O‘quvchilar ro‘yxati</span>
                <div className="text-xs text-primary font-bold">Jami: {filteredStudents.length} ta o‘quvchi</div>
              </div>

              {/* Search and Filters inside card */}
              <div className="p-4 bg-bg/20 border-b border-cardBlue/50 flex flex-col sm:flex-row gap-3 shrink-0">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-3 text-muted">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Ismi yoki login bo‘yicha qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-cardBlue rounded-xl focus:border-primary focus:outline-none text-sm placeholder-muted/50"
                  />
                </div>
                <div className="w-full sm:w-40">
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-cardBlue rounded-xl focus:border-primary focus:outline-none text-sm cursor-pointer"
                  >
                    <option value="all">Barcha sinflar</option>
                    <option value="4-A">4-A sinfi</option>
                    <option value="3-B">3-B sinfi</option>
                    <option value="5-A">5-A sinfi</option>
                  </select>
                </div>
              </div>

              {/* High Density Table for Desktop */}
              {filteredStudents.length === 0 ? (
                <div className="text-center p-12 text-muted flex flex-col items-center gap-3">
                  <Users className="w-12 h-12 text-primary/25" />
                  <p className="font-semibold text-lg text-deep">Birorta o‘quvchi topilmadi</p>
                  <p className="text-sm">Qidiruv parametrlarini o‘zgartiring yoki yangi o‘quvchi qo‘shing.</p>
                </div>
              ) : (
                <>
                  {/* Desktop view table */}
                  <div className="hidden md:block flex-1 overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="sticky top-0 bg-white border-b border-cardBlue z-10">
                        <tr className="text-muted text-[10px] uppercase tracking-widest border-b border-cardBlue/50">
                          <th className="px-6 py-4">Ism-sharif / Ma‘lumotlar</th>
                          <th className="px-6 py-4">Status & Aloqa</th>
                          <th className="px-6 py-4 text-center">Bugungi Kayfiyat</th>
                          <th className="px-6 py-4 text-right">Amal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cardBlue/30">
                        {filteredStudents.map((student) => {
                          const todayStr = new Date().toISOString().split('T')[0];
                          const hasTodayReport = reports.some(
                            (r) => r.studentId === student.id && r.date === todayStr
                          );
                          const studentReports = reports.filter(r => r.studentId === student.id);
                          const lastReport = studentReports.length > 0 ? studentReports[0] : null;

                          return (
                            <tr key={student.id} className="hover:bg-[#EAF3FB]/50 transition-all">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                    {student.fullName[0]}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-deep text-sm leading-tight">{student.fullName}</div>
                                    <div className="text-xs text-muted">Sinf: {student.className} • ID: {student.parentLogin}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-muted font-bold font-mono">Tel:</span>
                                    <span className="text-xs text-deep font-semibold">{student.parentPhone}</span>
                                  </div>
                                  <div>
                                    <Badge variant={student.credentialsActivated ? 'success' : 'muted'} className="text-[9px] py-0 px-1.5 uppercase font-bold">
                                      {student.credentialsActivated ? 'Faol' : 'Kutilmoqda'}
                                    </Badge>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {hasTodayReport && lastReport ? (
                                  <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-[#EAF3FB] border border-cardBlue rounded-full text-xs font-bold text-primary">
                                    <span>{moodEmojis[lastReport.mood]}</span>
                                    <span className="capitalize">{lastReport.mood}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted italic">Kiritilmagan</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {hasTodayReport ? (
                                  <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Yuborildi</span>
                                ) : (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    className="!py-1.5 !px-3 min-h-0 text-xs font-bold rounded-full shadow-sm"
                                    onClick={() => {
                                      setSelectedStudentId(student.id);
                                      setActiveTab('entry');
                                    }}
                                  >
                                    <ClipboardList className="w-3.5 h-3.5 mr-1" /> Qayd etish
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile view responsive cards */}
                  <div className="md:hidden flex-1 overflow-y-auto p-4 space-y-4">
                    {filteredStudents.map((student) => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      const hasTodayReport = reports.some(
                        (r) => r.studentId === student.id && r.date === todayStr
                      );
                      const studentReports = reports.filter(r => r.studentId === student.id);
                      const lastReport = studentReports.length > 0 ? studentReports[0] : null;

                      return (
                        <div key={student.id} className="p-4 border border-cardBlue bg-white rounded-2xl flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-deep text-sm">{student.fullName}</h4>
                              <p className="text-xs text-muted">Sinf: {student.className} • ID: {student.parentLogin}</p>
                            </div>
                            <Badge variant={student.credentialsActivated ? 'success' : 'muted'} className="text-[9px] uppercase font-bold">
                              {student.credentialsActivated ? 'Faol' : 'Kutilmoqda'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted border-t border-dashed border-cardBlue/50 pt-2 flex justify-between items-center">
                            <span>Tel: {student.parentPhone}</span>
                            {hasTodayReport && lastReport ? (
                              <span className="font-bold text-primary">{moodEmojis[lastReport.mood]} {lastReport.mood}</span>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="!py-1 !px-2 min-h-0 text-[10px] rounded-full"
                                onClick={() => {
                                  setSelectedStudentId(student.id);
                                  setActiveTab('entry');
                                }}
                              >
                                Qayd etish
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Right Column: AI Insights & Quick Stats */}
            <div className="flex flex-col space-y-6">
              {/* AI Class Insight Card */}
              <div className="bg-[#1B6FA8] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden shrink-0 flex flex-col justify-between min-h-[180px]">
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg shadow-inner">✨</div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D3E6F5]">AI Analitika (Sinf)</span>
                  </div>
                  <p className="text-sm leading-relaxed mb-4 text-[#EAF3FB]">
                    Bugun {reports.filter(r => r.date === new Date().toISOString().split('T')[0]).length > 0 
                      ? `sinfdagi ${reports.filter(r => r.date === new Date().toISOString().split('T')[0]).length} nafar o‘quvchi hisoboti kiritildi. O‘quvchilarning umumiy kayfiyat ko‘rsatkichi barqaror baholanmoqda.` 
                      : "Hali bugun uchun o‘quvchilarning kunlik hisobotlari kiritilmadi. Bolalar holatini kiritishingiz bilan AI tahlili bu yerda shakllanadi."
                    }
                  </p>
                </div>
                <div className="relative z-10 flex items-center justify-between mt-auto">
                  <div className="text-xs text-white/70 italic">Haftalik trend +12%</div>
                  <button 
                    onClick={() => setActiveTab('stats')}
                    className="text-xs bg-white text-primary px-3 py-1.5 rounded-full font-bold cursor-pointer hover:bg-white/90 transition-all shadow-md"
                  >
                    Batafsil
                  </button>
                </div>
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none"></div>
              </div>

              {/* Quick Stats Bento */}
              <div className="bg-white rounded-3xl shadow-sm border border-cardBlue p-6 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Bugungi Ko‘rsatkichlar</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-bg rounded-2xl border border-cardBlue/30">
                    <span className="text-sm font-semibold text-deep">Faollik (Kelganlar)</span>
                    <span className="text-base font-black text-primary">
                      {reports.filter(r => r.date === new Date().toISOString().split('T')[0]).length} / {students.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-bg rounded-2xl border border-cardBlue/30">
                    <span className="text-sm font-semibold text-deep">Sog‘lom</span>
                    <span className="text-base font-black text-emerald-600">
                      {reports.filter(r => r.date === new Date().toISOString().split('T')[0] && r.healthStatus === 'sog‘lom').length} ta
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-white border border-coral/20 rounded-2xl">
                    <span className="text-sm text-coral font-semibold">E‘tibor talab (Bezovta)</span>
                    <span className="text-base font-black text-coral">
                      {reports.filter(r => r.date === new Date().toISOString().split('T')[0] && (r.healthStatus === 'betob' || r.healthStatus === 'yengil bezovta' || r.mood === 'tashvishli')).length} ta
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-cardBlue/20">
                  <div className="text-[10px] uppercase font-bold text-muted mb-2 tracking-wider">Haftalik Qaydlar dinamikasi</div>
                  <div className="flex items-end space-x-1.5 h-14">
                    {[
                      { day: 'DU', h: 'h-4/5', active: false },
                      { day: 'SE', h: 'h-3/4', active: false },
                      { day: 'CH', h: 'h-4/5', active: false },
                      { day: 'PA', h: 'h-full', active: false },
                      { day: 'JU', h: 'h-5/6', active: false },
                      { day: 'SH', h: 'h-1/3', active: false },
                      { day: 'YA', h: 'h-[10%]', active: true },
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div className={`w-full rounded-t-sm transition-all ${
                          bar.active ? 'bg-coral' : 'bg-[#1B6FA8]/40 hover:bg-[#1B6FA8]/80'
                        } ${bar.h}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] text-muted font-bold mt-1.5 px-0.5">
                    <span>DU</span><span>SE</span><span>CH</span><span>PA</span><span>JU</span><span>SH</span><span>YA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Daily Status Entry */}
        {activeTab === 'entry' && (
          <div className="max-w-2xl mx-auto w-full">
            <Card variant="white" className="p-6 sm:p-8 shadow-sm border border-cardBlue rounded-3xl">
              <div className="flex items-center gap-3 border-b border-cardBlue/50 pb-4 mb-6">
                <div className="bg-coral/10 text-coral rounded-full p-2.5">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-deep font-serif">Kunlik hisobot shakllantirish</h3>
                  <p className="text-xs text-muted">Pedagogik kuzatuv va kayfiyat darajalarini belgilang</p>
                </div>
              </div>

              <form onSubmit={handleDailyEntrySubmit} className="flex flex-col gap-6">
                {/* Select Student */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep pl-1">O‘quvchini tanlang</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-cardBlue rounded-xl focus:border-primary focus:outline-none text-sm cursor-pointer"
                  >
                    <option value="">-- O‘quvchini tanlang --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.className})</option>
                    ))}
                  </select>
                </div>

                {/* Mood Selector Component */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-deep pl-1">Bugungi umumiy kayfiyati</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { type: 'xursand', icon: <Smile className="w-6 h-6 text-emerald-500" />, label: 'Xursand', bg: 'hover:bg-emerald-50 border-emerald-200', activeBg: 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' },
                      { type: 'oddiy', icon: <Smile className="w-6 h-6 text-sky-500" />, label: 'Oddiy', bg: 'hover:bg-sky-50 border-sky-200', activeBg: 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20' },
                      { type: 'tashvishli', icon: <Frown className="w-6 h-6 text-amber-500" />, label: 'Tashvishli', bg: 'hover:bg-amber-50 border-amber-200', activeBg: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' },
                      { type: 'charchagan', icon: <Meh className="w-6 h-6 text-slate-500" />, label: 'Charchagan', bg: 'hover:bg-slate-50 border-slate-200', activeBg: 'bg-slate-500 text-white border-slate-500 shadow-md shadow-slate-500/20' }
                    ].map((moodItem) => {
                      const isSelected = selectedMood === moodItem.type;
                      return (
                        <button
                          key={moodItem.type}
                          type="button"
                          onClick={() => setSelectedMood(moodItem.type as any)}
                          className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected ? moodItem.activeBg : `bg-white text-deep ${moodItem.bg}`
                          }`}
                        >
                          {moodItem.icon}
                          <span className="text-xs font-bold">{moodItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Health Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep pl-1">Salomatlik holati</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {[
                      { type: 'sog‘lom', label: 'Sog‘lom ✅', color: 'border-emerald-200 hover:bg-emerald-50', active: 'bg-emerald-500 text-white border-emerald-500 shadow-sm' },
                      { type: 'yengil bezovta', label: 'Yengil bezovta ⚠️', color: 'border-amber-200 hover:bg-amber-50', active: 'bg-amber-500 text-white border-amber-500 shadow-sm' },
                      { type: 'betob', label: 'Betob 🛑', color: 'border-rose-200 hover:bg-rose-50', active: 'bg-rose-500 text-white border-rose-500 shadow-sm' }
                    ].map((healthItem) => {
                      const isSelected = selectedHealth === healthItem.type;
                      return (
                        <button
                          key={healthItem.type}
                          type="button"
                          onClick={() => setSelectedHealth(healthItem.type as any)}
                          className={`flex-1 py-3 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected ? healthItem.active : `bg-white text-deep ${healthItem.color}`
                          }`}
                        >
                          {healthItem.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Free Text Teacher Comment Note */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep pl-1">O‘qituvchi izohi va darslikdagi kuzatuvlar</label>
                  <textarea
                    rows={4}
                    required
                    value={teacherNote}
                    onChange={(e) => setTeacherNote(e.target.value)}
                    placeholder="Masalan: Sardor bugun rasm chizish darsida juda diqqatli bo'ldi. Geometrik shakllarni qunt bilan bo'yadi. Tushlikdan so'ng bir oz charchoq kuzatildi, lekin kayfiyati barqaror bo'ldi."
                    className="w-full px-4 py-3 bg-white border-2 border-cardBlue rounded-xl focus:border-primary focus:outline-none text-sm placeholder-muted/50 resize-none"
                  />
                  <span className="text-[11px] text-muted pl-1 leading-relaxed">Izohni professional, batafsil va ota-onani ruhan qo‘llab-quvvatlaydigan tarzda yozish tavsiya etiladi.</span>
                </div>

                {/* Submit button with Loading Spinner */}
                <Button variant="primary" size="lg" fullWidth type="submit" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Sparkles className="w-5 h-5 animate-spin" /> AI tahlili shakllantirilmoqda...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 justify-center">
                      <ClipboardList className="w-5 h-5" /> Hisobotni saqlash va Ota-onaga jo‘natish
                    </span>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* Tab 3: Class Reports */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 text-center flex flex-col items-center justify-center gap-2 border border-cardBlue shadow-sm">
                <Users className="w-8 h-8 text-primary" />
                <h4 className="text-3xl font-black text-deep">{students.length} ta</h4>
                <p className="text-sm text-muted">Jami faol o‘quvchilar</p>
              </div>

              <div className="bg-white rounded-3xl p-6 text-center flex flex-col items-center justify-center gap-2 border border-cardBlue shadow-sm">
                <ClipboardList className="w-8 h-8 text-coral" />
                <h4 className="text-3xl font-black text-deep">{reports.length} ta</h4>
                <p className="text-sm text-muted">Jami kiritilgan kunlik qaydlar</p>
              </div>

              <div className="bg-white rounded-3xl p-6 text-center flex flex-col items-center justify-center gap-2 border border-cardBlue shadow-sm">
                <Smile className="w-8 h-8 text-emerald-500" />
                <h4 className="text-3xl font-black text-deep">
                  {reports.length > 0
                    ? Math.round((reports.filter(r => r.mood === 'xursand' || r.mood === 'oddiy').length / reports.length) * 100)
                    : 100}%
                </h4>
                <p className="text-sm text-muted">Ijobiy/barqaror kayfiyat darajasi</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cardBlue shadow-sm">
              <h3 className="text-lg font-bold text-deep mb-4 font-serif flex items-center gap-2">
                <Calendar className="w-5 h-5 text-coral" /> Sinf bo‘yicha so‘nggi kiritilgan qaydlar tarixi
              </h3>
              {reports.length === 0 ? (
                <p className="text-center text-muted p-6">Hozircha tarix mavjud emas</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-cardBlue text-deep font-bold">
                        <th className="py-3 px-4">Sana</th>
                        <th className="py-3 px-4">O‘quvchi</th>
                        <th className="py-3 px-4">Kayfiyat</th>
                        <th className="py-3 px-4">Salomatlik</th>
                        <th className="py-3 px-4">Izoh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.slice(0, 15).map((rep) => {
                        const stud = students.find(s => s.id === rep.studentId);
                        return (
                          <tr key={rep.id} className="border-b border-cardBlue/30 hover:bg-[#EAF3FB]/30 transition-all">
                            <td className="py-3 px-4 font-medium text-xs sm:text-sm">{rep.date}</td>
                            <td className="py-3 px-4 font-bold text-deep text-xs sm:text-sm">{stud ? stud.fullName : 'Noma’lum'}</td>
                            <td className="py-3 px-4">
                              <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block">
                                {moodEmojis[rep.mood]} {rep.mood}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={rep.healthStatus === 'sog‘lom' ? 'success' : 'warning'} className="text-[10px] py-0 px-2 uppercase font-bold">
                                {rep.healthStatus}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 max-w-xs truncate text-muted text-xs">"{rep.teacherNote}"</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Classroom Cameras View */}
        {activeTab === 'cameras' && (
          <div className="flex-1 flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-cardBlue shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-deep font-serif">Sinf Xonasi va Mashg'ulot Kamerasi</h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Stream
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">
                  №{user?.schoolNumber || 12}-sonli maktab • Sinf xonasidagi onlayn kuzatuv kameralari va mashg'ulot nazorati
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-bg px-3 py-1.5 rounded-xl text-deep border border-primary/10">
                  {new Date().toLocaleTimeString('uz-UZ')}
                </span>
              </div>
            </div>

            {/* Camera Feeds Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { id: 1, name: "Doska va O'qituvchi Minbari", detail: "Sinf doskasi va asosiy o'quv maydoni" },
                { id: 2, name: "O'quvchilar Mashg'ulot Stollari", detail: "Partalar va guruhli dars bajarish zonasi" },
                { id: 3, name: "Sensor & Psixologik O'yin Burchagi", detail: "Yumshoq gilamcha va motorika jihozlari" },
                { id: 4, name: "Kirish va Dam Olish Hududi", detail: "Sinfga kirish va kiyim almashtirish sohasi" },
              ].map((cam) => (
                <div key={cam.id} className="bg-white rounded-3xl border border-cardBlue overflow-hidden shadow-sm flex flex-col group">
                  <div className="bg-slate-950 relative aspect-video flex items-center justify-center">
                    {/* LIVE Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                      <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                      <span className="text-white text-[10px] font-mono font-bold tracking-wider">LIVE 1080p</span>
                    </div>

                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-white/90 text-xs font-bold font-serif">
                      Kamera #{cam.id}
                    </div>

                    {/* Video Placeholder Content */}
                    <div className="text-center p-6 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/40 group-hover:scale-110 transition-transform">
                        <Video className="w-8 h-8" />
                      </div>
                      <p className="text-xs text-white/60 font-mono">Sinf stream oqimi faol kutilmoqda...</p>
                    </div>

                    {/* Control Bar overlay on camera stream bottom */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 text-white text-xs">
                      <span className="text-[11px] font-medium text-white/80">{cam.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => alert(`Kamera #${cam.id} ovozi yoqildi`)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          title="Ovozni eshitish"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Kamera #${cam.id} rasmga olindi`)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          title="Foto snapshot olish"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Kamera #${cam.id} to'liq ekranga o'tkazildi`)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          title="To'liq ekranga yoyish"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between bg-white border-t border-cardBlue/50">
                    <div>
                      <h4 className="font-bold text-deep text-sm">{cam.name}</h4>
                      <p className="text-xs text-muted">{cam.detail}</p>
                    </div>
                    <Badge variant="success" className="text-[10px] uppercase font-bold">Faol</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Yangi o‘quvchi qo‘shish">
        {!generatedCreds ? (
          <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
            <Input
              label="O‘quvchining To‘liq Ismi (F.I.Sh)"
              type="text"
              required
              placeholder="Masalan: G‘ofurov Muhammadjon"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
            />

            <Input
              label="Tug‘ilgan kuni"
              type="date"
              required
              value={newBirthDate}
              onChange={(e) => setNewBirthDate(e.target.value)}
            />

            <Select
              label="Sinfi"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              options={[
                { value: '4-A', label: '4-A sinfi' },
                { value: '3-B', label: '3-B sinfi' },
                { value: '5-A', label: '5-A sinfi' }
              ]}
            />

            <Input
              label="Ota-ona telefon raqami"
              type="tel"
              required
              placeholder="Masalan: +998 90 987 65 43"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />

            <Button variant="coral" size="lg" fullWidth type="submit" className="mt-4">
              <ClipboardList className="w-5 h-5 mr-1.5" /> Saqlash va parollarni yaratish
            </Button>
          </form>
        ) : (
          /* GeneratedCredentialsCard shown inside Modal */
          <div className="flex flex-col gap-6">
            <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl p-6 text-center flex flex-col gap-4">
              <div className="bg-emerald-50 text-emerald-700 font-bold text-xs py-1 px-3 rounded-full self-center uppercase tracking-wider">
                Parollar muvaffaqiyatli yaratildi 🎉
              </div>
              <div>
                <h4 className="text-xl font-bold text-deep font-serif mb-1">{newFullName}</h4>
                <p className="text-xs text-muted">Sinfi: {newClassName} • Maktab №{user?.schoolNumber || 12}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-primary/10 py-4 text-left my-2 bg-white rounded-xl px-4">
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase block">Login:</span>
                  <span className="text-base font-black text-deep font-mono">{generatedCreds.login}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase block">Parol:</span>
                  <span className="text-base font-black text-coral font-mono">{generatedCreds.pass}</span>
                </div>
              </div>

              <div className="text-xs text-muted leading-relaxed">
                Ushbu login-parol orqali ota-ona o‘z dashboardiga kompyuter yoki mobil telefon orqali bemalol kira oladi.
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                fullWidth
                className="gap-1.5 text-xs font-bold"
                onClick={() => {
                  console.log("Printing credential card for ", newFullName);
                  alert("Chop etish drayveri yuklanmoqda... Qarta chop etishga yuborildi.");
                }}
              >
                <Printer className="w-4 h-4" /> Chop etish
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                className="gap-1.5 text-xs font-bold"
                onClick={() => {
                  console.log("Sending credential SMS to ", newPhone, " credentials:", generatedCreds);
                  alert(`Ota-ona telefon raqamiga (${newPhone}) SMS jo‘natildi.`);
                }}
              >
                <Send className="w-4 h-4" /> SMS yuborish
              </Button>
            </div>

            <Button variant="ghost" fullWidth onClick={handleCloseAddModal} className="font-bold">
              Yopish va qaytish
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
