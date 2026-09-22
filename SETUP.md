# TrustLink — Setup Guide

## Prerequisites
- A [Supabase](https://supabase.com) account and project
- A local HTTP server (for serving the frontend)

---

## Step 1: Set Up the Database

1. Go to your Supabase project → **SQL Editor**
2. Open and run **`database/schema.sql`** — this creates all tables, indexes, triggers, RLS policies, and storage buckets
3. Open and run **`database/seed.sql`** — this populates demo data (users, categories, vendors, products, orders, reviews)

> **Note:** The seed script creates demo users directly in `auth.users`. If you get permission errors, go to **Authentication → Settings** and ensure email confirmations are disabled for development.

---

## Step 2: Configure the Frontend

1. Open **`config.js`**
2. Replace the placeholder values with your real Supabase credentials:
   - **`SUPABASE_URL`** — Found in: Project Settings → API → Project URL
   - **`SUPABASE_ANON_KEY`** — Found in: Project Settings → API → Project API keys → `anon` / `public`

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...your-anon-key';
```

> **⚠️ Security:** Never use the `service_role` key in the frontend. The anon key + RLS policies enforce access control.

---

## Step 3: Serve Locally

You need a local HTTP server (required for ES modules + Supabase API calls). The **project root is the site root** — serve it directly. Choose one:

**Option A — Python:**
```bash
cd "trustlink 2.0"
python -m http.server 3000
```

**Option B — Node.js:**
```bash
npx -y serve -l 3000
```

**Option C — VS Code:**
Install the "Live Server" extension → right-click `index.html` → "Open with Live Server"

Then open: **http://localhost:3000**

---

## Demo Login Credentials

| Role   | Email                    | Password        |
|--------|--------------------------|-----------------|
| Buyer  | buyer@trustlink.demo     | TrustLink123!   |
| Vendor | vendor@trustlink.demo    | TrustLink123!   |
| Admin  | admin@trustlink.demo     | TrustLink123!   |

Use the **"Quick Login"** buttons on the login page to log in as any demo role instantly.

---

## Admin Dashboard Access

The admin dashboard is hidden behind a secret gate:

1. **Triple-click** the TrustLink logo in the header
2. Enter the password: `TrustLinkAdmin2024`
3. You must also be logged in as a user with `admin` role (RLS enforced)

---

## Supabase Storage Setup (Optional)

If you want image uploads to work:

1. Go to **Storage** in your Supabase dashboard
2. The schema.sql already creates these buckets: `product-images`, `vendor-logos`, `avatars`
3. If they weren't created automatically, create them manually and set them as **public**

---

## PWA / HTTPS Note

- PWA features (install prompt, service worker) require **HTTPS** in production
- They work fine on **localhost** during development
- For production, deploy to any static host with HTTPS (Vercel, Netlify, Cloudflare Pages)

---

## Troubleshooting

**"Invalid login credentials"** — Make sure you ran `seed.sql` successfully and email confirmations are disabled in Supabase Auth settings.

**RLS policy errors** — Run `schema.sql` before `seed.sql`. Check that Row Level Security is enabled on all tables.

**CORS errors** — Make sure you're serving via HTTP (not opening `index.html` directly as a file). Add your local URL to Supabase → Authentication → URL Configuration → Redirect URLs.

**Storage upload fails** — Ensure the storage buckets exist and the policies from `schema.sql` were applied.
