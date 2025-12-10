/**
 * Custom Data Types for ShopMate AI Assistant Streaming
 * 
 * Purpose: Defines all custom data types that can be streamed from server to client
 * Used in: DataStreamProvider, DataStreamHandler, API routes, tools
 * Why: Type-safe streaming of structured data beyond text messages
 * 
 * How it works:
 * - Server-side tools can write data using: dataStream.write({ type: "data-productCard", data: product })
 * - Client-side DataStreamHandler processes these data parts and updates UI accordingly
 * - Enables real-time product cards, cart updates, and progress indicators
 */

import type { Product } from './product';
import type { CartState } from './cart';

/**
 * ShopMate-specific custom UI data types
 * 
 * These types can be streamed via dataStream.write() in tools and API routes.
 * Each type corresponds to a specific UI update or state change.
 * 
 * Naming convention: "data-{typeName}" (e.g., "data-productCard")
 * The "data-" prefix is automatically added by the AI SDK when streaming.
 * 
 * @example
 * ```typescript
 * // Stream a product card
 * dataStream.write({
 *   type: "data-productCard",
 *   data: product,
 *   transient: true, // UI-only, don't save to message history
 * });
 * ```
 */
export type ShopMateUIDataTypes = {
  //////////////////////////////////
  // Product-related types
  // Purpose: Stream product information as AI finds/recommends products
  //////////////////////////////////
  
  /** Stream individual product as it's found during search */
  productCard: Product;
  
  /** Stream multiple products at once (e.g., search results, recommendations) */
  productList: Product[];
  
  /** Search progress indicator for user feedback */
  productSearchStatus: {
    status: 'searching' | 'found' | 'complete';
    count?: number; // Number of products found
  };
  
  //////////////////////////////////
  // Cart-related types
  // Purpose: Stream cart state changes in real-time
  //////////////////////////////////
  
  /** Real-time cart state updates (full cart state) */
  cartUpdate: CartState;
  
  /** Individual item added notification */
  cartItemAdded: {
    productId: string;
    quantity: number;
  };
  
  /** Individual item removed notification */
  cartItemRemoved: {
    productId: string;
  };
  
  //////////////////////////////////
  // Recommendation types
  // Purpose: Stream product recommendations as they're generated
  //////////////////////////////////
  
  /** Product recommendations array */
  recommendation: Product[];
  
  /** Recommendation generation progress */
  recommendationStatus: {
    status: 'analyzing' | 'generating' | 'complete';
    count?: number; // Number of recommendations generated
  };
  
  //////////////////////////////////
  // Filtering types
  // Purpose: Stream filtering progress and results
  //////////////////////////////////
  
  /** Filtering progress indicator */
  filterStatus: {
    status: 'applying' | 'complete';
    resultsCount?: number; // Number of filtered results
  };
  
  //////////////////////////////////
  // Generic control types
  // Purpose: Control stream behavior and provide metadata
  //////////////////////////////////
  
  /** Clear current UI state (e.g., clear product list) */
  clear: null;
  
  /** Stream complete signal (all data has been streamed) */
  finish: null;
  
  /** Token usage information (if needed for analytics) */
  usage: {
    promptTokens?: number;
    completionTokens?: number;
  };
  
  //////////////////////////////////
  // Artifact types
  // Purpose: Support for text, sheet, and code artifacts
  // Used for: Real-time artifact creation and streaming
  //////////////////////////////////
  
  /** Text content chunks streamed as artifact is generated */
  textDelta: string;
  
  /** Sheet/CSV content chunks streamed as artifact is generated */
  sheetDelta: string;
  
  /** Artifact document ID (UUID) */
  artifactId: string;
  
  /** Artifact title */
  artifactTitle: string;
  
  /** Artifact type/kind */
  artifactKind: 'text' | 'code' | 'sheet';
  
  /** Artifact status/state */
  artifactStatus: 'idle' | 'streaming' | 'complete';
  
  /** Clear artifact signal (resets artifact state) */
  artifactClear: null;
  
  // Note: Future artifact types (not yet implemented):
  // codeDelta: string;            // Code content chunks
};

