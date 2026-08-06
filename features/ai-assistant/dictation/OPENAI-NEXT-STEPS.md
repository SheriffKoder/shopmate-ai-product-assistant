/**
 * @file features/ai-assistant/dictation/OPENAI-NEXT-STEPS.md
 * OpenAI dictation follow-up plan.
 *
 * Purpose: Records the deferred work required to enable OpenAI transcription.
 * Used in: Future work after browser dictation has been validated.
 */

# OpenAI Dictation — Next Steps

Browser dictation is currently the active provider. OpenAI transcription is already prepared inside this isolated feature but is intentionally not enabled in the UI or through a route yet.

## Already available

- `hooks/use-openai-dictation.ts`
  - Requests microphone access.
  - Records audio through `MediaRecorder`.
  - Enforces the configured recording limit.
  - Releases microphone tracks on stop, error, and unmount.
- `client/transcribe-audio.ts`
  - Sends the recorded blob as multipart form data.
  - Expects `{ text, language? }` from the transcription route.
- `server/transcribe-audio.ts`
  - Keeps `OPENAI_API_KEY` server-side.
  - Calls OpenAI’s audio transcription endpoint.
  - Returns normalized transcript text.
- `model/dictation-config.ts`
  - Supports `provider: 'openai'`.
  - Supports the transcription endpoint and recording limit settings.

## Required next files

```text
features/ai-assistant/dictation/
└── schema/
    └── dictation-request-schema.ts  # Validate uploaded audio metadata

app/api/ai-assistant/
└── transcribe/route.ts              # Thin Next.js multipart route adapter
```

The route must stay outside the feature folder because Next.js discovers API routes under `app/api`. It should delegate immediately to `dictation/server/transcribe-audio.ts`.

## Implementation sequence

1. Add `schema/dictation-request-schema.ts` for file presence, MIME type, and request metadata validation.
2. Add `app/api/ai-assistant/transcribe/route.ts` with a `POST` handler.
3. Read `request.formData()` and validate the `file` field.
4. Pass the validated `File` and optional language to `transcribeAudioOnServer`.
5. Return `{ text }` on success and safe error messages on failure.
6. Set the provider through environment configuration:

   ```env
   NEXT_PUBLIC_AI_ASSISTANT_DICTATION_ENABLED=true
   NEXT_PUBLIC_AI_ASSISTANT_DICTATION_PROVIDER=openai
   NEXT_PUBLIC_AI_ASSISTANT_DICTATION_AUTO_SUBMIT=false
   NEXT_PUBLIC_AI_ASSISTANT_DICTATION_LANGUAGE=en-US
   NEXT_PUBLIC_AI_ASSISTANT_DICTATION_MAX_RECORDING_SECONDS=60
   OPENAI_API_KEY=server-only
   ```

7. Test manual review first, then test `autoSubmit=true`.
8. Confirm that the browser bundle contains no OpenAI API key.

## API route boundary

The route should only own HTTP concerns:

- multipart parsing;
- upload validation;
- language extraction;
- calling the isolated server use-case;
- normalized HTTP responses.

It must not own microphone state, prompt state, chat submission, message persistence, or product logic.

## Security and privacy

- Never use `NEXT_PUBLIC_OPENAI_API_KEY`.
- Never import the server transcription module into a client hook.
- Do not log raw audio or dictated text by default.
- Enforce a maximum recording duration and upload size.
- Return generic provider errors to the browser.
- Consider retention and privacy requirements before storing audio or transcripts.

## Future improvements

- Add a streaming OpenAI transcription provider for live partial text.
- Add product-name/key-term hints for catalog terms.
- Add Arabic language configuration such as `ar-EG`.
- Add retry and cancellation support for slow transcription requests.
- Add provider-specific usage and latency telemetry without recording user content.

