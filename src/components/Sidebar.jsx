import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  BookOpen,
  Users,
  LineChart,
  Home,
  Search,
  Award,
  User,
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { ROLES } from '@/lib/roles';

function buildLinks(role) {
  const teacher = [
    { label: 'Dashboard', Icon: LayoutDashboard, page: 'TeacherDashboard' },
    { label: 'Course builder', Icon: Wrench, page: 'CourseBuilder' },
    { label: 'Courses', Icon: BookOpen, page: 'TeacherCourses' },
    { label: 'Students', Icon: Users, page: 'TeacherStudents' },
    { label: 'Analytics', Icon: LineChart, page: 'TeacherAnalytics' },
  ];

  const learner = [
    { label: 'Dashboard', Icon: Home, page: 'StudentDashboard' },
    { label: 'Browse courses', Icon: Search, page: 'Courses' },
    { label: 'Certificates', Icon: Award, page: 'Certificate' },
    { label: 'Profile', Icon: User, page: 'Profile' },
  ];

  if (role === ROLES.SUPER_ADMIN) {
    return [
      ...teacher,
      { label: 'Browse (learner)', Icon: Search, page: 'Courses', key: 'sa-courses' },
      { label: 'Certificates', Icon: Award, page: 'Certificate', key: 'sa-cert' },
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
          'fixed left-0 top-14 z-30 h-[calc(100dvh-var(--app-header-h))] overflow-y-auto border-r border-black/[0.06] bg-white/45 py-4 shadow-[2px_0_24px_-8px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-[transform,width] duration-layout ease-layout',
          'w-[min(240px,88vw)] max-lg:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.08)]',
          open ? 'max-lg:translate-x-0' : 'max-lg:pointer-events-none max-lg:-translate-x-full',
          open ? 'lg:w-60' : 'lg:w-16'
        )}
      >
        <nav className="flex flex-col gap-0.5 px-1.5 lg:px-2">
          {links.map((link) => (
            <Link
              key={link.key}
              to={link.path}
              onClick={() => onNavigate?.()}
              className={cn(
                'flex min-h-touch items-center gap-2.5 rounded-xl border border-transparent px-2.5 py-2.5 text-sm font-normal text-foreground/90 transition-all duration-200 ease-out lg:min-h-0 lg:py-2',
                open ? 'justify-start lg:justify-start' : 'justify-center lg:justify-center',
                isActive(link.path)
                  ? 'border-white/50 bg-white/70 text-foreground shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] backdrop-blur-md'
                  : 'hover:border-white/35 hover:bg-white/45 hover:backdrop-blur-sm hover:text-foreground'
              )}
            >
              <link.Icon className="h-[18px] w-[18px] shrink-0 stroke-[1.5] text-foreground/70" aria-hidden />
              {open && <span className="truncate">{link.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 hidden h-14 items-center justify-around border-t border-black/[0.06] bg-white/55 backdrop-blur-xl supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        aria-hidden
      >
        {links.map((link) => (
          <Link
            key={link.key}
            to={link.path}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-normal',
              isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <link.Icon className="h-5 w-5 stroke-[1.5]" aria-hidden />
            <span className="truncate px-0.5">{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
