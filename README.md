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

Put all images in **`public/images/`**. A file at `public/images/ring_1.png` is served as `/images/ring_1.png`.

### Logo

The logo is a **gold circle with a serif “G” centred inside** (Playfair Display). No image file is required.

Optional browser icons: `app/icon.png` (512×512), `app/apple-icon.png` (180×180).

### Product photos — add these exact filenames

| File | Used for |
|------|----------|
| `ring_1.png` … `ring_5.png` | Ring products + category tiles |
| `necklace_1.png` … `necklace_3.png` | Necklace products + hero banner |
| `earrings_1.png`, `earrings_2.png` | Earring products + category tile |
| `bangle_1.png`, `bangle_2.png` | Bangle products + category tile |
| `pendant_1.png`, `pendant_2.png` | Pendant products + category tile |
| `anklet_1.png` | Gold Stone Anklet product |

```
public/images/
  ring_1.png
  ring_2.png
  ring_3.png
  ring_4.png
  ring_5.png
  necklace_1.png
  necklace_2.png
  necklace_3.png
  earrings_1.png
  earrings_2.png
  bangle_1.png
  bangle_2.png
  pendant_1.png
  pendant_2.png
  anklet_1.png
```

If a file is missing, the UI falls back to the jewel icon placeholder for that item.

## Environment variables (Supabase / PostgreSQL auth)

Create `.env.local` (git-ignored) from `.env.local.example`, or set these in
Vercel → Project → Settings → Environment Variables, then redeploy:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

When unset, auth falls back to local mock login.
The admin account is fixed: `nancy2005nov@gmail.com`.
