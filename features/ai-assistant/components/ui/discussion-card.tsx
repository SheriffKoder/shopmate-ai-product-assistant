/**
 * Discussion Card Component
 * 
 * Purpose: Renders discussion content with a topic button at the bottom
 * Used in: message-part-orchestrator-renderer.tsx
 * Why: Separates discussion rendering logic into a reusable component
 */

'use client';

import { Button } from '@/components/ui/button';
import { MarkdownText } from './markdown-text';
import { useAssistantStyleConfig } from '../../providers/assistant-style-context';

interface DiscussionCardProps {
  text: string;
  topic: string;
  className?: string;
  sendMessage: (message: { text: string }, options?: { body: any }) => void;
}

export const DiscussionCard = ({ text, topic, className, sendMessage }: DiscussionCardProps) => {
  const styles = useAssistantStyleConfig();
  const handleButtonClick = () => {
    const messageText = `@ Return products containing ${topic}`;
    sendMessage(
      { 
        text: messageText,
      },
      {
        body: {
          // Body will be prepared by the chat hook if needed
        },
      }
    );
  };

  return (
    <div className={className}>
      <MarkdownText className="!text-black">
        {text}
      </MarkdownText>
      <Button
        variant="outline"
        className={`mt-3 bg-primary text-foreground border-none rounded-none font-normal cursor-pointer text-left ${styles.suggestions?.cardHoverClassName ?? ''}`}
        onClick={handleButtonClick}
      >
        Search {topic}
      </Button>
    </div>
  );
};
