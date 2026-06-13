# Vouchly Security Checklist

Vouchly is a static frontend with Supabase Auth and a private Supabase workspace table. Before selling this as a real SaaS, apply this checklist.

No website can honestly promise "no one can hack it." The right goal is layered security: private data access, no secret keys in the browser, server-side verification for money/sending, customer consent, backups, and monitoring.

## Supabase

Run `supabase-schema.sql` in the Supabase SQL Editor after every schema update.

Minimum required database protections:

- Row Level Security is enabled and forced on `vouchly_workspaces`.
- Anonymous users cannot read or write the workspace table.
- Authenticated users can only select, insert, update, or delete their own row.
- Never put `service_role`, WhatsApp API tokens, billing secrets, or provider API keys in frontend files.
- Treat `src/supabase-config.js` as public. The anon key is acceptable only because RLS protects the table.
- Do not store Razorpay keys, WhatsApp provider tokens, SMS keys, email keys, or admin passwords inside `state` JSON.

Quick live verification query:

```sql
select
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'vouchly_workspaces';
```

## Render Security Headers

Render Static Sites manage headers in the Render Dashboard. Add these headers for `/*`:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Content-Security-Policy: default-src 'self'; script-src 'self' https://esm.sh; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' https://owaummwalslzmgufbhey.supabase.co https://esm.sh; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

## Frontend-Safe vs Backend-Only

Frontend-safe:

- Supabase project URL
- Supabase anon key, only with RLS enabled
- Public plan names and prices
- Public marketing copy
- Owner-created customer data shown only after login

Backend-only:

- Supabase `service_role` key
- Razorpay key secret and webhook secret
- WhatsApp Business API tokens
- Interakt, WATI, AiSensy, SMS, or email provider API keys
- Plan activation, payment verification, auto-send jobs, and admin-only reports

## Future Backend Wall

These features must be server-side only, preferably Supabase Edge Functions or a backend service:

- Razorpay/Stripe billing verification and webhooks
- WhatsApp Business API tokens
- SMS/email provider API keys
- Admin dashboards
- Plan enforcement that blocks abuse
- Audit logs and customer deletion requests

## WhatsApp Sending Safety

Current safe launch mode:

- Vouchly prepares the message.
- Customer name, business name, review link, and offer text are auto-filled.
- The owner opens WhatsApp and taps Send from their own number.
- This avoids storing WhatsApp API secrets before the backend is ready.

Future automatic mode:

- Use an official WhatsApp provider such as Interakt, WATI, AiSensy, or Meta Cloud API.
- Store provider tokens only in Edge Functions/backend environment variables.
- Send only approved templates and only to customers with consent.

## Account Protection

- Keep email confirmation enabled in Supabase Auth.
- Require strong passwords for new accounts.
- Enable MFA later for business owners.
- Keep Terms, Privacy, anti-spam, and honest-review consent in onboarding.

## Customer Data Rules

- Only add customers with a real business relationship.
- Do not upload purchased, scraped, or random phone lists.
- Delete customer records when the customer asks.
- Do not offer rewards for only positive reviews.
