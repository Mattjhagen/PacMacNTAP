# PacMac Wireless OS

Production-style MVP for PacMac Mobile's white-label wireless platform.

PacMac Wireless OS manages customer accounts, usage-based billing, SIM/eSIM lifecycle actions, PackieAI scam-call protection, and an internal admin console. No Ultra Mobile, Mint Mobile, T-Mobile, or real carrier API access is assumed or hardcoded.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Server: Express for production static serving, JWT auth, customer APIs, and mock webhook endpoints
- Local data: backend in-memory seed stores when Supabase is not configured
- Live data: Supabase Postgres for customer signups, waitlist entries, dashboard records, blocked numbers, and PackieAI settings
- Future data layer: Supabase/PostgreSQL-ready schema in `supabase/schema.sql`
- Payments: Stripe-ready invoice estimate shape, mocked for this MVP
- Carrier layer: `MockCarrierAdapter` behind a typed adapter interface

## Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Useful routes:

- Customer dashboard: `/#/dashboard`
- Admin console: `/#/admin`
- Sign in: `/#/signin`
- Sign up: `/#/signup`
- Lifeline / NTAP helper: `/#/lifeline`

Demo credentials:

- Customer: `customer@pacmacmobile.com` / `password123`
- Admin: `admin@pacmacmobile.com` / `admin123`

## Supabase Live Mode

Apply the schema in `supabase/schema.sql`, then set these server-side env vars:

```bash
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
JWT_SECRET="replace-with-a-long-random-secret"
```

Optional browser-side Supabase values can still be set for older Supabase-powered features:

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

When `SUPABASE_SERVICE_ROLE_KEY` is configured, the backend persists:

- account signups in `pacmac_app_users`
- customer records in `customer_profiles`
- lines in `wireless_lines`
- eSIM records in `sim_cards`
- billing cycles in `billing_cycles`
- waitlist signups in `waitlist`
- BYOP TAC records in `device_tac_database`
- BYOP lookup audit rows in `byop_checks`
- Lifeline / NTAP contact requests in `lifeline_leads`
- customer blocked numbers in `blocked_numbers`
- PackieAI protection settings in `customer_profiles`

If Supabase is not configured, the app keeps using the in-memory demo seed data.

### Waitlist Table

Run `supabase/migrations/20260626143000_update_waitlist_real_positions.sql` or apply `supabase/schema.sql`.

The live `waitlist` table uses:

- `id uuid primary key default gen_random_uuid()`
- `email text unique not null`
- `full_name text`
- `phone text`
- `source text default 'pacmacmobile.com'`
- `status text default 'pending'`
- `position integer`
- `referral_code text unique`
- `referred_by uuid`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Waitlist inserts go through `POST /api/waitlist` using the server-side service role key. The browser never receives the service role key. Public reads of the full waitlist remain blocked; admin visibility goes through the protected admin endpoint.

Test locally:

```bash
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","full_name":"New User"}'
```

Expected response:

```json
{
  "success": true,
  "message": "You’re on the PacMac Mobile early access list.",
  "position": 1,
  "email": "new@example.com",
  "status": "pending"
}
```

Submitting the same email again returns success with the same position and does not create a duplicate row.

### BYOP TAC Lookup

Run `supabase/migrations/20260626160000_add_byop_tac_lookup.sql` or apply `supabase/schema.sql`.

BYOP device checks go through `POST /api/byop/check-imei`. The frontend sends the IMEI to the backend, the backend validates the 15-digit Luhn checksum, extracts the first 8 digits as the TAC, looks up `device_tac_database`, and records only `tac` plus `imei_last4` in `byop_checks`. Full IMEIs are not stored by the BYOP audit flow.

The TAC database table uses:

- `id uuid primary key default uuid_generate_v4()`
- `tac text unique not null`
- `brand text not null`
- `model text not null`
- `device_type text default 'smartphone'`
- `esim_capable boolean`
- `five_g_capable boolean`
- `source text default 'local_seed'`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Test locally with a seeded TAC:

```bash
curl -X POST http://localhost:3000/api/byop/check-imei \
  -H "Content-Type: application/json" \
  -d '{"imei":"353041101234562"}'
```

Expected response:

```json
{
  "success": true,
  "imei_valid": true,
  "tac": "35304110",
  "device": {
    "brand": "Apple",
    "model": "iPhone 14",
    "device_type": "smartphone",
    "esim_capable": true,
    "five_g_capable": true
  },
  "compatibility_status": "likely_compatible",
  "message": "We found your device."
}
```

Unknown but valid TACs return `needs_manual_review` with `device: null`. Carrier compatibility is not promised from IMEI validation alone; final activation still requires PacMac MVNO/carrier rules. Admins can review lookup rows under `/#/admin` → `BYOP Checks`.

### Nebraska Lifeline / NTAP Helper

Run `supabase/migrations/20260626170000_add_lifeline_leads.sql` or apply `supabase/schema.sql`.

The Lifeline helper lives at `/#/lifeline`. It explains possible Nebraska NTAP/Lifeline eligibility, reminds users that only one Lifeline benefit is allowed per household, and sends users to the official National Verifier:

- National Verifier / GetInternet.gov: `https://www.getinternet.gov/apply?id=nv_home&ln=RW5nbGlzaA%3D%3D`
- Nebraska PSC NTAP info: `https://psc.nebraska.gov/nebraska-telephone-assistance-programlifeline`

