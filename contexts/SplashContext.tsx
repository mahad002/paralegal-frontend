'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SplashScreen } from '@/components/splash-screen';

interface SplashContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!token) {
        router.push('/login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SplashContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && <SplashScreen />}
      {children}
    </SplashContext.Provider>
  );
}

export function useSplash() {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
}