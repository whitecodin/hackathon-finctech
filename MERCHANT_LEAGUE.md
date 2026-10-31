# Merchant League — feature implementation

## What was added
- New Merchant League dashboard in the React navigation.
- Local (same 6-digit PIN) and city (same location suffix) ranking views.
- Opt-in participation with public nickname; leave at any time.
- Category matched comparisons, 30-day average daily recorded gross inflow metric.
- Leaderboard withheld until at least five participating stores qualify.
- Backend authenticated read/write endpoints and database migration.

## Setup (required)
1. Run `merchant_league_migration.sql` against the application's PostgreSQL database.
2. Ensure JWT_SECRET and Firebase credentials are configured and existing merchant sessions work.
3. Run `npm install && npm run lint && npm run build`.
4. Manually test with at least five test merchants, including different categories and postal codes.
5. Review transaction classifications: an inflow is not necessarily a sale (refunds/transfers can contaminate gross).
6. Before real rollout, use verified sales data and consent records, standardized location IDs, fraud-resistant ingestion, reporting windows, eligibility rules, cohort privacy and audit logs.

## Data privacy
- Only opted-in merchants appear.
- Public nickname, exact leaderboard rank and gross average are disclosed to participating merchants.
- Leaderboards are withheld under a five-store cohort; this is only a basic minimum threshold.
- No transaction descriptions or account identifiers are returned by these routes.
- These are competitive benchmarks, NOT lender credit scores, fraud-risk or validated profitability.

## Known limitations
- PostgreSQL migration not executed or verified.
- Node.js was unavailable to the local MCP runner; no compile or runtime tests completed.
- City is currently parsed from merchant location text; standardized city IDs recommended.
- The metric is transaction *inflow*, not independently verified gross revenue and not net profit.
- Today's endpoint computes rolling 30 days, not frozen monthly seasons.
- The feature depends on actual opted-in shops. It does not generate fake leaderboard merchants.
- Application overall remains a non-production fintech prototype.
