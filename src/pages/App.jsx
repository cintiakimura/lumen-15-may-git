import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lumen } from '@/api/lumenClient';
import Layout from '@/components/Layout';
import Landing from './Landing';
import Onboarding from './Onboarding';
import TeacherDashboard from './TeacherDashboard';
import TeacherCourses from './TeacherCourses';
import TeacherStudents from './TeacherStudents';
import TeacherAnalytics from './TeacherAnalytics';
import StudentDashboard from './StudentDashboard';
import CourseDetail from './CourseDetail';
import Courses from './Courses';
import Settings from './Settings';
import Profile from './Profile';

// Block tracking scripts globally
if (typeof window !== 'undefined') {
  // Add referrer meta tag
  if (!document.querySelector('meta[name="referrer"]')) {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
  }

  // Block tracker domains
  const BLOCKED_DOMAINS = [
    'fbevents.js',
    'k.clarity.ms',
    'px.ads.linkedin.com',
    'googletag',
    'google-analytics',
    'googleadservices.com',
    'pixel.js',
    'analytics.google.com',
    'collect'
  ];

  // Intercept XMLHttpRequest
  const originalXHR = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    const urlStr = typeof url === 'string' ? url : url?.toString() || '';
    if (BLOCKED_DOMAINS.some(domain => urlStr.includes(domain))) {
      console.warn(`Tracker blocked: ${urlStr}`);
      return;
    }
    return originalXHR.apply(this, [method, url, ...args]);
  };

  // Block fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(resource, config) {
    const urlStr = typeof resource === 'string' ? resource : resource?.url || '';
    if (BLOCKED_DOMAINS.some(domain => urlStr.includes(domain))) {
      console.warn(`Tracker blocked: ${urlStr}`);
      return Promise.reject(new Error('Blocked'));
    }
    return originalFetch.apply(this, arguments);
  };

  // Prevent script injection
  const originalAppend = Element.prototype.appendChild;
  Element.prototype.appendChild = function(node) {
    if (node.src && BLOCKED_DOMAINS.some(domain => node.src.includes(domain))) {
      console.warn(`Tracker blocked: ${node.src}`);
      return node;
    }
    return originalAppend.apply(this, arguments);
  };

  // Prevent window.fbq, clarity, etc
  Object.defineProperty(window, 'fbq', { get: () => console.warn('Tracker blocked: Facebook Pixel'), set: () => {} });
  Object.defineProperty(window, 'clarity', { get: () => console.warn('Tracker blocked: Microsoft Clarity'), set: () => {} });
  Object.defineProperty(window, 'gtag', { get: () => console.warn('Tracker blocked: Google Analytics'), set: () => {} });
  Object.defineProperty(window, 'googletag', { get: () => console.warn('Tracker blocked: Google Ads'), set: () => {} });
}

export default function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await lumen.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#212121',
        color: '#E0E0E0'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Layout>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={user ? <Onboarding /> : <Navigate to="/" />} />
          <Route path="/teacher/dashboard" element={user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" />} />
          <Route path="/teacher/courses" element={user?.role === 'teacher' ? <TeacherCourses /> : <Navigate to="/" />} />
          <Route path="/teacher/students" element={user?.role === 'teacher' ? <TeacherStudents /> : <Navigate to="/" />} />
          <Route path="/teacher/analytics" element={user?.role === 'teacher' ? <TeacherAnalytics /> : <Navigate to="/" />} />
          <Route path="/student/dashboard" element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/" />} />
          <Route path="/course/:id" element={user ? <CourseDetail /> : <Navigate to="/" />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </Layout>
  );
}