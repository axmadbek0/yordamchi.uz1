/**
 * Kitchen camera API — oshxona kamera sektorlari (yotoqxona bilan bir xil tile uslubi)
 */

import type { CameraFeedItem } from '../components/camera/CameraFullscreenModal';

export interface KitchenCamerasResponse {
  isEnabled: boolean;
  cameras: CameraFeedItem[];
  lastHygieneCheck?: {
    date: string;
    result: string;
  };
}

/**
 * schoolId === 'disabled' → empty holat demo
 */
export async function getKitchenCameras(schoolId: string): Promise<KitchenCamerasResponse> {
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));

  const id = schoolId || 'default';

  if (id === 'disabled' || id === 'sch-disabled') {
    return { isEnabled: false, cameras: [] };
  }

  const sectorCount = 4;
  const cameras: CameraFeedItem[] = Array.from({ length: sectorCount }, (_, i) => {
    const n = i + 1;
    return {
      id: `kitchen-${id}-${n}`,
      cameraLabel: `Kamera #${n}`,
      sectorLabel: `Oshxona ${n}-sektori`,
      status: 'FAOL' as const,
      isLive: true,
    };
  });

  return {
    isEnabled: true,
    cameras,
    lastHygieneCheck: {
      date: new Date(Date.now() - 5 * 24 * 60 * 60_000).toISOString().split('T')[0],
      result: 'Yaxshi',
    },
  };
}

/** @deprecated snapshot API — grid uslubiga o‘tildi */
export async function getKitchenStatus(schoolId: string) {
  const data = await getKitchenCameras(schoolId);
  return {
    isEnabled: data.isEnabled,
    latestSnapshot: null,
    recentSnapshots: [],
    lastHygieneCheck: data.lastHygieneCheck
      ? { date: data.lastHygieneCheck.date, result: 'yaxshi' as const }
      : undefined,
    refreshIntervalMinutes: 20,
  };
}
