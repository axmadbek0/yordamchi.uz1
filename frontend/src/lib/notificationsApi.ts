/**
 * Notifications API — localStorage (backend/FCM ulanganda shu qatlam almashtiriladi)
 */

import type {
  TeacherNotification,
  SendNotificationPayload,
  ParentResponse,
  DeliveryStatus,
} from '../types/notification';

const STORAGE_KEY = 'yordamchi_notifications';
const PUSH_PREF_KEY = 'yordamchi_push_enabled';
const FCM_TOKEN_KEY = 'yordamchi_fcm_token';
const EVENT_NAME = 'yordamchi:notification';

function readAll(): TeacherNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TeacherNotification[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: TeacherNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { list } }));
}

export function isPushEnabled(): boolean {
  return localStorage.getItem(PUSH_PREF_KEY) === '1';
}

export function setPushEnabled(enabled: boolean) {
  localStorage.setItem(PUSH_PREF_KEY, enabled ? '1' : '0');
}

export function getStoredFcmToken(): string | null {
  return localStorage.getItem(FCM_TOKEN_KEY);
}

export function setStoredFcmToken(token: string | null) {
  if (token) localStorage.setItem(FCM_TOKEN_KEY, token);
  else localStorage.removeItem(FCM_TOKEN_KEY);
}

export function subscribeNotificationChanges(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  const onCustom = () => cb();
  window.addEventListener('storage', onStorage);
  window.addEventListener(EVENT_NAME, onCustom);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(EVENT_NAME, onCustom);
  };
}

function resolveDelivery(): DeliveryStatus {
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && isPushEnabled()) {
    return 'delivered';
  }
  if (isPushEnabled()) return 'pending_push';
  return 'failed_push';
}

async function tryBrowserNotify(title: string, body: string, tag: string) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  if (!isPushEnabled()) return;

  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, {
        body,
        icon: '/logo-192.png',
        tag,
        data: { url: '/parent/notifications' },
      });
    } else {
      // eslint-disable-next-line no-new
      new Notification(title, { body, tag, icon: '/logo-192.png' });
    }
  } catch {
    // Brauzer bloklaganda jim o‘tkazamiz — xabar feed’da qoladi
  }
}

export async function sendTeacherNotification(
  payload: SendNotificationPayload
): Promise<TeacherNotification> {
  await new Promise((r) => setTimeout(r, 600));

  const delivery = resolveDelivery();
  const now = new Date().toISOString();

  const recipients = payload.studentsMeta.map((s) => ({
    studentId: s.id,
    studentName: s.fullName,
    parentName: s.parentName || 'Ota-ona',
    deliveryStatus: delivery,
    readByParent: false,
    parentResponse: null as ParentResponse,
  }));

  const notification: TeacherNotification = {
    id: `ntf-${Date.now()}`,
    type: payload.type,
    studentIds: payload.studentIds,
    teacherId: payload.teacherId,
    teacherName: payload.teacherName,
    schoolId: payload.schoolId,
    schoolLabel: payload.schoolLabel,
    title: payload.title,
    body: payload.body,
    pickupReason: payload.pickupReason,
    pickupTime: payload.pickupTime,
    createdAt: now,
    deliveredAt: delivery === 'delivered' ? now : undefined,
    readByParent: false,
    recipients,
  };

  const all = readAll();
  all.unshift(notification);
  writeAll(all);

  await tryBrowserNotify(payload.title, payload.body, notification.id);

  return notification;
}

export async function getTeacherSentNotifications(teacherId: string): Promise<TeacherNotification[]> {
  await new Promise((r) => setTimeout(r, 200));
  return readAll().filter((n) => n.teacherId === teacherId);
}

export async function getParentNotifications(studentIds: string[]): Promise<TeacherNotification[]> {
  await new Promise((r) => setTimeout(r, 250));
  const set = new Set(studentIds);
  return readAll().filter((n) => n.studentIds.some((id) => set.has(id)));
}

export async function markNotificationRead(
  notificationId: string,
  studentId: string
): Promise<TeacherNotification | null> {
  const all = readAll();
  const idx = all.findIndex((n) => n.id === notificationId);
  if (idx < 0) return null;

  const n = { ...all[idx], recipients: all[idx].recipients.map((r) => ({ ...r })) };
  const rec = n.recipients.find((r) => r.studentId === studentId);
  if (rec) rec.readByParent = true;
  n.readByParent = n.recipients.some((r) => r.readByParent);
  all[idx] = n;
  writeAll(all);
  return n;
}

export async function respondToNotification(
  notificationId: string,
  studentId: string,
  response: Exclude<ParentResponse, null>
): Promise<TeacherNotification | null> {
  const all = readAll();
  const idx = all.findIndex((n) => n.id === notificationId);
  if (idx < 0) return null;

  const n = { ...all[idx], recipients: all[idx].recipients.map((r) => ({ ...r })) };
  const rec = n.recipients.find((r) => r.studentId === studentId);
  if (rec) {
    rec.readByParent = true;
    rec.parentResponse = response;
    rec.respondedAt = new Date().toISOString();
  }
  n.readByParent = true;
  all[idx] = n;
  writeAll(all);
  return n;
}

export function buildPickupTemplate(opts: {
  parentName: string;
  childName: string;
  time: string;
  reasonLabel: string;
  teacherName: string;
  schoolLabel: string;
  extraNote?: string;
}): { title: string; body: string } {
  const note = opts.extraNote?.trim() ? `\n\n${opts.extraNote.trim()}` : '';
  return {
    title: 'Bolani olib ketish so‘rovi',
    body:
      `Hurmatli ${opts.parentName}, farzandingiz ${opts.childName} bugun ${opts.time}da ` +
      `bo‘shatiladi. Sababi: ${opts.reasonLabel}. Iltimos, belgilangan vaqtda kelishingizni so‘raymiz.` +
      `${note}\n\n— ${opts.teacherName}, ${opts.schoolLabel}`,
  };
}
