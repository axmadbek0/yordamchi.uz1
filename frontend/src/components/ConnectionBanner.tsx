/**
 * Backend aloqa yo‘qolganda — iliq banner + polling self-heal
 */

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { fetchWithRetry } from '@/lib/fetchWithRetry';

const PING_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/health`;

async function pingBackend(): Promise<boolean> {
  try {
    await fetchWithRetry(async () => {
      const ctrl = new AbortController();
      const t = window.setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(PING_URL, { signal: ctrl.signal, credentials: 'include' });
      window.clearTimeout(t);
      // 404 ham "server tirik" deb hisoblanadi
      if (!res && res !== undefined) throw new Error('offline');
      return true;
    }, 1, 400);
    return true;
  } catch {
    // Dev’da backend bo‘lmasa ham marketing ishlashi uchun — faqat aniq network fail
    try {
      await fetch(window.location.origin, { method: 'HEAD', cache: 'no-store' });
      return true; // frontend o‘zi online
    } catch {
      return false;
    }
  }
}

export function ConnectionBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const ok = await pingBackend();
      if (!cancelled) setOffline(!ok);
    };

    void check();
    const id = window.setInterval(() => void check(), 5000);

    const onOffline = () => setOffline(true);
    const onOnline = () => void check();
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[90] bg-deep text-white text-center text-xs sm:text-sm font-semibold py-2.5 px-4 flex items-center justify-center gap-2 shadow-lg">
      <WifiOff className="w-4 h-4 text-coral" />
      Ulanish tiklanmoqda... Internet aloqasini tekshiring. Sahifa avtomatik yangilanadi.
    </div>
  );
}
