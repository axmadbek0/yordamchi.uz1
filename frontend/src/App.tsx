/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { HomePage } from './features/marketing/HomePage';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { TeacherDashboard } from './features/teacher/TeacherDashboard';
import { TeacherProfile } from './features/teacher/TeacherProfile';
import { ParentReportsPage } from './features/parent/ParentDashboard';
import { ParentAiChatPage } from './features/parent/ParentAiChatPage';
import { ParentDormitoryCameraPage } from './features/parent/ParentDormitoryCameraPage';
import { ParentKitchenCameraPage } from './features/parent/school/ParentKitchenCameraPage';
import { ParentProfile } from './features/parent/ParentProfile';
import { ParentNotificationsPage } from './features/parent/ParentNotificationsPage';
import { ParentLayout } from './components/layout/ParentLayout';
import { TeacherLayout } from './components/layout/TeacherLayout';
import { SchoolAdminLayout } from './components/layout/SchoolAdminLayout';
import { SchoolAdminDashboard } from './features/school-admin/SchoolAdminDashboard';
import { TeachersManagementPage } from './features/school-admin/TeachersManagementPage';
import { StudentsOverviewPage } from './features/school-admin/StudentsOverviewPage';
import { SchoolReportsPage } from './features/school-admin/SchoolReportsPage';
import { SchoolProfileEditPage } from './features/school-admin/SchoolProfileEditPage';
import { CameraSettingsPage } from './features/school-admin/CameraSettingsPage';
import { AnnouncementsPage } from './features/school-admin/AnnouncementsPage';
import { ChatProvider } from './components/ai-chat/ChatContext';
import { ChatWidget } from './components/ai-chat/ChatWidget';
import { NearbySchoolsPage } from './features/schools-directory/NearbySchoolsPage';
import { SchoolProfilePage } from './features/schools-directory/SchoolProfilePage';
import { EditModeProvider } from './components/admin/EditModeProvider';
import { EditModeToggle } from './components/admin/EditModeToggle';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppToastHost } from './components/AppToastHost';
import { ConnectionBanner } from './components/ConnectionBanner';
import type { UserRole } from './types';

function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: UserRole;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-primary font-bold">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        Yuklanmoqda...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    if (user.role === 'school_admin') return <Navigate to="/school-admin/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/class" replace />;
    if (user.role === 'parent') return <Navigate to="/parent/reports" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ErrorBoundary name="home">
            <HomePage />
          </ErrorBoundary>
        }
      />
      <Route
        path="/maktablar"
        element={
          <ErrorBoundary name="schools">
            <NearbySchoolsPage />
          </ErrorBoundary>
        }
      />
      <Route
        path="/maktablar/:schoolId"
        element={
          <ErrorBoundary name="school-profile">
            <SchoolProfilePage />
          </ErrorBoundary>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Maktab Admini Shell Routes */}
      <Route
        path="/school-admin"
        element={
          <ProtectedRoute allowedRole="school_admin">
            <ErrorBoundary name="school-admin">
              <SchoolAdminLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SchoolAdminDashboard />} />
        <Route path="teachers" element={<TeachersManagementPage />} />
        <Route path="students" element={<StudentsOverviewPage />} />
        <Route path="reports" element={<SchoolReportsPage />} />
        <Route path="profile" element={<SchoolProfileEditPage />} />
        <Route path="cameras" element={<CameraSettingsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
      </Route>

      {/* O'qituvchi Shell Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRole="teacher">
            <ErrorBoundary name="teacher">
              <TeacherLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="class" replace />} />
        <Route path="class" element={<TeacherDashboard />} />
        <Route path="daily-status" element={<TeacherDashboard />} />
        <Route path="reports" element={<TeacherDashboard />} />
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="dashboard" element={<Navigate to="/teacher/class" replace />} />
      </Route>

      {/* Ota-ona Shell Routes */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRole="parent">
            <ErrorBoundary name="parent">
              <ParentLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="reports" replace />} />
        <Route path="reports" element={<ParentReportsPage />} />
        <Route path="ai-chat" element={<ParentAiChatPage />} />
        <Route path="dormitory-camera" element={<ParentDormitoryCameraPage />} />
        <Route path="kitchen-camera" element={<ParentKitchenCameraPage />} />
        <Route path="notifications" element={<ParentNotificationsPage />} />
        <Route path="profile" element={<ParentProfile />} />
        <Route path="dashboard" element={<Navigate to="/parent/reports" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary name="app">
      <AuthProvider>
        <EditModeProvider>
          <ChatProvider>
            <BrowserRouter>
              <ConnectionBanner />
              <AppRoutes />
              <ChatWidget />
              <EditModeToggle />
              <AppToastHost />
            </BrowserRouter>
          </ChatProvider>
        </EditModeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
