/**
 * @file features/ai-assistant/dictation/client/transcribe-audio.ts
 * Client adapter for the later Next.js transcription route.
 */

export interface TranscriptionResponse {
  text: string;
  language?: string;
}

export async function transcribeAudio(
  audio: Blob,
  endpoint: string,
  signal?: AbortSignal,
): Promise<TranscriptionResponse> {
  const formData = new FormData();
  formData.append('file', audio, 'dictation.webm');

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    signal,
  });

  if (!response.ok) {
    throw new Error('Audio transcription failed.');
  }

  return response.json() as Promise<TranscriptionResponse>;
}
