/**
 * Generic Assistant UI Stream Data Types
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

/**
 * Host-defined custom UI data types.
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
export type AssistantUIDataTypes = Record<string, unknown>;

/** Typed payload for the generic progress-summary stream event. */
export type AssistantStepData = {
  id: string;
  label: string;
  summary?: string;
  status: 'loading' | 'done' | 'error';
};
