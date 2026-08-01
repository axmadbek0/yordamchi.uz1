/**
 * In-app toast — yangi bildirishnoma kelganda (ilova ochiq)
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { subscribeNotificationChanges, getParentNotifications } from '@/lib/notificationsApi';
import { useAuth } from '@/lib/auth';
import { getStudents } from '@/lib/db';
import type { TeacherNotification } from '@/types/notification';

export function ParentNotificationToast() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState<TeacherNotification | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (user?.role !== 'parent') return;

    let cancelled = false;

    const check = async () => {
      try {
        const students = await getStudents();
        const ids = user.associatedStudentId
          ? [user.associatedStudentId]
          : students.slice(0, 1).map((s) => s.id);
        const list = await getParentNotifications(ids);
        if (cancelled || list.length === 0) return;

        const newest = list[0];
        setSeenIds((prev) => {
          if (prev.has(newest.id)) return prev;
          // Birinchi yuklashda toast ko‘rsatmaslik
          if (prev.size === 0 && list.length > 0) {
            return new Set(list.map((n) => n.id));
          }
          setToast(newest);
          window.setTimeout(() => setToast((t) => (t?.id === newest.id ? null : t)), 5000);
          const next = new Set(prev);
          next.add(newest.id);
          return next;
        });
      } catch {
        /* ignore */
      }
    };

    void check();
    return subscribeNotificationChanges(() => void check());
  }, [user]);

  if (user?.role !== 'parent') return null;

  const isPickup = toast?.type === 'pickup_request' || toast?.type === 'urgent';

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[min(92vw,420px)]"
        >
          <button
            type="button"
            onClick={() => {
              setToast(null);
              navigate('/parent/notifications');
            }}
            className={`w-full text-left bg-white rounded-2xl shadow-xl border-2 p-4 flex gap-3 cursor-pointer ${
              isPickup ? 'border-coral' : 'border-primary/20'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isPickup ? 'bg-coral/10 text-coral' : 'bg-primary/10 text-primary'
              }`}
            >
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-deep truncate">{toast.title}</p>
              <p className="text-xs text-muted line-clamp-2 mt-0.5">{toast.body}</p>
            </div>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setToast(null);
              }}
              className="text-muted hover:text-deep p-1"
            >
              <X className="w-4 h-4" />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
