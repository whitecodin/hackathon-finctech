# Dukaan Saathi — Microphone Repair (31 October 2026)

## Root cause investigation
- The Windows desktop defaults to **Brave** (HTTP handler `BraveHTML`), while Windows reports two healthy recording devices: `Microphone (USB Audio)` and `Microphone Array (Realtek(R) Audio)`.
- Brave has a documented Web Speech API implementation/service compatibility problem. Its JavaScript `SpeechRecognition` constructor may exist even when the backend cannot accept audio or produce transcripts. Microphone access and speech recognition are **different** checks.
- Microsoft Edge is installed on this desktop.

## Changes applied
- New speech engine diagnostic codes for `not-allowed`, `service-not-allowed`, `audio-capture`, `network`, `no-speech`, `language-not-supported`, synchronous errors, and unsupported browser.
- Hindi/English/Bengali explanations with concrete resolution steps rather than generic "Microphone could not start".
- Dedicated **Test microphone** permission and device check using browser `navigator.mediaDevices.getUserMedia({audio:true,video:false})`; captures are stopped immediately and not stored.
- Explicit Brave compatibility notice, **Copy link for Edge**, and a **Windows dictation (Win + H)** fallback that focuses the input box.
- Timeout when a speech recognizer never starts, and a second timeout when it appears to listen but produces no result. Avoids indefinite "Listening…" in browsers with broken backends.
- More robust recognition lifecycle: start / audio start / result / error / end / user cancellation, with cleanup and no duplicate active listener.
- No change to financial data security: recognized transactions remain review-before-save.

## Test results
- `npm run lint` and `npm run build`: passed.
- `.runtime/microphone-diagnostics-test.mjs`: 11 error scenarios x 3 explanation languages, non-browser safety: passed.
- `.runtime/voice-saathi-test.mjs`: 7 draft interpretations, 5 rejections, 8 guide replies: passed.
- Windows devices detected, Edge installed. **Live spoken Hindi recognition could not be verified automatically**, because actual user microphone permission and a spoken utterance are required. Test it inside Edge manually.

## How to verify
1. Open `http://127.0.0.1:5173/?demo=1&view=ai-financial-coach` **in Microsoft Edge**, not Brave.
2. Click **Test microphone**. Select Allow when prompted and confirm that it says microphone test passed.
3. Click **Speak in Hindi** (हिंदी language selector); say `आज 2 किलो आलू 240 रुपये के बेचे`.
4. Review the draft, then click Save in Daily Hisaab for the fictional demo. No real financial data is written in Demo Bazaar.
5. If recognition still fails, read the new specific bracketed error code. Try Microsoft Edge site mic permissions, Windows Settings -> Privacy & security -> Microphone, and select the correct microphone in Sound.
6. If speech recognition remains unavailable, click **Windows dictation (Win + H)**, press Win+H and dictate into the focused question box, then Send. Windows dictation language availability depends on Windows configuration.

## Official supporting information
- https://github.com/brave/brave-browser/issues/3725
- https://github.com/brave/brave-browser/issues/55259
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionErrorEvent/error
- https://support.google.com/chrome/answer/2693767
