/**
 * Admin Settings — Platform configuration
 * 5 states implemented
 */

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import {
  Bell,
  Languages,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  RefreshCw,
  Save,
  Check,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'motion/react';
import { getAdminSettings, saveAdminSettings } from '../../lib/adminDb';
import type { AdminSettingsData } from '../../types';
import { useNavigate } from 'react-router-dom';

type LoadState = 'loading' | 'success' | 'error';

function ToggleSwitch({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-deep">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
          enabled ? 'bg-primary' : 'bg-muted/30'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettingsData | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [showClearModal, setShowClearModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const loadData = () => {
    setState('loading');
    setTimeout(() => {
      try {
        setSettings(getAdminSettings());
        setState('success');
      } catch {
        setState('error');
      }
    }, 300);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    saveAdminSettings(settings);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearData = () => {
    if (confirmPassword === 'YordamchiResetSecurePassword2026!') {
      // Clear localStorage to empty arrays (so they don't re-seed on next load)
      localStorage.setItem('yordamchi_students', JSON.stringify([]));
      localStorage.setItem('yordamchi_reports', JSON.stringify([]));
      localStorage.setItem('yordamchi_admin_schools', JSON.stringify([]));
      localStorage.setItem('yordamchi_admin_teachers', JSON.stringify([]));
      localStorage.setItem('yordamchi_admin_billing', JSON.stringify([]));
      localStorage.setItem('yordamchi_admin_user_payments', JSON.stringify([]));
      
      // Close modal and navigate to dashboard
      setShowClearModal(false);
      navigate('/admin/dashboard');
      setTimeout(() => {
        window.location.reload(); // Refresh to update all active views to 0/empty
      }, 100);
    } else {
      setPasswordError('Xavfsizlik paroli noto‘g‘ri! Qayta urinib ko‘ring.');
    }
  };

  const updateNotification = (key: keyof AdminSettingsData['notifications'], value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      notifications: { ...settings.notifications, [key]: value },
    });
  };

  const updateSecurity = (key: keyof AdminSettingsData['security'], value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      security: { ...settings.security, [key]: value },
    });
  };

  // Loading
  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-primary/10 rounded-lg w-48 animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  // Error
  if (state === 'error' || !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle className="w-12 h-12 text-coral/40 mb-3" />
        <h2 className="text-lg font-bold text-deep mb-2">Sozlamalarni yuklab bo'lmadi</h2>
        <p className="text-muted mb-4">Iltimos, qaytadan urining</p>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Qayta urinish
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-deep font-serif">Tizim sozlamalari</h1>
        <p className="text-sm text-muted mt-0.5">Platformaning asosiy konfiguratsiyasi</p>
      </div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="white" className="!p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-deep">Platforma bildirishnomalari</h3>
          </div>
          <div className="space-y-1 max-w-md">
            <ToggleSwitch
              enabled={settings.notifications.emailAlerts}
              onToggle={() => updateNotification('emailAlerts', !settings.notifications.emailAlerts)}
              label="Email orqali ogohlantirishlar"
            />
            <ToggleSwitch
              enabled={settings.notifications.smsAlerts}
              onToggle={() => updateNotification('smsAlerts', !settings.notifications.smsAlerts)}
              label="SMS orqali ogohlantirishlar"
            />
            <ToggleSwitch
              enabled={settings.notifications.dailyReport}
              onToggle={() => updateNotification('dailyReport', !settings.notifications.dailyReport)}
              label="Kunlik hisobot yuborish"
            />
          </div>
        </Card>
      </motion.div>

      {/* AI Language */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card variant="white" className="!p-6">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-deep">AI javob tili sozlamalari</h3>
          </div>
          <div className="max-w-xs">
            <Select
              label="AI javob tili"
              options={[
                { value: 'uz_latin', label: "O'zbek (lotin)" },
                { value: 'uz_cyrillic', label: "O'zbek (kirill)" },
                { value: 'ru', label: 'Rus tili' },
              ]}
              value={settings.aiLanguage}
              onChange={(e) =>
                setSettings({ ...settings, aiLanguage: e.target.value as AdminSettingsData['aiLanguage'] })
              }
            />
          </div>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card variant="white" className="!p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-deep">Xavfsizlik siyosati</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
            <Input
              label="Minimal parol uzunligi"
              type="number"
              value={settings.security.minPasswordLength.toString()}
              onChange={(e) => updateSecurity('minPasswordLength', parseInt(e.target.value) || 6)}
            />
            <Input
              label="Sessiya muddati (daqiqa)"
              type="number"
              value={settings.security.sessionTimeout.toString()}
              onChange={(e) => updateSecurity('sessionTimeout', parseInt(e.target.value) || 30)}
            />
          </div>
          <div className="mt-4 max-w-md">
            <ToggleSwitch
              enabled={settings.security.require2FA}
              onToggle={() => updateSecurity('require2FA', !settings.security.require2FA)}
              label="Ikki bosqichli tasdiqlash (2FA) majburiy"
            />
          </div>
        </Card>
      </motion.div>

      {/* Credential Formula */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card variant="white" className="!p-6">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-deep">Login/parol generatsiya formulasi</h3>
          </div>
          <div className="max-w-md">
            <Input
              label="Parol formulasi"
              value={settings.credentialFormula}
              onChange={(e) => setSettings({ ...settings, credentialFormula: e.target.value })}
              helperText="O'zgaruvchilar: {maktab_raqami}, {login}. Masalan: {maktab_raqami}maktab{login}"
            />
          </div>
        </Card>
      </motion.div>

      {/* Ma'lumotlarni tozalash (Clear Data) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card variant="white" className="!p-6 border-2 border-rose-200 bg-rose-50/20">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-bold text-rose-700">Ma'lumotlarni tozalash</h3>
          </div>
          <p className="text-sm text-rose-700/80 mb-4 max-w-xl">
            Diqqat! Ushbu amal platformadagi barcha maktablar, o'qituvchilar, o'quvchilar, to'lov tarixi hamda sozlamalarni butunlay o'chirib tashlaydi. Ushbu amalni ortga qaytarib bo'lmaydi!
          </p>
          <Button
            variant="coral"
            className="!bg-rose-600 hover:!bg-rose-700 text-white"
            onClick={() => {
              setShowClearModal(true);
              setConfirmPassword('');
              setPasswordError('');
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Barcha ma'lumotlarni o'chirish
          </Button>
        </Card>
      </motion.div>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Barcha ma'lumotlarni o'chirish"
      >
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 text-sm text-rose-800">
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Yuqori darajadagi xavfsizlik amali!</p>
              <p className="mt-1">
                Tizimni tozalash uchun maxsus xavfsizlik parolini kiriting. Bu amal barcha ma'lumotlarni o'chirib yuboradi.
              </p>
              <p className="mt-2 font-mono text-[11px] bg-rose-100 p-1.5 rounded text-rose-700">
                Parol: <span className="select-all font-bold">YordamchiResetSecurePassword2026!</span>
              </p>
            </div>
          </div>

          <Input
            label="Xavfsizlik paroli"
            type="password"
            placeholder="Parolni kiriting..."
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordError('');
            }}
            error={passwordError}
          />

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowClearModal(false)}>
              Bekor qilish
            </Button>
            <Button
              variant="coral"
              className="flex-1 !bg-rose-600 hover:!bg-rose-700"
              onClick={handleClearData}
              disabled={!confirmPassword}
            >
              Tasdiqlash va o'chirish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sticky Save Button */}
      <div className="fixed bottom-0 left-[260px] right-0 bg-white/90 backdrop-blur-sm border-t border-primary/10 p-4 z-40">
        <div className="max-w-[1280px] mx-auto flex items-center justify-end gap-3">
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600"
            >
              <Check className="w-4 h-4" />
              Saqlandi!
            </motion.span>
          )}
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saqlanmoqda...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Saqlash
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
