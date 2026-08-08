/**
 * Default Tool Renderer
 * 
 * Purpose: Renders generic tool output (fallback for unknown tools)
 * Used in: message-part-renderer.tsx
 * Why: Provides default rendering for tools without custom renderers
 */

'use client';

import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/features/ai-assistant/components/generic/ai-elements/tool';
import { ToolUIPart } from 'ai';

interface DefaultToolRendererProps {
  toolPart: any;
  messageId: string;
  partIndex: number;
}

export const DefaultToolRenderer = ({
  toolPart,
  messageId,
  partIndex,
}: DefaultToolRendererProps) => {
  // Handle generic tool parts
  if (toolPart.type?.startsWith('tool-')) {
    const genericToolPart = toolPart as ToolUIPart;
    return (
      <Tool key={`${messageId}-${partIndex}`} defaultOpen={true}>
        <ToolHeader
          type={genericToolPart.type}
          state={genericToolPart.state}
        />
        <ToolContent>
          <ToolInput input={genericToolPart.input} />
          <ToolOutput 
            output={
              genericToolPart.output ? (
                <div>
                  {JSON.stringify(genericToolPart.output).slice(0, 100)}
                </div>
              ) : null
            }
            errorText={genericToolPart.errorText} 
          />
        </ToolContent>
      </Tool>
    );
  }

  // Default dynamic tool rendering
  return (
    <Tool key={`${messageId}-${partIndex}`} defaultOpen={true}>
      <ToolHeader
        type={toolPart.toolName || 'tool'}
        state={toolPart.state}
      />
      <ToolContent>
        {toolPart.state === 'input-streaming' && (
          <div>Loading tool input...</div>
        )}
        {toolPart.input && (
          <ToolInput input={toolPart.input} />
        )}
        <ToolOutput 
          output={
            toolPart.output ? (
              <div>
                {typeof toolPart.output === 'string' 
                  ? toolPart.output 
                  : JSON.stringify(toolPart.output).slice(0, 200)}
              </div>
            ) : null
          }
          errorText={toolPart.errorText} 
        />
      </ToolContent>
    </Tool>
  );
};

