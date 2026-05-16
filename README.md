# Lumen Academy (frontend)

Vocational micro-learning web app: teacher dashboards, student progress, AI-assisted course structuring (via the hosted platform), and optional **local demo mode** for presentations without backend credentials.

## Run locally

```bash
cp .env.example .env.local   # optional: configure hosted Lumen (see below)
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Environment variables

- **Copy** [`.env.example`](./.env.example) to **`.env.local`** (recommended) or **`.env`** and fill in values for hosted mode.
- **Never commit** secrets or real tokens. This repo already ignores `.env`, `.env.local`, and other dotenv files except `.env.example` (see [`.gitignore`](./.gitignore)).
- Only variables prefixed with **`VITE_`** are exposed to browser code. Vite inlines them at build time; use **`import.meta.env.VITE_*`** or the small helper **`clientEnv`** in [`src/lib/env.js`](./src/lib/env.js).
- **Hosted Lumen** needs at least `VITE_LUMEN_APP_ID` and `VITE_LUMEN_APP_BASE_URL` (see the table in `.env.example`). URL query overrides (`?app_id=`, `?app_base_url=`, etc.) are merged in [`src/lib/app-params.js`](./src/lib/app-params.js).
- **`vite.config.js`** may mirror `VITE_LUMEN_*` into legacy `VITE_BASE44_*` for the bundled plugin. Build-time-only flags such as **`PORT`** (dev/preview port) or **`LUMEN_LEGACY_SDK_IMPORTS`** are read by Node when Vite starts; they are **not** available via `import.meta.env` in the app.

### Access in code (examples)

```js
// Anywhere in src/
import { clientEnv } from '@/lib/env';

if (clientEnv.hasHostedConfig()) {
  // ...
}
```

[`src/lib/AuthContext.jsx`](./src/lib/AuthContext.jsx) uses `clientEnv` for clearer errors when `appParams.appId` is missing in hosted mode. [`src/lib/app-params.js`](./src/lib/app-params.js) uses `clientEnv` as defaults for app id, base URL, and functions version.

## Demo mode (no hosted backend)

- Open the app with **`?demo=true`** (e.g. `http://localhost:5173/?demo=true`), or use **Demo mode (local)** on the landing page.
- Alternatively set **`VITE_DEMO_MODE=true`** in `.env.local` (see [`.env.example`](./.env.example)).
- Sign in on **`/Login`** with any password; use an email ending in **`@teacher.com`** for a teacher account, or any other email as a student.
- Data comes from **`localStorage`** via `storageService` / `authService`. AI calls return **placeholders** unless you turn demo off and use the real platform.

## Production / hosted mode

Use **`.env.local`** or **`.env`** (gitignored) with the variables listed in [`.env.example`](./.env.example). Short reference:

| Variable | Purpose |
|----------|---------|
| `VITE_LUMEN_APP_ID` | App id from the builder |
| `VITE_LUMEN_APP_BASE_URL` | Backend URL (enables Vite proxy to `/api`) |
| `VITE_LUMEN_FUNCTIONS_VERSION` | Functions version string if required by your project |
| `VITE_DEMO_MODE` | Set to `true` to align with demo-friendly builds (URL/session still apply) |

The Vite plugin may still read legacy `VITE_BASE44_*` names internally; `vite.config.js` mirrors `VITE_LUMEN_*` into those when the legacy vars are unset.

## Project layout

- **`src/`** — React app (`pages/`, `components/`, `lib/`, `api/`)
- **`functions/`** — Edge/serverless handlers (`chatWithGrok`, `structureCourse`) for the hosted runtime (Deno `npm:@base44/sdk` imports)
- **`public/`** — Static assets

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (`jsconfig`) |

## Security

- Do **not** commit `.env`, `.env.local`, or API keys. Use [`.env.example`](./.env.example) as the template for safe, non-secret placeholders only.
- Review **`npm audit`** periodically.

## License

Private project — see repository owner.
