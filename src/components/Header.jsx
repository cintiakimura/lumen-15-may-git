import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

export default function Header({ user, onMenuToggle, sidebarOpen, pageTitle = 'Dashboard' }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout(true);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center border-b border-border/60 bg-background/75 px-4 backdrop-blur-xl backdrop-saturate-150 sm:px-6">
      <div className="flex flex-1 items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-foreground"
          onClick={onMenuToggle}
          aria-expanded={sidebarOpen}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
            L
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" aria-hidden />
          <h1 className="accurat-thin truncate text-xl text-primary sm:text-2xl">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {user?.full_name?.charAt(0) || 'U'}
        </div>
        <div className="hidden min-w-0 flex-col gap-0.5 sm:flex">
          <p className="truncate text-sm font-medium leading-tight text-foreground">{user?.full_name || 'User'}</p>
          <span className="w-fit rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {user?.role === 'teacher' ? 'Teacher' : 'Student'}
          </span>
        </div>
        <Button type="button" variant="outline" size="sm" className="shrink-0 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
