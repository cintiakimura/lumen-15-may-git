const SESSION_KEY = 'lumen_demo_mode';
/** When set, use real hosted auth (lumen) — opt in via `?demo=false`. */
const FORCE_REAL_AUTH_KEY = 'lumen_force_real_auth';

/** Call once on app load (e.g. from main.jsx). */
export function initDemoModeFromUrl() {
  if (typeof window === 'undefined') return;
  const sp = new URLSearchParams(window.location.search);
  if (sp.get('demo') === 'false') {
    sessionStorage.setItem(FORCE_REAL_AUTH_KEY, '1');
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }
  if (sp.get('demo') === 'true') {
    sessionStorage.removeItem(FORCE_REAL_AUTH_KEY);
    sessionStorage.setItem(SESSION_KEY, '1');
  }
}

/** Real hosted login / SDK checks (requires env). */
export function isForceRealAuth() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(FORCE_REAL_AUTH_KEY) === '1';
}

/**
 * Demo mode: default ON (e.g. Render without `VITE_LUMEN_APP_ID`) so the app loads without hosted auth.
 * Turn OFF with `?demo=false` (persists in session until you open `?demo=true` again).
 */
export function isDemoMode() {
  if (typeof window !== 'undefined' && isForceRealAuth()) {
    return false;
  }
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_DEMO_MODE === 'true' || true;
  }
  if (sessionStorage.getItem(SESSION_KEY) === '1') return true;
  if (import.meta.env.VITE_DEMO_MODE === 'true') return true;
  return true;
}

/** Append demo flag to internal links when demo is active. */
export function withDemoParam(path) {
  if (!isDemoMode()) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}demo=true`;
}
