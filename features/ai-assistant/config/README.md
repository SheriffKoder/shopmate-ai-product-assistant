# Assistant configuration

This directory owns host-neutral configuration contracts for the AI assistant.
It must not contain Supabase, business-adapter, role, cart, catalog, or Closer
logic.

## Current files

- `assistant-style-config.ts` — defines the assistant visual contract, neutral
  semantic-token defaults, and the nested override merge function.
- `../providers/assistant-style-context.tsx` — resolves the defaults and makes
  the theme available to generic assistant components.

## Style configuration boundary

The host provides branding and presentation overrides through
`AssistantStyleProvider`. Generic assistant components read the configuration
through `useAssistantStyleConfig()`. The default config intentionally mirrors
the current ShopMate classes so the first extraction does not change the UI.

The configuration covers:

- shell and sidebar
- branding, logo, and header controls
- empty state
- prompt input, dictation toolbar, model picker area, and submit control
- user and assistant message surfaces
- reasoning and thinking steps
- loaders and shimmer text
- conversation spacing and scroll surface
- artifact panel and artifact content

## Current wiring stage

The initial extraction wires these surfaces while preserving their existing
visual values:

- `../components/shell/assistant-shell-header.tsx`
- `../components/shell/assistant-shell-content.tsx`
- `../components/ui/empty-state.tsx`
- `../components/prompt-input.tsx`
- `../components/message-list.tsx`
- `../components/ui/markdown-text.tsx`
- `../components/ui/intro-suggestions.tsx`
- `../components/ui/item-type-card.tsx`
- `../components/ui/discussion-card.tsx`
- `../components/generic/ai-elements/tool.tsx`

The remaining files below are intentionally still pending. Their values should
be extracted only after the first pass is visually confirmed.

## Planned consumers for the theming stage

These files are the expected implementation surface for replacing hardcoded
assistant colors, branding, and presentation values with the configuration:

- `../components/shell/assistant-shell-header.tsx`
- `../components/shell/assistant-shell-content.tsx`
- `../components/ui/empty-state.tsx`
- `../components/ui/intro-suggestions.tsx`
- `../components/ui/item-type-card.tsx`
- `../components/prompt-input.tsx`
- `../components/message-list.tsx`
- `../components/thinking-steps/thinking-steps.tsx`
- `../components/message-part-orchestrator-renderer.tsx`
- `../components/generic/ai-elements/message.tsx`
- `../components/generic/ai-elements/reasoning.tsx`
- `../components/generic/ai-elements/chain-of-thought.tsx`
- `../components/generic/ai-elements/tool.tsx`
- `../components/generic/ai-elements/plan.tsx`
- `../components/generic/ai-elements/loader.tsx`
- `../components/generic/ai-elements/shimmer.tsx`
- `../components/artifacts/components/artifact-panel.tsx`
- `../components/artifacts/components/artifact-panel-messages.tsx`
- `../components/artifacts/components/document-header-chat-card.tsx`
- `../components/artifacts/components/document-content-chat-card.tsx`
- `../components/artifacts/text/components/text-artifact-content.tsx`
- `../components/artifacts/sheet/components/sheet-artifact-content.tsx`
- `../components/artifacts/chart/components/chart-artifact-content.tsx`

## Host configuration

The Closer host currently supplies its initial configuration at:

- `../../closer-assistant/ui/closer-assistant-integration.tsx`

That host-level configuration should remain limited to Closer branding and
visual choices. It must not change the generic assistant contract or introduce
business behavior into this feature.
