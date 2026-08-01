/**
 * SendNotificationModal — o‘qituvchi → ota-ona bildirishnoma yuborish
 */

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Student } from '@/types';
import {
  PICKUP_REASONS,
  type NotificationType,
} from '@/types/notification';
import {
  buildPickupTemplate,
  sendTeacherNotification,
} from '@/lib/notificationsApi';
import { Car, Megaphone, AlertTriangle, Check, Loader2 } from 'lucide-react';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  /** Bitta o‘quvchi qatoridan ochilsa — avtomatik tanlangan */
  preselectedStudentId?: string | null;
  teacherId: string;
  teacherName: string;
  schoolId: string;
  schoolNumber: number;
}

type Step = 'compose' | 'sending' | 'done' | 'error';

export function SendNotificationModal({
  isOpen,
  onClose,
  students,
  preselectedStudentId,
  teacherId,
  teacherName,
  schoolId,
  schoolNumber,
}: SendNotificationModalProps) {
  const [step, setStep] = useState<Step>('compose');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [type, setType] = useState<NotificationType>('pickup_request');
  const [pickupReason, setPickupReason] = useState(PICKUP_REASONS[0].value);
  const [pickupTime, setPickupTime] = useState('15:00');
  const [extraNote, setExtraNote] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [resultSummary, setResultSummary] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const schoolLabel = `${schoolNumber}-sonli maktab-internat`;

  useEffect(() => {
    if (!isOpen) return;
    setStep('compose');
    setErrorMsg('');
    setResultSummary('');
    setType('pickup_request');
    setPickupReason(PICKUP_REASONS[0].value);
    setPickupTime('15:00');
    setExtraNote('');
    if (preselectedStudentId) {
      setSelectedIds([preselectedStudentId]);
    } else {
      setSelectedIds([]);
    }
  }, [isOpen, preselectedStudentId]);

  const selectedStudents = useMemo(
    () => students.filter((s) => selectedIds.includes(s.id)),
    [students, selectedIds]
  );

  // Shablonni avtomatik to‘ldirish (tahrirlash mumkin)
  useEffect(() => {
    if (!isOpen || type !== 'pickup_request') return;
    const child = selectedStudents[0];
    const reasonLabel =
      PICKUP_REASONS.find((r) => r.value === pickupReason)?.label || pickupReason;
    const tpl = buildPickupTemplate({
      parentName: 'ota-ona',
      childName: child?.fullName || '[Farzand ismi]',
      time: pickupTime,
      reasonLabel,
      teacherName,
      schoolLabel,
      extraNote,
    });
    setTitle(tpl.title);
    setBody(tpl.body);
  }, [
    isOpen,
    type,
    selectedStudents,
    pickupReason,
    pickupTime,
    extraNote,
    teacherName,
    schoolLabel,
  ]);

  useEffect(() => {
    if (!isOpen || type === 'pickup_request') return;
    if (type === 'announcement') {
      setTitle('Umumiy e’lon');
      setBody('');
    } else {
      setTitle('Muhim xabar');
      setBody('');
    }
  }, [type, isOpen]);

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(students.map((s) => s.id));

  const handleSend = async () => {
    if (selectedIds.length === 0 || !title.trim() || !body.trim()) return;
    setStep('sending');
    try {
      const result = await sendTeacherNotification({
        type,
        studentIds: selectedIds,
        teacherId,
        teacherName,
        schoolId,
        schoolLabel,
        title: title.trim(),
        body: body.trim(),
        pickupReason: type === 'pickup_request' ? pickupReason : undefined,
        pickupTime: type === 'pickup_request' ? pickupTime : undefined,
        studentsMeta: selectedStudents.map((s) => ({
          id: s.id,
          fullName: s.fullName,
          parentName: 'Ota-ona',
        })),
      });

      const delivered = result.recipients.filter((r) => r.deliveryStatus === 'delivered').length;
      const failed = result.recipients.filter((r) => r.deliveryStatus === 'failed_push').length;
      const pending = result.recipients.filter((r) => r.deliveryStatus === 'pending_push').length;

      if (failed === result.recipients.length) {
        setResultSummary(
          'Yuborildi ✓ — ilova ichida saqlandi. Push yetkazilmadi: ota-ona bildirishnomalarni yoqmagan bo‘lishi mumkin.'
        );
      } else if (failed > 0 || pending > 0) {
        setResultSummary(
          `Yuborildi ✓ — ${delivered} ta yetkazildi` +
            (failed ? `, ${failed} ta push yo‘q (feed’da ko‘rinadi)` : '') +
            (pending ? `, ${pending} ta kutilmoqda` : '')
        );
      } else {
        const names = result.recipients.map((r) => r.parentName).join(', ');
        setResultSummary(`Yuborildi ✓ — ${names}ga yetkazildi`);
      }
      setStep('done');
    } catch {
      setErrorMsg('Yuborib bo‘lmadi. Qayta urinib ko‘ring.');
      setStep('error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bildirishnoma yuborish">
      {step === 'sending' && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-semibold text-sm">Yuborilmoqda...</p>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center text-center py-8 gap-3">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Check className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-deep leading-relaxed px-2">{resultSummary}</p>
          <Button variant="primary" onClick={onClose} className="mt-2">
            Yopish
          </Button>
        </div>
      )}

      {step === 'error' && (
        <div className="flex flex-col items-center text-center py-8 gap-3">
          <AlertTriangle className="w-10 h-10 text-coral/60" />
          <p className="text-sm text-deep font-semibold">{errorMsg}</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => setStep('compose')}>
              Orqaga
            </Button>
            <Button variant="primary" onClick={() => void handleSend()}>
              Qayta urinish
            </Button>
          </div>
        </div>
      )}

      {step === 'compose' && (
        <div className="space-y-5">
          {/* Qadam 1 — o‘quvchilar */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                1. O‘quvchi(lar)
              </h4>
              {!preselectedStudentId && students.length > 0 && (
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Hammasini tanlash
                </button>
              )}
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-primary/10 rounded-xl p-2 bg-bg/40">
              {students.length === 0 ? (
                <p className="text-xs text-muted p-2">O‘quvchilar yo‘q</p>
              ) : (
                students.map((s) => (
                  <label
                    key={s.id}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                      selectedIds.includes(s.id) ? 'bg-primary/10' : 'hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.id)}
                      onChange={() => toggleStudent(s.id)}
                      className="accent-[#1B6FA8]"
                    />
                    <span className="text-sm font-semibold text-deep">{s.fullName}</span>
                    <span className="text-[10px] text-muted ml-auto">{s.className}</span>
                  </label>
                ))
              )}
            </div>
          </section>

          {/* Qadam 2 — tur */}
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              2. Bildirishnoma turi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'pickup_request' as const, label: 'Olib ketish', icon: Car, hint: '🚗' },
                  { id: 'announcement' as const, label: "E'lon", icon: Megaphone, hint: '📋' },
                  { id: 'urgent' as const, label: 'Muhim', icon: AlertTriangle, hint: '⚠️' },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon;
                const active = type === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setType(opt.id)}
                    className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'border-primary bg-primary/8 shadow-sm'
                        : 'border-primary/10 hover:border-primary/25'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-bold text-deep">
                      <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted'}`} />
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-muted">{opt.hint}</span>
                  </button>
                );
              })}
            </div>

            {type === 'pickup_request' && (
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-muted block mb-1">Sabab</label>
                  <select
                    value={pickupReason}
                    onChange={(e) => setPickupReason(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-primary/15 bg-white focus:border-primary focus:outline-none"
                  >
                    {PICKUP_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted block mb-1">Vaqt</label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-primary/15 bg-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-muted block mb-1">
                    Qo‘shimcha izoh (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={extraNote}
                    onChange={(e) => setExtraNote(e.target.value)}
                    placeholder="Masalan: asosiy darvoza yonida kutamiz"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-primary/15 bg-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Qadam 3 — preview / tahrir */}
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              3. Ko‘rib chiqish
            </h4>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-2 px-3 py-2.5 text-sm font-bold rounded-xl border border-primary/15 focus:border-primary focus:outline-none"
              placeholder="Sarlavha"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-primary/15 focus:border-primary focus:outline-none resize-y leading-relaxed"
              placeholder="Xabar matni..."
            />
            <div
              className={`mt-3 p-3 rounded-xl border text-left ${
                type === 'pickup_request' || type === 'urgent'
                  ? 'border-coral/40 bg-coral/5'
                  : 'border-primary/15 bg-bg/50'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                Ota-ona ko‘rinishi
              </p>
              <p className="text-sm font-bold text-deep">{title || '—'}</p>
              <p className="text-xs text-muted mt-1 whitespace-pre-wrap leading-relaxed">
                {body || 'Matn kiritilmagan'}
              </p>
            </div>
          </section>

          <Button
            variant="coral"
            className="w-full font-bold"
            disabled={selectedIds.length === 0 || !title.trim() || !body.trim()}
            onClick={() => void handleSend()}
          >
            Yuborish
          </Button>
        </div>
      )}
    </Modal>
  );
}
