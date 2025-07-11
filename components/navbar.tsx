import { Menu, Bell, Search, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface NavbarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export function Navbar({ onMenuClick, isSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 navbar-glass">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-300 hover:text-sconce-100 hover:bg-navy-800/50"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          {!isSidebarOpen && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex text-gray-300 hover:text-sconce-100 hover:bg-navy-800/50"
                onClick={onMenuClick}
              >
                <Menu className="h-6 w-6" />
              </Button>
              
              {/* Logo and Brand Name when sidebar is closed */}
              <div className="hidden lg:flex items-center gap-3 ml-2">
                <div className="p-2 bg-gradient-to-br from-tricorn-800/50 to-navy-800/50 rounded-lg border border-sconce-500/30 shadow-lg">
                  <img 
                    src="/image.png" 
                    alt="Paralegal Logo" 
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      // Fallback if image doesn't load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  {/* Fallback icon if image fails to load */}
                  <div className="hidden w-6 h-6 bg-gradient-to-br from-sconce-500 to-sconce-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                </div>
                <span className="text-xl font-bold text-sconce-100 legal-serif">
                  Paralegal
                </span>
              </div>
            </>
          )}
          
          {/* Search Bar */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search cases, notes, or documents..."
              className={`pl-10 professional-input ${!isSidebarOpen ? 'w-64' : 'w-80'}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-300 hover:text-sconce-100 hover:bg-navy-800/50"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              3
            </span>
          </Button>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 px-3 py-2 h-auto text-gray-300 hover:text-sconce-100 hover:bg-navy-800/50"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sconce-500 to-sconce-600 flex items-center justify-center text-tricorn-900 font-semibold text-sm shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-sconce-100">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {user.role.replace('_', ' ')}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-tricorn-900/95 backdrop-blur-sm border-navy-800/50"
              >
                <DropdownMenuLabel className="text-sconce-100">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-navy-800/50" />
                <DropdownMenuItem 
                  className="text-gray-300 hover:bg-navy-800/50 hover:text-sconce-100 cursor-pointer"
                  onClick={() => window.location.href = '/profile'}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-navy-800/50" />
                <DropdownMenuItem 
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}