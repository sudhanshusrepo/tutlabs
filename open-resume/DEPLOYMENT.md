# Deployment Guide — OpenResume

This guide covers deploying OpenResume to **Vercel** (frontend + API) with **Supabase** (database + auth).

---

## Prerequisites

- A [Vercel](https://vercel.com) account (free tier works)
- A [Supabase](https://supabase.com) account (free tier works)
- Your code pushed to a GitHub repository

---

## Step 1: Set Up Supabase (Production)

1. Create a **new project** in the Supabase dashboard
2. Under **SQL Editor**, paste and run the full contents of [`database/schema.sql`](./database/schema.sql)
3. Under **Authentication > Providers**, enable:
   - **Email** (Magic Link) — toggle on
   - **Google** — add your OAuth Client ID and Secret from [Google Cloud Console](https://console.cloud.google.com)
4. Under **Authentication > URL Configuration**, set:
   - **Site URL**: `https://your-production-domain.vercel.app`
   - **Redirect URLs**: `https://your-production-domain.vercel.app/auth/callback`

> **Note**: For Google OAuth, the Authorized Redirect URI in Google Cloud must be set to `https://<your-supabase-project>.supabase.co/auth/v1/callback`

---

## Step 2: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Under **Environment Variables**, add the following:

| Variable | Value | Where to Find |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase > Settings > API |
| `IP_SALT` | A random secret string | Generate with `openssl rand -hex 32` |

4. Click **Deploy**

---

## Step 3: Configure Auth Callback Route

Ensure your app has the Supabase auth callback route. Create `app/auth/callback/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(origin + '/dashboard')
}
```

---

## Step 4: Verify Deployment

After deployment, test the following:
- [ ] Landing page loads at your Vercel URL
- [ ] `/builder` is accessible and the form works
- [ ] Google Sign In redirects correctly and returns to `/dashboard`
- [ ] Email Magic Link arrives and authenticates correctly
- [ ] PDF download works and tracks usage
- [ ] Dashboard shows saved resumes

---

## Custom Domain (Optional)

1. In Vercel, go to your project's **Settings > Domains**
2. Add your custom domain and follow the DNS configuration steps
3. Update the **Supabase Auth Site URL** and **Redirect URLs** with your new domain

---

## Updating the App

Simply push to your main branch on GitHub. Vercel will automatically deploy the latest changes.
