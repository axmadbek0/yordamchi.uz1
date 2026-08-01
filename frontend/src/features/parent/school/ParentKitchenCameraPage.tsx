/**
 * ParentKitchenCameraPage — faqat oshxona kamera-grid (ichki tabsiz)
 */

import { useAuth } from '@/lib/auth';
import { KitchenCameraTab } from './KitchenCameraTab';

export function ParentKitchenCameraPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId || `sch-${user?.schoolNumber || 12}`;

  return <KitchenCameraTab schoolId={schoolId} />;
}
