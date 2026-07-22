/**
 * Admin Schools — List, Add, Filter
 * 5 states: Loading, Empty, Error, Success, Partial
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import {
  Plus,
  Search,
  School,
  Eye,
  Pencil,
  Ban,
  AlertTriangle,
  RefreshCw,
  Check,
  Copy,
  Printer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getSchools,
  addSchool,
  isSchoolNumberTaken,
  deactivateSchool,
} from '../../lib/adminDb';
import type { School as SchoolType, SchoolStatus } from '../../types';

const REGIONS = [
  'Barchasi',
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand viloyati',
  "Farg'ona viloyati",
  'Buxoro viloyati',
  'Andijon viloyati',
  'Namangan viloyati',
  'Xorazm viloyati',
  'Surxondaryo viloyati',
  'Qashqadaryo viloyati',
  'Navoiy viloyati',
  'Jizzax viloyati',
  "Sirdaryo viloyati",
  "Qoraqalpog'iston Respublikasi",
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Barcha status' },
  { value: 'active', label: 'Faol' },
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'suspended', label: "To'xtatilgan" },
];

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

export function AdminSchools() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('Barchasi');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add school modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    number: '',
    region: 'Toshkent shahri',
    district: '',
    address: '',
    phone: '',
    classCount: '',
  });
  const [numberError, setNumberError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ login: string; password: string; schoolName: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Deactivate modal
  const [deactivateTarget, setDeactivateTarget] = useState<SchoolType | null>(null);

  // Highlight newly added school
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const loadSchools = () => {
    setState('loading');
    setTimeout(() => {
      try {
        const data = getSchools();
        setSchools(data);
        setState(data.length === 0 ? 'empty' : 'success');
      } catch {
        setState('error');
      }
    }, 400);
  };

  useEffect(() => {
    loadSchools();
  }, []);

  // Real-time school number check
  useEffect(() => {
    if (newSchool.number) {
      const num = parseInt(newSchool.number);
      if (!isNaN(num) && isSchoolNumberTaken(num)) {
        setNumberError(`${num}-raqam band, boshqa raqam tanlang`);
      } else {
        setNumberError('');
      }
    } else {
      setNumberError('');
    }
  }, [newSchool.number]);

  const filteredSchools = schools.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.number.toString().includes(search);
    const matchesRegion = regionFilter === 'Barchasi' || s.region === regionFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const handleAddSchool = async () => {
    if (!newSchool.name || !newSchool.number || !newSchool.region || !newSchool.address || !newSchool.phone) return;
    if (numberError) return;

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));

    const result = addSchool({
      name: newSchool.name,
      number: parseInt(newSchool.number),
      region: newSchool.region,
      district: newSchool.district,
      address: newSchool.address,
      phone: newSchool.phone,
      classCount: parseInt(newSchool.classCount) || 0,
    });

    setIsSaving(false);
    setCreatedCreds({
      login: result.teacherLogin,
      password: result.teacherPassword,
      schoolName: `${result.school.number}-maktab`,
    });
    setHighlightId(result.school.id);
    loadSchools();
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setCreatedCreds(null);
    setNewSchool({ name: '', number: '', region: 'Toshkent shahri', district: '', address: '', phone: '', classCount: '' });
    setNumberError('');
  };

  const handleDeactivate = () => {
    if (deactivateTarget) {
      deactivateSchool(deactivateTarget.id);
      setDeactivateTarget(null);
      loadSchools();
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
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
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
        <Button variant="outline" onClick={loadSchools}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Qayta urinish
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-deep font-serif">Maktablar</h1>
          <p className="text-sm text-muted mt-0.5">{schools.length} ta maktab ro'yxatda</p>
        </div>
        <Button variant="coral" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yangi maktab qo'shish
        </Button>
      </div>

      {/* Filters */}
      <Card variant="white" className="!p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Maktab nomi yoki raqami bo'yicha qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm text-ink bg-bg border border-primary/10 rounded-xl focus:border-primary focus:outline-none transition-all"
              />
            </div>
          </div>
          <Select
            options={REGIONS.map((r) => ({ value: r, label: r }))}
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="!min-h-[40px] !py-2 !text-sm w-[200px]"
          />
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="!min-h-[40px] !py-2 !text-sm w-[160px]"
          />
        </div>
      </Card>

      {/* Empty state */}
      {state === 'empty' || filteredSchools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <School className="w-8 h-8 text-primary/40" />
          </div>
          <h2 className="text-lg font-bold text-deep mb-2">
            {state === 'empty' ? 'Hali maktab yo\'q' : 'Natija topilmadi'}
          </h2>
          <p className="text-muted mb-4 max-w-sm">
            {state === 'empty'
              ? 'Birinchi maktabni qo\'shing va platformani boshlang.'
              : 'Qidiruv yoki filtr mezonlarini o\'zgartiring.'}
          </p>
          {state === 'empty' && (
            <Button variant="coral" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Birinchi maktabni qo'shish
            </Button>
          )}
        </div>
      ) : (
        /* Schools Table */
        <Card variant="white" className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg/50 border-b border-primary/5">
                  <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Maktab nomi</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Viloyat</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">O'qituvchilar</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">O'quvchilar</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Sana</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Amallar</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredSchools.map((school) => (
                    <motion.tr
                      key={school.id}
                      initial={highlightId === school.id ? { backgroundColor: 'rgba(232,115,74,0.1)' } : {}}
                      animate={{ backgroundColor: 'transparent' }}
                      transition={{ duration: 2 }}
                      className="border-b border-primary/5 hover:bg-bg/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-deep">{school.number}-maktab</p>
                          <p className="text-xs text-muted truncate max-w-[260px]">{school.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{school.region}</td>
                      <td className="px-4 py-3 text-center font-medium text-deep">{school.teacherCount}</td>
                      <td className="px-4 py-3 text-center font-medium text-deep">{school.studentCount}</td>
                      <td className="px-4 py-3 text-muted text-xs">
                        {new Date(school.createdAt).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="px-4 py-3 text-center">{statusBadge(school.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/admin/schools/${school.id}`)}
                            className="p-1.5 rounded-lg hover:bg-primary/5 text-primary transition-colors cursor-pointer"
                            title="Ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/schools/${school.id}`)}
                            className="p-1.5 rounded-lg hover:bg-primary/5 text-muted transition-colors cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {school.status !== 'suspended' && (
                            <button
                              onClick={() => setDeactivateTarget(school)}
                              className="p-1.5 rounded-lg hover:bg-coral/5 text-coral transition-colors cursor-pointer"
                              title="To'xtatish"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add School Modal */}
      <Modal isOpen={showAddModal} onClose={closeAddModal} title="Yangi maktab qo'shish">
        {createdCreds ? (
          /* Success — show credentials */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="font-bold text-emerald-700 text-lg">{createdCreds.schoolName} qo'shildi!</p>
              <p className="text-sm text-emerald-600 mt-1">Birinchi o'qituvchi hisobi avtomatik yaratildi</p>
            </div>

            <Card variant="blue" className="!p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Login:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-bold text-deep bg-white px-2 py-0.5 rounded">{createdCreds.login}</code>
                  <button
                    onClick={() => copyToClipboard(createdCreds.login, 'login')}
                    className="p-1 rounded hover:bg-white/50 transition-colors cursor-pointer"
                  >
                    {copiedField === 'login' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Parol:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-bold text-deep bg-white px-2 py-0.5 rounded">{createdCreds.password}</code>
                  <button
                    onClick={() => copyToClipboard(createdCreds.password, 'password')}
                    className="p-1 rounded hover:bg-white/50 transition-colors cursor-pointer"
                  >
                    {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                  </button>
                </div>
              </div>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1.5" />
                Chop etish
              </Button>
              <Button variant="primary" size="sm" className="flex-1" onClick={closeAddModal}>
                Ro'yxatga qaytish
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Add form */
          <div className="space-y-4">
            <Input
              label="Maktab nomi *"
              placeholder="Masalan: 71-sonli maxsus ta'lim maktab-internati"
              value={newSchool.name}
              onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
            />
            <Input
              label="Maktab raqami *"
              type="number"
              placeholder="Masalan: 71"
              value={newSchool.number}
              onChange={(e) => setNewSchool({ ...newSchool, number: e.target.value })}
              error={numberError}
              className={numberError ? '!border-coral/40' : ''}
            />
            <Select
              label="Viloyat *"
              options={REGIONS.filter((r) => r !== 'Barchasi').map((r) => ({ value: r, label: r }))}
              value={newSchool.region}
              onChange={(e) => setNewSchool({ ...newSchool, region: e.target.value })}
            />
            <Input
              label="Tuman"
              placeholder="Masalan: Chilonzor tumani"
              value={newSchool.district}
              onChange={(e) => setNewSchool({ ...newSchool, district: e.target.value })}
            />
            <Input
              label="Manzil *"
              placeholder="To'liq manzilni kiriting"
              value={newSchool.address}
              onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
            />
            <Input
              label="Aloqa telefoni *"
              type="tel"
              placeholder="+998 XX XXX XX XX"
              value={newSchool.phone}
              onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
            />
            <Input
              label="Sinflar soni"
              type="number"
              placeholder="Ixtiyoriy"
              value={newSchool.classCount}
              onChange={(e) => setNewSchool({ ...newSchool, classCount: e.target.value })}
            />

            <Button
              variant="coral"
              fullWidth
              onClick={handleAddSchool}
              disabled={isSaving || !newSchool.name || !newSchool.number || !newSchool.address || !newSchool.phone || !!numberError}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saqlanmoqda...
                </span>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Maktab qo'shish
                </>
              )}
            </Button>
          </div>
        )}
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        title="Maktabni to'xtatish"
      >
        <div className="space-y-4">
          <div className="bg-coral/5 border border-coral/15 rounded-xl p-4">
            <p className="text-sm text-deep leading-relaxed">
              <strong>{deactivateTarget?.number}-maktabni</strong> to'xtatsangiz, uning barcha o'qituvchi va ota-onalari tizimga kira olmaydi.
              Davom etasizmi?
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeactivateTarget(null)}>
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
