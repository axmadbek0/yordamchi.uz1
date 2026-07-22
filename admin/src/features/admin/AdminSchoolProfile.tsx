/**
 * Admin School Profile — Tabs: Info, Teachers, Stats, Billing
 * 5 states implemented
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  Users,
  GraduationCap,
  Ban,
  AlertTriangle,
  RefreshCw,
  School,
  CreditCard,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  getSchoolById,
  getTeachersBySchool,
  getBillingRecords,
  deactivateSchool,
} from '../../lib/adminDb';
import type { School as SchoolType, Teacher, BillingRecord, SchoolStatus } from '../../types';

type Tab = 'info' | 'teachers' | 'stats' | 'billing';
type LoadState = 'loading' | 'success' | 'error' | 'empty';

function statusBadge(status: SchoolStatus) {
  const map: Record<SchoolStatus, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
    active: { variant: 'success', label: 'Faol' },
    pending: { variant: 'warning', label: 'Kutilmoqda' },
    suspended: { variant: 'danger', label: "To'xtatilgan" },
  };
  const s = map[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function AdminSchoolProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [school, setSchool] = useState<SchoolType | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [billing, setBilling] = useState<BillingRecord[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [tab, setTab] = useState<Tab>('info');
  const [showDeactivate, setShowDeactivate] = useState(false);

  const loadData = () => {
    setState('loading');
    setTimeout(() => {
      try {
        if (!id) throw new Error('ID not found');
        const s = getSchoolById(id);
        if (!s) {
          setState('empty');
          return;
        }
        setSchool(s);
        setTeachers(getTeachersBySchool(id));
        setBilling(getBillingRecords().filter((b) => b.schoolId === id));
        setState('success');
      } catch {
        setState('error');
      }
    }, 400);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDeactivate = () => {
    if (school) {
      deactivateSchool(school.id);
      setShowDeactivate(false);
      loadData();
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'info', label: 'Umumiy ma\'lumot', icon: School },
    { key: 'teachers', label: 'O\'qituvchilar', icon: Users },
    { key: 'stats', label: 'O\'quvchilar statistikasi', icon: GraduationCap },
    { key: 'billing', label: 'To\'lov tarixi', icon: CreditCard },
  ];

  // Loading
  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-primary/10 rounded-lg w-48 animate-pulse" />
        <div className="h-40 bg-white rounded-2xl animate-pulse" />
        <div className="h-64 bg-white rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Error
  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle className="w-12 h-12 text-coral/40 mb-3" />
        <h2 className="text-lg font-bold text-deep mb-2">Maktab ma'lumotlarini yuklab bo'lmadi</h2>
        <p className="text-muted mb-4">Iltimos, qaytadan urining</p>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Qayta urinish
        </Button>
      </div>
    );
  }

  // Empty
  if (state === 'empty' || !school) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <School className="w-12 h-12 text-primary/30 mb-3" />
        <h2 className="text-lg font-bold text-deep mb-2">Maktab topilmadi</h2>
        <p className="text-muted mb-4">Bu ID bo'yicha maktab mavjud emas</p>
        <Button variant="outline" onClick={() => navigate('/admin/schools')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ro'yxatga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/schools')}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-deep mb-3 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Maktablar ro'yxati
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-deep font-serif">{school.number}-maktab</h1>
            {statusBadge(school.status)}
          </div>
          <p className="text-sm text-muted mt-1 max-w-lg">{school.name}</p>
        </div>
        {school.status !== 'suspended' && (
          <Button variant="outline" size="sm" onClick={() => setShowDeactivate(true)} className="!border-coral/30 !text-coral hover:!bg-coral/5">
            <Ban className="w-4 h-4 mr-1.5" />
            To'xtatish
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-primary/5 shadow-sm overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              tab === t.key
                ? 'bg-primary/8 text-primary font-semibold'
                : 'text-muted hover:bg-bg hover:text-deep'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {tab === 'info' && (
          <Card variant="white" className="!p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted uppercase font-semibold tracking-wider">Manzil</p>
                    <p className="text-sm text-deep mt-0.5">{school.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted uppercase font-semibold tracking-wider">Telefon</p>
                    <p className="text-sm text-deep mt-0.5">{school.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted uppercase font-semibold tracking-wider">Ro'yxatdan o'tgan</p>
                    <p className="text-sm text-deep mt-0.5">{new Date(school.createdAt).toLocaleDateString('uz-UZ')}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Layers className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted uppercase font-semibold tracking-wider">Viloyat / Tuman</p>
                    <p className="text-sm text-deep mt-0.5">{school.region}{school.district ? `, ${school.district}` : ''}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-bg rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-deep">{school.teacherCount}</p>
                    <p className="text-[11px] text-muted">O'qituvchilar</p>
                  </div>
                  <div className="bg-bg rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-deep">{school.studentCount}</p>
                    <p className="text-[11px] text-muted">O'quvchilar</p>
                  </div>
                  <div className="bg-bg rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-deep">{school.classCount}</p>
                    <p className="text-[11px] text-muted">Sinflar</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {tab === 'teachers' && (
          <Card variant="white" className="!p-0 overflow-hidden">
            {teachers.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Users className="w-10 h-10 text-primary/30 mb-3" />
                <p className="text-muted">Bu maktabda hali o'qituvchi yo'q</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg/50 border-b border-primary/5">
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase">Ism</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase">Login</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase">Rol</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase">Oxirgi faollik</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted text-xs uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.id} className="border-b border-primary/5 hover:bg-bg/30">
                      <td className="px-4 py-3 font-medium text-deep">{t.fullName}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-bg px-2 py-0.5 rounded font-medium">{t.login}</code>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={t.role === 'school_admin' ? 'primary' : 'muted'}>
                          {t.role === 'school_admin' ? 'Admin' : 'O\'qituvchi'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted text-xs">
                        {new Date(t.lastActivity).toLocaleDateString('uz-UZ', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={t.status === 'active' ? 'success' : 'danger'}>
                          {t.status === 'active' ? 'Faol' : 'Bloklangan'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}

        {tab === 'stats' && (
          <Card variant="white" className="!p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-bg rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-deep">{school.studentCount}</p>
                <p className="text-xs text-muted mt-1">Jami o'quvchilar</p>
              </div>
              <div className="bg-bg rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-primary">{Math.round(school.studentCount * 0.85)}</p>
                <p className="text-xs text-muted mt-1">Faol qatnashuvchilar</p>
              </div>
              <div className="bg-bg rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-coral">{Math.round(school.studentCount * 0.12)}</p>
                <p className="text-xs text-muted mt-1">Hisobotlar soni (hafta)</p>
              </div>
              <div className="bg-bg rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-emerald-600">82%</p>
                <p className="text-xs text-muted mt-1">O'rtacha farovonlik</p>
              </div>
            </div>
            <p className="text-sm text-muted text-center">Batafsil statistika kelajakda qo'shiladi</p>
          </Card>
        )}

        {tab === 'billing' && (
          <Card variant="white" className="!p-0 overflow-hidden">
            {billing.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <CreditCard className="w-10 h-10 text-primary/30 mb-3" />
                <p className="text-muted">To'lov tarixi mavjud emas</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg/50 border-b border-primary/5">
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase">Reja</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase">Keyingi to'lov</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted text-xs uppercase">Summa</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.map((b) => (
                    <tr key={b.id} className="border-b border-primary/5">
                      <td className="px-4 py-3 font-medium text-deep">{b.plan}</td>
                      <td className="px-4 py-3">
                        <Badge variant={b.status === 'active' ? 'success' : b.status === 'overdue' ? 'danger' : 'muted'}>
                          {b.status === 'active' ? 'Faol' : b.status === 'overdue' ? "Muddati o'tgan" : 'Bekor qilingan'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{new Date(b.nextPayment).toLocaleDateString('uz-UZ')}</td>
                      <td className="px-4 py-3 text-right font-semibold text-deep">{b.amount.toLocaleString()} so'm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}
      </motion.div>

      {/* Deactivate Modal */}
      <Modal isOpen={showDeactivate} onClose={() => setShowDeactivate(false)} title="Maktabni to'xtatish">
        <div className="space-y-4">
          <div className="bg-coral/5 border border-coral/15 rounded-xl p-4">
            <p className="text-sm text-deep leading-relaxed">
              <strong>{school.number}-maktabni</strong> to'xtatsangiz, uning barcha o'qituvchi va ota-onalari tizimga kira olmaydi.
              Davom etasizmi?
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowDeactivate(false)}>
              Bekor qilish
            </Button>
            <Button variant="coral" className="flex-1" onClick={handleDeactivate}>
              <Ban className="w-4 h-4 mr-2" />
              To'xtatish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
