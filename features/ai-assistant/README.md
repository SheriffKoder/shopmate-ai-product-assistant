# AI Assistant

Reusable assistant feature shell for chat UI, message rendering, data streaming, model selection, history, artifacts, and server request handling.

## Owns

- Generic chat wrapper/container UI and prompt input.
- Assistant provider shell, fullscreen state, data-stream context, and stream utilities.
- Generic message rendering and adapter-injected tool renderer registry contracts.
- Model picker/configuration and the OpenAI provider boundary.
- Request parsing, validation, persistence orchestration, and runtime invocation for `/api/ai-assistant`.
- Artifact UI and document creation/persistence helpers.
- Chat history sidebar UI and message loading helpers.

## Does Not Own

- ShopMate product/cart prompts, tools, renderers, or agent routing.
- Product catalog data sources, cart mutation logic, or storefront state.
- Business-specific runtime selection. Host routes inject an `AssistantRuntime`.

## Dependency Rules

- `features/ai-assistant` may expose contracts that adapters import.
- `features/ai-assistant` must not import `features/shop-assistant`.
- Business adapters may import assistant contracts, generic UI slots, and server handlers.
- App routes should stay thin: import the reusable handler and inject the current adapter runtime.

## Porting Checklist

1. Copy `features/ai-assistant` into the target app.
2. Create a business adapter feature that implements `AssistantRuntime`.
3. Register adapter-owned tool renderers with the generic message renderer.
4. Mount the assistant root provider and chat wrapper from an app-level integration component.
5. Point the route adapter at the new runtime.
