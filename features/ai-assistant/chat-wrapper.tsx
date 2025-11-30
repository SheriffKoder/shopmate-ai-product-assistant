/**
 * Chat Wrapper Component
 * 
 * Purpose: Wraps the chat container with header and collapse/expand functionality
 * Used in: app/page.tsx
 */

'use client';

import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ChatContainer from '@/features/ai-assistant/chat-container';

interface ChatWrapperProps {
  userType: string;
  isChatCollapsed: boolean;
  setIsChatCollapsed: (collapsed: boolean) => void;
}

export const ChatWrapper = ({ userType, isChatCollapsed, setIsChatCollapsed }: ChatWrapperProps) => {

  return (
    <div
      className={`md:w-[400px] w-[calc(100%-24px)] rounded-lg overflow-hidden
      flex flex-col fixed bottom-2 md:bottom-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-6 transition-all duration-300 ease-in-out z-[100]
      ${isChatCollapsed ? 'h-[60px]' : 'h-[calc(75vh)]'}`}
      style={{
        boxShadow: '0 0 10px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      <div
        onClick={() => setIsChatCollapsed(!isChatCollapsed)}
        className={`p-4 font-semibold flex flex-row items-center justify-between gap-2 cursor-pointer transition-colors
          
          ${isChatCollapsed ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gradient-to-r from-black to-black'}`}
        role="button"
        tabIndex={0}
        aria-label={isChatCollapsed ? 'Expand chat' : 'Collapse chat'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsChatCollapsed(!isChatCollapsed);
          }
        }}
      >
        <div className="flex flex-row items-center gap-2">
          <Image src="/images/icon.png" alt="Liora AI Assistant" width={24} height={24} />
          <span className="text-white">ShopMate AI</span>
        </div>
        <div className="p-1">
          {isChatCollapsed ? (
            <ChevronUp className="w-5 h-5 text-white" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white" />
          )}
        </div>
      </div>
      {/* Always render ChatContainer but hide it when collapsed */}
      <div 
        className={`flex-1 w-full min-h-0 overflow-hidden bg-[#FFFFFF] transition-opacity duration-300 ${
          isChatCollapsed ? 'hidden' : 'flex flex-col'
        }`}
      >
        <ChatContainer userType={userType} />
      </div>
    </div>
  );
};

