const SESSION_KEY = 'lumen_demo_mode';

/** Call once on app load (e.g. from main.jsx). */
export function initDemoModeFromUrl() {
  if (typeof window === 'undefined') return;
  const sp = new URLSearchParams(window.location.search);
  if (sp.get('demo') === 'true') {
    sessionStorage.setItem(SESSION_KEY, '1');
  }
  if (sp.get('demo') === 'false') {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function isDemoMode() {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_DEMO_MODE === 'true';
  }
  if (sessionStorage.getItem(SESSION_KEY) === '1') return true;
  return import.meta.env.VITE_DEMO_MODE === 'true';
}

/** Append demo flag to internal links when demo is active. */
export function withDemoParam(path) {
  if (!isDemoMode()) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}demo=true`;
}
