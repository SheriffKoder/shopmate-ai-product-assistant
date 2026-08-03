/**
 * Data Stream Provider
 * 
 * Purpose: Provides React Context for managing streaming data from AI responses
 * Used in: AssistantRootProvider and chat components
 * Why: Allows components to access and update stream data without prop drilling
 * 
 * How it works:
 * 1. Creates React Context for data stream state
 * 2. Provides dataStream array and setDataStream function
 * 3. Memoizes context value for performance
 * 4. Exports useDataStream hook for easy access
 * 
 * Usage:
 * ```tsx
 * // Wrap app with provider
 * <DataStreamProvider>
 *   <App />
 * </DataStreamProvider>
 * 
 * // Use in components
 * const { dataStream, setDataStream } = useDataStream();
 * setDataStream((ds) => [...ds, newDataPart]);
 * ```
 */

"use client";

import type { DataUIPart } from "ai";
import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { ShopMateUIDataTypes } from '../types/stream';

/**
 * Context value type for data stream
 * 
 * Contains:
 * - dataStream: Array of streaming data parts from AI responses
 * - setDataStream: Function to update the data stream array
 */
type DataStreamContextValue = {
  /** Array of streaming data parts from the AI response */
  dataStream: DataUIPart<ShopMateUIDataTypes>[];
  /** Function to update the data stream array */
  setDataStream: React.Dispatch<
    React.SetStateAction<DataUIPart<ShopMateUIDataTypes>[]>
  >;
};

/**
 * React Context for data stream
 * 
 * Initialized as null to allow type checking for provider usage
 */
const DataStreamContext = createContext<DataStreamContextValue | null>(null);

/**
 * Provider component that manages data stream state
 * 
 * This component wraps the application (or a portion of it) to provide
 * global access to streaming data from AI responses.
 * 
 * @param children - React children that will have access to the data stream context
 * 
 * @example
 * ```tsx
 * <DataStreamProvider>
 *   <YourApp />
 * </DataStreamProvider>
 * ```
 */
export function DataStreamProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  //////////////////////////////////
  // Data Stream State: Holds all streaming data parts
  // Why: Centralized state for all stream data
  // Type: Array of DataUIPart with ShopMate-specific types
  //////////////////////////////////
  const [dataStream, setDataStream] = useState<DataUIPart<ShopMateUIDataTypes>[]>(
    []
  );

  //////////////////////////////////
  // Memoized Context Value: Prevents unnecessary re-renders
  // Why: useMemo ensures context value only changes when dataStream changes
  // Benefit: Components consuming this context won't re-render unnecessarily
  //////////////////////////////////
  const value = useMemo(() => ({ dataStream, setDataStream }), [dataStream]);

  return (
    <DataStreamContext.Provider value={value}>
      {children}
    </DataStreamContext.Provider>
  );
}

/**
 * Hook to access the data stream context
 * 
 * This hook provides access to the data stream state and setter function.
 * Must be used within a DataStreamProvider component.
 * 
 * @returns The data stream context value containing:
 *   - dataStream: Array of streaming data parts
 *   - setDataStream: Function to update the data stream
 * 
 * @throws Error if used outside of a DataStreamProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { dataStream, setDataStream } = useDataStream();
 *   
 *   // Add new data part
 *   setDataStream((ds) => [...ds, newDataPart]);
 *   
 *   // Read current stream
 *   console.log('Current stream:', dataStream);
 * }
 * ```
 */
export function useDataStream() {
  const context = useContext(DataStreamContext);
  
  if (!context) {
    throw new Error("useDataStream must be used within a DataStreamProvider");
  }
  
  return context;
}
