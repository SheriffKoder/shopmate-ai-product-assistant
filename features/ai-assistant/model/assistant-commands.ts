/**
 * @file features/ai-assistant/model/assistant-commands.ts
 * Generic Assistant Commands
 *
 * Purpose: Defines an extensible command channel from assistant UI to the host application.
 * Used in: Tool renderers, assistant integrations, and business command bridges.
 * Used for: Preventing assistant-core components from importing or mutating application state directly.
 */

/** Default command map is intentionally open; business adapters provide concrete command maps. */
export type AssistantCommandMap = Record<string, unknown>;

/** Typed command emitted by an assistant tool or interaction. */
export type AssistantCommand<TMap extends object = AssistantCommandMap> = {
  [TName in keyof TMap]: {
    type: TName;
    payload: TMap[TName];
  };
}[keyof TMap];

/** Host-owned command dispatcher. */
export type AssistantCommandDispatcher<TMap extends object = AssistantCommandMap> = (
  command: AssistantCommand<TMap>
) => Promise<void> | void;
