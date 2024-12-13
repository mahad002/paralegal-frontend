'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bot, FileText, FolderOpen, History, User, LogOut, LogIn, Menu } from 'lucide-react';
import { useEffect } from 'react';
// import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { name: 'Dashboard', href: '/', icon: FolderOpen },
  { name: 'Compliance Bot', href: '/compliance-bot', icon: Bot },
  { name: 'Case Management', href: '/case-management', icon: FileText },
  { name: 'Case Notes', href: '/case-notes', icon: FileText },
  { name: 'History Logs', href: '/history-logs', icon: History },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, checkAuth } = useAuth();
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="flex h-16 items-center border-b bg-background px-4 lg:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <FolderOpen className="h-6 w-6" />
        <span className="hidden sm:inline-block">Paralegal</span>
      </Link>

      <div className="ml-auto flex items-center space-x-4">
        {user ? (
          <>
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  size="sm"
                  className={pathname === item.href ? 'bg-muted' : ''}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          pathname !== '/login' && (
            <>
              <Button variant="ghost" size="sm" className="hidden lg:inline-flex" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="lg:hidden" asChild>
                <Link href="/login">
                  <LogIn className="h-5 w-5" />
                </Link>
              </Button>
            </>
          )
        )}
      </div>
    </nav>
  );
}

