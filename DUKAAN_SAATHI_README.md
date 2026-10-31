# Dukaan Saathi — VyaparTrust assistant
**31 October 2026**

## What was built
- Replaces the old three-button static \`AIFinancialCoachView\` with a responsive, keyboard-friendly chat interface matching the desi bahi-khata design.
- Access through **More tools → Ask for Help**, the homepage help action, and a small **Ask Saathi** shortcut in the header of other pages.
- English, Hindi, and Bengali prompts/guide replies. Enter sends, Shift+Enter adds a line; messages are kept only in React component state and cleared when leaving/reloading. No saved transcripts.
- Six starter questions; app-page buttons beside relevant replies.
- Built-in deterministic guide is always available, including in fictional demo mode. It covers: My Dukaan, Daily Hisaab, Udhar/suppliers, stock, forecasts, Auto Hisaab, payment CSV reconciliation, Bazaar League, Mohalla Power, regular customers, audit history, settings, data export/deletion, savings, loan guide and Financial Passport.
- Guide can calculate today's amounts, udhar remaining and current low-stock items from the already loaded shop record snapshot. Matched manual-provider duplicates are excluded. This is local code, **not a generative model**, and all numeric totals are merchant-entered/unverified.
- Supabase Edge Function \`vyapartrust-saathi\` (deployed) integrates with Google Gemini via \`GEMINI_API_KEY\`, and can answer natural-language app questions with a very small, current, merchant-owned summary if the user checks the optional privacy consent box.
- Backend authenticates bearer tokens using Supabase Auth, queries only that user-owned merchant, enforces strict 8/minute and 60/day limits per merchant, caps input/output/history, and returns only text plus allowlisted navigation route.
- No LLM tools or database writes are exposed. The assistant cannot send money, modify expenses/dues, access competitor private financial records or delete an account. It cannot directly grant a loan.
- Personal-data toggle defaults OFF. When ON, the model can see summary money in/out, due totals, limited item names/quantities, general counts and connection statuses; no contact phone numbers, financial credentials, full raw transactions, or competitor details.
- Prompts/chat messages are sent to Gemini when live chat is enabled regardless of the summary toggle. Do not type OTP, PIN, passwords or personal account numbers.
- Usage-counter tables contain only per-merchant request counts and time buckets; their records are included in user data export and shop deletion.

## ACTUAL LIVE STATUS
**The deployed function exists, but live Gemini AI is NOT configured.** A safe probe returned \`503 ai_not_configured\` on 31 Oct 2026. Therefore normal and demo users get the built-in app-guide answers, not generative replies, until the platform operator configures the server-side key.
Never claim the model has been fine-tuned or trained on merchant data. This is prompt/knowledge grounded guidance with optional limited factual context, not model training.

## Activate the model securely (platform operator)
1. Obtain an authorised Gemini API key from Google AI Studio / your organisation's Google Cloud billing system. Choose a model available to the API key and region.
2. In Supabase project \`htrugaagenwugpzvnxkj\`, open **Edge Functions → Secrets**. Create the secret **\`GEMINI_API_KEY\`** with the value; **never place it in Vite \`VITE_*\` variables, frontend files, Git, logs or user messages**.
3. Optional secret \`VYAPARTRUST_AI_MODEL\` (default \`gemini-2.5-flash\`). Configure \`VYAPARTRUST_PUBLIC_ORIGIN\` for the production website.
4. The function uses \`https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent\` with the key only on Supabase servers.
5. Sign into a disposable test merchant account, ask "What can VyaparTrust do?", then opt-in to summary sharing, add test transactions, and verify accurately grounded answers. Test Hindi/Bengali, error/429 fallback, prompt-injection attempts, failure recovery, latency and billing.
6. Add monitoring, model-provider data-retention policy review, real-user usability and security reviews before production.

## Test results
- \`npm run lint\`: passes.
- \`npm run build\`: passes.
- \`.runtime/saathi-test.mjs\`: passed eight sample checks on routing, account amounts, matched provider duplicates, Hindi/Bengali, product and feature guidance.
- Live Edge HTTP unauthenticated request -> 401, invalid bearer request -> 401 (after auth-first change).
- Local frontend / \`src/views/AIFinancialCoachView.tsx\` served HTTP 200.
- No valid authenticated, key-configured Gemini generation was possible without the owner's server-side secret; it has not been tested.
- No real customer data or financial records were modified.

## Source files
- \`src/views/AIFinancialCoachView.tsx\`: chat interface.
- \`src/lib/saathiGuide.ts\`: safe, deterministic fallback and feature knowledge.
- \`src/saathi.css\`: responsive desi styling.
- \`src/components/Header.tsx\` and \`src/App.tsx\`: contextual shortcuts and routing.
- \`supabase/functions/vyapartrust-saathi/index.ts\`: authenticated, server-side Gemini connector.
- \`SHOP_AI_USAGE.sql\`, \`SHOP_AI_EXPORT.sql\`, \`SHOP_AI_DATA_CLEAR.sql\`: quotas, export, deletion.

## Honest limitations
- Prompts and response instructions do not guarantee 100% perfect scope control; output is text-only with a validated navigation target, never authorised actions.
- The assistant cannot see updated bank activity from external personal UPI apps, nor know individual purchased items without POS data. It cannot replace an accountant, certified tax professional, lender or bank support.
- Real Bazaar League still relies on older \`transactions\`, separate from Auto Hisaab's \`shop_entries\`; the assistant explains this rather than inventing seamless integration.
- Customer-level debtors' names are not sent to the AI, so it gives totals and links to Udhar.
- Data in demo is fictional and may use separate demo source models.
- No persistent cross-device chat history, voice assistant, advanced tool-calling, document ingestion, retrieval database, custom model fine-tuning, or mobile push alerts yet.

## Demo
\`http://127.0.0.1:5173/?demo=1&view=ai-financial-coach\`

## Official references
- https://ai.google.dev/api/generate-content
- https://ai.google.dev/gemini-api/docs/generate-content/structured-output
- https://supabase.com/docs/guides/functions/auth
- https://supabase.com/docs/guides/functions/secrets
