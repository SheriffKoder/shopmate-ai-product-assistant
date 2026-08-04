/**
 * Layout Wrapper Component
 * 
 * Purpose: Client-side wrapper for app-wide providers and page structure
 * Used in: app/layout.tsx
 * Why: Separates client-side shell state from the server component layout
 */

'use client';

import { ShopAssistantDataStreamHandler, ShopAssistantIntegration } from '@/features/shop-assistant/ui/shop-assistant-integration';
import ToastContainer from '@/shared/toast-success/toast-container';
import { ToastPosition, ToastStacking } from '@/shared/toast-success/toast';
import { MainHeader } from './main-header/main-header';
import Footer from './footer';
import { AssistantRootProvider } from '@/features/ai-assistant/providers/assistant-root-provider';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  return (
    <AssistantRootProvider streamHandler={<ShopAssistantDataStreamHandler />}> 
      {/* Toast Container: Global toast notifications */}
      <ToastContainer 
        position={ToastPosition.TOP_RIGHT}
        maxToasts={5}
        stacking={ToastStacking.PUSH_UP}
      />
      
      <div className="w-screen min-h-screen flex flex-col text-white overflow-hidden bg-[#f0f0f0]">
      
        <MainHeader />
        <div className='h-full w-full max-w-7xl mx-auto mt-[70px]'>

          {/* Main content */}
          {children}

          {/* Shop Assistant: Single integration point for the reusable assistant feature */}
          <ShopAssistantIntegration />
        </div>
        
        <Footer />
      </div>
    </AssistantRootProvider>
  );
};
