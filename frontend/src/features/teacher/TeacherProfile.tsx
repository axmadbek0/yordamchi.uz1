/**
 * Premium Teacher Profile Page (/teacher/profile)
 * Complete implementation with inline-edit, password strength meter, notifications, AI tone customization
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  User,
  Edit2,
  Check,
  X,
  Shield,
  Lock,
  Bell,
  Sparkles,
  Award,
  Clock,
  Users,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Building,
  Calendar,
  Mail,
  Phone,
  Sparkle,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useChatContext } from '../../components/ai-chat/ChatContext';

export function TeacherProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setContextInfo } = useChatContext();

  useEffect(() => {
    setContextInfo('teacher', '/teacher/profile');
  }, []);


  // 1.3 Personal Data (Inline-edit states)
  const [profileData, setProfileData] = useState({
    fullName: user?.displayName || 'Abdullayeva Nodira',
    phone: '+998 90 123 45 67',
    email: 'nodira.teacher@yordamchi.med',
    birthDate: '1988-04-12',
    schoolName: `${user?.schoolNumber || 12}-sonli ixtisoslashtirilgan maktab`,
    className: '2-A sinf',
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleStartEdit = (field: keyof typeof profileData) => {
    setEditingField(field);
    setTempValue(profileData[field]);
  };

  const handleSaveEdit = (field: keyof typeof profileData) => {
    setProfileData((prev) => ({ ...prev, [field]: tempValue }));
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  // 1.4 Security & Accordion Password Change
  const [isPasswordAccordionOpen, setIsPasswordAccordionOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState(false);

  // Password Strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Kiritilmagan', color: 'bg-slate-200', text: 'text-slate-400' };
    if (pass.length < 6) return { score: 33, label: 'Zaif', color: 'bg-coral', text: 'text-coral' };
    if (pass.length < 10 || !/\d/.test(pass)) return { score: 66, label: 'O\'rta', color: 'bg-amber-500', text: 'text-amber-600' };
    return { score: 100, label: 'Kuchli', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert("Yangi parollar mos kelmadi!");
      return;
    }
    setPasswordSuccessMsg(true);
    setTimeout(() => {
      setPasswordSuccessMsg(false);
      setIsPasswordAccordionOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 2000);
  };

  // 1.5 Notification Toggles
  const [notifications, setNotifications] = useState({
    parentRequests: true,
    dailyReminder: true,
    weeklyReport: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 1.6 AI Writing Tone Customization
  const [aiTone, setAiTone] = useState<'formal' | 'warm' | 'concise'>('warm');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 pt-2">
      {/* Top Corner Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/teacher/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-bg text-deep font-bold text-xs border border-primary/10 shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-primary" /> Orqaga (Kabinetga)
        </button>
        <span className="text-xs font-semibold text-muted">O'qituvchi Profili Sozlamalari</span>
      </div>

      {/* 1.1 Identity Header */}
      <Card variant="white" className="p-6 sm:p-8 relative overflow-hidden border border-primary/10 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with hover pencil edit icon */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-coral to-deep text-white text-3xl font-black flex items-center justify-center shadow-lg border-4 border-white">
              {profileData.fullName.slice(0, 2).toUpperCase()}
            </div>
            <button
              type="button"
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white text-deep shadow-md border border-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
              title="Fotosuratni tahrirlash"
              onClick={() => alert("Profil rasmini almashtirish darchasi")}
            >
              <Edit2 className="w-4 h-4 text-coral" />
            </button>
          </div>

          {/* User Meta Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-deep font-serif">
                {profileData.fullName}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-coral text-white shadow-xs">
                O'qituvchi
              </span>
            </div>

            <p className="text-sm text-muted font-medium flex items-center justify-center sm:justify-start gap-2">
              <Building className="w-4 h-4 text-primary" /> {profileData.schoolName}, {profileData.className}
            </p>

            {/* Trust Indicator */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/8 text-primary text-xs font-semibold border border-primary/10">
                <Award className="w-4 h-4 text-primary" /> Yordamchi med'da 3 oydan beri
              </span>
              <span className="text-xs text-muted">Oxirgi kirish: bugun, 09:14</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 1.2 Statistics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Boshqarilgan O\'quvchilar', value: '45 nafar', icon: Users, color: 'text-primary' },
          { label: 'Bu Oy Kiritilgan Holatlar', value: '128 ta', icon: ClipboardCheck, color: 'text-emerald-600' },
          { label: 'O\'rtacha Javob Berish Vaqti', value: '15 daqiqa', icon: Clock, color: 'text-coral' },
        ].map((stat, i) => (
          <Card
            key={i}
            variant="white"
            className="p-5 border border-primary/10 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <h3 className="text-2xl font-black text-deep mt-2">{stat.value}</h3>
          </Card>
        ))}
      </div>

      {/* 1.3 Personal Information Section (Inline Edit) */}
      <Card variant="white" className="p-6 border border-primary/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-primary/8 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-deep font-serif">Shaxsiy Ma'lumotlar</h2>
          </div>
          <span className="text-xs text-muted">Ustiga bosib tahrirlang</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'fullName', label: 'F.I.Sh.', value: profileData.fullName, icon: User },
            { key: 'phone', label: 'Telefon Raqam', value: profileData.phone, icon: Phone },
            { key: 'email', label: 'Elektron Pochta', value: profileData.email, icon: Mail },
            { key: 'birthDate', label: 'Tug\'ilgan Sana', value: profileData.birthDate, icon: Calendar },
          ].map((field) => (
            <div
              key={field.key}
              className="p-3.5 rounded-2xl bg-bg/50 border border-primary/5 hover:border-primary/20 transition-all"
            >
              <span className="block text-xs font-semibold text-muted mb-1 flex items-center gap-1.5">
                <field.icon className="w-3.5 h-3.5 text-primary/70" /> {field.label}
              </span>

              {editingField === field.key ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm bg-white rounded-xl border border-coral focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(field.key as any)}
                    className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => handleStartEdit(field.key as any)}
                  className="flex items-center justify-between font-bold text-deep text-sm cursor-pointer group py-0.5"
                >
                  <span>{field.value}</span>
                  <Edit2 className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 1.6 AI Customization Tone Section */}
      <Card variant="white" className="p-6 border border-primary/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-primary/8 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-coral animate-pulse" />
            <h2 className="text-lg font-bold text-deep font-serif">AI Yordamchi Bilan Sozlash</h2>
          </div>
          <span className="text-xs bg-coral/10 text-coral font-bold px-2 py-0.5 rounded-full">Premium Touch</span>
        </div>

        <p className="text-xs text-muted">
          AI kunlik holat yozuvlarini tahlil qilganda va ota-onalarga hisobot tayyorlaganda ushbu ohangdan foydalanadi:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'formal', title: 'Rasmiy & Pedagogik', desc: 'Aniq va ilmiy tushunchalar bilan' },
            { id: 'warm', title: 'Iliq & Do\'stona', desc: 'Samimiy, dalda beruvchi ohang' },
            { id: 'concise', title: 'Qisqa & Lirik', desc: 'Eng muhim nuqtalar muxtasar' },
          ].map((option) => (
            <div
              key={option.id}
              onClick={() => setAiTone(option.id as any)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                aiTone === option.id
                  ? 'border-coral bg-coral/5 shadow-xs'
                  : 'border-primary/10 hover:border-primary/30 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-deep">{option.title}</h4>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    aiTone === option.id ? 'border-coral bg-coral' : 'border-slate-300'
                  }`}
                >
                  {aiTone === option.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-xs text-muted mt-1">{option.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 1.4 Security Section & Accordion Password Change */}
      <Card variant="white" className="p-6 border border-primary/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-primary/8 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-deep font-serif">Xavfsizlik va Parol</h2>
          </div>
        </div>

        <div className="border border-primary/10 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsPasswordAccordionOpen((prev) => !prev)}
            className="w-full px-5 py-4 bg-bg/40 flex items-center justify-between font-bold text-sm text-deep hover:bg-bg transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> Parolni O'zgartirish
            </span>
            {isPasswordAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {isPasswordAccordionOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-5 border-t border-primary/10 bg-white"
              >
                {passwordSuccessMsg ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-bold text-center">
                    Parol muvaffaqiyatli o'zgartirildi!
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-bold text-deep mb-1">Joriy Parol</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-bg/50 rounded-xl text-xs border border-primary/10 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-deep mb-1">Yangi Parol</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-bg/50 rounded-xl text-xs border border-primary/10 focus:outline-none focus:border-primary pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Real-time Password Strength Meter */}
                      {newPassword && (
                        <div className="mt-2 space-y-1">
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${strength.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${strength.score}%` }}
                              transition={{ duration: 0.25 }}
                            />
                          </div>
                          <span className={`text-[11px] font-bold ${strength.text}`}>
                            Mustahkamlik: {strength.label}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-deep mb-1">Yangi Parolni Tasdiqlang</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-bg/50 rounded-xl text-xs border border-primary/10 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <Button type="submit" className="bg-primary text-white font-bold text-xs">
                      Parolni Yangilash
                    </Button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* 1.5 Notification Settings */}
      <Card variant="white" className="p-6 border border-primary/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-primary/8 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-deep font-serif">Bildirishnoma Sozlamalari</h2>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: 'parentRequests', label: 'Yangi ota-ona murojaati haqida bildirishnoma' },
            { key: 'dailyReminder', label: 'Kunlik holat kiritilmagan bo\'lsa eslatma yuborish' },
            { key: 'weeklyReport', label: 'Haftalik xulosa va AI statistikasi hisoboti' },
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
