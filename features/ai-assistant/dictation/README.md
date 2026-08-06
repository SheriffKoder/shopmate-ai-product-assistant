/**
 * @file features/ai-assistant/dictation/README.md
 * Isolated dictation feature wiring guide.
 */

# Assistant Dictation

This folder owns speech-to-text behavior for the reusable AI assistant. It supports two providers behind one contract:

- `browser`: the browser Web Speech API, with interim/final recognition events.
- `openai`: browser `MediaRecorder` audio sent to a later server route and transcribed with OpenAI.

The feature does not own prompt rendering, chat state, message persistence, ShopMate catalog behavior, or assistant API streaming.

## Folder structure

```text
dictation/
├── README.md
├── OPENAI-NEXT-STEPS.md          # Deferred OpenAI route, security, and rollout plan
├── client/
│   └── transcribe-audio.ts       # Calls the future multipart route
├── hooks/
│   ├── use-browser-dictation.ts  # Web Speech API lifecycle and transcript events
│   ├── use-dictation.ts          # Provider-neutral public hook
│   └── use-openai-dictation.ts   # MediaRecorder lifecycle and transcription request
├── lib/
│   ├── dictation-support.ts      # Capability and MIME-type detection
│   └── transcript.ts              # Pure append and auto-submit decisions
├── model/
│   └── dictation-config.ts       # Configuration and callback contracts
├── schema/
│   └── dictation-request-schema.ts # Reserved for route upload validation
└── server/
    └── transcribe-audio.ts       # Server-only OpenAI transcription use-case
```

The `schema/` file is intentionally deferred until the Next.js route is added. No route is created during the folder-first milestone.

## Public contract

UI wiring should import only:

```ts
import { useDictation } from '@/features/ai-assistant/dictation/hooks/use-dictation';
import type {
  AssistantDictationConfig,
  DictationCallbacks,
} from '@/features/ai-assistant/dictation/model/dictation-config';
```

The hook returns `isListening`, `isTranscribing`, `isSupported`, `error`, `start`, and `stop`. It receives the current prompt text, `setInput`, and the existing submit callback. Providers update the controlled prompt text; they do not submit automatically unless `autoSubmit` is enabled.

## Configuration

```env
NEXT_PUBLIC_AI_ASSISTANT_DICTATION_ENABLED=false
NEXT_PUBLIC_AI_ASSISTANT_DICTATION_PROVIDER=browser
NEXT_PUBLIC_AI_ASSISTANT_DICTATION_AUTO_SUBMIT=false
NEXT_PUBLIC_AI_ASSISTANT_DICTATION_LANGUAGE=en-US
NEXT_PUBLIC_AI_ASSISTANT_DICTATION_MAX_RECORDING_SECONDS=60
OPENAI_API_KEY=server-only
```

`OPENAI_API_KEY` must never be imported by client code or placed in a `NEXT_PUBLIC_` variable. OpenAI transcription is intentionally separated into `server/transcribe-audio.ts` and will be called by a thin route adapter later.

## Data flow

```text
Browser provider:
microphone → SpeechRecognition → finalized transcript → setInput → optional submit

OpenAI provider:
microphone → MediaRecorder → Blob → future /api/ai-assistant/transcribe route
→ server/transcribe-audio.ts → text → setInput → optional submit
```

Interim browser results are not appended to committed text, preventing duplicate words. OpenAI recording always releases microphone tracks after success, failure, stop, or unmount.

## Deferred outside wiring

The folder-first milestone must not touch outside files. Later integration may touch only:

- `features/ai-assistant/components/prompt-input.tsx`: render the microphone control and pass existing `input`, `setInput`, and `handleSubmit` callbacks. Add a nearby comment explaining this isolated integration.
- `features/ai-assistant/chat-container.tsx`: pass configuration only if needed by the assistant composition. Add a nearby comment explaining config injection.
- `features/ai-assistant/components/artifacts/components/artifact-panel-messages.tsx`: reuse dictation only if the artifact prompt should support it. Add a nearby comment explaining reuse.
- `app/api/ai-assistant/transcribe/route.ts`: required by Next.js route discovery; keep it a thin multipart adapter to `server/transcribe-audio.ts` and add a route-boundary comment.
- The existing environment example/documentation file: document public settings and the server-only key.

No dictation code should be added to `use-chat-submission.ts`; the existing controlled input contract is sufficient.
