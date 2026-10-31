# Bazaar League 2.0 — Regional, fair, opt-in

## Implemented
- Four demo region scopes: exact six-digit PIN, city, district, and state.
- Two boards: Bazaar Stars (30-day recorded gross inflow) and Rising Stars (percentage growth versus the previous 30 days).
- Twenty-eight fictional kirana shops across Jaipur, Chomu, Udaipur and Jodhpur, with 5,880 synthetic payments and explicitly simulated previous-month baselines.
- Demo ranks respond to adding sample sales. All synthetic information stays in the browser; nothing is inserted into real merchant accounts.
- Regional breadcrumb, progress ranking, relative top-percentile, peer list and beginner-friendly privacy explanations.
- Improved Shop Settings with PIN, city, district and state.
- Private Supabase snapshots recomputed every 30 minutes, only for explicitly opted-in merchants.
- Authenticated public.get_bazaar_league(p_scope,p_mode) RPC returns only public pseudonym, position, peer count, optional growth percentage, region and refresh time.
- Peer monetary amounts, merchant IDs and raw transactions are withheld; SELECT privileges on raw snapshots are revoked for the authenticated role.
- API endpoints /api/league and /api/league/preferences now use Supabase.

## Tested
- TypeScript: npm run lint
- Vite production bundle: npm run build
- Dataset: 28 shops / 5880 synthetic transactions / unique transaction IDs
- Cohorts: 6 PIN / 12 city / 16 district / 28 state.
- Rank ordering in both modes and monotonic response to added sample sales.
- Database scheduled refresh active.
- Authenticated cannot SELECT raw snapshot; anon cannot EXECUTE ranking RPC.

## Important before production
- Geography is **self-declared**, not yet validated against the authoritative India Post PIN/post-office mapping. Import postal geo data and validate it server-side before promoting ranks as accurate.
- Bank/GST/transaction source authenticity has not been verified; never represent gross inflow as revenue, profit, lender score or credit-worthiness.
- Real leaderboard stays empty until enough actual merchants opt in and have transactions recorded on at least five distinct dates. Rising Stars also requires data in the previous 30-day period.
- Security linter intentionally notes that a restricted SECURITY DEFINER ranking RPC is callable by authenticated users; review the implementation and privileges before public deployment.
- Supabase account currently warns that leaked-password protection is disabled; address in Auth settings.
- No live authenticated browser journey, penetration audit, full accessibility audit, or deployment/monitoring testing has been performed.
- Do not invent competitors or use synthetic transactions in the production database.

## Product research
- PhonePe PulsePro, 30 July 2026 — hyperlocal aggregated geographic insights: https://www.phonepe.com/press/phonepe-launches-pulsepro-actionable-data-intelligence-for-indian-businesses/
- Vyapar merchant app — accounting, inventory and business reports: https://vyaparapp.in/blog/vyapar-app-features/
- Paytm for Business — payment monitoring and analytics: https://business.paytm.com/support/what-is-the-use-of-merchant-dashboard-
- India Post official PIN locator: https://www.indiapost.gov.in/locate-postoffice
- Government DIGIPIN/PIN geo-boundary initiative: https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=2131707
