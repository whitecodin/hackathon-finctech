# VyaparTrust Voice Saathi & Sidebar Polish — 31 October 2026

## What changed, in the existing Vite React project

### Sidebar
- "More" previously rendered whenever the current page was an extra route, even when `more` state was false. It therefore couldn't reliably collapse.
- Sidebar now renders extra links ONLY when `more` is true, preserves a collapsed disclosure even while on an extra page, auto-opens on navigation to a new extra page, and uses `aria-expanded`, `aria-controls`, and a smaller inner scroll list.
- Slimmer navigation rows, shorter brand/shop card, controlled overflow on short viewports.

### Dukaan Saathi: voice-first
- Added visible home CTA and Hindi-first microphone in the chat, with English and Bengali recognition language selectors.
- Tap microphone to start; tap Stop to finish. Browser asks for microphone permission. One utterance is transcribed and interpreted; no background or always-on listening.
- Uses browser `SpeechRecognition` / `webkitSpeechRecognition` and `speechSynthesis`. Browser/OS support is limited, especially Firefox/iOS; some browsers send audio to their external recognition service, so it's not offline/private-local STT. Typed commands always remain available.
- Optional read-aloud replies, with Hindi voice if the OS/browser actually provides one.
- No microphone recording stored by VyaparTrust.

### Speakable Hisaab drafts
- "aaj 2 kilo aalo beche h 240rs k" / "आज 2 किलो आलू बेचे हैं 240 रुपये के": creates a pending SALE draft (2kg aaloo, ₹240).
- "आज 200 रुपये खर्च हुए": creates a pending EXPENSE draft.
- "invoice banado": opens an empty printable receipt draft; follow-up "2 kilo aloo 240rs" fills details in the SAME draft.
- Payment method defaults to Cash but is editable; receipt makes no payment verification or GST tax-invoice claim.
- Every amount/item/quantity/payment method must be reviewed by user. **No DB insert until user clicks Save in Daily Hisaab**. That action calls existing `ShopContext.add('entries', ...)` under Supabase RLS and audit logging. No automatic stock deduction, debt settlement, tax invoice, bank transfer, or owner UPI access.
- Print is a browser print layout of **DRAFT SALE RECEIPT · NOT A GST TAX INVOICE**. It does not submit a tax invoice or alter a ledger.
- Spoken phrases mentioning yesterday/tomorrow deliberately do NOT create a today-dated transaction. Ambiguous missing price/invoice details stay incomplete.
- Synthetic demo writes only to in-memory shop state; the live database receives nothing from demo.

### Smarter answers
- Built-in no-key guide can answer expense totals in the current day, week and month, same for recorded sales; respond honestly to profit questions; report specific item stock; support invoice and voice how-tos.
- Does NOT "train" a model on users' data. The live AI endpoint requires configured `GEMINI_API_KEY` in Supabase Edge Function secrets, which was previously **not configured**. The typed and voice features work without that key via an on-device rule-based guide and command parser.
- Retry a server AI model after a 90-second cooldown after failures, instead of getting stuck forever in local-only guide mode.
- Still supports English/Hindi/Bengali replies and opt-in shop summary sharing for live AI.
- Voice input is transcription + deterministic parser, not a realtime Agora streaming LLM.

### Agora Quickstart evaluation
Reviewed via the connected GitHub app:
https://github.com/AgoraIO-Conversational-AI/agent-quickstart-nextjs
This example uses NEXT.JS App Router, Agora RTC+RTM session tokens, server invite/stop, managed STT→LLM→TTS and Agora credential setup. Replacing the current Vite app with a Next.js template to use it would require a framework migration and credentials, and is not necessary for this voice-command prototype. A later production voice upgrade can port verified RTC/RTM patterns and build a dedicated service endpoint after project, App ID and certificate provision; never put certificates in the browser.

## Verification
- `npm run lint` TypeScript, `npm run build`: pass
- `.runtime/voice-saathi-test.mjs`: 7 intent parsings, 5 reject cases, 8 shop-guide questions pass, no database writes
- `.runtime/saathi-test.mjs` and `.runtime/operations-test.mjs`: pass
- Local preview: http://127.0.0.1:5173/?demo=1&view=ai-financial-coach
- Browser microphone, Hindi TTS voice quality, mobile responsiveness, and real authenticated DB write need manual E2E device QA. No claim of universal browser microphone support or a working Agora deployment.
- A full official GST invoice engine (registered entity, GSTIN, tax rates, invoice sequencing, PDF archival) is not implemented.

## Changed/added files
- src/components/Sidebar.tsx
- src/desi.css
- src/lib/voiceCommands.ts
- src/lib/browserVoice.ts
- src/lib/saathiGuide.ts
- src/views/AIFinancialCoachView.tsx
- src/views/SimpleHome.tsx
- src/saathi.css
- .runtime/voice-saathi-test.mjs

## Privacy/security
All speech and LLM outputs are UNTRUSTED. Money can only be manually saved by direct click with checked fields. No voice command sends a payment, deletes data or approves financial products. Browser speech recognition may rely on a third-party engine; user must explicitly click microphone and grant browser permission. The model may still make mistakes; verify data and invoices.

Official speech docs: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
