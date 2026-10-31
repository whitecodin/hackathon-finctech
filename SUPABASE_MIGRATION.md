# Supabase migration — setup & status

## Verified
- npm install completed.
- TypeScript `npm run lint` passed.
- `npm run build` passed.
- Authentication state and Google OAuth moved to `@supabase/supabase-js`.
- No Firebase identity fallback in the new frontend AuthContext.
- Minimal API in `supabase-server.ts` validates the access token with Supabase Auth and scopes reads/writes by authenticated merchant.
- Basic row-level security policies in `supabase-schema.sql`.

## Configuration required (not yet done)
1. Create/connect a Supabase project (connect the Supabase plugin in ChatGPT if you'd like project changes handled directly).
2. Run `supabase-schema.sql` in the Supabase SQL Editor of a **fresh** project.
3. Enable Google provider in Supabase Authentication > Providers, and configure Google OAuth credentials there.
4. Set the allowed Site URL and redirect URL to `http://127.0.0.1:5173` for local development.
5. Copy `.env.example` to `.env.local`; enter **only** the Supabase project URL and publishable/anon key, with matching `SUPABASE_URL` and `SUPABASE_ANON_KEY` for the API. Do not use a service-role secret in the browser.
6. Restart Vite and run `npm run dev:api` in a second terminal.

## Important limitations
- No live Supabase project connection or credentials were provided; sign-in is not yet end-to-end verified.
- The old Firebase backend source remains in `server.ts`, but `npm start` now uses `supabase-server.ts`.
- Merchant League endpoints explicitly return HTTP 501 while migrating data/logic. The AI coach, passport signing and live voice are also not yet implemented on the new server.
- Existing PostgreSQL/Firebase data has **not** been migrated. Legacy demo data must not be silently claimed as real data.
- The new backend is intentionally minimal, not a complete production deployment. Review RLS and rate limits before adding real financial information.
- Performance improvement cannot be promised from a provider change alone; measure real sign-in and API latency after deployment.
