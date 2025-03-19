import { Menu } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export function Navbar({ onMenuClick, isSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-gray-400 hover:text-white"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => logout()}
            >
              Sign out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}