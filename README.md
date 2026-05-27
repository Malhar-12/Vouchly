# Vouchly

Universal review automation for local businesses.

Vouchly is a separate product from SkinSignal. It is designed for general stores, hospitals, clinics, textile shops, barbers, hotels, car services, mobile shops, restaurants, salons, gyms, coaching classes, and other local businesses.

## What is ready

- Supabase email login and signup
- Private cloud workspace per business owner
- Business profile setup
- Business type selector
- Customer list with phone, email, channel, and visit date
- Review request queue
- Follow-up automation tasks
- Message templates
- Customer delete control
- Data export
- Local backup persistence

## Render deploy

Create a new Render Static Site with:

```text
Root Directory: .
Build Command:
Publish Directory: .
```

This first version is static and does not require a build command.

## Supabase setup

Run `supabase-schema.sql` in the Supabase SQL Editor before using the live app.

The app stores each signed-in user's workspace in `vouchly_workspaces` with row-level security enabled.

## Security setup

Read `SECURITY.md` before taking real customers. It includes the Supabase RLS verification query, Render security headers, and the rules for keeping billing and WhatsApp provider secrets out of the frontend.

## Next production steps

- Add business-owned sender connections
- Add real WhatsApp/SMS/email provider integration
- Add billing and plan limits
