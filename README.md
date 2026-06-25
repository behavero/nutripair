# NutriPair

A warm, 70s-retro grocery + meal-planning app for two — Martin & Giulia share one
**household**: one grocery list, one weekly meal plan, one set of recipes, in real time.

- **Mobile PWA** (`/`) — one-handed, in-store first, FR/EN/RO.
- **Web Dashboard** (`/web`) — desktop sidebar SPA with macro KPIs, budget donut, weekly calendar.
- **Auth** — email/password, httpOnly sessions, household pairing via invite links.
- Built as a **single Cloudflare Worker** backed by **Workers KV**. No framework, no build step.

Live: https://nutripair.martin-503.workers.dev

## Monorepo layout

```
nutripair/
├── apps/
│   ├── worker/          # the Cloudflare Worker — the whole app lives in src/index.js
│   │   ├── src/index.js
│   │   ├── wrangler.toml
│   │   └── package.json
│   └── ios/             # Capacitor wrapper (loads the live Worker in a native WKWebView)
├── design-system/       # NutriPair design canvas (.dc.html) + dc-runtime (support.js)
├── .github/workflows/   # deploy.yml — wrangler deploy on push to main
└── README.md
```

## Worker (`apps/worker`)

```bash
cd apps/worker
npm install
npm run dev       # wrangler dev --no-bundle (uses remote KV)
npm run deploy    # wrangler deploy --no-bundle
npm run tail      # stream production logs
```

Everything — mobile HTML, web dashboard, all routes, and the auth layer — is in the single
`src/index.js`, served by one Worker. State is per-household in KV under `h:{householdId}:state`.

### Routes (high level)
- `GET /` mobile PWA · `GET /web` desktop dashboard (both auth-gated)
- `GET /login`, `POST /auth/{register,login,logout}`, `GET /auth/me`
- `GET /invite/{token}`, `POST /invite/{token}/accept`, `POST /api/invite/create`
- `POST /api/user/prefs`
- `GET /api/state` + the per-household data routes (`toggle`, `add-item`, `update-meal`, `save-recipe`, …)

### Auth model
- Passwords: **PBKDF2-SHA256, 100k iterations, random 16-byte salt** (`crypto.subtle`).
- Sessions: random 32-byte hex IDs stored in KV (30-day TTL) — **not JWT**.
- Cookie: `session=…; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`.
- Each couple is one **household** sharing one KV namespace; a second member joins via an invite link.

## iOS (`apps/ios`)

Capacitor shell that points a native WKWebView at the live Worker (frontend not embedded, so
web + iOS never drift). See `apps/ios/README.md` for the `npx cap add ios` + Xcode steps.

## Design system (`design-system`)

The source-of-truth design canvas (`NutriPair-Foundations / -Mobile / -Web .dc.html`) authored on
claude.ai/design, plus `support.js` (the dc-runtime). The tokens here are implemented 1:1 in the
Worker's `buildCSS()`.

## Deployment

Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) runs
`cd apps/worker && npm ci && npx wrangler deploy --no-bundle` using the `CLOUDFLARE_API_TOKEN` secret.

**Required GitHub secret:** `CLOUDFLARE_API_TOKEN` (Cloudflare → My Profile → API Tokens →
*Edit Cloudflare Workers* template).

### Workflow
Feature work on `develop` → PR → review → merge to `main` → auto-deploy.

## License

Private — Martin & Giulia.
