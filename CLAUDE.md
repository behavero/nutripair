# NutriPair — Context for Claude Code

## What this project is

A **single-file Cloudflare Worker** (`src/index.js`) that serves a mobile-first PWA for two people (Martin & Giulia) to share a grocery list and weekly meal plan in real time.

- **No framework, no bundler, no build step** — `wrangler deploy --no-bundle` deploys directly.
- **State** is stored in **Cloudflare KV** (binding name: `KV`, namespace ID: `7915d6990b1e4958b43596866ec8604b`).
- **Frontend** is embedded as a template literal inside `buildHTML()` — the browser gets one self-contained HTML file.
- **Real-time sync**: the browser polls `/api/state` every 3 seconds.

## Architecture

```
src/index.js
├── GROCERY_DATA        — 44 items × 5 sections with prices in RON
├── DEFAULT_PLAN        — 7 days × 4 meal slots (breakfast/lunch/snack/dinner)
├── DEFAULT_STATE       — initial KV state shape
├── I18N                — translations for FR / EN / RO
├── buildHTML()         — returns the full HTML string served at GET /
└── export default      — Cloudflare Worker fetch handler
    ├── GET  /              → buildHTML()
    ├── GET  /api/state     → read KV
    ├── POST /api/toggle    → toggle grocery item checked/unchecked
    ├── POST /api/reset     → clear all checked items
    ├── POST /api/add-item  → add manual grocery item
    └── POST /api/update-meal → update a meal slot in the plan
```

## KV state shape

```json
{
  "checked": {
    "g1": { "by": "Martin", "at": "2026-06-19T10:00:00Z" }
  },
  "manualItems": [
    { "id": "m_1718790000000", "name": "Houmous", "qty": "1 pot" }
  ],
  "plan": {
    "lun": {
      "breakfast": { "name": "...", "detail": "...", "type": "prep", "time": "5 min" },
      "lunch":     { ... },
      "snack":     { ... },
      "dinner":    { ... }
    },
    "mar": { ... },
    "mer": { ... },
    "jeu": { ... },
    "ven": { ... },
    "sam": { ... },
    "dim": { ... }
  },
  "resetAt": null
}
```

Meal `type` values: `prep` (purple dot) | `cook` (orange dot) | `batch` (green dot) | `free` (gray dot)

## Browser JS conventions

- **No template literals inside `buildHTML()`** — all browser JS uses string concatenation to avoid escaping complexity.
- `var` instead of `let/const` for browser globals (avoids issues with embedded `<script>` blocks).
- `ge(id)` is a shorthand for `document.getElementById(id)`.
- All event listeners use `addEventListener`, never inline `onclick`.
- Language (`lang`) and user name (`user`) are stored in `localStorage` under keys `np_lang` and `np_user`.

## Commands

```bash
# Local dev (live reload, uses remote KV)
npm run dev

# Deploy to production
npm run deploy

# Stream production logs
npm run tail

# Reset the shared KV state (useful for testing)
npm run kv:reset
```

## Profiles (nutrition context)

- **Martin**: 28yo ♂, 180 cm, 76 kg — target ~2100–2200 kcal/day, 130–145 g protein
- **Giulia**: 27yo ♀, 178 cm, 56 kg underweight (BMI 17.7) — target ~2000–2050 kcal/day (surplus for weight gain)
- Meal plan is designed for batch cooking on Sunday (90 min) + quick weekday assembly (<20 min)
- Grocery list is optimised for **Carrefour Shopping City Piatra Neamț, Romania**
- Budget: ~290–390 RON/week for two people

## Things to keep in mind when editing

1. `GROCERY_DATA` item IDs (`g1`–`g44`) are stored in KV — don't change them without also migrating existing KV data.
2. `DEFAULT_PLAN` day keys must match `DAYS = ['lun','mar','mer','jeu','ven','sam','dim']`.
3. The `I18N` object is JSON.stringify'd and embedded verbatim in the HTML — keep all string values JSON-safe (no unescaped control characters).
4. The KV namespace already exists in Martin's Cloudflare account — don't recreate it.
5. `--no-bundle` flag is required because there is no build step (the file imports nothing).
