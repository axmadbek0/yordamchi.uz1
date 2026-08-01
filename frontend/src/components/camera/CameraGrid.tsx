/**
 * Camera grid + fullscreen — yotoqxona va oshxona uchun umumiy
 */

import { useState, useEffect, useCallback } from 'react';
import { CameraTile } from './CameraTile';
import { CameraFullscreenModal, type CameraFeedItem } from './CameraFullscreenModal';

export type { CameraFeedItem };

interface CameraGridProps {
  cameras: CameraFeedItem[];
}

function useLiveClock(enabled: boolean) {
  const [now, setNow] = useState(() =>
    new Date().toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  );

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      setNow(
        new Date().toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, [enabled]);

  return now;
}

export function CameraGrid({ cameras }: CameraGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const timestamp = useLiveClock(true);

  const onNavigate = useCallback(
    (delta: number) => {
      setActiveIndex((prev) => {
        if (prev === null || cameras.length === 0) return prev;
        return (prev + delta + cameras.length) % cameras.length;
      });
    },
    [cameras.length]
  );

  if (cameras.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map((cam, index) => (
          <CameraTile
            key={cam.id}
            cameraLabel={cam.cameraLabel}
            sectorLabel={cam.sectorLabel}
            status={cam.status}
            isLive={cam.isLive}
            timestamp={timestamp}
            thumbnailUrl={cam.thumbnailUrl}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>

      <CameraFullscreenModal
        cameras={cameras}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={onNavigate}
        timestamp={timestamp}
      />
    </>
  );
}
