import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

export default function Sidebar({ open, isTeacher, isStudent }) {
  const location = useLocation();

  const teacherLinks = [
    { label: 'Dashboard', icon: '📊', page: 'TeacherDashboard' },
    { label: 'Courses', icon: '📚', page: 'TeacherCourses' },
    { label: 'Students', icon: '👥', page: 'TeacherStudents' },
    { label: 'Analytics', icon: '📈', page: 'TeacherAnalytics' },
  ];

  const studentLinks = [
    { label: 'Dashboard', icon: '🏠', page: 'StudentDashboard' },
    { label: 'Browse Courses', icon: '🔍', page: 'Courses' },
    { label: 'Profile', icon: '👤', page: 'Profile' },
  ];

  const links = (isTeacher ? teacherLinks : studentLinks).map((item) => ({
    ...item,
    path: createPageUrl(item.page),
  }));

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-16 z-20 h-[calc(100vh-4rem)] overflow-y-auto border-r border-sidebar-border/80 bg-sidebar/80 py-6 backdrop-blur-xl backdrop-saturate-150 transition-[width] duration-300 ease-out',
          open ? 'w-[280px]' : 'w-20'
        )}
      >
        <nav className="flex flex-col gap-1 px-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                open ? 'justify-start' : 'justify-center',
                isActive(link.path)
                  ? 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/15'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
              )}
            >
              <span className="text-lg leading-none">{link.icon}</span>
              {open && <span>{link.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 hidden h-[60px] items-center justify-around border-t border-sidebar-border/80 bg-sidebar/85 backdrop-blur-xl"
        aria-hidden
      >
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-xs',
              isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <span className="text-xl">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
