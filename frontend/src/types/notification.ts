/**
 * Bildirishnomalar — o‘qituvchi → ota-ona (pickup, e'lon, muhim)
 */

export type NotificationType = 'pickup_request' | 'announcement' | 'urgent';

export type ParentResponse = 'coming' | 'delayed' | null;

export type DeliveryStatus = 'delivered' | 'pending_push' | 'failed_push';

export interface NotificationRecipient {
  studentId: string;
  studentName: string;
  parentName: string;
  deliveryStatus: DeliveryStatus;
  readByParent: boolean;
  parentResponse?: ParentResponse;
  respondedAt?: string;
}

export interface TeacherNotification {
  id: string;
  type: NotificationType;
  studentIds: string[];
  teacherId: string;
  teacherName: string;
  schoolId: string;
  schoolLabel: string;
  title: string;
  body: string;
  pickupReason?: string;
  pickupTime?: string;
  createdAt: string;
  deliveredAt?: string;
  /** Umumiy: kamida bitta ota-ona o‘qiganmi */
  readByParent: boolean;
  recipients: NotificationRecipient[];
}

export interface SendNotificationPayload {
  type: NotificationType;
  studentIds: string[];
  teacherId: string;
  teacherName: string;
  schoolId: string;
  schoolLabel: string;
  title: string;
  body: string;
  pickupReason?: string;
  pickupTime?: string;
  /** O‘quvchi meta — API ichida recipient yasash uchun */
  studentsMeta: Array<{
    id: string;
    fullName: string;
    parentName?: string;
  }>;
}

export const PICKUP_REASONS = [
  { value: 'early_release', label: 'Bugun ertaroq bo‘shatiladi' },
  { value: 'health', label: "Sog‘lig‘i yomonlashdi" },
  { value: 'other', label: 'Boshqa sabab' },
] as const;
