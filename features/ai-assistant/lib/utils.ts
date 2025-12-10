/**
 * Utility Functions
 * 
 * Purpose: Reusable utility functions for AI Assistant
 * allows to not duplicate extraction logic
 * Used in: API routes, agents, and other modules
 * Why: Centralizes common logic and reduces code duplication
 */

import type { UIMessage } from 'ai';

/**
 * Extract the text content from a UIMessage part
 * 
 * @param part - Message part to extract text from
 * @returns Text content if part is a text part, empty string otherwise
 */
function extractTextFromPart(part: any): string {
  if (part?.type === 'text' && typeof part.text === 'string') {
    return part.text;
  }
  return '';
}

/**
 * Extract all text parts from a UIMessage
 * 
 * @param message - UIMessage to extract text from
 * @returns Array of text strings from all text parts
 */
function extractTextParts(message: UIMessage): string[] {
  if (!message.parts || !Array.isArray(message.parts)) {
    return [];
  }
  
  return message.parts
    .filter((p: any) => p.type === 'text')
    .map((p: any) => extractTextFromPart(p))
    .filter((text: string) => text.length > 0);
}

/**
 * Extract user query from the last message in the messages array
 * This is the primary function used for query classification
 * 
 * @param messages - Array of UIMessages
 * @returns Extracted query string from the last user message, or empty string if not found
 * 
 * @example
 * ```typescript
 * const query = extractUserQuery(messages);
 * if (!query) {
 *   // Handle empty query
 * }
 * ```
 */
export function extractUserQuery(messages: UIMessage[]): string {
  if (!messages || messages.length === 0) {
    return '';
  }

  // Get the last message
  const lastMessage = messages[messages.length - 1];
  
  if (!lastMessage) {
    return '';
  }

  // Extract all text parts and join them
  const textParts = extractTextParts(lastMessage);
  
  return textParts.join('') || '';
}
/**
 * Get the last user message from a messages array
 * 
 * @param messages - Array of UIMessages
 * @returns The last message with role 'user', or undefined if not found
 */
export function getLastUserMessage(messages: UIMessage[]): UIMessage | undefined {
  if (!messages || messages.length === 0) {
    return undefined;
  }

  // Find last user message (searching backwards)
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === 'user') {
      return messages[i];
    }
  }

  return undefined;
}

/**
 * Check if a message is a user message
 * 
 * @param message - UIMessage to check
 * @returns True if message role is 'user'
 */
export function isUserMessage(message: UIMessage): boolean {
  return message?.role === 'user';
}

/**
 * Check if a message is an assistant message
 * 
 * @param message - UIMessage to check
 * @returns True if message role is 'assistant'
 */
export function isAssistantMessage(message: UIMessage): boolean {
  return message?.role === 'assistant';
}

/**
 * Get all text content from a message
 * Combines all text parts into a single string
 * 
 * @param message - UIMessage to extract text from
 * @returns Combined text content from all text parts
 */
export function getMessageText(message: UIMessage): string {
  const textParts = extractTextParts(message);
  return textParts.join('') || '';
}

/**
 * Validate that messages array is not empty
 * 
 * @param messages - Array of UIMessages to validate
 * @returns True if messages array has at least one message
 */
export function hasMessages(messages: UIMessage[] | undefined | null): boolean {
  return Array.isArray(messages) && messages.length > 0;
}

/**
 * Validate that messages array has at least one user message
 * 
 * @param messages - Array of UIMessages to validate
 * @returns True if messages array has at least one user message
 */
export function hasUserMessage(messages: UIMessage[] | undefined | null): boolean {
  if (!hasMessages(messages)) {
    return false;
  }
  
  return messages!.some(msg => isUserMessage(msg));
}

// FUTURE IMPLEMENTATION: Add more utilities as needed
// - Message validation utilities (when message schema is stricter)
// - Message filtering utilities (when we need to filter by type, date, etc.)
// - Message transformation utilities (when we need to transform messages for different purposes)
// - Message comparison utilities (when we need to compare messages)


export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Extract chat title from a message
 * Used to generate chat titles from the first user message
 * 
 * @param message - UIMessage to extract title from
 * @returns Title string (max 50 characters) or 'New Chat' if no text found
 * 
 * @example
 * ```typescript
 * const title = extractTitleFromMessage(userMessage);
 * // Returns: "What products do you have?" (truncated to 50 chars)
 * ```
 */
export function extractTitleFromMessage(message: UIMessage | undefined | null): string {
  if (!message) {
    return 'New Chat';
  }

  // Try to extract text from message parts
  const textContent = getMessageText(message);
  
  if (textContent && textContent.trim().length > 0) {
    // Truncate to 50 characters
    return textContent.trim().slice(0, 50) || 'New Chat';
  }

  // Fallback to 'New Chat' if no text found
  return 'New Chat';
}