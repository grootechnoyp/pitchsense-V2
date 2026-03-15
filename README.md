# PitchSense v2.0 — AI Sales Co-Pilot

Full-stack SaaS with Clerk Auth, Supabase database, and Claude AI.

---

## What's New in v2

- ✅ User authentication (Clerk) — every user has their own account
- ✅ Call history saved to Supabase — persists across sessions
- ✅ Beautiful landing page with pricing
- ✅ Protected dashboard — only accessible when logged in
- ✅ Real-time stats from actual call history

---

## Setup (20 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Clerk (auth)
1. Go to **clerk.com** → Create account → Create application
2. Name it "PitchSense" → Choose Email + Google
3. Go to **API Keys** → copy both keys

### 3. Set up Supabase (database)
1. Go to **supabase.com** → Create account → New project
2. Wait ~2 mins for it to spin up
3. Go to **SQL Editor** → New Query → paste contents of `supabase_schema.sql` → Run
4. Go to **Settings → API** → copy Project URL and anon key

### 4. Add all keys to .env.local
```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in all 5 values:
```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 5. Run locally
```bash
npm run dev
```

Open http://localhost:3000

---

## Deploy to Vercel

```bash
git add .
git commit -m "pitchsense v2"
git push origin main
```

Then in Vercel → Settings → Environment Variables, add ALL 5 keys from your `.env.local`.

Redeploy after adding keys.

---

## File Structure

```
pitchsense/
├── app/
│   ├── page.js                  ← Landing page (public)
│   ├── layout.js                ← Root layout + Clerk provider
│   ├── globals.css              ← Global styles
│   ├── sign-in/page.js          ← Clerk sign in
│   ├── sign-up/page.js          ← Clerk sign up
│   ├── dashboard/page.js        ← Protected app (all features)
│   └── api/
│       ├── claude/route.js      ← Secure Claude API (auth required)
│       └── calls/route.js       ← Save/fetch calls from Supabase
├── lib/
│   └── supabase.js              ← Supabase client + helpers
├── middleware.js                ← Clerk auth protection
├── supabase_schema.sql          ← Run once in Supabase SQL editor
└── .env.local.example           ← Copy to .env.local
```

---

## Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/sign-in` | Public | Clerk login |
| `/sign-up` | Public | Clerk signup |
| `/dashboard` | Auth required | Full app |
| `/api/claude` | Auth required | Claude AI proxy |
| `/api/calls` | Auth required | Call history CRUD |

---

## Next: Add Stripe Payments
- Free tier: 3 calls/month
- Pro $49/mo: unlimited calls
- Team $99/mo: team dashboard
