# Grids Gold Jewellery ERP Frontend

Responsive Next.js frontend for a jewellery ERP dashboard, designed for Vercel deployment.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Images & logo

Put all images in the **`public/images/`** folder. Anything there is served from the
site root, so a file at `public/images/ring.jpg` is referenced in code as `/images/ring.jpg`.

- **Logo:** add `public/images/logo.png` and it is used automatically in the sidebar,
  customer header and login page (falls back to the gold "G" mark if the file is absent).
- **Product / hero photos:** drop them in `public/images/` and reference them by their
  `/images/...` path where needed.

## Environment variables (Supabase / PostgreSQL auth)

Create `.env.local` (git-ignored) from `.env.local.example`, or set these in
Vercel → Project → Settings → Environment Variables, then redeploy:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

When unset, auth falls back to local mock login.
The admin account is fixed: `nancy2005nov@gmail.com`.
