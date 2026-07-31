/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'parent' | 'teacher' | 'admin';

export interface AuthUser {
  id: string;
  role: UserRole;
  schoolNumber: number;
  schoolId?: string;
  login: string;
  displayName: string;
  associatedStudentId?: string;
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
  healthStatus: 'sog‘lom' | 'yengil bezovta' | 'betob';
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
// Schools Directory Types
// ==========================================

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SchoolWithLocation {
  id: string;
  number: number;
  name: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  classCount: number;
  photoUrl?: string;
  photoUrls?: string[];
  status: 'active' | 'pending' | 'suspended';
  teacherCount: number;
  studentCount: number;
  createdAt: string;
  lat?: number;
  lng?: number;
  description?: string;
  workingHours?: string;
  foundedYear?: number;
  isVerified?: boolean;
  licenseNumber?: string;
  ageRangeMin?: number;
  ageRangeMax?: number;
  faqItems?: FaqItem[];
  // computed
  distanceKm?: number;
}

export type SchoolDetail = SchoolWithLocation;
