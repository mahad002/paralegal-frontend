'use client';

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import * as UserAPI from '@/lib/api/User';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, user, error: null }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    clearError();

    try {
      const response = await UserAPI.login(email, password);

      if (!response || 'error' in response) {
        throw new Error(response?.error || 'Login failed');
      }

      if (response.token) {
        localStorage.setItem('token', response.token);
      } else {
        throw new Error('No token received');
      }

      if (response.user) {
        setUser(response.user);
      } else {
        throw new Error('No user data received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login error occurred';
      setError(errorMessage);
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setUser, setError]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  }, [setUser, setError]);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    clearError();

    try {
      const response = await UserAPI.getCurrentUser();

      if ('error' in response) {
        console.error('Error fetching user:', response.error);
        localStorage.removeItem('token');
        setUser(null);
        setError(response.error);
        return;
      }

      if (response._id) {
        setUser(response);
        clearError();
      } else {
        console.error('Invalid user data received:', response);
        logout();
        setError('Invalid user data received');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      setUser(null);
      setError('Session expired or invalid');
    } finally {
      setLoading(false);
    }
  }, [logout, setUser, setError, setLoading, clearError]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    ...state,
    login,
    logout,
    checkAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}