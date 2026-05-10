# ReviewLoop

Universal review automation for local businesses.

ReviewLoop is a separate product from SkinSignal. It is designed for general stores, hospitals, clinics, textile shops, barbers, hotels, car services, mobile shops, restaurants, salons, gyms, coaching classes, and other local businesses.

## What is ready

- Business profile setup
- Business type selector
- Customer list with phone, email, channel, and visit date
- Review request queue
- Follow-up automation tasks
- Message templates
- Customer delete control
- Data export
- Local browser persistence

## Render deploy

Create a new Render Static Site with:

```text
Root Directory: .
Build Command:
Publish Directory: .
```

This first version is static and does not require a build command.

## Next production steps

- Create a separate GitHub repo for this app
- Add Supabase auth and database
- Add business-owned sender connections
- Add real WhatsApp/SMS/email provider integration
- Add billing and plan limits
