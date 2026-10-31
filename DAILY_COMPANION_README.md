# VyaparTrust — Daily Shop Companion (October 2026)

## Implemented in the actual Windows project
- Today: one-screen list of customer dues to follow up, near-term supplier payments and items to reorder; four direct actions.
- Daily Hisaab: manually enter cash/UPI/bank sales and expenses, see today's totals and recorded entries. These entries are **not bank-verified** and are **separate from imported transactions**.
- Udhar: customer and supplier contacts, amounts due, optional due date, partial settlement, copy-and-review reminders.
- Stock: manually track essential items and unit/quantity, trigger threshold-based low-stock reminders, copy purchase list for a supplier.
- Regular Customers: consent checkbox, remembered repeat-order lists, manual copy-and-review customer requests. No automatic WhatsApp messages or sharing.
- Regional Bazaar League remains accessible in More tools and has a separate demo, opt-in real merchant data and PIN/city/district/state scopes.
- Demo Mode has fictional customer/supplier/stock/cashbook records held only in browser memory; it cannot write them to live Supabase.
- A slim, Hindi-friendly, keyboard-accessible responsive UI; Book-opening khata button animations retained in the existing design.

## Database work
- public.shop_contacts, public.shop_dues, public.shop_stock, public.shop_entries.
- Each table has RLS, four owner-scoped policies, and only signed-in users have necessary CRUD grants.
- Supplier/customer dues link to contact records with a same-merchant composite foreign key.
- Deleting contacts is restricted while any dues are linked to them, preventing accidental removal of udhar history.
- A cross-user visibility check and authenticated write test were performed in transactions rolled back after testing.
- Anonymous REST access was rejected by the live API, while tables were present in PostgREST.

## Tests and security
- npm run lint (tsc --noEmit); npm run build (Vite).
- Automated pure dailyTasks logic tests (partial settlement, overdue, supplier bills, stock threshold, empty state).
- Supabase policy and constraint inspection; API HTTP checks.
- Real authenticated click-through/E2E browser tests, multiple-shop concurrency, mobile accessibility audit, backups/restores, banking reconciliation, incident response, export and data-deletion workflows still need further validation.

## Important limits
- No payment initiation or collection, bank statement syncing, automatic UPI reconciliation, GST filing, lending decisions or direct business guarantees.
- Seller-entered balances and stock may be incomplete; this is a recording aid, not a certified accounting or bank system.
- Reminder/order messages are never sent without human action; copy functionality requires the customer to have agreed for repeat-list use.
- Regional intelligence/group buying with real merchants requires critical-mass participation, validated PIN geography and privacy-reviewed aggregation; it has not been launched.
- Above 5,000 records in a section, the client currently displays a blocking error rather than silently using misleading truncated totals; server pagination/aggregations remain a scaling milestone.
- Production readiness requires real-user usability and security testing, audit logs for financial changes, authentication review, backups, privacy controls and operational monitoring.

## Local preview
Run `npm run dev` and `npm run dev:api` (portable Node is available under .runtime); preview http://127.0.0.1:5173/?demo=1&view=daily-hisaab
Other sample views: ?demo=1&view=udhar, ?demo=1&view=stock, ?demo=1&view=regulars
