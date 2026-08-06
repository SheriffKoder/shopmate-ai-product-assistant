/**
 * @file features/ai-assistant/dictation/server/transcribe-audio.ts
 * OpenAI transcription server use-case.
 *
 * Purpose: Keeps the OpenAI credential and provider request server-side.
 * Used in: The later Next.js multipart route adapter.
 */

export interface ServerTranscriptionResult {
  text: string;
}

/**
 * Transcribe an uploaded audio file with OpenAI's audio transcription endpoint.
 *
 * @param audio - Validated audio file received by the route adapter.
 * @param language - Optional ISO-639-1 language hint.
 */
export async function transcribeAudioOnServer(
  audio: File,
  language?: string,
): Promise<ServerTranscriptionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.');

  const formData = new FormData();
  formData.append('file', audio, audio.name || 'dictation.webm');
  formData.append('model', 'gpt-4o-mini-transcribe');
  if (language) formData.append('language', language.slice(0, 2));

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) throw new Error('OpenAI transcription request failed.');
  const result = (await response.json()) as { text?: unknown };
  if (typeof result.text !== 'string') throw new Error('OpenAI returned no transcript.');

  return { text: result.text };
}
