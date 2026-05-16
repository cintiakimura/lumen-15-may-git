/**
 * Public (browser-safe) environment for Vite.
 * Only `VITE_*` keys from `.env`, `.env.local`, `.env.[mode]`, etc. are inlined at build time.
 * @see https://vitejs.dev/guide/env-and-mode.html
 */

const str = (v) => (typeof v === 'string' ? v.trim() : '') || '';

export const clientEnv = {
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  /** Lumen app id (falls back to legacy Base44 name for migration). */
  lumenAppId: str(import.meta.env.VITE_LUMEN_APP_ID || import.meta.env.VITE_BASE44_APP_ID),
  /** Hosted app / API base URL. */
  lumenAppBaseUrl: str(import.meta.env.VITE_LUMEN_APP_BASE_URL || import.meta.env.VITE_BASE44_APP_BASE_URL),
  /** Functions version string when required by the platform. */
  lumenFunctionsVersion: str(
    import.meta.env.VITE_LUMEN_FUNCTIONS_VERSION || import.meta.env.VITE_BASE44_FUNCTIONS_VERSION
  ),
  /** `VITE_DEMO_MODE=true` forces demo-friendly behavior when read at runtime. */
  demoModeFlag: import.meta.env.VITE_DEMO_MODE === 'true',
  hasHostedConfig() {
    return Boolean(this.lumenAppId && this.lumenAppBaseUrl);
  },
};
