'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    'Open': {
      className: 'status-open',
      label: 'Open'
    },
    'In Progress': {
      className: 'status-progress',
      label: 'In Progress'
    },
    'Resolved': {
      className: 'status-resolved',
      label: 'Resolved'
    },
    'Closed': {
      className: 'status-closed',
      label: 'Closed'
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  const config = statusConfig[status];

  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full',
      config.className,
      sizeClasses[size]
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {config.label}
    </span>
  );
}