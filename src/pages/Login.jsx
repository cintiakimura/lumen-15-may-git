import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { lumen } from '@/api/lumenClient';
import { createPageUrl } from '@/utils';
import { initDemoModeFromUrl, isDemoMode, withDemoParam } from '@/lib/demoMode';

export default function Login() {
  useEffect(() => {
    initDemoModeFromUrl();
    if (!isDemoMode()) {
      lumen.auth.redirectToLogin();
    }
  }, []);

  if (!isDemoMode()) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 text-center"
        style={{ background: '#212121', color: '#E0E0E0' }}
      >
        <p>Redirecting to hosted sign-in…</p>
      </div>
    );
  }

  // Demo mode: auto teacher session from AuthProvider — skip manual login (temporary)
  return <Navigate to={withDemoParam(createPageUrl('TeacherDashboard'))} replace />;
}