PacMac Mobile does not determine Lifeline/NTAP eligibility and is not a government agency. The app must use careful wording such as “may qualify,” “help guide,” and “verify eligibility through the official National Verifier.”

Optional follow-up requests go through `POST /api/lifeline/leads` and store safe contact info only:

- `full_name`
- `email`
- `phone`
- `eligibility_status`
- `consent`
- `source`
- `created_at`

Do not collect or store Social Security numbers, benefit cards, documents, uploads, or sensitive eligibility proof. Admins can review contact requests under `/#/admin` → `Lifeline / NTAP`.

## Authentication

Authentication is backend-backed. The browser posts credentials to `/api/auth/login`; the server verifies PBKDF2-hashed passwords and issues a signed JWT in an HTTP-only `pacmac_session` cookie.

Auth routes:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/signup`
- `GET /api/auth/me`
- `POST /api/waitlist`
- `GET /api/admin/waitlist`
- `POST /api/byop/check-imei`
- `GET /api/admin/byop-checks`
- `POST /api/lifeline/leads`
- `GET /api/admin/lifeline-leads`

Role behavior:

- Customer login redirects to `/#/dashboard`
- Admin login redirects to `/#/admin`
- Unauthenticated users who open `/#/dashboard` are sent to `/#/signin`
- Customer accounts cannot access `/#/admin`
- New signups are customer accounts by default

## Billing Model

Customers do not choose static plans. Billing is based on actual cellular data usage:

- `VITE_PRICE_PER_GB`, default `$3`
- `VITE_MONTHLY_CAP`, default `$30`
- `VITE_MINIMUM_CHARGE`, default `$0`
- `VITE_MINIMUM_CHARGE_ENABLED`, default `false`

The billing engine lives in `src/services/wirelessOsService.ts` as `calculateInvoiceEstimate`.

## Carrier Adapter Boundary

The current carrier implementation is intentionally mocked:

- `provisionSim(customer)`
- `activateSim(simId)`
- `suspendSim(simId)`
- `getUsage(customerId)`
- `getLineStatus(phoneNumber)`
- `portNumber(customerId, portingInfo)`
- `deactivateLine(customerId)`

Replace `MockCarrierAdapter` only after PacMac has real wholesale/MVNO/MVNE API credentials and contracts. TODO markers should be limited to those external credentials and provider-specific payload mappings.

## PackieAI Webhooks

The Express server exposes mock-ready endpoints:

- `POST /webhooks/incoming-call`
- `POST /webhooks/call-analysis`
- `GET /customer/fraud-alerts`
- `POST /customer/block-number`
- `POST /customer/unblock-number`

Sample incoming call payload:

```json
{
  "callerNumber": "+1 888 555 0198",
  "calledNumber": "+1 512 555 0148",
  "timestamp": "2026-06-26T17:00:00.000Z",
  "transcriptText": "urgent payment required by gift card",
  "transcriptUrl": "https://example.com/transcripts/call-123.txt"
}
```

High-risk calls are automatically blocked. Medium-risk calls create warnings unless the customer's auto-block preference is enabled.

## Customer API

The customer dashboard is populated from the logged-in user's JWT session:

- `GET /api/customer/dashboard`
- `GET /api/customer/usage-events`
- `GET /api/customer/billing-estimate`
- `PATCH /api/customer/packie-protection`
- `POST /api/customer/blocked-numbers`
- `DELETE /api/customer/blocked-numbers/:id`

The API only returns data for the customer id embedded in the verified backend session.

## Seed Data

Demo seed data lives in `server/pacmacBackend.ts` for local fallback mode and includes:

- one admin user
- one customer user
- one active wireless line
- one eSIM record
- current billing cycle
- usage events
- billing estimate inputs
- PackieAI fraud alerts
- blocked numbers

To seed live Supabase demo accounts, create rows in `pacmac_app_users` using PBKDF2 hashes generated by `server/pacmacBackend.ts`, or sign up through `/#/signup` to create customer accounts directly.

## Data Models

The MVP includes typed models for:

- User
- CustomerProfile
- WirelessLine
- SimCard
- UsageEvent
- BillingCycle
- InvoiceEstimate
- BlockedNumber
- FraudAlert
- CarrierEvent
- AdminAuditLog

See `src/types/wireless.ts`.

## Database Migration Notes

For hosted persistence, apply and extend `supabase/schema.sql`. The current MVP can run locally without a database, but production should move localStorage mock state into PostgreSQL tables matching the typed models above.

Suggested migration flow:

```bash
supabase db push
```

Then configure:

```bash
VITE_SUPABASE_URL="..."
VITE_SUPABASE_ANON_KEY="..."
```

## Tests

```bash
npm run lint
npm test
```

Current coverage focuses on:

- Customer and admin login
- Role protection and missing session behavior
- Customer dashboard scoping
- Dynamic billing calculation and monthly cap
- PackieAI toggle
- Block and unblock number actions
- Waitlist signup queue number creation
- PackieAI fraud risk routing
- Mock carrier provisioning and activation
- High-risk automatic blocking

## Production Notes

- Keep real carrier, voice, Stripe, and email credentials in environment variables.
- Verify webhook signatures before processing production voice events.
- Enforce role-based access control server-side before exposing real admin APIs.
- Store audit logs immutably once a real database is connected.
