import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import Header from './Header';
import Sidebar from './Sidebar';
import GrokChat from './GrokChat';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#212121' }}>
      <meta name="referrer" content="no-referrer" />
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/akkurat');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', 'Akkurat', system-ui, sans-serif;
          background: #212121;
          color: #E0E0E0;
        }

        .accurat-thin {
          font-family: 'Akkurat', system-ui, sans-serif;
          font-weight: 100;
        }

        .glass-bg {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid #333333;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid #333333;
          border-radius: 16px;
          padding: 24px;
        }

        .btn-primary {
          background: #00c600;
          color: #000000;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          background: #00e600;
          transform: scale(1.03);
        }

        .btn-outline {
          background: transparent;
          color: #00c600;
          border: 1px solid #00c600;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-outline:hover {
          background: #00c600;
          color: #000000;
        }

        .progress-bar {
          height: 8px;
          background: #333333;
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #00c600;
          transition: width 0.3s ease;
        }

        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .hide-small {
            display: none !important;
          }
        }
      `}</style>

      {user && (
        <Header user={user} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      )}

      <div style={{ display: 'flex', flex: 1 }}>
        {showSidebar && (
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            isTeacher={isTeacher}
            isStudent={isStudent}
          />
        )}

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingBottom: user ? '100px' : '0px',
            transition: 'margin-left 0.3s ease',
            width: '100%',
          }}
        >
          {children}
        </div>
      </div>

      {user && (
        <>
          <button
            type="button"
            onClick={toggleChat}
            style={{
              position: 'fixed',
              bottom: '32px',
              right: '32px',
              width: '64px',
              height: '64px',
              background: '#00c600',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 40,
              boxShadow: '0 4px 12px rgba(0, 198, 0, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
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
