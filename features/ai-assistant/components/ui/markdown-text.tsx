/**
 * Markdown Text Component
 * 
 * Purpose: Reusable component for rendering markdown text with GitHub Flavored Markdown support
 * Used in: All message part renderers and tool renderers
 * Why: Centralizes markdown rendering logic to avoid code duplication
 */

'use client';
// npm install remark-gfm @types/remark-gfm react-markdown
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/shared/lib/utils';
import { useAssistantStyleConfig } from '../../providers/assistant-style-context';

interface MarkdownTextProps {
  children: string;
  className?: string;
}

export const MarkdownText = ({ children, className }: MarkdownTextProps) => {
  const styles = useAssistantStyleConfig();
  // Replace single newlines with double newlines for proper paragraph breaks in markdown
  const processedText = children.replace(/\n/g, '\n\n');
  
  return (
    <div className={cn('markdown-content', styles.messages?.markdownClassName, className)}>
      <Markdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Style paragraphs with spacing
          p: ({ children, ...props }) => (
            <p className="mb-4 last:mb-0" {...props}>
              {children}
            </p>
          ),
          // Style unordered lists (bullet points)
          ul: ({ children, ...props }) => (
            <ul className="mb-4 ml-6 list-disc space-y-2 last:mb-0" {...props}>
              {children}
            </ul>
          ),
          // Style ordered lists
          ol: ({ children, ...props }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-2 last:mb-0" {...props}>
              {children}
            </ol>
          ),
          // Style list items
          li: ({ children, ...props }) => (
            <li className="pl-2" {...props}>
              {children}
            </li>
          ),
          // Style headers with spacing
          h1: ({ children, ...props }) => (
            <h1 className="mb-3 mt-6 text-2xl font-bold first:mt-0" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="mb-3 mt-6 text-xl font-semibold first:mt-0" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="mb-2 mt-4 text-lg font-semibold first:mt-0" {...props}>
              {children}
            </h3>
          ),
          // Style blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote className="mb-4 border-l-4 border-gray-300 pl-4 italic last:mb-0" {...props}>
              {children}
            </blockquote>
          ),
          // Style code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Style horizontal rules
          hr: ({ ...props }) => (
            <hr className="my-6 border-gray-300" {...props} />
          ),
        }}
      >
        {processedText}
      </Markdown>
    </div>
  );
};
