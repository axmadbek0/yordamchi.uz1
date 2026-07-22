/**
 * Admin Users — Teachers & School Admins management
 * 5 states implemented
 */

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Search,
  Users,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  Check,
  Copy,
} from 'lucide-react';
import { motion } from 'motion/react';
import { getTeachers, toggleTeacherStatus, resetTeacherCredentials } from '../../lib/adminDb';
import type { Teacher } from '../../types';

type Tab = 'teachers' | 'admins';
type LoadState = 'loading' | 'success' | 'error' | 'empty';

export function AdminUsers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [tab, setTab] = useState<Tab>('teachers');
  const [search, setSearch] = useState('');

  // Credentials modal
  const [showCreds, setShowCreds] = useState<{ login: string; password: string; name: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const loadData = () => {
    setState('loading');
    setTimeout(() => {
      try {
        const data = getTeachers();
        setTeachers(data);
        setState(data.length === 0 ? 'empty' : 'success');
      } catch {
        setState('error');
      }
    }, 400);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTeachers = teachers.filter((t) => {
    const matchesTab = tab === 'teachers' ? t.role === 'teacher' : t.role === 'school_admin';
    const matchesSearch =
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.login.toLowerCase().includes(search.toLowerCase()) ||
      t.schoolName.toLowerCase().includes(search.toLowerCase()) ||
      t.schoolNumber.toString().includes(search);
    return matchesTab && matchesSearch;
  });

  const handleToggleStatus = (id: string) => {
    toggleTeacherStatus(id);
    loadData();
  };

  const handleShowCredentials = (teacher: Teacher) => {
    const creds = resetTeacherCredentials(teacher.id);
    if (creds) {
      setShowCreds({ ...creds, name: teacher.fullName });
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Loading
  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-primary/10 rounded-lg w-48 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error
  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle className="w-12 h-12 text-coral/40 mb-3" />
        <h2 className="text-lg font-bold text-deep mb-2">Ma'lumotlarni yuklab bo'lmadi</h2>
        <p className="text-muted mb-4">Iltimos, qaytadan urining</p>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Qayta urinish
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-deep font-serif">Foydalanuvchilar</h1>
        <p className="text-sm text-muted mt-0.5">Barcha o'qituvchi va maktab adminlarini boshqarish</p>
      </div>

      {/* Tab + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-white rounded-xl p-1 border border-primary/5 shadow-sm">
          <button
            onClick={() => setTab('teachers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === 'teachers' ? 'bg-primary/8 text-primary font-semibold' : 'text-muted hover:text-deep'
            }`}
          >
            O'qituvchilar
          </button>
          <button
            onClick={() => setTab('admins')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === 'admins' ? 'bg-primary/8 text-primary font-semibold' : 'text-muted hover:text-deep'
            }`}
          >
            Maktab adminlari
          </button>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Ism, login yoki maktab bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm text-ink bg-white border border-primary/10 rounded-xl focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table or Empty */}
      {filteredTeachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary/40" />
          </div>
          <h2 className="text-lg font-bold text-deep mb-2">
            {state === 'empty' ? 'Foydalanuvchi yo\'q' : 'Natija topilmadi'}
          </h2>
          <p className="text-muted max-w-sm">
            {state === 'empty'
              ? 'Hali birorta foydalanuvchi mavjud emas.'
              : 'Qidiruv mezonlarini o\'zgartiring.'}
          </p>
        </div>
      ) : (
        <Card variant="white" className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg/50 border-b border-primary/5">
                  <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Ism</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Maktab</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Login</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Oxirgi faollik</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher) => (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-primary/5 hover:bg-bg/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-deep">{teacher.fullName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted">{teacher.schoolNumber}-maktab</span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-bg px-2 py-0.5 rounded font-medium">{teacher.login}</code>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {new Date(teacher.lastActivity).toLocaleDateString('uz-UZ', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(teacher.id)}
                        className="cursor-pointer"
                        title={teacher.status === 'active' ? 'Bloklash' : 'Faollashtirish'}
                      >
                        <Badge variant={teacher.status === 'active' ? 'success' : 'danger'}>
                          {teacher.status === 'active' ? 'Faol' : 'Bloklangan'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleShowCredentials(teacher)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3 h-3" />
                        Login/parol
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Credentials Modal */}
      <Modal
        isOpen={!!showCreds}
        onClose={() => setShowCreds(null)}
        title="Login/Parol ma'lumotlari"
      >
        {showCreds && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              <strong className="text-deep">{showCreds.name}</strong> uchun kirish ma'lumotlari:
            </p>
            <Card variant="blue" className="!p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Login:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-bold text-deep bg-white px-2 py-0.5 rounded">{showCreds.login}</code>
                  <button
                    onClick={() => copyToClipboard(showCreds.login, 'login')}
                    className="p-1 rounded hover:bg-white/50 transition-colors cursor-pointer"
                  >
                    {copiedField === 'login' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Parol:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-bold text-deep bg-white px-2 py-0.5 rounded">{showCreds.password}</code>
                  <button
                    onClick={() => copyToClipboard(showCreds.password, 'password')}
                    className="p-1 rounded hover:bg-white/50 transition-colors cursor-pointer"
                  >
                    {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                  </button>
                </div>
              </div>
            </Card>
            <Button variant="primary" fullWidth onClick={() => setShowCreds(null)}>
              Yopish
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
