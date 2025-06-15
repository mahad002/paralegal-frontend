'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Bot,
  History,
  User,
  Users,
  X,
  Scale,
  Building2,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const getNavItems = (role: string) => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Case Management', href: '/case-management', icon: FileText },
      { name: 'Case Notes', href: '/case-notes', icon: FileText },
      { name: 'Compliance Bot', href: '/compliance-bot', icon: Bot },
      { name: 'Chat History', href: '/chat-history', icon: MessageSquare },
      { name: 'Profile', href: '/profile', icon: User },
    ];

    if (role === 'admin') {
      return [...baseItems, { name: 'User Management', href: '/users', icon: Users }];
    }

    if (role === 'firm') {
      return [...baseItems, { name: 'Lawyer Management', href: '/firm/lawyers', icon: Users }];
    }

    return baseItems;
  };

  const navItems = user ? getNavItems(user.role) : [];

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="w-[280px] h-full bg-gray-900 border-r border-gray-800 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">Paralegal</h1>
            <p className="text-xs text-gray-400">Legal Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors lg:hidden"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.button
                key={item.name}
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"
                )} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 bg-blue-400 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      {user && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-800/50">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-400 truncate capitalize">
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}