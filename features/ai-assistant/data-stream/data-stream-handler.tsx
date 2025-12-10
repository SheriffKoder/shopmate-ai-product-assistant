/**
 * Data Stream Handler
 * 
 * Purpose: Processes streaming data parts and updates UI state accordingly
 * Used in: Layout wrapper (invisible component)
 * Why: Separates stream processing logic from UI components
 * 
 * How it works:
 * 1. Listens for changes to dataStream via useDataStream hook
 * 2. Copies and clears stream immediately (prevents reprocessing)
 * 3. Processes each data part based on type
 * 4. Updates appropriate state (products, cart, etc.)
 * 5. Handles all ShopMate-specific data types
 * 
 * This is an invisible component (returns null) that acts as a processor.
 * It should be placed in the layout wrapper alongside the DataStreamProvider.
 */

"use client";

import { useEffect } from "react";
import { useDataStream } from "./data-stream-provider";
import { useProductStream } from '../hooks/use-product-stream';
import { useCartStream } from '../hooks/use-cart-stream';
import { useArtifact, initialArtifactData } from '../artifacts/hooks/use-artifact';
import { useFullscreen } from '../providers/fullscreen-context';

/**
 * Data Stream Handler Component
 * 
 * This component processes streaming data parts from AI responses and
 * updates the UI state accordingly. It runs as an invisible processor
 * (doesn't render anything) and handles all ShopMate-specific data types.
 * 
 * Processing flow:
 * 1. Watches dataStream for new data parts
 * 2. Copies all parts to a local array
 * 3. Clears the stream immediately (prevents reprocessing)
 * 4. Processes each part based on its type
 * 5. Updates appropriate UI state or logs for debugging
 * 
 * @returns null (invisible component)
 */
