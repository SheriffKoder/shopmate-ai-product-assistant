import { UIMessage } from 'ai';

/**
 * Converts UI messages to a single string format with custom ordering
 * Order: introText + last message, system prompt, then all other messages (0 to n-1)
 * 
 * @param messages - Array of UI messages with parts
 * @param introText - Optional intro text to prepend to the last message
 * @param systemPrompt - Optional system prompt to include before messages 0 to n-1
 * @returns Single string with messages reordered and formatted as "role: content"
 */
export function convertToModelMessagesString(
  messages: UIMessage[],
  introText: string = '',
  systemPrompt: string = ''
): string {
  // Process all messages and extract text content
  const processedMessages = messages
    .map((message) => {
      // Skip if message doesn't have parts or role
      if (!message.parts || !message.role) {
        return null;
      }

      // Extract all text parts and combine them into a single string
      const textContent = message.parts
        .filter((part) => part.type === 'text' && 'text' in part && part.text)
        .map((part) => (part as { type: 'text'; text: string }).text)
        .join('')
        .trim();

      // Skip messages without text content
      if (!textContent) {
        return null;
      }

      return {
        role: message.role as 'system' | 'user' | 'assistant',
        content: textContent,
      };
    })
    .filter(
      (msg): msg is { role: 'system' | 'user' | 'assistant'; content: string } =>
        msg !== null
    );

  if (processedMessages.length === 0) {
    return '';
  }

  // Separate messages by type
  const lastMessage = processedMessages[processedMessages.length - 1];
  const systemMessages = processedMessages.filter((msg) => msg.role === 'system');
  const otherMessages = processedMessages.slice(0, -1).filter(
    (msg) => msg.role !== 'system'
  );

  // Build the result in the desired order:
  // 1. introText + last message
  // 2. system prompt (if provided)
  // 3. other messages (0 to n-1)
  const result: string[] = [];

  // Add last message with intro text
  if (lastMessage) {
    const lastMessageText = `${lastMessage.role}: ${lastMessage.content}`;
    result.push(introText ? `${introText}${lastMessageText}` : lastMessageText);
  }

  // Add system prompt if provided
  if (systemPrompt) {
    result.push(`system: ${systemPrompt}`);
  }

  // Add system messages from the conversation (if any)
  systemMessages.forEach((msg) => {
    result.push(`${msg.role}: ${msg.content}`);
  });

  // Add other messages (0 to n-1)
  otherMessages.forEach((msg) => {
    result.push(`${msg.role}: ${msg.content}`);
  });

  return result.join('\n');
}

