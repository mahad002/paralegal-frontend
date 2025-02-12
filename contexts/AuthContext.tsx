'use client'

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: User['role'] | User['role'][]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token, user } = await api.login(email, password);
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      
      setUser(user);
      await checkAuth(); // Verify the token and user data
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setUser(null);
    router.push('/login');
  }, [router]);

  const checkAuth = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      setIsLoading(false);
      setUser(null);
      return;
    }

    try {
      setIsLoading(true);
      const user = await api.getCurrentUser();
      
      if (user && user._id) {
        setUser(user);
      } else {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Check authentication status on mount and token changes
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Function to check if user has specific role(s)
  const hasRole = useCallback((roles: User['role'] | User['role'][]) => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  }, [user]);

  const value = {
    user,
    login,
    logout,
    isLoading,
    checkAuth,
    isAuthenticated: !!user,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
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