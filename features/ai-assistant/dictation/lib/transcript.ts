/**
 * @file features/ai-assistant/dictation/lib/transcript.ts
 * Pure transcript reconciliation helpers.
 */

/**
 * Join new speech text to existing prompt text without accidental spacing.
 */
export function appendTranscript(input: string, transcript: string): string {
  const cleanTranscript = transcript.trim();
  if (!cleanTranscript) return input;
  return input.trim() ? `${input.trim()} ${cleanTranscript}` : cleanTranscript;
}

/**
 * Decide whether a finalized transcript should trigger automatic submission.
 */
export function shouldAutoSubmit(autoSubmit: boolean, transcript: string): boolean {
  return autoSubmit && Boolean(transcript.trim());
}
