# VyaparTrust — hardening status (31 October 2026)

## Source
Cloned from whitecodin/hackathon-finctech at `b7bd5eb817537683d6da7013925d07a21c626cc9`.
Original repository has not been modified.

## Changes applied locally
- Removed cross-tenant merchant fallback and added atomic merchant ownership constraint to transaction status updates.
- Added verified Firebase token requirement to selected merchant, transaction, coach, score, and passport issuance endpoints.
- Disabled unsafe PIN login and client-side fake authentication success.
- Stopped showing authenticated users as pre-seeded merchants by default.
- Added a frontend API client that automatically attaches Firebase ID tokens to protected requests.
- Restricted Firestore merchant reads by owner.
- Removed the fallback JWT signing secret and required explicit secret configuration.
- Disabled fake passport issuance/verification pending real signed credentials.
- Disabled unauthenticated realtime voice WebSocket pending proper session authorization.
- Marked local consent controls, financial scoring, and logs as demonstrative rather than verified.
- Replaced newly created merchant sample bank and credit numbers with unassessed/zero values.
- Documented required server environment variables.

## NOT complete / known risks
- Build, tests, and functional browser testing cannot currently run: local MCP process runner could not find Node.js executable.
- Original demo displays elsewhere may still contain stale fixed claims.
- Account Aggregator, GST, Udyam and lender integrations remain unimplemented.
- No true signed credential or zero-knowledge verification; those endpoints now explicitly return HTTP 501.
- No real consent lifecycle, revocation, deletion or durable privacy audit log.
- Voice WebSocket is disabled rather than secured.
- No proven rate limiting, abuse controls, CSRF protection strategy or production observability.
- No validated statistical/ML model or lender approval assurance.
- UI login and server integration need end-to-end testing.

## Next verification commands (when Node/Bun is installed)
```sh
npm install
npm run lint
npm run build
```

Configure JWT_SECRET (32+ characters), SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DB_NAME, Firebase credentials, and GEMINI_API_KEY only as required. Do not commit secrets.

## Release gate
Do not deploy with real personal or financial information without completing the remaining security work, provider integration testing, and independent review.
