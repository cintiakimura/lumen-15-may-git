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
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import authService from './services/authService';

export default function TeacherSidebar({ isOpen, onToggle }) {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'TeacherDashboard' },
    { icon: BookOpen, label: 'My Courses', page: 'TeacherCourses' },
    { icon: Users, label: 'Students', page: 'TeacherStudents' },
    { icon: BarChart3, label: 'Analytics', page: 'TeacherAnalytics' },
  ];

  const isActive = (page) => {
    return location.pathname === createPageUrl(page);
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = createPageUrl('Landing');
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={onToggle}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className={cn(
          'sidebar fixed top-0 left-0 h-full z-40 flex flex-col',
          'lg:translate-x-0 lg:static'
        )}
        style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(10px)', 
          borderRight: '1px solid var(--glass-border)' 
        }}
      >
        {/* Logo */}
        <div className="sidebar-header flex items-center px-6 border-b" style={{ borderColor: 'var(--glass-border)' }}>
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/lumen-prod/public/69816fdfc8b62c2372da0c4b/1cf3c4952_lumenlogo.png"
            alt="LUMEN"
            style={{ height: '40px' }}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              onClick={() => window.innerWidth < 1024 && onToggle()}
              style={{ textDecoration: 'none' }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  background: isActive(item.page) ? 'var(--primary)' : 'transparent',
                  color: isActive(item.page) ? '#000000' : 'var(--text)'
                }}
              >
                <item.icon style={{ width: '20px', height: '20px' }} />
                <span style={{ fontWeight: '600' }}>{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <Link to={createPageUrl('Settings')} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              color: 'var(--text)',
              transition: 'all 0.2s ease',
              marginBottom: '8px'
            }}>
              <Settings style={{ width: '20px', height: '20px' }} />
              <span style={{ fontWeight: '600' }}>Settings</span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut style={{ width: '20px', height: '20px' }} />
            <span style={{ fontWeight: '600' }}>Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}