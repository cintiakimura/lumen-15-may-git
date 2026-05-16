import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function TeacherSidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'TeacherDashboard' },
    { icon: BookOpen, label: 'My Courses', page: 'TeacherCourses' },
    { icon: Users, label: 'Students', page: 'TeacherStudents' },
    { icon: BarChart3, label: 'Analytics', page: 'TeacherAnalytics' },
  ];

  const isActive = (page) => {
    return location.pathname === createPageUrl(page);
  };

  const handleLogout = async () => {
    await logout(true);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={onToggle}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className={cn(
          'sidebar fixed left-0 top-0 z-40 flex h-full w-[280px] flex-col border-r border-border/60 bg-sidebar/85 backdrop-blur-xl backdrop-saturate-150 lg:static lg:translate-x-0'
        )}
      >
        <div className="sidebar-header flex items-center border-b border-border/60 px-6 py-4">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/lumen-prod/public/69816fdfc8b62c2372da0c4b/1cf3c4952_lumenlogo.png"
            alt="LUMEN"
            className="h-10 w-auto"
          />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              onClick={() => window.innerWidth < 1024 && onToggle()}
              className="block no-underline"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                  isActive(item.page)
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/90'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-border/60 p-4">
          <Link to={createPageUrl('Settings')} className="block no-underline">
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent/90">
              <Settings className="h-5 w-5 shrink-0" />
              <span>Settings</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border-0 bg-transparent px-4 py-3 text-left text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent/90"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
