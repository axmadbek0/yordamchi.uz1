/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { HomePage } from './features/marketing/HomePage';
import { LoginPage } from './features/auth/LoginPage';
import { TeacherDashboard } from './features/teacher/TeacherDashboard';
import { ParentDashboard } from './features/parent/ParentDashboard';

/**
 * Route guard component to check roles.
 */
function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'parent' | 'teacher' }) {
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
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing Route */}
          <Route path="/" element={<HomePage />} />

          {/* Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Teacher Private Area */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          {/* Parent Private Area */}
          <Route
            path="/parent/dashboard"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
