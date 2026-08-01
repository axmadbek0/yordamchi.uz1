/**
 * ParentNotificationsPage — ota-ona bildirishnomalar tasmasi
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { getStudents } from '@/lib/db';
import type { TeacherNotification } from '@/types/notification';
import {
  getParentNotifications,
  markNotificationRead,
  respondToNotification,
  subscribeNotificationChanges,
} from '@/lib/notificationsApi';
import { Bell, Car, Megaphone, AlertTriangle, Check, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'motion/react';

function TypeIcon({ type }: { type: TeacherNotification['type'] }) {
  if (type === 'pickup_request') return <Car className="w-5 h-5 text-coral" />;
  if (type === 'urgent') return <AlertTriangle className="w-5 h-5 text-amber-600" />;
  return <Megaphone className="w-5 h-5 text-primary" />;
}

export function ParentNotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<TeacherNotification[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const students = await getStudents();
      const mine = user?.associatedStudentId
        ? students.filter((s) => s.id === user.associatedStudentId)
        : students.slice(0, 1);
      const ids = mine.map((s) => s.id);
      setStudentId(ids[0] ?? null);
      const list = await getParentNotifications(ids.length ? ids : ['__none__']);
      setItems(list);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
    return subscribeNotificationChanges(() => void load());
  }, [load]);

  const onRespond = async (id: string, response: 'coming' | 'delayed') => {
    if (!studentId) return;
    await respondToNotification(id, studentId, response);
    await load();
  };

  const onOpen = async (n: TeacherNotification) => {
    if (!studentId) return;
    const rec = n.recipients.find((r) => r.studentId === studentId);
    if (rec && !rec.readByParent) {
      await markNotificationRead(n.id, studentId);
      await load();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-primary gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-semibold">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="font-bold text-deep mb-2">Bildirishnomalarni yuklab bo‘lmadi</p>
        <Button variant="primary" onClick={() => { setLoading(true); void load(); }}>
          Qayta urinish
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl">
      <header>
        <h2 className="text-2xl sm:text-3xl font-serif text-deep font-bold flex items-center gap-2">
          <Bell className="w-7 h-7 text-primary" />
          Bildirishnomalar
        </h2>
        <p className="text-muted text-xs sm:text-sm mt-1">
          O‘qituvchidan kelgan xabarlar va olib ketish so‘rovlari
        </p>
      </header>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-cardBlue p-12 text-center">
          <Bell className="w-10 h-10 text-primary/25 mx-auto mb-3" />
          <p className="font-bold text-deep">Hali bildirishnoma yo‘q</p>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            O‘qituvchi xabar yuborganida shu yerda ko‘rinadi. Push ruxsatini Profil → Bildirishnomalar
            orqali yoqishingiz mumkin.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const rec = studentId
              ? n.recipients.find((r) => r.studentId === studentId)
              : n.recipients[0];
            const unread = rec ? !rec.readByParent : !n.readByParent;
            const isPickup = n.type === 'pickup_request';

            return (
              <motion.article
                key={n.id}
                layout
                onClick={() => void onOpen(n)}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-sm cursor-pointer transition-shadow hover:shadow-md ${
                  isPickup ? 'border-coral/35' : 'border-cardBlue'
                } ${unread ? 'ring-2 ring-primary/15' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isPickup ? 'bg-coral/10' : 'bg-primary/10'
                    }`}
                  >
                    <TypeIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-deep leading-snug">{n.title}</h3>
                      {unread && (
                        <span className="text-[10px] font-bold uppercase bg-primary text-white px-2 py-0.5 rounded-full shrink-0">
                          Yangi
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1.5 whitespace-pre-wrap leading-relaxed">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-muted mt-2">
                      {new Date(n.createdAt).toLocaleString('uz-UZ')} · {n.teacherName}
                    </p>

                    {isPickup && (
                      <div className="flex flex-wrap gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        {rec?.parentResponse === 'coming' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                            <Check className="w-3.5 h-3.5" /> Ko‘rdim, kelaman
                          </span>
                        ) : rec?.parentResponse === 'delayed' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                            <Clock className="w-3.5 h-3.5" /> Biroz kechikaman
                          </span>
                        ) : (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              className="!rounded-full text-xs"
                              onClick={() => void onRespond(n.id, 'coming')}
                            >
                              ✅ Ko‘rdim, kelaman
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="!rounded-full text-xs"
                              onClick={() => void onRespond(n.id, 'delayed')}
                            >
                              ⏰ Biroz kechikaman
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
