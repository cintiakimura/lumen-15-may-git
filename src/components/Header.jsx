import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Header({ user, onMenuToggle, sidebarOpen, showSidebar = false, pageTitle = 'Dashboard' }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout(true);
  };

  const insetLeft =
    showSidebar && sidebarOpen
      ? 'lg:pl-[calc(15rem+2rem)]'
      : showSidebar && !sidebarOpen
        ? 'lg:pl-[calc(4rem+2rem)]'
        : '';

  return (
    <header
      className={cn(
        'lumen-glass-nav fixed inset-x-0 top-0 z-40 flex h-14 items-center pl-4 pr-4 md:pr-10 supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))]',
        insetLeft
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="touch-target h-11 w-11 shrink-0 text-foreground sm:h-10 sm:w-10"
          onClick={onMenuToggle}
          aria-expanded={sidebarOpen}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/55 bg-white/65 text-[10px] font-normal text-foreground shadow-[0_2px_8px_-4px_rgba(15,23,42,0.08)] backdrop-blur-md sm:h-9 sm:w-9 sm:text-[11px]">
            L
          </div>
          <h1 className="accurat-thin truncate text-[15px] leading-snug sm:text-base">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="touch-target h-11 w-11 text-foreground sm:hidden"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden h-9 px-3 sm:inline-flex"
          onClick={handleLogout}
        >
          Log out
        </Button>
      </div>
    </header>
  );
}
