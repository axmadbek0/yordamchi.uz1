/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole } from '../types';
import { getStudents } from './db';

interface AuthContextType {
  user: AuthUser | null;
  login: (role: UserRole, schoolNumber: number, login: string, passwordString: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('yordamchi_auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    role: UserRole,
    schoolNumber: number,
    loginStr: string,
    passwordStr: string
  ): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Admin auth
    if (role === 'admin' && loginStr === 'admin' && passwordStr === 'admin123') {
      const adminUser: AuthUser = {
        id: 'admin-1',
        role: 'admin',
        schoolNumber: schoolNumber,
        login: 'admin',
        displayName: 'Tizim Admini',
      };
      setUser(adminUser);
      localStorage.setItem('yordamchi_auth_user', JSON.stringify(adminUser));
      setIsLoading(false);
      return true;
    }

    // Teacher auth - "umumi" is default index 1
    if (role === 'teacher' && loginStr.startsWith('umumi') && passwordStr === `${schoolNumber}maktab${loginStr}`) {
      const teacherUser: AuthUser = {
        id: `teacher-${loginStr}`,
        role: 'teacher',
        schoolNumber: schoolNumber,
        login: loginStr,
        displayName: `O‘qituvchi (${loginStr === 'umumi' ? 'Asosiy' : loginStr})`,
      };
      setUser(teacherUser);
      localStorage.setItem('yordamchi_auth_user', JSON.stringify(teacherUser));
      setIsLoading(false);
      return true;
    }

    // Parent auth - Matches login/password in students database
    if (role === 'parent') {
      const students = getStudents();
      const student = students.find(
        (s) => s.schoolNumber === schoolNumber && s.parentLogin === loginStr && s.parentPassword === passwordStr
      );

      if (student) {
        const parentUser: AuthUser = {
          id: `parent-${student.id}`,
          role: 'parent',
          schoolNumber: schoolNumber,
          login: loginStr,
          displayName: `${student.fullName}ning ota-onasi`,
          associatedStudentId: student.id,
        };
        setUser(parentUser);
        localStorage.setItem('yordamchi_auth_user', JSON.stringify(parentUser));
        
        // Mark student credentials as activated
        if (!student.credentialsActivated) {
          student.credentialsActivated = true;
          const allStudents = JSON.parse(localStorage.getItem('yordamchi_students') || '[]');
          const idx = allStudents.findIndex((s: any) => s.id === student.id);
          if (idx !== -1) {
            allStudents[idx].credentialsActivated = true;
            localStorage.setItem('yordamchi_students', JSON.stringify(allStudents));
          }
        }
        
        setIsLoading(false);
        return true;
      }
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('yordamchi_auth_user');
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