export function DataStreamHandler() {
  //////////////////////////////////
  // Data Stream Access: Get stream data and setter
  // Why: Need to read and clear the stream
  //////////////////////////////////
  const { dataStream, setDataStream } = useDataStream();

  //////////////////////////////////
  // State Management Hooks: Access product and cart update functions
  // Why: Need to update UI state when stream data arrives
  //////////////////////////////////
  const { addProduct, updateProducts, addProducts } = useProductStream();
  const { updateCart, addCartItem, removeCartItem } = useCartStream();
  
  //////////////////////////////////
  // Artifact State Management: Access artifact state and setter
  // Why: Need to update artifact state when artifact data streams
  //////////////////////////////////
  const { artifact, setArtifact } = useArtifact();
  
  //////////////////////////////////
  // Fullscreen State: Check if chat is in fullscreen mode
  // Why: Artifacts should only auto-open when in fullscreen mode
  //////////////////////////////////
  const { isFullScreen } = useFullscreen();

  //////////////////////////////////
  // Stream Processing: Process all accumulated data parts
  // Why: Batch processing is more efficient than processing one at a time
  // When: Runs whenever dataStream changes
  //////////////////////////////////
  useEffect(() => {
    // Early return if no data to process
    if (!dataStream?.length) {
      return;
    }

    //////////////////////////////////
    // Copy and Clear: Prevent reprocessing same parts
    // Why: Copy before clearing ensures we process all parts even if new ones arrive
    // How: slice() creates a shallow copy, then we clear the original
    //////////////////////////////////
    const newDeltas = dataStream.slice();
    setDataStream([]); // Clear immediately to prevent reprocessing

    //////////////////////////////////
    // Process Each Data Part: Handle different data types
    // Why: Different data types require different state updates
    // How: Switch statement routes each type to appropriate handler
    //////////////////////////////////
    for (const delta of newDeltas) {
      switch (delta.type) {
        //////////////////////////////////
        // Product-related types
        // Purpose: Handle product streaming and search status
        //////////////////////////////////
        
        case "data-productCard":
          // Add product to UI state
          addProduct(delta.data);
          console.log('[DataStreamHandler] Product card added:', delta.data.name);
          break;

        case "data-productList":
          // Update product list with multiple products
          addProducts(delta.data);
          console.log('[DataStreamHandler] Product list updated:', delta.data.length, 'products');
          break;

        case "data-productSearchStatus":
          // Search status update (can be used for UI indicators)
          // Status: 'searching' | 'found' | 'complete'
          console.log('[DataStreamHandler] Search status:', delta.data.status, delta.data.count ? `(${delta.data.count} found)` : '');
          break;

        //////////////////////////////////
        // Cart-related types
        // Purpose: Handle cart state updates and item notifications
        //////////////////////////////////
        
        case "data-cartUpdate":
          // Update cart state from stream
          updateCart(delta.data);
          console.log('[DataStreamHandler] Cart updated:', delta.data.totalItems, 'items');
          break;

        case "data-cartItemAdded":
          // FUTURE IMPLEMENTATION: Show notification
          // For now, cart updates are handled via cartUpdate type
          // This type can be used for specific item-added notifications
          console.log('[DataStreamHandler] Cart item added:', delta.data.productId, `x${delta.data.quantity}`);
          break;

        case "data-cartItemRemoved":
          // Remove cart item
          removeCartItem(delta.data.productId);
          console.log('[DataStreamHandler] Cart item removed:', delta.data.productId);
          break;

        //////////////////////////////////
        // Recommendation types
        // Purpose: Handle product recommendations and generation status
        //////////////////////////////////
        
        case "data-recommendation":
          // FUTURE IMPLEMENTATION: Display recommendations
          // displayRecommendations(delta.data);
          console.log('[DataStreamHandler] Recommendations:', delta.data);
          break;

        case "data-recommendationStatus":
          // FUTURE IMPLEMENTATION: Update recommendation status
          // showRecommendationStatus(delta.data.status, delta.data.count);
          console.log('[DataStreamHandler] Recommendation status:', delta.data);
          break;

        //////////////////////////////////
        // Filter types
        // Purpose: Handle filtering progress and results
        //////////////////////////////////
        
        case "data-filterStatus":
          // FUTURE IMPLEMENTATION: Update filter status
          // showFilterStatus(delta.data.status, delta.data.resultsCount);
          console.log('[DataStreamHandler] Filter status:', delta.data);
          break;

        //////////////////////////////////
        // Control types
        // Purpose: Control stream behavior and provide metadata
        //////////////////////////////////
        
        case "data-clear":
          // FUTURE IMPLEMENTATION: Clear current UI state
          // clearProductList();
          // clearRecommendations();
          console.log('[DataStreamHandler] Clear signal received');
          break;

        case "data-finish":
          // Mark artifact as complete when stream finishes
          setArtifact((prev) => {
            // Update status to complete if currently streaming
            if (prev.status === 'streaming' || prev.status === 'idle') {
              return {
                ...prev,
                status: 'complete',
              };
            }
            return prev;
          });
          console.log('[DataStreamHandler] Stream finished - artifact marked as complete');
          break;

        case "data-usage":
          // FUTURE IMPLEMENTATION: Track token usage (if needed for analytics)
          // trackTokenUsage(delta.data.promptTokens, delta.data.completionTokens);
          console.log('[DataStreamHandler] Usage:', delta.data);
          break;

        //////////////////////////////////
        // Artifact types
        // Purpose: Handle text, sheet, and code artifacts
        //////////////////////////////////
        
        case "data-artifactId":
          // Set artifact document ID
          setArtifact((prev) => ({
            ...prev,
            documentId: delta.data,
          }));
          console.log('[DataStreamHandler] Artifact ID set:', delta.data);
          break;

        case "data-artifactTitle":
          // Set artifact title
          setArtifact((prev) => ({
            ...prev,
            title: delta.data,
          }));
          console.log('[DataStreamHandler] Artifact title set:', delta.data);
          break;

        case "data-artifactKind":
          // Set artifact type/kind
          setArtifact((prev) => ({
            ...prev,
            kind: delta.data,
          }));
          console.log('[DataStreamHandler] Artifact kind set:', delta.data);
          break;

        case "data-artifactStatus":
          // Update artifact status
          setArtifact((prev) => ({
            ...prev,
            status: delta.data,
          }));
          console.log('[DataStreamHandler] Artifact status:', delta.data);
          break;

        case "data-textDelta":
          // Append text chunk to artifact content
          setArtifact((prev) => {
            const newContent = prev.content + delta.data;
            // Only set to 'streaming' if status is 'idle', preserve 'complete' status
            const newStatus = prev.status === 'idle' ? 'streaming' : 
                            prev.status === 'complete' ? 'complete' : 
                            prev.status;
            
            // Auto-show artifact when content reaches threshold (400-450 chars) AND in fullscreen mode
            const shouldShow = 
              isFullScreen &&
              newStatus === 'streaming' && 
              newContent.length > 400 && 
              newContent.length < 450 &&
              !prev.isVisible;
            
            return {
              ...prev,
              content: newContent,
              status: newStatus,
              isVisible: shouldShow ? true : prev.isVisible,
            };
          });
          // Don't log every text delta (too verbose)
          break;

        case "data-sheetDelta":
          // Replace sheet content (streamObject sends full CSV each time, not incremental)
          setArtifact((prev) => {
            // streamObject sends full CSV each time, so we replace (not append)
            const newContent = delta.data;
            // Only set to 'streaming' if status is 'idle', preserve 'complete' status
            const newStatus = prev.status === 'idle' ? 'streaming' : 
                            prev.status === 'complete' ? 'complete' : 
                            prev.status;
            
            // CRITICAL: Ensure kind is set to 'sheet' when receiving sheet deltas
            // This prevents the artifact from defaulting to 'text' if data-artifactKind wasn't processed yet
            // If we're receiving sheet deltas, we know it's a sheet artifact, so set kind to 'sheet'
            const newKind = prev.kind === 'text' ? 'sheet' : prev.kind;
            
            // Auto-show artifact when content reaches threshold (400-450 chars) AND in fullscreen mode
            // Same threshold as text artifacts for consistency
            const shouldShow = 
              isFullScreen &&
              newStatus === 'streaming' && 
              newContent.length > 400 && 
              newContent.length < 450 &&
              !prev.isVisible;
            
            return {
              ...prev,
              content: newContent,
              status: newStatus,
              kind: newKind, // Ensure kind is 'sheet' when receiving sheet deltas
              isVisible: shouldShow ? true : prev.isVisible,
            };
          });
          // Don't log every sheet delta (too verbose)
          break;

        case "data-artifactClear":
          // Reset artifact to initial state
          setArtifact({
            ...initialArtifactData,
          });
          console.log('[DataStreamHandler] Artifact cleared');
          break;

        // FUTURE IMPLEMENTATION: Other artifact types
        // case "data-codeDelta":
        //   // Handle code artifact updates
        //   break;

        default:
          // Unknown data type - log for debugging
          // This helps identify if new types are added but not handled
          console.warn('[DataStreamHandler] Unknown data type:', (delta as any).type, delta);
      }
    }
  }, [dataStream, setDataStream, addProduct, updateProducts, addProducts, updateCart, addCartItem, removeCartItem, setArtifact]);

  //////////////////////////////////
  // Invisible Component: Doesn't render anything
  // Why: This is a processor component, not a UI component
  // How: Returns null so it doesn't affect the DOM
  //////////////////////////////////
  return null;
}

