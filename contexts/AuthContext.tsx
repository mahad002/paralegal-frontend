'use client'

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
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

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    clearError();

    try {
      const { token, user } = await api.login(email, password);
      
      if (!token || !user) {
        throw new Error('Invalid response from server: Missing token or user data');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }

      setUser(user);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during login';
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setUser(null);
  }, [setUser]);

  const checkAuth = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const user = await api.getCurrentUser(token);
      
      if (user && user._id) {
        setUser(user);
      } else {
        logout();
        setError('Invalid user data received');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
      setError('Session expired or invalid');
    } finally {
      setLoading(false);
    }
  }, [logout, setUser, setError, setLoading]);

  // Initial auth check on mount
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