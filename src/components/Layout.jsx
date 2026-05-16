import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
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
  const { user, normalizedRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedChat = localStorage.getItem('grokChatOpen');
    setChatOpen(savedChat === 'true');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setSidebarOpen(false);
    }
  }, []);

  const closeChat = () => {
    setChatOpen(false);
    localStorage.setItem('grokChatOpen', 'false');
  };

  const toggleChat = () => {
    const next = !chatOpen;
    setChatOpen(next);
    localStorage.setItem('grokChatOpen', String(next));
  };

  const isLandingLike =
    location.pathname === '/' ||
    location.pathname === createPageUrl('Landing') ||
    location.pathname === createPageUrl('Login');

  const isLandingPageOnly =
    location.pathname === '/' || location.pathname === createPageUrl('Landing');

  const showSidebar = user && !isLandingLike;

  /** Sidebar width (15rem / 4rem) + exactly 32px (2rem) to main content — see Sidebar `lg:w-60` / `lg:w-16`. */
  const mainPadLeft = showSidebar
    ? sidebarOpen
      ? 'lg:pl-[calc(15rem+2rem)]'
      : 'lg:pl-[calc(4rem+2rem)]'
    : '';

  const showMobileBackdrop = showSidebar && sidebarOpen;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <meta name="referrer" content="no-referrer" />

      {user && (
        <Header
          user={user}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          showSidebar={showSidebar}
          pageTitle={formatPageTitle(currentPageName)}
        />
      )}

      {showMobileBackdrop && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-x-0 bottom-0 top-14 z-[19] bg-black/15 backdrop-blur-sm transition-opacity duration-layout ease-layout lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        {showSidebar && (
          <Sidebar
            open={sidebarOpen}
            role={normalizedRole || 'learner'}
            onNavigate={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
          />
        )}

        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col transition-[padding] duration-layout ease-layout md:flex-row',
            user && 'pt-14',
            mainPadLeft
          )}
        >
          <div
            className={cn(
              'lumen-main min-h-0 min-w-0 flex-1 overflow-y-auto text-left',
              !isLandingPageOnly && '[&_h1]:mb-6 [&_h2]:mb-6',
              user && 'max-md:pb-safe md:pb-6',
              isLandingPageOnly ? 'p-0' : 'px-4 py-5 md:px-10 md:py-8'
            )}
          >
            {children}
          </div>

          {user && chatOpen && (
            <>
              <button
                type="button"
                aria-label="Close assistant"
                className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm md:hidden"
                onClick={closeChat}
              />
              <aside
                className={cn(
                  'glass-card-static flex min-h-0 flex-col',
                  'fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] rounded-t-2xl border-x border-t shadow-2xl',
                  'md:static md:z-auto md:max-h-none md:h-[calc(100dvh-var(--app-header-h))] md:w-[min(32vw,420px)] md:min-w-[260px] md:max-w-[32vw] md:flex-none md:rounded-none md:border-x-0 md:border-l md:border-t-0 md:border-b-0 md:shadow-none'
                )}
              >
                <GrokChat user={user} onClose={closeChat} />
              </aside>
            </>
          )}
        </div>
      </div>

      {user && !chatOpen && (
        <button
          type="button"
          onClick={toggleChat}
          className="touch-target fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[60] flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/15 transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] md:bottom-6 md:right-5"
          aria-label="Open assistant"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
