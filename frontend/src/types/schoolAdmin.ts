/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TeacherItem {
  id: string;
  login: string;
  displayName: string;
  fullName?: string;
  className: string;
  phone?: string;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface GeneratedCredentials {
  login: string;
  password: string;
}

export interface TeacherWithCredentials {
  teacher: TeacherItem;
  generatedCredentials: GeneratedCredentials;
}

export interface StudentItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  className: string;
  diagnosis: string;
  dob?: string;
  createdAt: string;
  parent: {
    id: string;
    login: string;
    displayName: string;
    phone: string;
  } | null;
  todayStatus: {
    mood: string;
    health: string;
    teacherNote: string;
    aiAnalysis?: string;
    date: string;
  } | null;
}

export interface SchoolReportData {
  period: 'week' | 'month' | 'quarter';
  kpis: {
    totalTeachers: number;
    totalStudents: number;
    totalClasses: number;
    todayLoggedCount: number;
    todayLogRatePercentage: number;
    activeAlertsCount: number;
  };
  moodDistribution: Array<{
    label: string;
    count: number;
    percent: number;
  }>;
  healthDistribution: Array<{
    label: string;
    count: number;
  }>;
  classesBreakdown: Array<{
    className: string;
    totalStudents: number;
    todayLogged: number;
    ratePercentage: number;
  }>;
  trendData: Array<{
    date: string;
    rate: number;
    positiveMoodRate: number;
  }>;
  attentionNeeded: Array<{
    id: string;
    fullName: string;
    className: string;
    mood?: string;
    health?: string;
    teacherNote?: string;
  }>;
}

export interface SchoolProfileData {
  id: string;
  schoolNumber: number;
  name: string;
  address: string;
  region: string;
  phone: string;
  description: string;
  photos: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CameraItem {
  id: string;
  type: 'DORMITORY' | 'KITCHEN';
  sectorLabel: string;
  streamUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  type: 'pickup_request' | 'announcement' | 'urgent';
  targetClasses: string;
  deliveredCount: number;
  createdAt: string;
}

export interface AnnouncementPayload {
  title: string;
  body: string;
  type: 'pickup_request' | 'announcement' | 'urgent';
  classIds?: string[];
  targetClasses?: string[];
}
