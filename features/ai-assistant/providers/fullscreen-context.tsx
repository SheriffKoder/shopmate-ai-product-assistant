/**
 * Fullscreen Context Provider
 * 
 * Purpose: Centralizes fullscreen state management for chat wrapper
 * Used in: layout-wrapper.tsx (wraps ChatWrapper)
 * Why: Allows artifact panel and other components to check fullscreen state
 * 
 * Provides:
 * - isFullScreen: Current fullscreen state
 * - setIsFullScreen: Function to update fullscreen state
 */

'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';

interface FullscreenContextValue {
  isFullScreen: boolean;
  setIsFullScreen: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const FullscreenContext = createContext<FullscreenContextValue | undefined>(undefined);

interface FullscreenProviderProps {
  children: ReactNode;
  initialValue?: boolean;
}

/**
 * Fullscreen Provider Component
 * Wraps the app and provides fullscreen state to all children
 */
export function FullscreenProvider({ children, initialValue = false }: FullscreenProviderProps) {
  const [isFullScreen, setIsFullScreen] = useState(initialValue);

  const value: FullscreenContextValue = {
    isFullScreen,
    setIsFullScreen,
  };

  return (
    <FullscreenContext.Provider value={value}>
      {children}
    </FullscreenContext.Provider>
  );
}

/**
 * Hook to access fullscreen context
 * Must be used within FullscreenProvider
 */
export function useFullscreen() {
  const context = useContext(FullscreenContext);
  if (context === undefined) {
    throw new Error('useFullscreen must be used within a FullscreenProvider');
  }
  return context;
}

