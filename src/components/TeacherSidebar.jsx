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
  Wrench,
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
    { icon: Wrench, label: 'Course builder', page: 'CourseBuilder' },
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
        {isOpen ? <X className="h-5 w-5 stroke-[1.5]" /> : <Menu className="h-5 w-5 stroke-[1.5]" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -240 }}
        className={cn(
          'sidebar fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-black/[0.06] bg-white/45 shadow-[2px_0_24px_-8px_rgba(0,0,0,0.06)] backdrop-blur-xl lg:static lg:translate-x-0'
        )}
      >
        <div className="sidebar-header flex items-center border-b border-black/[0.06] px-6 py-4">
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
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 rounded-xl border border-transparent px-4 py-2.5 text-sm font-normal text-foreground/90 transition-all duration-200 ease-out',
                  isActive(item.page)
                    ? 'border-white/50 bg-white/70 text-foreground shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] backdrop-blur-md'
                    : 'hover:border-white/35 hover:bg-white/45 hover:backdrop-blur-sm hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0 stroke-[1.5]" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-black/[0.06] p-4">
          <Link to={createPageUrl('Settings')} className="block no-underline">
            <div className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-2.5 text-sm font-normal text-foreground/90 transition-all duration-200 hover:border-white/35 hover:bg-white/45 hover:backdrop-blur-sm hover:text-foreground">
              <Settings className="h-5 w-5 shrink-0 stroke-[1.5]" />
              <span>Settings</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-transparent px-4 py-2.5 text-left text-sm font-normal text-foreground/90 transition-all duration-200 hover:border-white/35 hover:bg-white/45 hover:backdrop-blur-sm hover:text-foreground"
          >
            <LogOut className="h-5 w-5 shrink-0 stroke-[1.5]" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
