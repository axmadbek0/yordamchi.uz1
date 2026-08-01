/**
 * CameraFullscreenModal — kamera to'liq ekran ko'rinishi
 * Chap/o'ng navigatsiya, Esc yopish, fade+scale animatsiya
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Video } from 'lucide-react';

export interface CameraFeedItem {
  id: string;
  cameraLabel: string;
  sectorLabel: string;
  status: 'FAOL' | 'FAOL EMAS';
  isLive: boolean;
  thumbnailUrl?: string;
  /** Kelajakda HLS/WebRTC stream URL */
  streamUrl?: string;
}

interface CameraFullscreenModalProps {
  cameras: CameraFeedItem[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (delta: number) => void;
  timestamp?: string;
}

export function CameraFullscreenModal({
  cameras,
  activeIndex,
  onClose,
  onNavigate,
  timestamp,
}: CameraFullscreenModalProps) {
  const isOpen = activeIndex !== null;
  const camera = isOpen ? cameras[activeIndex] : null;

  useEffect(() => {
    if (!isOpen || !camera) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate(1);
      if (e.key === 'ArrowLeft') onNavigate(-1);
    };

    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, camera, onClose, onNavigate]);

  const timeLabel =
    timestamp ??
    new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <AnimatePresence>
      {isOpen && camera && (
        <motion.div
          key="camera-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${camera.cameraLabel} — ${camera.sectorLabel}`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>

          {cameras.length > 1 && (
            <button
              type="button"
              onClick={() => onNavigate(-1)}
              className="absolute left-3 sm:left-6 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Oldingi kamera"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {cameras.length > 1 && (
            <button
              type="button"
              onClick={() => onNavigate(1)}
              className="absolute right-3 sm:right-6 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Keyingi kamera"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <motion.div
            key={camera.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="max-w-5xl w-full"
          >
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center shadow-2xl border border-white/10">
              {camera.streamUrl ? (
                <video
                  src={camera.streamUrl}
                  className="absolute inset-0 w-full h-full object-contain"
                  autoPlay
                  muted
                  playsInline
                  controls={false}
                />
              ) : camera.thumbnailUrl ? (
                <img
                  src={camera.thumbnailUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <Video className="w-20 h-20 text-white/20" />
              )}

              {camera.isLive && (
                <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-mono bg-black/50 px-2.5 py-1 rounded font-bold tracking-wide">
                    LIVE
                  </span>
                </div>
              )}

              <div className="absolute bottom-4 right-4 z-10">
                <span className="text-white/80 text-xs font-mono bg-black/50 px-2.5 py-1 rounded">
                  {timeLabel}
                </span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="flex justify-between items-center mt-4 text-white px-1">
              <div>
                <p className="font-bold text-base sm:text-lg">
                  {camera.cameraLabel}
                  <span className="text-white/50 font-normal"> — </span>
                  {camera.sectorLabel}
                </p>
                <p className="text-xs text-white/50 mt-0.5">
                  {activeIndex! + 1} / {cameras.length}
                </p>
              </div>
              {camera.isLive && (
                <span className="text-red-400 flex items-center gap-1.5 text-sm font-bold">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
