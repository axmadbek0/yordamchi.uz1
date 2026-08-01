/**
 * ParentDormitoryCameraPage — yotoqxona kameralari
 */

import { CameraGrid, type CameraFeedItem } from '@/components/camera/CameraGrid';

const DORM_CAMERAS: CameraFeedItem[] = ([1, 2, 3, 4] as const).map((n) => ({
  id: `dorm-${n}`,
  cameraLabel: `Kamera #${n}`,
  sectorLabel: `Yotoqxona ${n}-sektori`,
  status: 'FAOL' as const,
  isLive: true,
}));

export function ParentDormitoryCameraPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <header>
        <h2 className="text-2xl sm:text-3xl font-serif text-deep font-bold">Yotoqxona kuzatuvi</h2>
        <p className="text-muted text-xs sm:text-sm mt-1">
          Yotoqxona sektorlari bo‘yicha kamera ko‘rinishi
        </p>
      </header>
      <CameraGrid cameras={DORM_CAMERAS} />
    </div>
  );
}
