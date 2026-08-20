/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  KeyRound,
  Copy,
  Check,
  Printer,
  MessageSquare,
  Search,
  AlertCircle,
  RefreshCw,
  X,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  getTeachers,
  addTeacher,
  resetTeacherCredentials,
} from '../../lib/api/schoolAdmin';
import type { TeacherItem, GeneratedCredentials } from '../../types/schoolAdmin';

export function TeachersManagementPage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add teacher modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [className, setClassName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Credentials created modal state
  const [credentialsModalData, setCredentialsModalData] = useState<{
    teacher: TeacherItem;
    credentials: GeneratedCredentials;
  } | null>(null);
  const [copiedLogin, setCopiedLogin] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  // Reset confirmation state
  const [resetTeacherId, setResetTeacherId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const fetchTeachersList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await getTeachers();
      setTeachers(list);
    } catch (err: any) {
      setError(err?.response?.data?.message || "O'qituvchilar ro'yxatini yuklab bo'lmadi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTeachersList();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!displayName.trim()) {
      setFormError("O'qituvchi ism-familiyasini kiriting");
      return;
    }
    if (!className.trim()) {
      setFormError("Biriktirilgan sinf nomini kiriting (masalan: 4-A sinf)");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addTeacher({
        displayName: displayName.trim(),
        className: className.trim(),
        phone: phone.trim() || undefined,
      });

      setIsAddModalOpen(false);
      setDisplayName('');
      setClassName('');
      setPhone('');

      // Show credentials voucher
      setCredentialsModalData({
        teacher: res.teacher,
        credentials: res.generatedCredentials,
      });

      // Refresh list
      await fetchTeachersList();
    } catch (err: any) {
      setFormError(err?.response?.data?.error || err?.response?.data?.message || "O'qituvchi qo'shishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (teacher: TeacherItem) => {
    setIsResetting(true);
    try {
      const res = await resetTeacherCredentials(teacher.id);
      setResetTeacherId(null);
      setCredentialsModalData({
        teacher: res.teacher,
        credentials: res.generatedCredentials,
      });
      await fetchTeachersList();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Parolni yangilab bo\'lmadi');
    } finally {
      setIsResetting(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'login' | 'password') => {
    await navigator.clipboard.writeText(text);
    if (type === 'login') {
      setCopiedLogin(true);
      setTimeout(() => setCopiedLogin(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleSimulateSms = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3000);
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.login.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-serif text-deep flex items-center gap-2.5">
            <Users className="w-7 h-7 text-primary" /> O'qituvchilar Boshqaruvi
          </h1>
          <p className="text-sm text-muted">
            Maktab o'qituvchilari hisoblari, biriktirilgan sinflar va tizimga kirish kredentsiallari
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 font-bold shadow-md w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" /> + Yangi o'qituvchi qo'shish
        </Button>
      </div>

      {/* Search and Stats bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ism, sinf yoki login bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-cardBlue/50 text-sm focus:outline-hidden focus:border-primary transition-all shadow-xs"
          />
        </div>

        <div className="text-xs font-semibold text-muted">
          Jami: <span className="text-deep font-bold">{teachers.length}</span> nafar o'qituvchi
        </div>
      </div>

      {/* Teachers Table / List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-primary/5" />
          ))}
        </div>
      ) : error ? (
        <Card variant="white" className="p-8 text-center max-w-md mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10 text-coral mx-auto mb-3" />
          <p className="text-sm text-muted mb-4">{error}</p>
          <Button variant="primary" onClick={fetchTeachersList} className="gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" /> Qayta yuklash
          </Button>
        </Card>
      ) : filteredTeachers.length === 0 ? (
        <Card variant="white" className="p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-muted/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-deep mb-1">O'qituvchi topilmadi</h3>
          <p className="text-xs text-muted mb-6">
            {searchQuery ? "Qidiruv bo'yicha hech qanday natija yo'q" : "Hozircha o'qituvchilar qo'shilmagan"}
          </p>
          {!searchQuery && (
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="gap-2 mx-auto">
              <UserPlus className="w-4 h-4" /> Birinchi o'qituvchini qo'shish
            </Button>
          )}
        </Card>
      ) : (
        <div className="bg-white rounded-3xl border border-primary/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-cardBlue/50 text-[11px] font-bold text-muted uppercase tracking-wider bg-bg/50">
                  <th className="py-4 px-6">O'qituvchi</th>
                  <th className="py-4 px-4">Biriktirilgan Sinf</th>
                  <th className="py-4 px-4">Login</th>
                  <th className="py-4 px-4">Telefon</th>
                  <th className="py-4 px-4">Holat</th>
                  <th className="py-4 px-6 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cardBlue/30 text-sm">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-bg/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cardBlue text-primary flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          {teacher.displayName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-deep">{teacher.displayName}</div>
                          <div className="text-[11px] text-muted">
                            Qo'shilgan: {new Date(teacher.createdAt).toLocaleDateString('uz-UZ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/15">
                        {teacher.className}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <code className="text-xs font-mono font-bold text-deep bg-bg px-2 py-1 rounded-lg border border-cardBlue">
                        {teacher.login}
                      </code>
                    </td>
                    <td className="py-4 px-4 text-xs text-muted">
                      {teacher.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-primary/70" /> {teacher.phone}
                        </span>
                      ) : (
                        <span className="text-muted/50">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-success/10 text-success">
                        <ShieldCheck className="w-3 h-3" /> Faol
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setResetTeacherId(teacher.id)}
                        className="text-xs font-bold gap-1.5 border-cardBlue hover:bg-cardBlue/60"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-primary" /> Parolni yangilash
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-deep/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-cardBlue relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 text-muted hover:text-deep p-1 rounded-full hover:bg-bg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black font-serif text-deep">
                  Yangi O'qituvchi Qo'shish
                </h3>
                <p className="text-xs text-muted">
                  Tizim avtomatik login va xavfsiz parol generatsiya qiladi
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-coral/10 text-coral border border-coral/20 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddTeacher} className="space-y-4">
              <Input
                label="O'qituvchi F.I.Sh."
                placeholder="Masalan: Rustam Ahmedov"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />

              <Input
                label="Biriktirilgan sinf nomi"
                placeholder="Masalan: 4-A sinf"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              />

              <Input
                label="Telefon raqami (ixtiyoriy)"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <div className="p-3.5 bg-bg rounded-2xl border border-cardBlue text-xs text-muted space-y-1">
                <p className="font-bold text-deep">📌 Generatsiya qoidasi:</p>
                <p>• Login: <code>umumi</code>, <code>umumi2</code>, ...</p>
                <p>• Parol formulasi: <code>{`{MaktabRaqami}maktab{login}`}</code></p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 justify-center"
                >
                  Bekor qilish
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 justify-center font-bold"
                >
                  {isSubmitting ? 'Qo‘shilmoqda...' : 'Yaratish va Saqlash'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Credentials Voucher Modal */}
      {credentialsModalData && (
        <div className="fixed inset-0 bg-deep/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-cardBlue relative text-center">
            <button
              onClick={() => setCredentialsModalData(null)}
              className="absolute right-5 top-5 text-muted hover:text-deep p-1 rounded-full hover:bg-bg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black font-serif text-deep mb-1">
              O'qituvchi Kredentsiallari Yaratildi!
            </h3>
            <p className="text-xs text-muted mb-6">
              Ushbu hisob ma'lumotlarini o'qituvchiga taqdim eting:
            </p>

            {/* Voucher Box */}
            <div className="p-5 rounded-2xl bg-bg border-2 border-dashed border-primary/30 text-left space-y-4 mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-cardBlue">
                <div>
                  <span className="text-xs text-muted block">O'qituvchi:</span>
                  <span className="font-bold text-deep text-sm">
                    {credentialsModalData.teacher.displayName}
                  </span>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 bg-primary text-white rounded-lg">
                  {credentialsModalData.teacher.className}
                </span>
              </div>

              {/* Login row */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-cardBlue">
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold block">Login</span>
                  <code className="text-base font-mono font-black text-deep">
                    {credentialsModalData.credentials.login}
                  </code>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(credentialsModalData.credentials.login, 'login')
                  }
                  className="gap-1.5 text-xs"
                >
                  {copiedLogin ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLogin ? 'Nusxalandi' : 'Nusxa olish'}
                </Button>
              </div>

              {/* Password row */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-cardBlue">
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold block">Parol</span>
                  <code className="text-base font-mono font-black text-deep">
                    {credentialsModalData.credentials.password}
                  </code>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(credentialsModalData.credentials.password, 'password')
                  }
                  className="gap-1.5 text-xs"
                >
                  {copiedPassword ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPassword ? 'Nusxalandi' : 'Nusxa olish'}
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Button
                variant="secondary"
                onClick={() => window.print()}
                className="gap-2 justify-center font-bold text-xs"
              >
                <Printer className="w-4 h-4" /> Chop etish (PDF)
              </Button>
              <Button
                variant="secondary"
                onClick={handleSimulateSms}
                className="gap-2 justify-center font-bold text-xs"
              >
                <MessageSquare className="w-4 h-4 text-primary" />
                {smsSent ? 'SMS yuborildi!' : 'SMS orqali jo\'natish'}
              </Button>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={() => setCredentialsModalData(null)}
              className="font-bold"
            >
              Tayyor, yopish
            </Button>
          </div>
        </div>
      )}

      {/* Password Reset Confirmation Dialog */}
      {resetTeacherId && (
        <div className="fixed inset-0 bg-deep/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-cardBlue">
            <div className="w-12 h-12 rounded-full bg-coral/10 text-coral flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-deep mb-2">
              Parolni yangilashni tasdiqlaysizmi?
            </h3>
            <p className="text-xs text-muted mb-6">
              O'qituvchining amaldagi paroli bekor qilinib, yangi standart parol generatsiya qilinadi.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setResetTeacherId(null)}
                className="flex-1 justify-center"
              >
                Bekor qilish
              </Button>
              <Button
                variant="primary"
                disabled={isResetting}
                onClick={() => {
                  const t = teachers.find((x) => x.id === resetTeacherId);
                  if (t) void handleResetPassword(t);
                }}
                className="flex-1 justify-center font-bold"
              >
                {isResetting ? 'Yangilanmoqda...' : 'Tasdiqlash'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
