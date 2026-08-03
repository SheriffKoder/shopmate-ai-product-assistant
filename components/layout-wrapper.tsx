/**
 * Layout Wrapper Component
 * 
 * Purpose: Client-side wrapper for app-wide providers and page structure
 * Used in: app/layout.tsx
 * Why: Separates client-side shell state from the server component layout
 */

'use client';

import { useCallback, useState } from 'react';
import { ShopProvider } from '@/features/shop/providers/shop-context';
import { ShopAssistantIntegration } from '@/features/shop-assistant/ui/shop-assistant-integration';
import ToastContainer from '@/features/toast-success/toast-container';
import { ToastPosition, ToastStacking } from '@/features/toast-success/toast';
import { MainHeader } from './main-header/main-header';
import Footer from './footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  //////////////////////////////////
  // Assistant Chrome State: Shared by the header button and assistant mount.
  // Why: The app shell owns only whether the assistant is visible, not assistant internals.
  //////////////////////////////////
  const [isChatCollapsed, setIsChatCollapsed] = useState(true); // Start collapsed
  const USER_TYPE = 'user' as const;

  /**
   * Toggles the assistant from the app header.
   */
  const handleChatToggle = useCallback(function toggleAssistantVisibility() {
    setIsChatCollapsed(function invertChatCollapsedState(currentValue) {
      return !currentValue;
    });
  }, []);

  // these can be used to pass correct model id to the chat if modelIdFromCookie is available
  // otherwise use DEFAULT_CHAT_MODEL
  // const cookieStore = await cookies();
  // const modelIdFromCookie = cookieStore.get("chat-model");
  
  return (
    <ShopProvider userType={USER_TYPE}>
      {/* Toast Container: Global toast notifications */}
      <ToastContainer 
        position={ToastPosition.TOP_RIGHT}
        maxToasts={5}
        stacking={ToastStacking.PUSH_UP}
      />
      
      <div className="w-screen min-h-screen flex flex-col text-white overflow-hidden bg-[#f0f0f0]">
      
        <MainHeader
          onChatToggle={handleChatToggle}
          isChatOpen={!isChatCollapsed}
        />
        <div className='h-full w-full max-w-7xl mx-auto mt-[70px]'>

          {/* Main content */}
          {children}

          {/* Shop Assistant: Single integration point for the reusable assistant feature */}
          <ShopAssistantIntegration
            isChatCollapsed={isChatCollapsed}
            setIsChatCollapsed={setIsChatCollapsed}
          />
        </div>
        
        <Footer />
      </div>
    </ShopProvider>
  );
};
