# PacMac Wireless OS

Production-style MVP for PacMac Mobile's white-label wireless platform.

PacMac Wireless OS manages customer accounts, usage-based billing, SIM/eSIM lifecycle actions, PackieAI scam-call protection, and an internal admin console. No Ultra Mobile, Mint Mobile, T-Mobile, or real carrier API access is assumed or hardcoded.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Server: Express for production static serving, JWT auth, customer APIs, and mock webhook endpoints
- Local data: backend in-memory seed stores plus browser localStorage for the admin mock carrier console
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

Demo credentials:

- Customer: `customer@pacmacmobile.com` / `password123`
- Admin: `admin@pacmacmobile.com` / `admin123`

## Authentication

Authentication is backend-backed. The browser posts credentials to `/api/auth/login`; the server verifies PBKDF2-hashed passwords and issues a signed JWT in an HTTP-only `pacmac_session` cookie.

Auth routes:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/signup`
- `GET /api/auth/me`

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

Seed data lives in `server/pacmacBackend.ts` and includes:

- one admin user
- one customer user
- one active wireless line
- one eSIM record
- current billing cycle
- usage events
- billing estimate inputs
- PackieAI fraud alerts
- blocked numbers

To reset seed state during development, restart the dev server.

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
- PackieAI fraud risk routing
- Mock carrier provisioning and activation
- High-risk automatic blocking

## Production Notes

- Keep real carrier, voice, Stripe, and email credentials in environment variables.
- Verify webhook signatures before processing production voice events.
- Enforce role-based access control server-side before exposing real admin APIs.
- Store audit logs immutably once a real database is connected.
