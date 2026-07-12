# Grids Gold — Jewellery ERP Frontend

Next.js (App Router) frontend for the Grids Gold jewellery ERP, intended for **frontend-only** deployment on Vercel. Uses TypeScript, React, `lucide-react` icons, and plain CSS (`app/globals.css`). Brand theme: navy (`#061327`) + gold (`#f2b33d` / `#ffd36c`), Inter font.

## Cursor Cloud specific instructions

- **Package manager is pnpm** (there is a `pnpm-lock.yaml`). Use `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`. Do not use npm/yarn.
- **Dev server:** `pnpm dev` (Next.js + Turbopack) serves on `http://localhost:3000`. It is a long-running process — start it in a background/tmux session, not a blocking foreground call.
- **Lint gotcha:** Next.js 16 **removed the `next lint` command**. Linting uses ESLint's flat config directly: `eslint.config.mjs` (extends `eslint-config-next/core-web-vitals` + `/typescript`) and the `lint` script is `eslint .`. Do not change it back to `next lint`.
- **Routing / area separation:**
  - `/` → public **Login / Sign Up** entry (`app/page.tsx`, client component). Has a Customer vs Admin/Staff role toggle. Auth is currently **mock**: submitting redirects Customer → `/portal`, Admin → `/dashboard` (no backend yet).
  - `/dashboard` → **Admin** ERP (uses `AppShell`, the sidebar layout). All other admin screens are data-driven from `app/data.ts` and rendered by `app/[...slug]/page.tsx` + `app/components/ErpScreen.tsx` (these are placeholder ERP screens to be built out one at a time).
  - `/portal` → **Customer** portal home (uses `CustomerShell`, a light top-nav layout). Upcoming customer screens (`/portal/orders|repairs|wishlist|account`) render a polished "coming next" placeholder via `app/portal/[...rest]/page.tsx` so links never 404.
- **Everything prerenders statically** (`pnpm build` output is all `○`/`●`), which keeps it Vercel-friendly. New dynamic catch-all routes should add `generateStaticParams` to keep the build fully prerendered.
- **Images:** none are committed yet. Product/hero images should be dropped into `public/images/` and referenced as `/images/...`. The UI currently uses CSS/`jewel-icon` motifs as placeholders so it looks complete without assets.
- **Shared client store:** `app/lib/store.tsx` is a React context (`useStore()`) that holds all app data — gold `rates`, `items`, `customers`, `invoices`, `repairs`, `suppliers`, `purchaseOrders`, POS `cart`, `wishlist`, and customer `orders` — persisted to `localStorage` (key `gg_state_v2`). It is wired in via `StoreProvider` in `app/layout.tsx`. This is the temporary data layer (no backend yet); replace with Supabase/Postgres later.
  - Pricing is **derived from the live gold rate**: `itemPrice(item, rates) = weight × rate[karat] + making + stoneValue`. Changing a rate on `/gold-rates` recomputes prices everywhere (sidebar widget, POS, catalog, product detail). `itemStatus(stock)` derives In/Low/Out of Stock.
  - To reset demo data, clear `localStorage` keys `gg_state_v2` and `gg_state_v2_cart`.
- **Working (interactive) screens** — Admin: `/pos` (cart → checkout creates an invoice + reduces stock), `/inventory` (search/filter + `/inventory/new` add form + `/inventory/item-details?id=` detail), `/customers`, `/repairs`, `/gold-rates`, `/suppliers`, `/purchase-orders`, `/sales/invoices`, `/jewelry`. Customer: `/portal`, `/portal/catalog`, `/portal/product/[id]`, `/portal/wishlist`, `/portal/orders`. Other admin routes still render the generic data-driven `ErpScreen` fallback (to be built out next).
- **Route override note:** paths built as dedicated pages are listed in `explicitPaths` inside `app/[...slug]/page.tsx` and excluded from the catch-all's `generateStaticParams`. When you promote another catch-all screen to a real page, add its path there too.
- **Database (planned, not yet wired):** target is **PostgreSQL via Supabase** (auth + Postgres + storage) — chosen for smooth Vercel/serverless deployment and native JSON support for the many `*_json` columns in the schema. The full data model lives in the provided SRS/DDL docs.
