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
  Briefcase,
  Shield,
  MessageSquare,
  BarChart3,
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
      { name: 'Dashboard', href: '/', icon: BarChart3, description: 'Overview & Analytics' },
      { name: 'Case Management', href: '/case-management', icon: Briefcase, description: 'Manage Legal Cases' },
      { name: 'Case Notes', href: '/case-notes', icon: FileText, description: 'Document Analysis' },
      { name: 'Compliance Bot', href: '/compliance-bot', icon: Shield, description: 'Due Diligence Assistant' },
      { name: 'Chat History', href: '/chat-history', icon: MessageSquare, description: 'Conversation Logs' },
      { name: 'Profile', href: '/profile', icon: User, description: 'Account Settings' },
    ];

    if (role === 'admin') {
      return [...baseItems, { name: 'User Management', href: '/users', icon: Users, description: 'System Administration' }];
    }

    if (role === 'firm') {
      return [...baseItems, { name: 'Lawyer Management', href: '/firm/lawyers', icon: Users, description: 'Manage Firm Lawyers' }];
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
      className="fixed inset-y-0 left-0 w-[280px] glass-card flex flex-col shadow-2xl z-50"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-navy-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-tricorn-800/50 to-navy-800/50 rounded-lg border border-sconce-500/30 shadow-lg">
            <img 
              src="/image.png" 
              alt="Paralegal Logo" 
              className="h-6 w-6"
            />
          </div>
          <span className="text-xl font-bold text-sconce-100 legal-serif">
            Paralegal
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-navy-800/50 transition-colors duration-200 text-gray-300 hover:text-sconce-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="px-3 space-y-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.button
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(item.href)}
                className={cn(
                  "sidebar-item w-full group",
                  isActive && "active"
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-sconce-500/20 text-sconce-400 shadow-lg" 
                      : "bg-tricorn-800/30 text-gray-400 group-hover:bg-navy-800/50 group-hover:text-sconce-100"
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                      {item.description}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-1 rounded-full bg-sconce-500/20"
                  >
                    <ChevronRight className="h-3 w-3 text-sconce-400" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-navy-800/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-tricorn-800/50 to-navy-800/50 border border-sconce-500/30 shadow-lg">
            <div className="p-2 rounded-full bg-gradient-to-br from-sconce-500 to-sconce-600 shadow-lg">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sconce-100 truncate">
                {user.name}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <p className="text-xs text-gray-400 truncate capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}