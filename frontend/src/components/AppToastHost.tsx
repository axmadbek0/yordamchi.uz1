/**
 * Global toast (rollback xabarlari uchun)
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastPayload {
  type: 'error' | 'success' | 'info';
  message: string;
}

export function AppToastHost() {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastPayload>).detail;
      if (!detail?.message) return;
      setToast(detail);
      window.setTimeout(() => setToast(null), 4200);
    };
    window.addEventListener('yordamchi:toast', handler);
    return () => window.removeEventListener('yordamchi:toast', handler);
  }, []);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className={`fixed bottom-6 right-6 z-[80] max-w-sm px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold border ${
            toast.type === 'error'
              ? 'bg-white border-coral/40 text-deep'
              : 'bg-white border-primary/20 text-deep'
          }`}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
