# Brave Voice [network] Error — On-Device Whisper Fallback (31 Oct 2026)

## Report
Browser Brave reported:
- `Brave detected: it may block speech recognition even with a working microphone`
- `[network]` from `webkitSpeechRecognition`

Cause: Brave exposes parts of the Web Speech API but the online recognition backend can be unavailable. Hardware microphone access does NOT ensure the browser speech service works. This is not solved reliably by clearing browser permissions or retrying Web Speech.

## Applied fix
- Added `@huggingface/transformers` and a **local Whisper multilingual transcription worker** (model `onnx-community/whisper-tiny`, quantized q8, WASM).
- Brave defaults to `Private on-device Whisper`. It no longer calls Brave's `SpeechRecognition` service when this mode is selected.
- User presses **Record Hindi**, speaks up to 15 seconds, then presses **Stop & transcribe**. The microphone is acquired via `getUserMedia`, audio is recorded in memory by `MediaRecorder`, decoded to mono 16kHz PCM, and passed by transfer to a local Web Worker.
- Worker downloads and caches open-source model weights from Hugging Face on first use; after the model is loaded, inference runs on the browser device. Audio samples aren't sent to the VyaparTrust backend, Gemini or Hugging Face during this transcription flow.
- The resulting text goes to Saathi's existing Hindi/Hinglish command parser. For example `आज 2 किलो आलू 240 रुपये के बेचे` makes a draft, **not** an immediate financial transaction. Owner must check and press Save in Daily Hisaab.
- First-use download requires internet access to Hugging Face; model weighs about 40MB plus browser runtime assets (~27MB). CPU inference may take time, especially on lower-end devices. The model may mishear Hindi words; edit the recognized text or the draft.
- Error recovery: 210-second model load/inference timeout, clear error text; if Web Speech fails with `network` or `service-not-allowed`, switch to local Whisper for subsequent taps.
- A microphone test and Windows Win + H typed-dictation fallback remain in the page. Non-Brave browsers can enable local mode manually; default mode in supported browsers may still use the browser's speech provider.
- No continuous listening or automatic background microphone access.

## Verification
- `npm run lint` and `npm run build`: success after addition.
- On Windows PC: request to Hugging Face model config and quantized model component HEAD returned HTTP 200.
- Node-only inference smoke test using the same `onnx-community/whisper-tiny` and q8 weights reached `Whisper pipeline initialized` and `Worker-compatible inference completed`. Note: Node uses `device:'cpu'`, browser worker uses `device:'wasm'`.
- Client worker and code served by Vite HTTP 200.
- Actual spoken Hindi microphone session in Brave still requires user permission and a real utterance. No visual/mic E2E certification.

## How to try
1. Hard refresh `http://127.0.0.1:5173/?demo=1&view=ai-financial-coach` in **Brave**.
2. Leave **Private on-device Whisper** checked.
3. Tap **Record Hindi / हिंदी बोलें**, grant microphone permission if asked, then speak e.g. `आज दो किलो आलू दो सौ चालीस रुपये में बेचे`.
4. Tap **Stop & transcribe / लिखें**, and allow the initial model download. The page displays download/progress status, then recognized text.
5. Verify the draft's quantity and rupee amount before saving. Demo data is fictional.

If model download fails, check `huggingface.co` connectivity; if CPU inference is too slow, test Edge or Chrome's built-in speech recognition as an alternative. For accessibility, typed entry and Windows Win + H are always available.

## Files
- `src/lib/localWhisper.ts`
- `src/workers/whisper.worker.ts`
- `src/views/AIFinancialCoachView.tsx`
- `src/saathi.css`
- `package.json`, lockfile

## Resources
- https://huggingface.co/onnx-community/whisper-tiny
- https://github.com/brave/brave-browser/issues/55259
- https://github.com/brave/brave-browser/issues/56487
