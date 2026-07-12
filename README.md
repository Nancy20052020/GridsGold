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

### Logo (gold circle with “G” inside)

The default mark is a **gold circle with a serif “G”** inside. To use your own artwork,
add a square PNG with the G centred in the circle:

| File | Size | Used for |
|------|------|----------|
| `public/images/logo.png` | 512×512 px, transparent or gold circle PNG | Sidebar, login page, customer header, receipts |
| `app/icon.png` | 512×512 px (Next.js scales down) | Browser tab favicon |
| `app/apple-icon.png` | 180×180 px (optional) | iOS home-screen icon |

If `logo.png` is missing, the styled gold **G-in-circle** fallback is shown automatically.

### Product & marketing photos (optional, for when you wire real images)

The UI currently uses CSS jewel placeholders. When you add photos, use clear filenames:

| File | Purpose |
|------|---------|
| `public/images/hero-jewellery.jpg` | Customer portal hero banner |
| `public/images/products/RG22K-00124.jpg` | Product photo by SKU (match inventory SKU) |
| `public/images/products/NK22K-00098.jpg` | …one file per product SKU |

Suggested folder layout:

```
public/images/
  logo.png
  hero-jewellery.jpg
  products/
    RG22K-00124.jpg
    NK22K-00098.jpg
    …
```

Product images are not wired in code yet — drop files with these names so they are ready when product pages are updated to use them.

## Environment variables (Supabase / PostgreSQL auth)

Create `.env.local` (git-ignored) from `.env.local.example`, or set these in
Vercel → Project → Settings → Environment Variables, then redeploy:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

When unset, auth falls back to local mock login.
The admin account is fixed: `nancy2005nov@gmail.com`.
