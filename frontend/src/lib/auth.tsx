/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthUser, UserRole } from '../types';
import {
  loginRequest,
  logoutRequest,
  clearAuthSession,
  fetchCurrentUser,
  getApiErrorMessage,
} from '../api/authApi';
import { setUnauthorizedHandler } from '../api/axios';
import { fetchMyChildren } from '../api/studentApi';

interface AuthContextType {
  user: AuthUser | null;
  login: (
    role: UserRole,
    loginStr: string,
    passwordString: string,
    schoolNumber?: number
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendRole(role: string): UserRole {
  if (role === 'PARENT') return 'parent';
  if (role === 'TEACHER' || role === 'SCHOOL_ADMIN') return 'teacher';
  return 'admin';
}

async function buildAuthUser(
  backendUser: {
    id: string;
    login: string;
    full_name: string | null;
    role: string;
    school_id: string | null;
  },
  schoolNumber?: number
): Promise<AuthUser> {
  const authUser: AuthUser = {
    id: backendUser.id,
    role: mapBackendRole(backendUser.role),
    schoolNumber: schoolNumber || 12,
    schoolId: backendUser.school_id ?? undefined,
    login: backendUser.login,
    displayName: backendUser.full_name || backendUser.login,
  };

  if (authUser.role === 'parent') {
    try {
      const children = await fetchMyChildren();
      if (children[0]) {
        authUser.associatedStudentId = children[0].id;
      }
    } catch {
      // Bolalar ro'yxati keyinroq yuklanadi
    }
  }

  return authUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    void logoutRequest();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthSession();
      setUser(null);
      window.location.href = '/login';
    });
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const storedUser = localStorage.getItem('yordamchi_auth_user');
      const token =
        localStorage.getItem('yordamchi_auth_token') ||
        localStorage.getItem('accessToken');

      if (!storedUser || !token) {
        setIsLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(storedUser) as AuthUser;
        const backendUser = await fetchCurrentUser();
        const refreshed = await buildAuthUser(backendUser, parsed.schoolNumber);
        setUser(refreshed);
        localStorage.setItem('yordamchi_auth_user', JSON.stringify(refreshed));
      } catch {
        clearAuthSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const login = async (
    _role: UserRole,
    loginStr: string,
    passwordStr: string,
    schoolNumber?: number
  ): Promise<{ ok: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const data = await loginRequest({
        login: loginStr,
        password: passwordStr,
      });

      const authUser = await buildAuthUser(data.user, schoolNumber);
      setUser(authUser);
      localStorage.setItem('yordamchi_auth_user', JSON.stringify(authUser));
      setIsLoading(false);
      return { ok: true };
    } catch (error) {
      console.error('Login failed', error);
      setIsLoading(false);
      return {
        ok: false,
        error: getApiErrorMessage(error, 'Login yoki parol xato! Iltimos, tekshirib qayta kiriting.'),
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
