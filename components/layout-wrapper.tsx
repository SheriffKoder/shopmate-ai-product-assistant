/**
 * Layout Wrapper Component
 * 
 * Purpose: Client-side wrapper for layout with ShopProvider and page structure
 * Used in: app/layout.tsx
 * Why: Separates client-side logic from server component layout
 */

'use client';

import { Suspense, useMemo, useState } from 'react';
import { ShopProvider } from '@/features/shop/providers/shop-context';
import { FullscreenProvider } from '@/features/ai-assistant/providers/fullscreen-context';
import { ChatWrapper } from '@/features/ai-assistant/chat-wrapper';
import { generateUUID } from '@/features/ai-assistant/lib/utils';
import ToastContainer from '@/features/toast-success/toast-container';
import { ToastPosition, ToastStacking } from '@/features/toast-success/toast';
import { DataStreamProvider } from '@/features/ai-assistant/data-stream/data-stream-provider';
import { DataStreamHandler } from '@/features/ai-assistant/data-stream/data-stream-handler';
import { MainHeader } from './main-header/main-header';
import Footer from './footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const [isChatCollapsed, setIsChatCollapsed] = useState(true); // Start collapsed
  const USER_TYPE = 'user' as const;
  
  // Generate chat ID once on mount - persists for the session
  const chatId = useMemo(() => generateUUID(), []);

  // these can be used to pass correct model id to the chat if modelIdFromCookie is available
  // otherwise use DEFAULT_CHAT_MODEL
  // const cookieStore = await cookies();
  // const modelIdFromCookie = cookieStore.get("chat-model");
  
  return (
    <ShopProvider userType={USER_TYPE}>
      {/* Fullscreen Provider: Manages fullscreen state for chat wrapper */}
      <FullscreenProvider>
        {/* DataStream Provider: Enables streaming data access globally */}
        <DataStreamProvider>
          {/* Toast Container: Global toast notifications */}
          <ToastContainer 
            position={ToastPosition.TOP_RIGHT}
            maxToasts={5}
            stacking={ToastStacking.PUSH_UP}
          />
          
          <div className="w-screen min-h-screen flex flex-col text-white overflow-hidden bg-[#f0f0f0]">
          
            <MainHeader 
            onChatToggle={() => setIsChatCollapsed(!isChatCollapsed)}
            isChatOpen={!isChatCollapsed}
            />
            <div className='h-full w-full max-w-7xl mx-auto mt-[70px]'>

              {/* Main content */}
              {children}

              {/* Right Side: Chat Wrapper - Wrap in suspence for using the useSearchParams hook*/}
              <Suspense fallback={null}>
                <ChatWrapper 
                  chatId={chatId}
                  userType={USER_TYPE} 
                  isChatCollapsed={isChatCollapsed}
                  setIsChatCollapsed={setIsChatCollapsed}
                />
              </Suspense>
            </div>
            
            <Footer />
          </div>
          
          {/* DataStream Handler: Processes stream data (invisible) */}
          <DataStreamHandler />
        </DataStreamProvider>
      </FullscreenProvider>
    </ShopProvider>
  );
};
