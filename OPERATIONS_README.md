# VyaparTrust Operations Suite — 31 October 2026

## Built and wired into the running Windows application

### 1. Payment reconciliation (Match Payments)
- Merchant-selected CSV import with a strict template (Date,Direction,Amount,Reference,Description), ISO dates, credit/debit, 500-row/1 MB file limit.
- Deterministic SHA-256 row fingerprint for repeat-import detection; server unique key prevents duplicates of the same fingerprint.
- Match candidates from manually recorded UPI or Bank Hisaab entries: exact amount, matching direction, within two calendar days.
- **Never auto-approve.** Merchant explicitly confirms each link; database function locks and verifies ownership, amount, direction, eligible payment method, date and one-to-one uniqueness.
- Statement uploads are NOT bank-verified; no automatic bank/UPI provider API connection.
- Opening path: More tools -> Match Payments, or from Daily Hisaab.

### 2. Sales-pattern forecast (Sales Forecast)
- Item-specific sale/restock history recorded with a transaction-safe Supabase RPC that updates inventory and creates movement history together.
- On the last 28 days of actually recorded sales, computes seven-day expected demand using a transparent moving average, alongside historical four-week min/max.
- Requires sales on at least 14 distinct days and >=10 units in the window before reporting a projection. No synthetic prediction is shown for missing real data.
- Provides a suggested replenishment quantity using current recorded stock and the owner-defined reorder threshold.
- Does NOT guarantee demand, recognize holidays, external events, unrecorded stockouts, or supplier delivery schedules.
- Opening path: More tools -> Sales Forecast, or from My Stock.

### 3. Mohalla Power (group quantity requests)
- Participation and quantity pledges are voluntary. Campaigns shown only to authenticated merchants in the same self-reported city/state or their own campaigns.
- Individual pledges visible only to the shop making them. Aggregate participants and quantity are hidden unless >=5 distinct shops join.
- Member can join, change or withdraw quantity. An anonymous supplier enquiry can be copied **only after five join**.
- No ordering, payments, retail-price coordination, customer data sharing, delivery contract or supplier contract is implemented.
- Region is self-declared until authoritative PIN verification is added.
- Opening path: More tools -> Mohalla Power, or from My Stock.

### 4. Audit history
- Database AFTER INSERT/UPDATE/DELETE triggers log table, record ID, actor, action and time without copying customer data or all before/after financial values.
- Clients have SELECT only on audit rows for their own merchant. No direct client insert/update/delete grants.
- Latest 150 shown in UI; export includes full available history. After comprehensive user deletion audit history is erased as part of app data.
- Cascaded account deletion safely suppresses orphan audit inserts.
- Opening path: More tools -> Activity History.

### 5. Export, shop-data erase, account erase
- Export paginates through owned merchant records, account profile, contacts, debts, Hisaab, stock, item movements, uploaded statements, user transaction records, procurement, league preferences and audit, saving a JSON copy to the user's own browser. It fails rather than producing silently truncated results for >100k rows per table.
- Clear shop data requires typing **DELETE MY SHOP DATA**, a separate browser confirmation and an authenticated SQL function. Shop profile and login remain. Do not invoke this function during tests with a valid phrase unless in an isolated disposable test database.
- Permanently delete account requires typing **DELETE MY ACCOUNT**, second browser confirmation and fresh sign-in within 15 minutes; deployed Edge Function validates the user's bearer token through Supabase Auth and invokes Auth Admin deletion. The merchant-to-auth cascade removes business records in the same database transaction.
- Tested unauthenticated/malformed bearer requests -> HTTP 401. Live account deletion was **not** executed on the user's account.
- Exported files are unencrypted JSON; users must store them securely.
- Data not necessarily removed by controls: external messages, independently stored third-party copies, infrastructure backups/logs under retention policy.

## Database migrations
- OPERATIONS_V1.sql
- OPERATIONS_AUDIT_CASCADE_FIX.sql
- OPERATIONS_DATA_CLEAR.sql
- OPERATIONS_PLEDGE_SECURITY_FIX.sql
- OPERATIONS_CAMPAIGN_OWNER_READ_FIX.sql
- OPERATIONS_AUDIT_COVERAGE.sql — adds audit triggers for merchant profile changes, transaction records and Bazaar League preferences.\n- Supabase Edge Function source: supabase/functions/delete-my-vyapartrust-account/index.ts

## Tests performed
- TypeScript: npm run lint
- Frontend: npm run build (Vite)
- Pure JS tests: .runtime/operations-test.mjs (valid/invalid CSV, strict matching, 7-day history prediction, insufficient-history refusal).
- SQL in ROLLBACK transaction: audit trigger creation, exact payment match, stock movement atomicity, cross-user RLS rejection.
- SQL in ROLLBACK transaction: Mohalla aggregate privacy until five shops, unrelated user unable to read campaign.
- HTTP: local webapp and API returned 200; Edge account deletion without valid bearer returned 401.
- Security advisor: restricted authenticated SECURITY DEFINER RPCs flagged for manual review (intentional, ownership-scoped); leaked-password protection disabled at Supabase Auth; protected league_snapshots table has RLS enabled and no direct-reading policy.

## Production gaps (do not claim bank/compliance certification)
- No approved bank/UPI provider credentials or account aggregator integration. CSV is shopkeeper-uploaded data, not proof of settlement.
- Forecast quality needs measured calibration on real POS item-level history; sparse sales data and stockouts can bias it. No machine-learning model trained.
- No supplier platform, procurement commitments, wholesaler quotes, payment/fulfillment or market supervision.
- Self-reported city/state needs validation against authoritative postal geography; anti-spam, rate limiting and abuse moderation are required before a public multi-merchant rollout.
- Auth fresh-login and permanent-delete flow needs safe full E2E test against a disposable real account, external-backup retention plan, restore verification, data portability review and DPDP privacy/legal review.
- No full multi-user browser/phone accessibility test or penetration test, or automatic monitoring for production.
- Supabase security lint should be reviewed and leaked-password protection enabled if password auth is used.
- Set VYAPARTRUST_PUBLIC_ORIGIN in Edge Function environment when deploying to a public domain.
- No transactional email/SMS/WhatsApp messages are automatically sent.

## Demo links
- http://127.0.0.1:5173/?demo=1&view=reconciliation
- http://127.0.0.1:5173/?demo=1&view=forecast
- http://127.0.0.1:5173/?demo=1&view=mohalla-power
- http://127.0.0.1:5173/?demo=1&view=audit-history
- http://127.0.0.1:5173/?demo=1&view=data-controls

## Public references used
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Auth user removal: https://supabase.com/docs/guides/auth/managing-user-data
- Supabase Function Authentication: https://supabase.com/docs/guides/functions/auth
- India DPDP Rules 2025: https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa
