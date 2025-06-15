'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ButtonLoader } from './loading-states';

interface ModernButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag'> {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function ModernButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ModernButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600',
    ghost: 'hover:bg-gray-800 text-gray-300 hover:text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base'
  };

  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  );

  return (
    <motion.button
      className={baseClasses}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      {...props}
    >
      {loading ? (
        <ButtonLoader />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </motion.button>
  );
}