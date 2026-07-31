/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'parent' | 'teacher' | 'admin' | 'super_admin';

export interface AuthUser {
  id: string;
  role: UserRole;
  schoolNumber: number;
  login: string;
  displayName: string;
  associatedStudentId?: string; // For parents to link to a student
}

export interface Student {
  id: string;
  fullName: string;
  birthDate: string;
  className: string;
  schoolNumber: number;
  sequenceNumber: number;
  parentPhone: string;
  parentLogin: string;
  parentPassword: string;
  credentialsActivated: boolean;
  avatarUrl?: string;
}

export interface DailyStatusEntry {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  healthStatus: 'sog\'lom' | 'yengil bezovta' | 'betob';
  mood: 'xursand' | 'oddiy' | 'tashvishli' | 'charchagan';
  teacherNote: string;
  aiAnalysis?: string; // AI generated summary/feedback for the parent
  createdAt: string;
}

export interface AIAnalysisPoint {
  date: string;
  moodScore: number; // 1-5 scale for graph representation
  attendanceScore: number;
  entry: DailyStatusEntry;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

// ==========================================
// Super-Admin Types
// ==========================================

export type SchoolStatus = 'active' | 'pending' | 'suspended';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface School {
  id: string;
  number: number;
  name: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  classCount: number;
  photoUrl?: string;
  status: SchoolStatus;
  teacherCount: number;
  studentCount: number;
  createdAt: string;
  // Map & profile extensions
  lat?: number;
  lng?: number;
  description?: string;
  workingHours?: string;
  foundedYear?: number;
  isVerified?: boolean;
  licenseNumber?: string;
  ageRangeMin?: number;
  ageRangeMax?: number;
  photoUrls?: string[];
  faqItems?: FaqItem[];
}

export interface Teacher {
  id: string;
  fullName: string;
  login: string;
  password: string;
  schoolId: string;
  schoolNumber: number;
  schoolName: string;
  lastActivity: string;
  status: 'active' | 'blocked';
  role: 'teacher' | 'school_admin';
}

export interface BillingRecord {
  id: string;
  schoolId: string;
  schoolNumber: number;
  schoolName: string;
  status: 'active' | 'overdue' | 'cancelled';
  nextPayment: string;
  amount: number;
  plan: string;
}

export type PaymentStatus = 'completed' | 'pending' | 'overdue' | 'refunded';
export type PaymentProvider = 'Click' | 'Payme' | 'Uzum Pay' | 'Karta (Uzcard/Humo)';

export interface UserPaymentRecord {
  id: string;
  transactionId: string;
  userName: string;
  userRole: 'parent' | 'teacher' | 'school_admin';
  userPhone: string;
  studentName?: string;
  schoolNumber?: number;
  planName: string;
  amount: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  paymentDate: string;
  expiryDate: string;
  cardNumberMasked?: string;
}


export interface PlatformStats {
  totalSchools: number;
  totalTeachers: number;
  totalStudents: number;
  activeChatsToday: number;
  schoolsTrend: number;   // percentage change
  teachersTrend: number;
  studentsTrend: number;
  chatsTrend: number;
}

export interface ActivityFeedItem {
  id: string;
  message: string;
  timestamp: string;
  type: 'school' | 'teacher' | 'billing' | 'system';
}

export interface AttentionItem {
  id: string;
  message: string;
  type: 'pending_school' | 'overdue_payment' | 'system_alert';
  link: string;
}

export interface MonthlyGrowthData {
  month: string;
  schools: number;
  students: number;
  teachers: number;
}

export interface RegionData {
  region: string;
  count: number;
  color: string;
}

export interface TopSchoolData {
  id: string;
  name: string;
  number: number;
  score: number;
  studentCount: number;
}

export interface AdminSettingsData {
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    dailyReport: boolean;
  };
  aiLanguage: 'uz_latin' | 'uz_cyrillic' | 'ru';
  security: {
    minPasswordLength: number;
    sessionTimeout: number; // minutes
    require2FA: boolean;
  };
  credentialFormula: string;
}
