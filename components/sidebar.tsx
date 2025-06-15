import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  FolderOpen,
  FileText,
  Bot,
  History,
  User,
  Users,
  X,
  Scale,
  Building2,
  ChevronRight,
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
      { name: 'Dashboard', href: '/', icon: FolderOpen },
      { name: 'Case Management', href: '/case-management', icon: FileText },
      { name: 'Case Notes', href: '/case-notes', icon: FileText },
      { name: 'Compliance Bot', href: '/compliance-bot', icon: Bot },
      { name: 'History Logs', href: '/history-logs', icon: History },
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
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-y-0 left-0 w-[280px] bg-gray-900 border-r border-gray-800 flex flex-col shadow-2xl"
    >
      <div className="p-6 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-cyan-400" />
          <span className="font-semibold text-lg text-white">Paralegal</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <div className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/50">
            <div className="p-2 rounded-full bg-gray-700">
              <User className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user.role.replace('_', ' ').charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}