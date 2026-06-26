# PacMac Wireless OS

Production-style MVP for PacMac Mobile's white-label wireless platform.

PacMac Wireless OS manages customer accounts, usage-based billing, SIM/eSIM lifecycle actions, PackieAI scam-call protection, and an internal admin console. No Ultra Mobile, Mint Mobile, T-Mobile, or real carrier API access is assumed or hardcoded.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Server: Express for production static serving and mock webhook endpoints
- Local data: browser localStorage plus in-memory server webhook state
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
- Login: `/#/login`

For local login, set `VITE_DEV_AUTH_BYPASS=true` and use `demo@pacmac.com`; the bypass passcode is `123456`.

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

- Dynamic billing calculation and monthly cap
- PackieAI fraud risk routing
- Mock carrier provisioning and activation
- High-risk automatic blocking

## Production Notes

- Keep real carrier, voice, Stripe, and email credentials in environment variables.
- Verify webhook signatures before processing production voice events.
- Enforce role-based access control server-side before exposing real admin APIs.
- Store audit logs immutably once a real database is connected.
