import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  UtensilsCrossed,
  RefreshCw,
  Clock,
  Camera,
  Maximize2,
  X,
  Apple,
  Fish,
  Wheat,
  Coffee,
  HeartHandshake,
  HelpCircle,
} from 'lucide-react';
import type { FoodAnalysisItem, FoodAnalysisCardState, DetectedFood } from '@/types/foodAnalysis';

interface FoodAnalysisCardProps {
  analysis: FoodAnalysisItem | null;
  cardState: FoodAnalysisCardState;
  onRefresh?: () => void;
  onTriggerAnalyze?: () => void;
  isTriggering?: boolean;
}

function getCategoryIcon(category?: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('sabzavot') || cat.includes('meva')) {
    return <Apple className="w-3.5 h-3.5 text-emerald-600" />;
  }
  if (cat.includes('oqsil') || cat.includes('go\'sht') || cat.includes('tuxum')) {
    return <Fish className="w-3.5 h-3.5 text-blue-600" />;
  }
  if (cat.includes('uglevod') || cat.includes('don') || cat.includes('non')) {
    return <Wheat className="w-3.5 h-3.5 text-amber-600" />;
  }
  if (cat.includes('ichimlik') || cat.includes('choy') || cat.includes('kompot')) {
    return <Coffee className="w-3.5 h-3.5 text-teal-600" />;
  }
  return <UtensilsCrossed className="w-3.5 h-3.5 text-coral" />;
}

function getCategoryBg(category?: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('sabzavot') || cat.includes('meva')) return 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
  if (cat.includes('oqsil')) return 'bg-blue-50 text-blue-800 border-blue-200/60';
  if (cat.includes('uglevod')) return 'bg-amber-50 text-amber-900 border-amber-200/60';
  if (cat.includes('ichimlik')) return 'bg-teal-50 text-teal-800 border-teal-200/60';
  return 'bg-coral/10 text-coral border-coral/20';
}

