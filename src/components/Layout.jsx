import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import { isDemoMode } from '@/lib/demoMode';
import Header from './Header';
import Sidebar from './Sidebar';
import GrokChat from './GrokChat';

function formatPageTitle(pageKey) {
  if (!pageKey) return 'Dashboard';
  return String(pageKey)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Layout({ children, currentPageName }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedChat = localStorage.getItem('grokChatOpen');
    setChatOpen(savedChat === 'true');
  }, []);

  const toggleChat = () => {
    const newState = !chatOpen;
    setChatOpen(newState);
    localStorage.setItem('grokChatOpen', newState);
  };

  const isLandingLike =
    location.pathname === '/' ||
    location.pathname === createPageUrl('Landing') ||
    location.pathname === createPageUrl('Login');

  const showSidebar = user && !isLandingLike;
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const mainPadLeft = showSidebar ? (sidebarOpen ? 'pl-[280px]' : 'pl-20') : '';

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <meta name="referrer" content="no-referrer" />
      {isDemoMode() && (
        <div
          role="status"
          className="z-[100] border-b border-amber-800/40 bg-amber-600 px-4 py-2.5 text-center text-sm font-semibold tracking-wide text-amber-50"
        >
          DEMO MODE — Login disabled (auto demo teacher). Add{' '}
          <code className="rounded bg-black/20 px-1.5 py-0.5 text-[0.8125rem]">?demo=false</code> to the URL to use
          real hosted login (requires app env).
        </div>
      )}

      {user && (
        <Header
          user={user}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          pageTitle={formatPageTitle(currentPageName)}
        />
      )}

      <div className="flex min-h-0 flex-1">
        {showSidebar && (
          <Sidebar
            open={sidebarOpen}
            isTeacher={isTeacher}
            isStudent={isStudent}
          />
        )}

        <div
          className={`w-full flex-1 overflow-y-auto transition-[padding] duration-300 ease-out ${
            user ? 'pb-24 pt-20' : ''
          } ${mainPadLeft}`}
        >
          {children}
        </div>
      </div>

      {user && (
        <>
          <button
            type="button"
            onClick={toggleChat}
            className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
            aria-label="Toggle chat"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {chatOpen && (
            <GrokChat
              user={user}
              onClose={() => {
                setChatOpen(false);
                localStorage.setItem('grokChatOpen', 'false');
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
