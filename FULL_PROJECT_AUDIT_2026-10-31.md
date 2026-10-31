# VyaparTrust — Full Project Audit
**Audit date:** 31 October 2026
**Project root:** \`vyapartrust-improved\` (Windows local workspace)
**Supabase project:** \`htrugaagenwugpzvnxkj\`
**Audit type:** Source review, read-only database inspection, runtime/process checks and non-destructive automated build/tests. **Not** a penetration test, formal privacy audit, bank integration certification or end-to-end human usability study.

## Executive conclusion

VyaparTrust is a functioning local React/Supabase prototype with working merchant-side CRUD forms, in-memory fictional demo mode, some database-backed automation, restricted cross-merchant access, and a partially built payment-provider webhook integration. It is **not yet ready for production rollout or a claim that all UPI activity is automatically captured**.

There are two overlapping transaction systems:
1. **\`shop_entries\`** — Today's Hisaab, manual cash/UPI/bank entries, provider webhook receipts, duplicate review and current dashboard totals.
2. **\`transactions\`** — separate older payment-review screen and the sole source for real Bazaar League snapshots.

The demo contains a THIRD, isolated store of sample payments (\`DemoShowcase.tsx\` / \`demo/data.ts\`). This is the central integration and trust inconsistency. A payment added to Auto Hisaab will update Daily Hisaab, but it does not populate the legacy \`transactions\` view or count toward real Bazaar League scores.

## Status definitions
- **Implemented / locally tested:** Present in code; TypeScript/build or logic tests pass. Does not imply user E2E testing.
- **Implemented but conditional:** Real data/participation/provider authorisation needed.
- **Demo-only:** Synthetic or ephemeral browser-state demonstration; no real financial data or bank connection.
- **Guidance / placeholder:** Page exists, but no operational backend for the headline capability.
- **Production blocker:** Should be addressed before a public finance-product launch.

## Layer 1: Visual design, navigation, identity

| Feature | What exists today | Verified status | Caveat |
|---|---|---|---|
| Desi shop theme | Kirana/shop awning, warm ledger colours, \`bahi-khata\` book-cover icon animations, slim cards | Implemented | No device/browser visual regression suite |
| Mobile navigation | 4 main links: My Dukaan, Daily Hisaab, Udhar, Stock. More tools holds advanced features | Implemented | Onboarding/usability and screen-reader audit absent |
| Language | English, Hindi, Bengali selectors and saved preference | Partial | Many new advanced pages remain English-only |
| Day/night theme | CSS variables and saved local preference | Implemented | Full contrast review pending |
| Google login | Supabase Auth Google OAuth with PKCE and session persistence | Implemented; previously reported working | Live login flow not rerun in this audit |
| Shop profile | \`merchants\` record, name, owner, location, PIN, city, district and state | Implemented | Region is self-declared, not India Post-verified |
| Demo Bazaar | One-click fictional mode; 28 shops and 5,880 synthetic records plus a smaller independent sample Hisaab | Implemented/demo-only | Two different demo data models are not fully synchronized |
| Old code | Unused old \`OverviewView.tsx\`, Firebase client/admin, \`server.ts\`, old Drizzle schema and large older chart components | Present | Migration cleanup necessary; increases complexity and chance of using wrong data source |

## Layer 2: Everyday merchant features

| Feature | User-facing flow | Status / honesty boundary |
|---|---|---|
| My Dukaan / today | Overview of today's manually entered and connected provider events, after excluding manually confirmed duplicates | Implemented; real shop currently has no entries. Not a profit figure or bank balance |
| Today's action list | Pulls overdue customer dues, near-term supplier payments and low-stock items | Implemented; data entered manually, not inferred from UPI amount |
| Daily Hisaab | Add/delete manual sales and expenses, Cash/UPI/Bank/Other; see totals and entries | Implemented with Supabase RLS; not certified accounting or bank-reconciled |
| Udhar | Add customer/supplier, create due, date, partial settlement, copy respectful reminder | Implemented; marking paid doesn't actually transfer or verify funds |
| Supplier payments | Owed to supplier, upcoming due reminders | Implemented; no supplier-payment initiation or automated mapping to provider payouts |
| Stock | Enter stock items and thresholds, update quantities, copy reorder list | Implemented; manual stock updates do not automatically create item-sale movements for forecasting |
| Repeat customers | Customer-consented shopping lists and manually copied messages | Implemented; no automatic WhatsApp ordering, delivery, or POS integration |
| My Stock Forecast | Record item sold/restocked with transactional RPC; 28-day mean, seven-day projection, min/max weekly band | Conditional; requires >=14 distinct sale dates and >=10 units, and is not ML or weather/season-aware |
| Uploaded statement reconciliation | Parse limited CSV template; deduplicate file rows, show candidate manual payment matches, confirm one-to-one links | Implemented, not independently bank verified; manual review required |

## Layer 3: Regional and growth features

| Feature | Present | Constraints |
|---|---|---|
| Bazaar League | PIN, city, district, state; opt-in alias, category peers, \`Bazaar Stars\` (30-day recorded activity) and \`Rising Stars\` (relative growth) | **Real league reads only \`transactions\`**, not Auto Hisaab \`shop_entries\` |
| League privacy | No competitor gross amounts exposed; >/=5 active shops minimum; snapshot refresh via pg_cron every 30 min | Region/PIN self-declared; enough shops must join; snapshots currently empty |
| Fictional league | 6 PIN, 12 city, 16 district, 28 state competitors; full ranking and relative growth | Demo-only, no link to live merchant data |
| Mohalla Power | Create regional bulk-purchase interest request, join/update/leave pledge; supplier enquiry copy | Needs multiple real shops; no marketplace ordering, supplier fulfillment, payment, shared retail prices or contracts |
| Aggregation privacy | Pledge amounts readable only by their owner; group totals revealed only with >=5 separate participants | City/state are self-entered; campaign metadata visible to eligible same-region shops, admin abuse prevention/rate limits incomplete |

## Layer 4: Automation

| Feature | Implemented | Live reality |
|---|---|---|
| Auto Hisaab | Razorpay Edge Function validates raw webhook HMAC, uses service-only ingestion RPC, records \`shop_entries\`, detects event + payment duplicates | **Not activated. 0 approved provider connections / 0 webhook events / 0 real automatic entries** |
| Connection request | User can submit provider account ID for external verification | Request does NOT approve or link account automatically; no operator onboarding UI |
| Payouts and reversals | Tests cover supported provider payout events, duplicates, reversal ordering and matching | Does not give access to personal UPI apps or all bank transfers; still needs real provider contract |
| Potential duplicate resolution | Manual entries match automatically only on exact provider reference; similar amount/date requires merchant confirmation | Implemented; owner must review ambiguous cases |
| Live refresh | Webapp polls while visible, refreshes on focus (~60s), webhook works server-side while browser closed | Not push notifications or offline mode |
| Stock automation from UPI | No SKU/item details in provider payment event | **Not implemented and cannot be inferred from payment amount alone** |
| Automatic customer udhar | No verified customer-to-payment identity join | **Not implemented** |
| Bank/account aggregation | No authorised bank or account-aggregator provider integrated | **Not implemented** |
| Provider secrets | Razorpay webhook intentionally responds 503 until private secret configured | Safe inactive default; never request owner UPI PIN, bank OTP or passwords |

## Layer 5: Supporting pages

| Page | Actual implementation |
|---|---|
| Money in/out / Payment Review | Reads older \`transactions\` table; distinct from Daily Hisaab and Auto Hisaab |
| Ask for Help / AI Coach | Static FAQ educational answers. Backend AI chat and voice endpoints return HTTP 501 |
| Savings / resilience | Temporary goal entered in component state; no savings account connection, fund transfer or durable savings ledger |
| Loan readiness | Three-step educational checklist. No underwriting, credit-scoring, lender integration or approval |
| Financial Passport | Basic shop details. No verified financial passport, bank verification, QR document issuance or authenticity check |
| Verification page | Explicitly says verification is unavailable; backend endpoint returns HTTP 501 |
| Settings | Updates shop name/owner, locality and self-entered PIN/city/district/state |
| Audit History | DB triggers record INSERT/UPDATE/DELETE type, table/id, time and actor, not full before/after financial field values. Latest 150 shown |
| Data Export | Browser-side JSON export of own account/profile, shop records, provider connection metadata, league preferences and audits; data is not encrypted on download |
| Clear Shop Data | Privileged merchant-scoped RPC requires exact phrase, wipes records, preserves profile/login; irreversible; only phrase + browser confirm, **no fresh re-authentication** |
| Delete Entire Account | Edge function checks authenticated session and recent sign-in before admin delete; merchant foreign-key cascade; unauthenticated calls rejected | Real deletion never rehearsed with disposable account; backup retention and identity revocation review needed |

## Architecture and source map

**Frontend:** Vite 8, React 19, TypeScript, Tailwind/CSS. Route selection is application React state in \`src/App.tsx\`; complex pages are lazy-loaded. There is no conventional URL router.

**Auth:** \`src/context/AuthContext.tsx\`, \`src/lib/supabase.ts\`. Google OAuth only.

**General shop records:** \`src/context/ShopContext.tsx\`, \`src/views/DailyCompanionView.tsx\`, \`src/views/DailyActionStrip.tsx\`.

**Business calculations:** \`src/lib/shopLogic.ts\`, \`src/lib/operations.ts\`.

**League/demo:** \`src/views/MerchantLeagueView.tsx\`, \`src/demo/RegionalLeague.tsx\`, \`src/demo/DemoShowcase.tsx\`, \`src/demo/data.ts\`.

**Automation:** \`src/views/AutoHisaabView.tsx\`, \`supabase/functions/razorpay-auto-hisaab/index.ts\`, SQL files prefixed \`AUTO_HISAAB_\`.

**Procurement:** \`src/views/MohallaPowerView.tsx\`; audit, exports and deletions: \`src/views/RecordsAndPrivacyView.tsx\`; \`supabase/functions/delete-my-vyapartrust-account/index.ts\`.

**Secondary Express server:** \`supabase-server.ts\` listens at 127.0.0.1:3001. Main CRUD pages call Supabase directly; local API handles some legacy and league routes. \`/api/health\` returns HTTP 200 but explicitly says \`database:not_checked\`; it is NOT a real database health probe.

**Database tables:** merchant account/profile; legacy \`transactions\`; shop contacts/dues/stock/stock movements/entries; uploaded statement reconciliation; regional league prefs/snapshots; Mohalla campaigns/pledges; payment provider connection requests/connections/webhook-event metadata; audit log.

**Deployed Edge Functions:** \`razorpay-auto-hisaab\` (provider webhook) and \`delete-my-vyapartrust-account\` (recently authenticated account deletion). Both are deployed, but that alone does not validate real provider onboarding or deletion completion.

**Migrations:** Numerous incremental \`*.sql\` files in project root; applied to Supabase. There is no consolidated, clean-bootstrap migration chain validated on an empty clone yet. Replaying every SQL file blindly would be unsafe.

## Live data snapshot of Supabase

Read-only inspection on 31 Oct 2026 showed:
- 1 merchant profile
- 0 live \`transactions\`, \`shop_entries\`, \`shop_contacts\`, \`shop_dues\` and \`shop_stock\`
- 0 live league snapshots, Mohalla campaigns/pledges, active payment connections/link requests, webhook events and audit events

Past SQL integration tests were run inside explicitly rolled-back transactions. The demo's 5,880 fictional transactions are **not** in Supabase.

## Testing done this audit

**Pass:** \`npm run lint\` (TypeScript \`tsc --noEmit\`) and \`npm run build\` (Vite), as tested in local project.

**Pass:** \`.runtime/operations-test.mjs\` — CSV handling, invalid row rejection, strict matching and 7-day forecasting history threshold.

**Pass:** \`.runtime/league-test.mjs\` — 28 fictional shops, 5,880 transactions, ranks sorted for PIN/city/district/state.

**Pass:** \`.runtime/daily-companion-test.mjs\` — supplier dates, partially settled dues, low stock, empty data.

**Previously verified (non-destructive, rollback):** Postgres audit trigger, provider event replays, canonical QR/payment deduplication, payout ordering, signed-in merchant cross-user data separation, owner-only manual duplicate review, public webhook safe disabled response, provider entry forgery rejection, Mohalla aggregate privacy under five participants.

**Not verified:** visual E2E on all screens, real provider signed event with valid secret, live multi-merchant account mapping, full sign-up → data CRUD → provider capture → reconciliation → league integration journey, long-term security/load tests, production monitoring, or actual safe account deletion on a disposable test user.

## Findings — severity and next actions

### P0 — must resolve before real financial processing
1. **No real payment-provider activation.** Zero approved connections; webhook not configured with secret. The demo is not a bank integration.
2. **Two ledgers plus separate demo ledger.** Unify \`shop_entries\` and \`transactions\`, update League and payment review to derive from the same canonical event/ledger model; handle provider revisions and finance accuracy carefully.
3. **Verify merchant-provider mapping.** Provider \`account_id\` must genuinely correspond to the beneficiary shop. A shared platform merchant ID cannot be treated as a unique sub-merchant ID. Obtain authorised onboarding.
4. **Payment operations safety review.** Formal reconciliation of settlements, provider status transitions, refunds, reversals, late events, manual duplicates and webhook secret rotation is incomplete.
5. **Sensitive destruction.** Clearing shop data relies on a phrase and current session; add strong recent-auth requirement plus test restore, backup retention, consent and account deletion rehearsals.

### P1 — important functionality/reliability
6. Real Bazaar League only reads \`transactions\`; manual/provider \`shop_entries\` do not contribute.
7. Stock forecasting requires independently recorded item movements; ordinary cash/UPI sales do not decrement stock or forecast SKU demand.
8. Udhar and supplier contacts are not linked to payment-provider identities; automatic dues settlement needs explicit mapping/confirmation and exception handling.
9. Shop-data client loads full records in 500-row pages with a 5,000-record cap per group; blocking error rather than scalable server aggregates on larger shops.
10. No comprehensive end-to-end tests, API error recovery, observability, offline handling, suspicious-payment workflow or rate-limiting/abuse protection.
11. Self-reported geographic metadata risks incorrect league/procurement grouping; implement authoritative PIN verification and a trusted member review policy.
12. Audit events record action/time but not changed financial values; insufficient alone for robust reconciliation/dispute resolution.
13. Source/history migration drift: legacy Firebase/Drizzle/server paths remain in repository and may confuse future development.
14. Data export is browser-generated unencrypted JSON; privacy notices, encryption options, backup deletion and data portability review still needed.

### P2 — product/design quality
15. Language coverage is inconsistent: English/Hindi/Bengali on shell, but several advanced workflows are English-only.
16. Demo financial views use two independent sample datasets, leading to different totals when switching screens.
17. New advanced pages have not been checked with real kirana owners for readability, form length, keyboard support or screen-reader access.
18. Savings, AI coach, loan readiness and financial passport are honest educational placeholders, not the fully automated branded capabilities their names suggest.

## Database advisory notes

All 16 reviewed public tables have RLS enabled. The \`league_snapshots\` table has no direct user policy intentionally; it is accessed through a restricted RPC.

Supabase Security Advisor flags seven authenticated \`SECURITY DEFINER\` functions for manual review: clear records, confirm duplicate, disconnect provider, league ranking, group progress, stock activity and statement match. It also flags disabled leaked-password protection (currently the app uses Google login). Being a warning does not necessarily prove a vulnerability, but these privileged functions must be reviewed independently.

Performance Advisor identifies three foreign keys lacking covering indexes and four indexes currently unused. The unused-index findings may simply reflect an empty/new database. Do not delete indexes solely on that evidence.

## Recommended order

**Phase A — Truthful and trustworthy finances:** Unify the ledger; verified Razorpay onboarding; webhook test account; robust settlement reconciliation, retries and monitoring; secure account deletion/export.

**Phase B — Connect the automation:** Connect verified incoming/outgoing payments to one Hisaab, customer dues only with confirmed counterparty mapping, and item movements only with a linked POS/cart invoice.

**Phase C — Grow with real shops:** India Post region validation, optional League with enough peer participation, Mohalla Power with multiple authentic merchants, real demand backtesting.

**Phase D — Production release:** Accessibility and kirana-user testing, localization, offline/error recovery, rate limits, backups/restore, DPDP-compliant privacy operations, penetration testing, alerting, documented incident response and clean deployment.

## Overall audit verdict

**A strong hackathon/prototype foundation with several genuine backend mechanisms, not a fully automated production-ready fintech app.** The next milestone should be one end-to-end real merchant transaction that is captured through a supported authorised provider, reconciled once, visible in Daily Hisaab and reflected correctly everywhere else. Avoid piling on new branded features until that path is reliable.
