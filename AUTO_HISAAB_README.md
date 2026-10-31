# VyaparTrust Auto Hisaab — 31 October 2026

## What is working now

- Real, server-side Razorpay event ingestion via deployed Supabase Edge Function `razorpay-auto-hisaab`.
- Signature verification over the **raw** webhook bytes using the private `RAZORPAY_WEBHOOK_SECRET`.
- Events: payment.captured, qr_code.credited, refund.processed; RazorpayX payout.processed and payout.reversed (only if the merchant's provider account supports these).
- Every event must have a valid signed payload and linked, operator-approved provider account before the service-only SQL RPC books an entry.
- Shop Hisaab updates while the app is closed, since the webhook runs in Supabase. When the app is open it refreshes records on focus and every 60 seconds.
- Idempotency at **event** level and at canonical **payment/payout** level. QR credited and payment captured can refer to the same payment.
- Provider-confirmed records are stored separately from editable manual records and clients cannot forge, edit or delete provider records.
- Manual transaction duplicate review: exact provider reference can auto-link; same amount/date alone is only a possible duplicate requiring shopkeeper confirmation. Matched manual entries are excluded from the daily totals.
- Provider connection request/connection status screen, "simulate incoming payment" button in fictional Demo Bazaar, and clear "not a bank balance" labels.
- Full data export and shop-data wipe cover payment connections and webhook metadata.
- Audits cover connection changes, requests and provider notification events.

## What is NOT connected yet
- There are currently **zero approved Razorpay accounts**, **zero real provider entries** and the server is **not configured with RAZORPAY_WEBHOOK_SECRET**. The real endpoint safely returns HTTP 503 until configured.
- A UPI ID alone cannot grant access to transaction history. Only provider-side authenticated merchant/business integrations can supply verified payment events.
- This integration DOES NOT see UPI payments made or received by unrelated personal PhonePe/Google Pay/bank apps, unless those institutions separately offer a permitted API connection.
- A provider event is not a confirmed bank balance or payout settlement; actual accounting may require a bank reconciliation.
- Cash, customer identity/udhar, purchased inventory items, and supplier purchase quantities cannot be inferred from the rupee amount of a UPI transfer. For automated stock forecasting, connect an itemised billing/POS system and customer mapping.
- Provider-specific Razorpay sub-merchant account IDs must be unique and verifiably linked. A single shared platform account_id is **not enough** to distinguish independent shops; in that architecture, implement trusted order/sub-merchant mapping before activation.

## What the platform operator must do to enable REAL payments

1. Obtain an authorised Razorpay merchant/platform integration appropriate to how individual kirana shops receive payments. **Never ask shopkeepers to enter their UPI PIN, banking password, OTP, or API secret in the app.**
2. Merchant visits **More tools → Auto Hisaab**, submits their Razorpay merchant account ID. A `pending` request is saved.
3. Platform operator independently verifies merchant-account ownership in Razorpay's merchant dashboard or supported onboarding API, including that the event account_id truly identifies this shop.
4. Operator configures a strong Razorpay webhook secret using the **secure Supabase Edge Function Secrets settings**, not in frontend code or chat. Set `RAZORPAY_WEBHOOK_SECRET` and configure Razorpay to send to:
   `https://htrugaagenwugpzvnxkj.supabase.co/functions/v1/razorpay-auto-hisaab`
   Subscribe to payment.captured and qr_code.credited; add supported refund and RazorpayX payout events as relevant.
5. Only after verification, the platform's authorised admin/service process should insert an approved row into `shop_payment_connections` matching merchant_id, provider='razorpay', provider_account_id, status='active', and mark the shop's `shop_payment_link_requests.status` as `approved`. **Do not approve a user-supplied ID without external verification.** Never expose service-role credentials in a browser.
6. Test a real low-value payment using Razorpay's recommended safe test mode first; check webhook delivery, signature, unique event ID, one-to-one account mapping, and visible Auto Hisaab entry. Then test payouts and refunds according to provider permissions and applicable policies.
7. Confirm operational ownership for webhook secret rotation, monitoring, delivery retries, disputes and refunds, data retention, settlement reconciliations and incident response.

## Technical files in this project

- `AUTO_HISAAB_MIGRATION.sql`
- `AUTO_HISAAB_CANONICAL_FIX.sql`
- `AUTO_HISAAB_RECON_SAFETY_FIX.sql`
- `AUTO_HISAAB_EVENT_ORDER_FIX.sql`
- `AUTO_HISAAB_METHOD_FIX.sql`
- `AUTO_HISAAB_DATA_CLEAR.sql`
- `AUTO_HISAAB_EXPORT_METADATA.sql`
- `AUTO_HISAAB_AUDIT_TRIGGERS.sql`
- `AUTO_HISAAB_MANUAL_REVIEW.sql`
- `supabase/functions/razorpay-auto-hisaab/index.ts`
- `src/views/AutoHisaabView.tsx`
- `src/views/DailyCompanionView.tsx`
- `src/context/ShopContext.tsx`

All these incremental migrations were applied to Supabase project `htrugaagenwugpzvnxkj`. Do not reapply them blindly to the same database.

## Verified in rollback-only database tests

- payment.captured records a provider entry.
- Same event ID -> duplicate; different qr_code.credited event for same payment ID -> already_booked.
- payout.processed and payout.reversed -> offsetting cash flows; reversal arriving first blocks a later processed event from inventing an outflow.
- Unlinked account -> no entries.
- Matching manual record with exact provider ID -> automatically avoids duplicate; same-amount/day-only remains separate until merchant confirms.
- Authenticated user cannot forge a provider-confirmed row or execute the service-only ingestion RPC.
- TypeScript lint and Vite production build pass.
- Local preview and API HTTP 200, live unconfigured webhook HTTP 503.
- No real provider entries or approved connections have been added.

## Demo link
http://127.0.0.1:5173/?demo=1&view=auto-hisaab

## Launch requirements
Razorpay merchant API permissions/onboarding, production webhook secret, rigorous webhook signing/rotation and exception monitoring, a full browser multi-merchant E2E test, independent security and privacy review, explicit user consent, verified bank-settlement/reconciliation tests, and validated provider account mapping. The system is not yet certified production-ready.

## Official references
- https://razorpay.com/docs/webhooks/validate-test/
- https://razorpay.com/docs/webhooks/qr-codes/
- https://supabase.com/docs/guides/functions/secrets
- https://supabase.com/docs/guides/database/postgres/row-level-security
