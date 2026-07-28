/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (role: UserRole, schoolNumber: number, loginStr: string, passwordString: string) => Promise<boolean>;
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
    
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: loginStr,
          password: passwordStr,
          role: role.toUpperCase()
        })
      });

      if (!response.ok) {
        setIsLoading(false);
        return false;
      }

      const data = await response.json();
      
      const authUser: AuthUser = {
        id: data.user.id,
        role: role,
        schoolNumber: schoolNumber,
        login: data.user.login,
        displayName: data.user.full_name || data.user.login,
        associatedStudentId: data.user.associatedStudentId // optionally return from backend for parents
      };

      setUser(authUser);
      localStorage.setItem('yordamchi_auth_user', JSON.stringify(authUser));
      localStorage.setItem('yordamchi_auth_token', data.token);

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('yordamchi_auth_user');
    localStorage.removeItem('yordamchi_auth_token');
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

