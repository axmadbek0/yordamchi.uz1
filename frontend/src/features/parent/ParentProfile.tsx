/**
 * Premium Parent Profile Page (/parent/profile)
 * Complete implementation with linked children segmented control, read-only explanation, support call action
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { getStudents, getReportsForStudent } from '../../lib/db';
import { Student, DailyStatusEntry } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  User,
  Heart,
  Phone,
  School,
  Bell,
  HelpCircle,
  Globe,
  Sparkles,
  Lock,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Activity,
  Calendar,
  PhoneCall,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useChatContext } from '../../components/ai-chat/ChatContext';
import { useNavigate } from 'react-router-dom';

export function ParentProfile() {
  const { user } = useAuth();
  const { setContextInfo } = useChatContext();
  const navigate = useNavigate();

  useEffect(() => {
    setContextInfo('parent', '/parent/profile');
  }, []);

  // Students list associated with this parent
  const [childrenList, setChildrenList] = useState<Student[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [todayReport, setTodayReport] = useState<DailyStatusEntry | null>(null);

  useEffect(() => {
    getStudents().then((allStudents) => {
      if (user?.associatedStudentId) {
        const matched = allStudents.filter((s) => s.id === user.associatedStudentId);
        if (matched.length > 0) {
          setChildrenList(matched);
        } else {
          setChildrenList(allStudents.slice(0, 2));
        }
      } else {
        setChildrenList(allStudents.slice(0, 2));
      }
    });
  }, [user]);

  const currentChild = childrenList[selectedChildIndex] || null;

  useEffect(() => {
    if (currentChild) {
      getReportsForStudent(currentChild.id).then((reports) => {
        if (reports.length > 0) {
          setTodayReport(reports[0]);
        } else {
          setTodayReport(null);
        }
      });
    }
  }, [currentChild]);

  // 2.4 Language & Notification states
  const [language, setLanguage] = useState<'uz' | 'ru'>('uz');
  const [notifications, setNotifications] = useState({
    dailyStatus: true,
    weeklyReport: true,
    importantAnnouncements: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getMoodBadge = (mood?: string) => {
    if (mood === 'xursand') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Smile className="w-3.5 h-3.5 text-emerald-600" /> Bugun ko'tarinki
        </span>
      );
    } else if (mood === 'oddiy') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <Meh className="w-3.5 h-3.5 text-sky-600" /> Bugun barqaror
        </span>
      );
    } else if (mood === 'tashvishli' || mood === 'charchagan') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Frown className="w-3.5 h-3.5 text-amber-600" /> Sensor bezovtalik
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
        Holat hali kiritilmagan
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 pt-2">
      {/* Top Corner Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/parent/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-bg text-deep font-bold text-xs border border-primary/10 shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-primary" /> Orqaga (Kabinetga)
        </button>
        <span className="text-xs font-semibold text-muted">Ota-ona Profili Sozlamalari</span>
      </div>

      {/* 2.5 Prominent Support Call Header Box (Top View for Anxious Parents) */}
      <Card variant="white" className="p-5 border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-white to-coral/5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-deep text-base font-serif">Tezkor Muloqot va Qo'llab-quvvatlash</h3>
              <p className="text-xs text-muted">Savollaringiz bormi? Maktab pedagoglari va psixologlar bilan darhol bog'laning</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:+998712765432"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-coral hover:bg-coral/90 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <Phone className="w-4 h-4" /> Qo'ng'iroq Qilish
            </a>
            <button
              onClick={() => alert("Tez-tez so'raladigan savollar va qo'llanma")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-bg text-deep font-semibold text-xs border border-primary/10 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-primary" /> FAQ
            </button>
          </div>
        </div>
      </Card>

      {/* 2.1 Identity Header */}
      <Card variant="white" className="p-6 sm:p-8 border border-primary/10 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with brand colors circle */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary to-deep text-white text-3xl font-black flex items-center justify-center shadow-lg border-4 border-white shrink-0">
            {(user?.displayName || 'Dilshoda Karimova').slice(0, 2).toUpperCase()}
          </div>

          {/* Parent Meta Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-deep font-serif">
                {user?.displayName || 'Dilshoda Karimova'}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-xs">
                Mas'ul Shaxs
              </span>
            </div>

            <p className="text-xs text-muted flex items-center justify-center sm:justify-start gap-1">
              <Phone className="w-3.5 h-3.5 text-muted" /> Login: {user?.login || 'otaona12'}
            </p>

            {/* Linked Children Segmented Control */}
            {childrenList.length > 0 && (
              <div className="pt-3">
                <span className="block text-xs font-semibold text-muted mb-2">Bog'langan Farzandlar:</span>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {childrenList.map((child, idx) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChildIndex(idx)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        selectedChildIndex === idx
                          ? 'bg-deep text-white shadow-md'
                          : 'bg-bg text-muted hover:text-deep hover:bg-bg/80 border border-primary/10'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-coral text-white text-[10px] flex items-center justify-center">
                        {child.fullName.slice(0, 1)}
                      </div>
                      <span>{child.fullName}</span>
                      <span className="text-[10px] opacity-80">({child.className})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 2.2 Short Child Summary Card */}
      {currentChild && (
        <Card variant="white" className="p-6 border border-primary/10 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-primary/8 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-coral fill-coral" />
              <h2 className="text-lg font-bold text-deep font-serif">{currentChild.fullName} Haqida Ma'lumot</h2>
            </div>
            <button
              onClick={() => navigate('/parent/dashboard')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              To'liq Hisobot →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-bg/50 border border-primary/5">
              <span className="text-xs font-semibold text-muted block mb-1">Maktab va Sinf</span>
              <p className="font-bold text-deep text-sm">
                {currentChild.schoolNumber}-sonli Maktab, {currentChild.className}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg/50 border border-primary/5">
              <span className="text-xs font-semibold text-muted block mb-1">Tug'ilgan Sana</span>
              <p className="font-bold text-deep text-sm">{currentChild.birthDate || '2016-05-14'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg/50 border border-primary/5">
              <span className="text-xs font-semibold text-muted block mb-1">Bugungi Kayfiyat</span>
              <div className="mt-0.5">{getMoodBadge(todayReport?.mood)}</div>
            </div>
          </div>
        </Card>
      )}

      {/* 2.3 Personal Information (Read-only with warm explanation note) */}
      <Card variant="white" className="p-6 border border-primary/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-primary/8 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-deep font-serif">Ota-ona Ma'lumotlari</h2>
          </div>
          <span className="text-xs text-muted flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-muted" /> Faqat ko'rish rejimida
          </span>
        </div>

        {/* Warm Note Explanation */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-amber-800 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Eslatma:</strong> Shaxsiy ma'lumotlar xavfsizligini ta'minlash uchun telefon raqam va ism profil orqali o'zgartirilmaydi. Uxlash yoki o'zgartirish zarur bo'lsa, farzandingiz sinf rahbariga murojaat qiling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 opacity-85">
            <span className="block text-xs font-semibold text-muted mb-1">F.I.Sh.</span>
            <p className="font-bold text-deep text-sm">{user?.displayName || 'Dilshoda Karimova'}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 opacity-85">
            <span className="block text-xs font-semibold text-muted mb-1">Telefon Raqam</span>
            <p className="font-bold text-deep text-sm">+998 90 123 45 67</p>
          </div>
        </div>
      </Card>

      {/* 2.4 Language & Notification Settings */}
      <Card variant="white" className="p-6 border border-primary/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-primary/8 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-deep font-serif">Til va Bildirishnoma Sozlamalari</h2>
          </div>
        </div>

        {/* Language Selector */}
        <div>
          <label className="block text-xs font-bold text-deep mb-2">Interfeys Tili</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage('uz')}
              className={`flex-1 py-2.5 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                language === 'uz'
                  ? 'border-primary bg-primary/8 text-primary shadow-xs'
                  : 'border-primary/10 text-muted bg-white'
              }`}
            >
              O'zbekcha (Lotin)
            </button>

            <button
              onClick={() => alert("Rus tili tez orada qo'shiladi")}
              className="flex-1 py-2.5 px-4 rounded-2xl border border-primary/10 bg-slate-50 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              Русский язык <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Tez orada</span>
            </button>
          </div>
        </div>

        {/* Notification Switches */}
        <div className="space-y-3 pt-2">
          <span className="block text-xs font-bold text-deep">Xabarnoma Qabuli</span>
          {[
            { key: 'dailyStatus', label: 'Kunlik holat haqida sms/bildirishnoma' },
            { key: 'weeklyReport', label: 'Haftalik AI tahliliy hisoboti' },
            { key: 'importantAnnouncements', label: 'Maktab va internat muhim e\'lonlari' },
          ].map((item) => {
            const isChecked = notifications[item.key as keyof typeof notifications];
            return (
              <div
                key={item.key}
                onClick={() => toggleNotification(item.key as any)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-bg/40 border border-primary/5 hover:border-primary/15 transition-all cursor-pointer"
              >
                <span className="text-xs font-bold text-deep">{item.label}</span>
                <div
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                    isChecked ? 'bg-coral' : 'bg-slate-200'
                  }`}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full bg-white shadow-xs"
                    animate={{ x: isChecked ? 20 : 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
