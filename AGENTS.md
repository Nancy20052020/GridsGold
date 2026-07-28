# Grids Gold — Jewellery ERP Frontend

Next.js (App Router) frontend for the Grids Gold jewellery ERP, intended for **frontend-only** deployment on Vercel. Uses TypeScript, React, `lucide-react` icons, and plain CSS (`app/globals.css`). Brand theme: navy (`#061327`) + gold (`#f2b33d` / `#ffd36c`), Inter font.

## Cursor Cloud specific instructions

- **Package manager is pnpm** (there is a `pnpm-lock.yaml`). Use `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`. Do not use npm/yarn.
- **Dev server:** `pnpm dev` (Next.js + Turbopack) serves on `http://localhost:3000`. It is a long-running process — start it in a background/tmux session, not a blocking foreground call.
- **Lint gotcha:** Next.js 16 **removed the `next lint` command**. Linting uses ESLint's flat config directly: `eslint.config.mjs` (extends `eslint-config-next/core-web-vitals` + `/typescript`) and the `lint` script is `eslint .`. Do not change it back to `next lint`.
- **Routing:**
  - `/` → public marketing landing (`app/page.tsx`).
  - `/login` → **Admin / Staff** sign-in and sign-up (`app/login/page.tsx` + `AuthPanel`). Auth is **fully client-side** (no backend): `app/lib/accounts.ts` validates against `data/accounts.json` (seed) + `localStorage` signups. Seed admin: `nancy2005nov@gmail.com` / `nancy`.
  - `/dashboard` → **Admin** ERP (uses `AppShell`, the sidebar layout). All other admin screens are data-driven from `app/data.ts` and rendered by `app/[...slug]/page.tsx` + `app/components/ErpScreen.tsx` (these are placeholder ERP screens to be built out one at a time).
- **Everything prerenders statically** (`pnpm build` output is all `○`/`●`), which keeps it Vercel-friendly. New dynamic catch-all routes should add `generateStaticParams` to keep the build fully prerendered.
- **Images:** none are committed yet. Product/hero images should be dropped into `public/images/` and referenced as `/images/...`. The UI currently uses CSS/`jewel-icon` motifs as placeholders so it looks complete without assets.
- **Shared client store:** `app/lib/store.tsx` is a React context (`useStore()`) that holds all app data — gold `rates`, `items`, `customers` (CRM), `invoices`, `repairs`, `suppliers`, `purchaseOrders`, POS `cart`, etc. — persisted to `localStorage` (key `gg_state_v4`). It is wired in via `StoreProvider` in `app/layout.tsx`. This is the temporary client-side data layer for ERP state.
  - Pricing is **derived from the live gold rate**: `itemPrice(item, rates) = weight × rate[karat] + making + stoneValue`. Changing a rate on `/gold-rates` recomputes prices everywhere (sidebar widget, POS, catalog, product detail). `itemStatus(stock)` derives In/Low/Out of Stock.
  - To reset demo data, clear `localStorage` keys `gg_state_v4` and `gg_state_v4_cart`.
- **Auth / current user:** fully client-side. `app/lib/accounts.ts` holds the account logic (seed `data/accounts.json` + `localStorage` signups); `useStore().currentUser` reflects the signed-in user. No Supabase / no network calls in the auth flow.
- **Theme:** light/dark toggle lives in the store (`theme`/`toggleTheme`), applied via `document.documentElement.dataset.theme` and persisted. Dark-mode surface overrides are in `globals.css` under `[data-theme="dark"]`. Note: `.erp-kpi`/`.erp-panel` hardcode a white background, so any NEW card surface must also get a dark override or its text will be invisible in dark mode.
- **Shell:** `AppShell` sidebar is collapsible (persisted `gg_sidebar`); the top bar has a working branch switcher (`selectedBranch`), notifications, a mini calendar, and theme toggle. Top-bar dropdowns rely on `.topbar { z-index: 55 }` sitting above the `.menu-backdrop` (z-45) — keep that ordering or dropdown clicks get swallowed.
- **Working (interactive) screens** — Admin: `/dashboard` (interactive trend), `/pos` (barcode scan + checkout → invoice + stock/movement), `/inventory` (+ `/new`, `/item-details?id=`, `/movements`, `/transfers`, `/adjustments`, `/cycle-count`), `/customers`, `/repairs`, `/gold-rates`, `/suppliers`, `/purchase-orders`, `/sales/invoices` (click row → printable receipt), `/jewelry`, `/finance`, `/wholesale`, `/reports` (CSV via `lib/export.ts` + print-to-PDF), `/analytics`, `/manufacturing`, `/settings`. Remaining catch-all routes still render the generic `ErpScreen` fallback.
- **Route override note:** paths built as dedicated pages are listed in `explicitPaths` inside `app/[...slug]/page.tsx` and excluded from the catch-all's `generateStaticParams`. When you promote another catch-all screen to a real page, add its path there too.
- **Backend:** none. The app is frontend-only (auth + ERP data live in `localStorage`), which keeps it a zero-config Vercel deploy. If a database is added later, the full data model lives in the provided SRS/DDL docs.
