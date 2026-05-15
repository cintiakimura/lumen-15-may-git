import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lumen } from '@/api/lumenClient';
import authService from '@/components/services/authService';
import { createPageUrl } from '@/utils';
import { initDemoModeFromUrl, isDemoMode, withDemoParam } from '@/lib/demoMode';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    initDemoModeFromUrl();
    if (!isDemoMode()) {
      lumen.auth.redirectToLogin();
    }
  }, []);

  if (!isDemoMode()) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#212121', color: '#E0E0E0' }}
      >
        Redirecting to sign in…
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      authService.login(email, password);
      const u = authService.getCurrentUser();
      const page = u.role === 'teacher' ? 'TeacherDashboard' : 'StudentDashboard';
      window.location.assign(withDemoParam(createPageUrl(page)));
    } catch (err) {
      alert(err.message || 'Login failed');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#212121', color: '#E0E0E0' }}
    >
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-light" style={{ color: '#00c600' }}>
          Demo sign-in
        </h1>
        <p className="text-sm text-white/70">
          Local mock auth only. Use an email ending in <code className="text-[#00c600]">@teacher.com</code> for a
          teacher, or any other email as a student. Password can be anything.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/40"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/40"
          />
          <button
            type="submit"
            className="w-full rounded-lg py-2 font-semibold text-black"
            style={{ background: '#00c600' }}
          >
            Continue
          </button>
        </form>
        <Link to={createPageUrl('Landing')} className="block text-center text-sm text-[#00c600] underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
