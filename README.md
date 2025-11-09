# NO SLEEP NOV14 — Two Tiers + 50 Early Bird Cap + Promo Code (Next.js + Stripe + Supabase)

Includes:
- **Early Bird — $29.50** (limit 4/order, **global cap = 50** via Supabase)
- **General Admission — $49.50**
- **Promo code `benj` = 10% off** (ensured by API; users type it at Checkout)
- Red theme + centered cover image
- Stripe Checkout

## Setup
```bash
npm install
cp .env.example .env.local
# fill .env.local with Stripe keys + NEXT_PUBLIC_SITE_URL (localhost now)
npm run dev
# open http://localhost:3000
```

### .env.local
```
NEXT_PUBLIC_STRIPE_PK=pk_test_REPLACE_ME
STRIPE_SECRET_KEY=sk_test_REPLACE_ME
NEXT_PUBLIC_SITE_URL=http://localhost:3000

STRIPE_WEBHOOK_SECRET=whsec_REPLACE_ME

SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

### Supabase schema
Run in Supabase SQL:
```
create table if not exists tickets (
  id bigserial primary key,
  session_id text unique,
  tier text not null,
  quantity int not null default 1,
  created_at timestamptz not null default now()
);
alter table tickets enable row level security;
```

### Stripe webhook
Dashboard → Developers → Webhooks → Add endpoint: `/api/webhook`
Events: `checkout.session.completed`
Copy the signing secret to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### Deploy
```
npm i -g vercel
vercel
```
Add the same environment variables in Vercel Project Settings and redeploy.
