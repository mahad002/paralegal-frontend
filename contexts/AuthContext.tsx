'use client'

import React, { createContext, useState, useContext, useCallback } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login...');
      const { token, user } = await api.login(email, password);
      console.log('Storing token in localStorage:', token ? 'exists' : 'missing');
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        console.log('Token successfully stored in localStorage');
      } else {
        console.warn('Window is undefined, skipping localStorage operation');
      }
      setUser(user);
      await checkAuth();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    console.log('Logging out...');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      console.log('Token removed from localStorage');
    } else {
      console.warn('Window is undefined, skipping localStorage operation');
    }
    setUser(null);
    console.log('User state cleared');
  }, []);

  const checkAuth = useCallback(async () => {
    console.log("Starting checkAuth...");
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log("Token in localStorage:", token ? 'exists' : 'missing');
    
    if (token) {
      try {
        setIsLoading(true);
        console.log("Fetching current user from API...");
        
        const user = await api.getCurrentUser(token);
        console.log("User fetched from API:", user);

        if (user && user._id) {
          console.log("Valid user data received. Updating state...");
          setUser(user);
        } else {
          console.error("Invalid user data received from API:", user);
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error("Error occurred while fetching user from API:", error);
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      } finally {
        console.log("Setting isLoading to false...");
        setIsLoading(false);
      }
    } else {
      console.log("No token found in localStorage. User is not authenticated.");
      setUser(null);
    }

    console.log("checkAuth complete.");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, checkAuth }}>
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

