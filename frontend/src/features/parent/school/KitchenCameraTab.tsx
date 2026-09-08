/**
 * KitchenCameraTab — Oshxona holati va AI Taomnoma tahlili ko'rsatuvi
 */

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { CameraGrid, type CameraFeedItem } from '@/components/camera/CameraGrid';
import { FoodAnalysisCard } from '@/components/camera/FoodAnalysisCard';
import { getKitchenCameras } from '@/lib/kitchenApi';
import { getLatestFoodAnalysis, triggerManualFoodAnalysis } from '@/lib/foodAnalysisApi';
import type { FoodAnalysisItem, FoodAnalysisCardState } from '@/types/foodAnalysis';

interface KitchenCameraTabProps {
  schoolId: string;
}

export function KitchenCameraTab({ schoolId }: KitchenCameraTabProps) {
  const [cameras, setCameras] = useState<CameraFeedItem[]>([]);
  const [camerasLoading, setCamerasLoading] = useState(true);
  const [camerasError, setCamerasError] = useState(false);

  const [foodAnalysis, setFoodAnalysis] = useState<FoodAnalysisItem | null>(null);
  const [foodCardState, setFoodCardState] = useState<FoodAnalysisCardState>('loading');
  const [isTriggering, setIsTriggering] = useState(false);

  const [hygiene, setHygiene] = useState<{
    date: string;
    result: string;
  } | null>(null);

  // 1. Kameralarni yuklash
  const loadCameras = useCallback(async () => {
    setCamerasLoading(true);
    setCamerasError(false);
    try {
      const data = await getKitchenCameras(schoolId);
      if (!data.isEnabled || data.cameras.length === 0) {
        setCameras([]);
        setHygiene(null);
      } else {
        setCameras(data.cameras);
        setHygiene(data.lastHygieneCheck ?? null);
      }
    } catch {
      setCamerasError(true);
    } finally {
      setCamerasLoading(false);
    }
  }, [schoolId]);

  // 2. AI Taomnoma tahlilini yuklash
  const loadFoodAnalysis = useCallback(async () => {
    setFoodCardState('loading');
    try {
      const res = await getLatestFoodAnalysis(schoolId);

      if (!res.analysis) {
        if (res.cameraStatus === 'CAMERA_OFFLINE') {
          setFoodCardState('partial');
        } else {
          setFoodCardState('empty');
        }
        setFoodAnalysis(null);
        return;
      }

      setFoodAnalysis(res.analysis);
      if (res.analysis.status === 'COMPLETED') {
        setFoodCardState('success');
      } else if (res.analysis.status === 'FAILED') {
        setFoodCardState('error');
      } else {
        setFoodCardState('loading');
      }
    } catch {
      setFoodCardState('error');
    }
  }, [schoolId]);

  const loadAll = useCallback(async () => {
    await Promise.all([loadCameras(), loadFoodAnalysis()]);
  }, [loadCameras, loadFoodAnalysis]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Test / Trigger tahlil
  const handleTriggerAnalyze = async () => {
    setIsTriggering(true);
    try {
      await triggerManualFoodAnalysis();
      // 2 soniyadan so'ng natijani qayta yuklash
      setTimeout(async () => {
        await loadFoodAnalysis();
        setIsTriggering(false);
      }, 1500);
    } catch {
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* 1. Sarlavha va yangilash tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-bold text-deep font-serif">
              Maktab Oshxonasi va Taomnoma
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Sun'iy intellekt orqali kunlik taomlar tahlili va jonli oshxona nazorati
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadAll()}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/8 hover:bg-primary hover:text-white px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Hammasini yangilash
        </button>
      </div>

      {/* 2. AI OSHXONA TAHLILI KARTASI (Asosiy Bloki) */}
      <section className="space-y-3">
        <FoodAnalysisCard
          analysis={foodAnalysis}
          cardState={foodCardState}
          onRefresh={() => void loadFoodAnalysis()}
          onTriggerAnalyze={handleTriggerAnalyze}
          isTriggering={isTriggering}
        />
      </section>

      {/* 3. JONLI OSHXONA KAMERALARI BO'LIMI */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-primary" />
            <h3 className="text-base sm:text-lg font-bold text-deep font-serif">
              Jonli Oshxona Kameralari
            </h3>
          </div>
          <span className="text-xs text-muted">
            {cameras.length} ta faol sektor
          </span>
        </div>

        {camerasLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
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
                </div>
              </div>
            ))}
          </div>
        ) : camerasError ? (
          <div className="bg-white rounded-3xl border border-cardBlue p-8 text-center">
            <p className="text-sm text-muted">Kameralar oqimini yuklashda xatolik yuz berdi.</p>
          </div>
        ) : cameras.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-cardBlue p-8 text-center">
            <p className="text-sm text-muted">Bu maktabda hali oshxona kameralari ulanmagan.</p>
          </div>
        ) : (
          <CameraGrid cameras={cameras} />
        )}
      </section>

      {/* 4. SANITARIYA HOLATI */}
      {hygiene && (
        <div className="bg-white rounded-2xl border border-cardBlue p-4 sm:p-5 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-deep">Sanitariya va Gigiyena Nazorati</h3>
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
