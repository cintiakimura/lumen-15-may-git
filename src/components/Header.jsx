import React from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function Header({ user, onMenuToggle, sidebarOpen, pageTitle = 'Dashboard' }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      background: 'rgba(33, 33, 33, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #333333',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      zIndex: 30
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <button
          type="button"
          onClick={onMenuToggle}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#E0E0E0',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '8px'
          }}
        >
          ☰
        </button>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(0, 198, 0, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00c600',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            L
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '2px',
              height: '32px',
              background: '#00c600'
            }} />
            <h1 className="accurat-thin" style={{
              fontSize: '24px',
              color: '#00c600',
              margin: 0,
              fontWeight: '100'
            }}>
              {pageTitle}
            </h1>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'rgba(0, 198, 0, 0.2)',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00c600',
          fontWeight: '600',
          fontSize: '14px'
        }}>
          {user?.full_name?.charAt(0) || 'U'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#E0E0E0' }}>
            {user?.full_name || 'User'}
          </p>
          <span style={{
            display: 'inline-block',
            background: 'rgba(0, 198, 0, 0.2)',
            color: '#00c600',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            width: 'fit-content'
          }}>
            {user?.role === 'teacher' ? 'Teacher' : 'Student'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: 'transparent',
            color: '#00c600',
            border: '1px solid #00c600',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: '400'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#00c600';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#00c600';
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
