import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Sidebar({ open, onToggle, isTeacher, isStudent }) {
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
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: '80px',
          height: 'calc(100vh - 80px)',
          width: open ? '280px' : '80px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #333333',
          padding: open ? '24px 0' : '24px 0',
          overflowY: 'auto',
          transition: 'width 0.3s ease',
          zIndex: 20,
          borderRight: '1px solid #333333',
        }}
      >
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              color: isActive(link.path) ? '#00c600' : '#E0E0E0',
              textDecoration: 'none',
              borderLeft: isActive(link.path) ? '3px solid #00c600' : '3px solid transparent',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              marginBottom: '8px',
              justifyContent: open ? 'flex-start' : 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 198, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '18px' }}>{link.icon}</span>
            {open && <span style={{ fontSize: '14px' }}>{link.label}</span>}
          </Link>
        ))}
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #333333',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 20,
        }}
      >
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: isActive(link.path) ? '#00c600' : '#E0E0E0',
              textDecoration: 'none',
              fontSize: '12px',
              flex: 1,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '20px' }}>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
