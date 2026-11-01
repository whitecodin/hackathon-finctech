# Deploy VyaparTrust on Vercel

Deploy the `main` branch of `whitecodin/hackathon-finctech`. This includes the
November 1 personalized Smart Restock update. Use the repository root, not `src`.

## Import and configure

1. In Vercel, choose **Add New → Project**, then import `whitecodin/hackathon-finctech`.
2. Use project name `vyapartrust` (or another available name), **Vite** framework,
   root directory `./`, **Node.js 24.x**, build command `npm run build`, output
   directory `dist`, and install command `npm ci`.
3. Add these environment variables to **Production** and **Preview** before building:

   | Variable | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | Supabase project URL, same as the working local `.env.local` |
   | `VITE_SUPABASE_ANON_KEY` | Supabase public anon key, same as the working local `.env.local` |

   The API falls back to these same variables. Optional server equivalents are
   `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Never use a service-role key in a `VITE_`
   variable. The current app does not need Firebase, database connection strings,
   or a Gemini key to run its implemented merchant/demo flows.
4. Click **Deploy**. Confirm that the deployed source branch is `main` and its
   latest commit includes the Vercel deployment setup.

## Allow Google login on the deployed domain

5. Copy the final URL, such as `https://vyapartrust.vercel.app`.
6. In the existing Supabase project, open **Authentication → URL Configuration**.
   Set **Site URL** to the production URL and add that exact origin to the
   **Redirect URLs** allowlist. Keep any local development redirects you still use.
   Add preview origins individually if you need preview login.
7. Keep the existing Google provider configured. Its Google OAuth authorized
   redirect URI is the Supabase Auth callback
   `https://<project-ref>.supabase.co/auth/v1/callback`, not the Vercel homepage.
8. If you added or changed Vercel environment variables after deployment, redeploy;
   the `VITE_` values are embedded during the build.

## Verify after deployment

9. Open `/api/health` on your deployed domain. It should return JSON containing
   `status: "online"`, `backend: "supabase"`, and `database: "not_checked"`.
   This checks the API handler, not database connectivity.
10. Open the homepage and enter the fictional demo. Check My Dukaan, Daily Hisaab,
    Udhar, Stock, Smart Restock, and Bazaar League. Refresh and check the page loads.
11. Sign in with Google. Check your existing shop loads, then use a clearly named
    disposable record to verify saving and loading in Daily Hisaab/Stock. Do not
    clear shop data or delete the account as a deployment test.
12. If the app loads but data fails, check Supabase and browser errors. Existing
    SQL migrations and Edge Functions remain in Supabase; deploying the frontend
    does not install them. Do not rerun data-clear SQL files.

## Architecture and known limits

`vercel.json` explicitly selects Vite, serves the built `dist` assets, sends
`/api/*` to `api/index.ts`, and falls back to the SPA for other paths. The API
exports the current Supabase Express app without opening a port. `npm start` /
`npm run dev:api` start its local listener. The older root `server.ts` is legacy
Firebase/Drizzle code and is not the API used by this deployment.

This is a merchant prototype/demo, not a fully integrated banking product.
The existing backend intentionally returns 501 for AI chat/live-talk and verified
financial-passport issuance/verification. Provider webhooks need separate approved
provider connections and Supabase secrets. Google login and authenticated data
writes must be tested on the deployed domain; a successful build alone does not
prove these flows work. See `FULL_PROJECT_AUDIT_2026-10-31.md` for wider limitations.

## Local verification (November 1, 2026)

- `npm test`: six passing test files covering API health/access controls, daily
  balances, reconciliation/CSV validation, demo league rankings, stock cycles,
  Hindi stock commands, and personalized restock estimates.
- `npm run lint` and `npm run build`: passed.
- `npm ci --dry-run --ignore-scripts`: lockfile/install plan passed; this is not
  a fresh dependency installation.
- Built frontend opened in a browser: sample-shop dashboard and personalized
  Smart Restock page loaded with expected records and estimates.
- Live Google OAuth, authenticated Supabase writes, and Vercel-hosted routing
  were not exercised. Complete the post-deployment checks above.
- Run the tests with Node.js 24.x (native TypeScript support).

Official references:
- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/project-configuration/vercel-json
- https://supabase.com/docs/guides/auth/redirect-urls