export function FoodAnalysisCard({
  analysis,
  cardState,
  onRefresh,
  onTriggerAnalyze,
  isTriggering = false,
}: FoodAnalysisCardProps) {
  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState(false);

  // 1. LOADING HOLATI (Skeleton)
  if (cardState === 'loading') {
    return (
      <div className="bg-white rounded-3xl border border-cardBlue p-5 sm:p-6 shadow-sm overflow-hidden animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10" />
            <div className="h-5 bg-primary/10 rounded w-48" />
          </div>
          <div className="h-6 bg-primary/10 rounded-full w-24" />
        </div>
        <div className="aspect-video w-full rounded-2xl bg-deep/5 mb-5" />
        <div className="space-y-3">
          <div className="h-4 bg-primary/10 rounded w-32" />
          <div className="flex flex-wrap gap-2">
            <div className="h-8 bg-primary/8 rounded-xl w-28" />
            <div className="h-8 bg-primary/8 rounded-xl w-36" />
            <div className="h-8 bg-primary/8 rounded-xl w-24" />
          </div>
          <div className="h-16 bg-cardBlue/50 rounded-2xl w-full mt-4" />
        </div>
      </div>
    );
  }

  // 2. EMPTY HOLATI (Bugun hali tahlil kelmadi)
  if (cardState === 'empty') {
    return (
      <div className="bg-white rounded-3xl border border-cardBlue p-8 sm:p-10 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-cardBlue flex items-center justify-center mx-auto mb-4 text-primary">
          <UtensilsCrossed className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-deep mb-2 font-serif">Bugun hali taomnoma tahlili kelmadi</h3>
        <p className="text-sm text-muted max-w-md mx-auto leading-relaxed mb-6">
          Maktab oshxonasida taom tayyorlangach va tarqatilgach, sun'iy intellekt kadrni tahlil qilib,
          bu yerda to'liq ozuqaviy qiymati va iliq izohni ko'rsatadi.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Yangilash
            </button>
          )}
          {onTriggerAnalyze && (
            <button
              type="button"
              onClick={onTriggerAnalyze}
              disabled={isTriggering}
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm hover:bg-deep transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isTriggering ? 'Tahlil qilinmoqda...' : 'Tahlilni sinab ko‘rish'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. ERROR / FAILED HOLATI (Foydalanuvchiga yumshoq, xavotirsiz matn)
  if (cardState === 'error') {
    return (
      <div className="bg-white rounded-3xl border border-cardBlue p-7 sm:p-9 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3 text-amber-600">
          <Clock className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-deep mb-1.5 font-serif">
          Bugungi tahlil biroz kechikmoqda
        </h3>
        <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto leading-relaxed mb-5">
          Tizim kadrni qayta tekshirmoqda, ma'lumotlar tez orada yangilanadi. Xavotirga o'rin yo'q.
        </p>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-xs px-4 py-2 rounded-xl hover:bg-deep transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Qaytadan tekshirish
          </button>
        )}
      </div>
    );
  }

  // 4. PARTIAL / OFFLINE HOLATI (Kamera oflayn)
  if (cardState === 'partial' || analysis?.status === 'FAILED') {
    return (
      <div className="bg-white rounded-3xl border border-cardBlue p-6 sm:p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-cardBlue flex items-center justify-center mx-auto mb-3 text-primary">
          <Camera className="w-7 h-7 text-primary/70" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-deep mb-1.5 font-serif">
          Kamera vaqtincha ulanmagan
        </h3>
        <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto leading-relaxed mb-5">
          Keyingi ovqatlanish vaqtida kadr avtomatik yangilanadi va tahlil hisoboti taqdim etiladi.
        </p>
        <div className="flex justify-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 bg-cardBlue hover:bg-primary hover:text-white text-primary font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Yangilash
            </button>
          )}
        </div>
      </div>
    );
  }

  // 5. SUCCESS HOLATI — To'liq chiroyli ko'rsatuv
  const imageUrl =
    analysis?.frameUrls && analysis.frameUrls.length > 0
      ? analysis.frameUrls[0]
      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';

  const detectedFoods: DetectedFood[] = analysis?.detectedFoods || [];
  const totalCalories = analysis?.totalCalories || 0;
  const healthScore = analysis?.healthScore || 'BALANCED';
  const aiNote = analysis?.aiNote || "Farzandlarimiz uchun tayyorlangan ushbu taom muvozanatli va to'yimli.";

  const formattedTime = analysis?.capturedAt
    ? new Date(analysis.capturedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    : '13:00';

  const formattedDate = analysis?.capturedAt
    ? new Date(analysis.capturedAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })
    : 'Bugun';

  return (
    <>
      <div className="bg-white rounded-3xl border border-cardBlue overflow-hidden shadow-sm hover:shadow-md transition-all">
        {/* Yuqori Header */}
        <div className="p-4 sm:p-5 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cardBlue/50 bg-gradient-to-r from-cardBlue/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-deep font-serif leading-tight">
                  Oshxona AI Taomnoma Tahlili
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  AI Vision
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary/70" />
                {formattedDate}, soat {formattedTime} holatiga
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                title="Tahlilni yangilash"
                className="p-2 rounded-xl text-muted hover:text-primary hover:bg-cardBlue transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            {onTriggerAnalyze && (
              <button
                type="button"
                onClick={onTriggerAnalyze}
                disabled={isTriggering}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isTriggering ? 'Tahlilda...' : 'Qayta tahlil'}
              </button>
            )}
          </div>
        </div>

        {/* Asosiy Kontent */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Kadr Rasmi (16:9) */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-deep/5 border border-cardBlue/80 group">
            <img
              src={imageUrl}
              alt="Oshxona taomi kadri"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              onError={(e) => {
                // Fallback placeholder image
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
              }}
            />
            {/* Ustki qoplamadagi ma'lumotlar */}
            <div className="absolute inset-0 bg-gradient-to-t from-deep/70 via-transparent to-black/20 pointer-events-none" />

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {analysis?.cameraLabel || 'Oshxona kamerasi'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreenImageOpen(true)}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-deep text-xs font-semibold px-3 py-1.5 rounded-xl backdrop-blur-md shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-primary" />
              Kattalashtirish
            </button>
          </div>

          {/* Aniqlangan taomlar va kaloriya bloki */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Chap tomonda: Aniqlangan taomlar ro'yxati badge'lari */}
            <div className="md:col-span-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                  Aniqlangan taomlar ({detectedFoods.length})
                </h4>
              </div>

              {detectedFoods.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {detectedFoods.map((food, idx) => (
                    <div
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-medium shadow-2xs transition-transform hover:-translate-y-0.5 ${getCategoryBg(
                        food.category
                      )}`}
                    >
                      {getCategoryIcon(food.category)}
                      <span className="font-semibold text-deep">{food.name}</span>
                      <span className="text-[11px] opacity-80 pl-1 border-l border-current/20">
                        ~{food.estimatedCalories} kal
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted italic">Taomlar ro'yxati aniqlanmoqda...</p>
              )}
            </div>

            {/* O'ng tomonda: Umumiy kaloriya kartasi */}
            <div className="bg-gradient-to-br from-cardBlue/50 to-white rounded-2xl border border-cardBlue p-4 flex flex-col justify-center items-center text-center">
              <div className="w-9 h-9 rounded-xl bg-coral/10 flex items-center justify-center mb-1 text-coral">
                <Flame className="w-5 h-5 fill-coral/20" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Umumiy kaloriya</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-deep font-serif mt-0.5">
                {totalCalories} <span className="text-sm font-semibold text-muted">kkal</span>
              </div>
              <span className="text-[10px] text-muted mt-1">O'rtacha me'yorga mos</span>
            </div>
          </div>

          {/* Sog'lomlik Ko'rsatkichi (Iliq, do'stona, hech qachon qizil svetofor emas) */}
          <div className="pt-1">
            {healthScore === 'BALANCED' ? (
              <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                  <span className="font-bold block text-emerald-950 mb-0.5">
                    🌿 Muvozanatli va to'yimli taomnoma
                  </span>
                  Ushbu taom tarkibidagi oqsil, uglevod va vitaminlar bolalarning sog'lom o'sishi va kun davomidagi
                  tetikligiga to'liq xizmat qiladi.
                </div>
              </div>
            ) : healthScore === 'NEEDS_ATTENTION' ? (
              <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                  <Apple className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                  <span className="font-bold block text-amber-900 mb-0.5">
                    🍎 Vitaminga boy taomnoma tavsiyasi
                  </span>
                  Taom to'yimli. Keyingi tushlik yoki kechki ovqatda yangi sabzavotlar va mevalar ulushini ko'paytirish
                  bolajonlarga yanada ko'proq tabiiy kuch bag'ishlaydi.
                </div>
              </div>
            ) : (
              <div className="bg-cardBlue border border-primary/20 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center flex-shrink-0 text-primary">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-xs text-deep leading-relaxed">
                  <span className="font-bold block mb-0.5">🍲 Taomnoma tahlil jarayonida</span>
                  Oshxona mutaxassislari tomonidan ozuqaviy qiymat yangilanmoqda.
                </div>
              </div>
            )}
          </div>

          {/* AI Iliq Izohi (Ota-ona uchun samimiy tilda) */}
          {aiNote && (
            <div className="bg-gradient-to-r from-cardBlue/70 via-cardBlue/40 to-white rounded-2xl border border-primary/15 p-4 sm:p-4.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary block mb-1">
                  AI Pedagog va Parhezshunos Xulosasi
                </span>
                <p className="text-xs sm:text-sm text-deep font-serif italic leading-relaxed">
                  "{aiNote}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rasm to'liq ekran modal oynasi */}
      {isFullscreenImageOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsFullscreenImageOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-deep rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between bg-black/40 text-white">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-coral" />
                <span className="font-bold text-sm">Oshxona kamerasi kadri ({formattedTime})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreenImageOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <img src={imageUrl} alt="Katta kadr" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
