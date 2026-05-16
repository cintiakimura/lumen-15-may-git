import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { ROLES } from '@/lib/roles';

function buildLinks(role) {
  const teacher = [
    { label: 'Dashboard', icon: '📊', page: 'TeacherDashboard' },
    { label: 'Course builder', icon: '🛠', page: 'CourseBuilder' },
    { label: 'Courses', icon: '📚', page: 'TeacherCourses' },
    { label: 'Students', icon: '👥', page: 'TeacherStudents' },
    { label: 'Analytics', icon: '📈', page: 'TeacherAnalytics' },
  ];

  const learner = [
    { label: 'Dashboard', icon: '🏠', page: 'StudentDashboard' },
    { label: 'Browse courses', icon: '🔍', page: 'Courses' },
    { label: 'Certificates', icon: '🏅', page: 'Certificate' },
    { label: 'Profile', icon: '👤', page: 'Profile' },
  ];

  if (role === ROLES.SUPER_ADMIN) {
    return [
      ...teacher,
      { label: 'Browse (learner)', icon: '🔍', page: 'Courses', key: 'sa-courses' },
      { label: 'Certificates', icon: '🏅', page: 'Certificate', key: 'sa-cert' },
    ];
  }
  if (role === ROLES.TEACHER) return teacher;
  return learner;
}

export default function Sidebar({ open, role, onNavigate }) {
  const location = useLocation();
  const links = buildLinks(role).map((item, i) => ({
    ...item,
    key: item.key || item.page || String(i),
    path: createPageUrl(item.page),
  }));

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-14 z-30 h-[calc(100dvh-var(--app-header-h))] overflow-y-auto border-r border-sidebar-border/50 bg-sidebar/50 py-4 backdrop-blur-md transition-[transform,width] duration-layout ease-layout',
          'w-[min(240px,88vw)] max-md:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.08)]',
          open ? 'max-md:translate-x-0' : 'max-md:pointer-events-none max-md:-translate-x-full',
          open ? 'md:w-60' : 'md:w-16'
        )}
      >
        <nav className="flex flex-col gap-0.5 px-1.5 md:px-2">
          {links.map((link) => (
            <Link
              key={link.key}
              to={link.path}
              onClick={() => onNavigate?.()}
              className={cn(
                'flex min-h-touch items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors duration-200 ease-out md:min-h-0 md:py-2',
                open ? 'justify-start md:justify-start' : 'justify-center md:justify-center',
                isActive(link.path)
                  ? 'bg-primary/10 text-primary ring-1 ring-inset ring-black/[0.04]'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/70'
              )}
            >
              <span className="text-base leading-none md:text-[15px]">{link.icon}</span>
              {open && <span className="truncate">{link.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 hidden h-14 items-center justify-around border-t border-sidebar-border/50 bg-sidebar/60 backdrop-blur-md supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        aria-hidden
      >
        {links.map((link) => (
          <Link
            key={link.key}
            to={link.path}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
              isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <span className="text-lg">{link.icon}</span>
            <span className="truncate px-0.5">{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
