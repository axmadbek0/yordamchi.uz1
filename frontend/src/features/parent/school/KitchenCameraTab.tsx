/**
 * KitchenCameraTab — oshxona holati (Yotoqxona bilan bir xil kamera-grid uslubi)
 */

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, UtensilsCrossed, AlertCircle, ShieldCheck } from 'lucide-react';
import { CameraGrid, type CameraFeedItem } from '@/components/camera/CameraGrid';
import { getKitchenCameras } from '@/lib/kitchenApi';

interface KitchenCameraTabProps {
  schoolId: string;
}

type UiState = 'loading' | 'empty' | 'error' | 'success';

export function KitchenCameraTab({ schoolId }: KitchenCameraTabProps) {
  const [cameras, setCameras] = useState<CameraFeedItem[]>([]);
  const [uiState, setUiState] = useState<UiState>('loading');
  const [hygiene, setHygiene] = useState<{
    date: string;
    result: string;
  } | null>(null);

  const load = useCallback(async () => {
    setUiState('loading');
    try {
      const data = await getKitchenCameras(schoolId);
      if (!data.isEnabled || data.cameras.length === 0) {
        setCameras([]);
        setHygiene(null);
        setUiState('empty');
        return;
      }
      setCameras(data.cameras);
      setHygiene(data.lastHygieneCheck ?? null);
      setUiState('success');
    } catch {
      setUiState('error');
    }
  }, [schoolId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (uiState === 'loading') {
    return (
      <div className="space-y-5">
        <div className="h-7 bg-primary/10 rounded-lg w-40 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-cardBlue overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-deep/10" />
              <div className="p-4 flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-primary/10 rounded w-24" />
                  <div className="h-3 bg-primary/6 rounded w-32" />
                </div>
                <div className="h-5 bg-primary/8 rounded-full w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (uiState === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
          <UtensilsCrossed className="w-8 h-8 text-primary/40" />
        </div>
        <h3 className="text-lg font-bold text-deep mb-2">
          Bu maktabda oshxona kamerasi hali ulanmagan
        </h3>
        <p className="text-sm text-muted max-w-sm leading-relaxed">
          Bu funksiya bosqichma-bosqich joriy etilmoqda. Maktab ulagach, bu yerda oshxona
          sektorlari bo‘yicha kamera ko‘rinishi paydo bo‘ladi.
        </p>
      </div>
    );
  }

  if (uiState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-coral/50" />
        </div>
        <h3 className="text-lg font-bold text-deep mb-2">Kameralarni yuklab bo‘lmadi</h3>
        <p className="text-sm text-muted max-w-sm leading-relaxed mb-5">
          Bu vaqtincha texnik uzilish — xavfsizlik bilan bog‘liq emas. Birozdan so‘ng
          qaytadan urinib ko‘ring.
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-deep transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-deep font-serif">Oshxona holati</h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            {cameras.length} ta sektor · kamera ustiga bosib to‘liq ekranda oching
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/8 hover:bg-primary hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Yangilash
        </button>
      </div>

      <CameraGrid cameras={cameras} />

      {hygiene && (
        <div className="bg-white rounded-2xl border border-cardBlue p-4 sm:p-5 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-deep">Sanitariya holati</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              So‘nggi sanitariya tekshiruvi:{' '}
              <span className="font-semibold text-deep">
                {new Date(hygiene.date).toLocaleDateString('uz-UZ', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {' — '}
              Natija:{' '}
              <span className="font-semibold text-emerald-700 capitalize">{hygiene.result}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
