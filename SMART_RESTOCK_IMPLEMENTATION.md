# Smart Restock — Low-effort, merchant-personalized learning
Created 1 November 2026 · VyaparTrust prototype

## Problem
Owners cannot record every stock unit sold. For commonly replenished products, they can instead check in when a product **runs out** and when a **new batch arrives**, including the quantity received. This records periodic supply cycles without requiring an item-level POS.

## Implemented
- "Smart Restock" panel in My Stock: choose an item, one-click **Finished today** (with confirmation), or type "20" and **Save restock**. No per-sale entries required.
- Secure owner-only backend RPC: public.record_my_stock_checkpoint(stock_id,event_type,quantity), which atomically updates the stored quantity and appends an immutable checkpoint. A restock is also recorded in existing stock movements. Stock-out sets recorded quantity to zero; it does not create a fabricated sales entry.
- Owner-scoped table public.shop_stock_cycles with RLS, authenticated read only and no direct client INSERT/UPDATE/DELETE. Both events are processed through an authenticated owner-verified SECURITY DEFINER RPC. Stock items must belong to caller's merchant ID.
- Exports and shop clearing include these historical checkpoints. Account deletion cascades the table via its merchant and stock foreign keys.
- Personalized algorithm in src/lib/restockInsights.ts: requires **at least two completed restock→stock-out cycles** to estimate demand; rolling median of up to six completed batches, units/day = reported incoming quantity / elapsed days. For current open batch, estimate remaining amount as total received minus elapsed time × recent daily demand. Infer a possible stock-out date and suggest an order to cover the next 14 days plus a 2-day buffer.
- Until enough data exists, the app says it is learning, not a forecast. Shows prior update dates, confidence description, usage and caveats.
- Forecast page shows an additional low-effort Smart Restock estimate, separate from the optional 28-day item-level sales forecast.
- My Dukaan shows an in-app warning for learned items estimated to run out within three days (when shown through SimpleHome). There are no background push notifications.
- Dukaan Saathi accepts stock updates in Hindi/Hinglish, e.g. "आलू खत्म हो गए" and "20 किलो आलू आए". It **prepares a confirmation card**, then updates only after a click. It answers "आलू कब खत्म होंगे और कितना मंगाना है?" from the actual logged history rather than model-generated numbers. Existing voice transcription review happens before a command is submitted.
- Demo sample includes fictional multi-cycle histories for Atta, Cooking oil, and Aloo. It does not touch real merchants.

## Limits and honesty
- This is a transparent statistical adaptation, **not an LLM trained on merchant data**. Each shop's pattern is calculated separately without external AI API keys.
- A stock-out date alone shows how long the last batch lasted, but quantities received are needed for calculating units/day and recommended order size.
- Stock levels between check-ins are only estimates; manual quantity changes, unreported restocks, damage/wastage, promotions, holidays and seasonal shifts can make them wrong. No guarantee of exact run-out date or purchase quantity.
- Early forecasts after two cycles have high uncertainty; use real records from at least four cycles and manual checks to evaluate accuracy.
- No auto purchases, supplier payments, automatic stock deduction from UPI, actual push reminders, or guaranteed lead-time optimization.
- Merchant must create the important stock item at least once. Normal transaction input and old stock tracking remain available.
- The owner-scoped database was migrated, but the actual live authenticated browser + RPC workflow needs hands-on end-to-end testing. No financial data was manually changed for testing.

## Verification
- TypeScript lint & Vite build passed.
- .runtime/smart-restock-test.mjs covers median, two-cycle learning threshold, run-out timing, reorder amounts, incomplete observation, Hindi voice and assistant.
- Existing voice, finance and daily companion tests passed with current India-local date.
- Live Postgres: row-level security enabled, anonymous SELECT and INSERT false, authenticated SELECT true, direct INSERT false; RPC exists with security definer.

## Files
SMART_STOCK_CHECKPOINTS.sql
src/lib/restockInsights.ts
src/lib/stockVoice.ts
src/context/ShopContext.tsx
src/components/SmartRestockPanel.tsx
src/views/DailyCompanionView.tsx
src/views/DemandForecastView.tsx
src/views/SimpleHome.tsx
src/views/AIFinancialCoachView.tsx
src/lib/saathiGuide.ts
src/views/RecordsAndPrivacyView.tsx
src/desi.css

## Demo walkthrough
http://127.0.0.1:5173/?demo=1&view=stock
1. Select "Aloo" or "Atta" in Smart Restock. Look at estimates from fictional completed cycles.
2. Click "Finished today" (confirm) or input a restock quantity and save. Predictions update.
3. Open Forecast and check the separate Smart Restock estimate.
4. In Dukaan Saathi, type "20 kilo aloo aaye" and review its explicit save card.
5. In a real account, repeat on actual stock-out and supplier delivery days. More observed cycles personalize predictions.

## Personalization upgrade — 1 November 2026
- Adds lead-time-aware reorder dates and urgency, including an out-of-stock reminder after a confirmed stockout.
- Estimates a possible run-out window from variation across recent observed batch rates.
- With four or more complete cycles, cautiously blends recent demand into the median estimate, capped to avoid chasing one unusual batch.
- Allows per-item supplier delivery days, planning days and safety buffer; settings are saved per merchant **on this device** using browser localStorage, not cloud-synced.
- Provides one-click quantity filling from the forecast; recording a restock still requires explicit action. No automatic supplier orders or stock mutations.
- Home-screen restock alert now uses the configured supplier lead time.
- Regression tests: .runtime/personalized-restock-test.mjs and .runtime/smart-restock-test.mjs.
- An existing Vite server served updated modules successfully; full TypeScript lint/build cannot be asserted without a clean dependency installation (npm ci encountered a Windows locked file).
- Cannot infer weekday patterns or genuine seasonal effects reliably from sparse stockout-only data. No push notifications or background tracking were introduced.
