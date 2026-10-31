# Dukaan Saathi — Hindi speech and chat repair
**31 October 2026**

## Reported fault
On Brave, local Whisper-tiny speech recognition returned nonsense such as:
- "Okay, I can get all of the jambi in my voice."
- "So, you know, I've been in voice."
- "."
The page immediately submitted those unreviewed transcripts to the fixed in-app guide, which repeated the unhelpful phrase "I can guide you around VyaparTrust..." The app's generative Gemini key is **not configured**, so demo interactions intentionally use a small rule-based app guide rather than a full conversational model.

## Implemented fixes
- New `src/lib/voiceReview.ts`: checks voice activity, minimum sound level, silence and transcript quality. The error examples above and repeated-word hallucinations are flagged instead of treated as high-confidence requests.
- Hindi/Bengali on-device speech model upgraded from `onnx-community/whisper-tiny` to **`onnx-community/whisper-base` q8 multilingual**. English retains tiny for speed. The Hindi model first downloads around 75–80MB in quantized model weights, additional runtime resources, then caches in the browser. This uses more CPU and RAM.
- Whisper transcription and the browser's own speech-recognition results now go to an **editable "Did I hear you correctly?" card**. It displays uncertainty, and offers **Looks right — send**, **Record again**, and **Discard**.
- The previous bug that auto-submitted random transcribed speech directly to the assistant is gone.
- Repeat-word hallucinations are flagged. Noisy/silent audio is rejected before expensive model inference using PCM amplitude, voice-activity ratio and duration checks.
- The generic app-guide fallback no longer repeats a long list of feature names; it asks one specific clarifying question with examples.
- The original safety confirmation remains: even after a transcript is submitted, an expense or sale is first an editable draft, and never saved until the merchant explicitly confirms Save in Daily Hisaab.
- The speech recording is processed locally in the browser; model files are downloaded from Hugging Face on the first use. No recorded audio is sent to VyaparTrust backend.

## Honesty / limits
- This is NOT a fine-tuned Hindi voice model, nor does it guarantee transcript accuracy. Users must review words and financial values.
- Hindi speech recognition on a real mic was **not** verified by automated tests; full real-browser QA requires a person granting mic permission and speaking.
- The speech model is larger and can take longer on older PCs.
- Because Gemini API key is still not configured, guide mode cannot provide unlimited open-ended intelligent responses. For genuinely generative answers, the operator must configure a server-side key and validate it.
- Brave speech-service `[network]` is bypassed by on-device Whisper but model download still requires internet initially.

## Verification
- TypeScript and Vite production build: passed.
- Original example command tests: passed.
- Regression tests for 8 bad transcription phrases, 6 valid questions/commands, silence detection, speech detection, and clarification response: passed.
- `onnx-community/whisper-base` q8 weights downloaded successfully and local Hindi inference completed in a Node CPU smoke test. Silent audio **did hallucinate repeated tokens**, illustrating why the new voice-activity and transcript checks are necessary; Node isn't a real mic/browser test.
- Vite dev server serves new worker and chat UI at HTTP 200.

## Preview
`http://127.0.0.1:5173/?demo=1&view=ai-financial-coach`

After a hard refresh, tap Record Hindi, say a clear sentence for several seconds, tap Stop & transcribe, check the recognized words, correct anything mistaken, and then tap Send. Financial records always require separate confirmation.
