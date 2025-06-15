'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export function ModernCard({ 
  children, 
  className, 
  hover = true, 
  gradient = false,
  glass = false,
  onClick 
}: ModernCardProps) {
  const baseClasses = cn(
    "rounded-xl border transition-all duration-200",
    glass ? "glass" : "bg-gray-900 border-gray-800",
    hover && "hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/10",
    gradient && "bg-gradient-to-br from-gray-900 to-gray-800",
    onClick && "cursor-pointer",
    className
  );

  if (onClick) {
    return (
      <motion.div
        className={baseClasses}
        onClick={onClick}
        whileHover={hover ? { scale: 1.02 } : undefined}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
}

export function ModernCardHeader({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("p-6 pb-4", className)}>
      {children}
    </div>
  );
}

export function ModernCardContent({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
}

export function ModernCardTitle({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <h3 className={cn("text-lg font-semibold text-white", className)}>
      {children}
    </h3>
  );
}

export function ModernCardDescription({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <p className={cn("text-sm text-gray-400 mt-1", className)}>
      {children}
    </p>
  );
}