/**
 * Layout Wrapper Component
 * 
 * Purpose: Client-side wrapper for layout with ShopProvider and page structure
 * Used in: app/layout.tsx
 * Why: Separates client-side logic from server component layout
 */

'use client';

import { useState } from 'react';
import { ShopProvider } from '@/providers/shop-context';
import { MainHeader } from '@/components/main-header/main-header';
import { ChatWrapper } from '@/features/ai-assistant/chat-wrapper';
import Footer from '@/components/footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const [isChatCollapsed, setIsChatCollapsed] = useState(true); // Start collapsed
  const USER_TYPE = 'user' as const;
  
  return (
    <ShopProvider userType={USER_TYPE}>
      <div className="w-screen min-h-screen flex flex-col text-white overflow-hidden bg-[#f0f0f0]">
        <MainHeader 
          onChatToggle={() => setIsChatCollapsed(!isChatCollapsed)}
          isChatOpen={!isChatCollapsed}
        />

        <div className='h-full w-full max-w-7xl mx-auto mt-[70px]'>
          {/* Main content */}
          {children}

          {/* Right Side: Chat Wrapper */}
          <ChatWrapper 
            userType={USER_TYPE} 
            isChatCollapsed={isChatCollapsed}
            setIsChatCollapsed={setIsChatCollapsed}
          />
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </ShopProvider>
  );
};

