# Lumen Academy (frontend)

Vocational micro-learning web app: teacher dashboards, student progress, AI-assisted course structuring (via the hosted platform), and optional **local demo mode** for presentations without backend credentials.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Demo mode (no hosted backend)

- Open the app with **`?demo=true`** (e.g. `http://localhost:5173/?demo=true`), or use **Demo mode (local)** on the landing page.
- Alternatively set **`VITE_DEMO_MODE=true`** in `.env.local`.
- Sign in on **`/Login`** with any password; use an email ending in **`@teacher.com`** for a teacher account, or any other email as a student.
- Data comes from **`localStorage`** via `storageService` / `authService`. AI calls return **placeholders** unless you turn demo off and use the real platform.

## Production / hosted mode

Create **`.env.local`** (gitignored) with:

| Variable | Purpose |
|----------|---------|
| `VITE_LUMEN_APP_ID` | App id from the builder |
| `VITE_LUMEN_APP_BASE_URL` | Backend URL (enables Vite proxy to `/api`) |
| `VITE_LUMEN_FUNCTIONS_VERSION` | Functions version string if required by your project |

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

- Do **not** commit `.env` or API keys. This repo uses the platform SDK for auth and LLM; there are no `gsk_` xAI keys in source.
- Review **`npm audit`** periodically.

## License

Private project — see repository owner.
