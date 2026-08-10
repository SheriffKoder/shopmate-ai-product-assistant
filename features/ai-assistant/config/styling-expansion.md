# AI Assistant Styling Config Upgrade

## Objective

Extract the current AI assistant theme into a host-configurable styling contract while preserving the existing appearance through default values.

The styling config is presentation-only. It must not contain business logic, agents, tools, catalog, cart, or persistence behavior.

## New files

```text
features/ai-assistant/config/
├── assistant-style-config.ts
└── README.md

features/ai-assistant/providers/
└── assistant-style-context.tsx
Provider wiring
Wrap the assistant UI with:
<AssistantStyleProvider>
  {children}
</AssistantStyleProvider>
The provider exposes:
const styles = useAssistantStyleConfig();
Final config shape
interface AssistantStyleConfig {
  shell?: {
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    sidebarClassName?: string;
    mainClassName?: string;
    sidebarBorderClassName?: string;
  };

  branding?: {
    logo?: ReactNode;
    logoSrc?: string;
    logoAlt?: string;
    logoClassName?: string;
    name?: string;
    nameClassName?: string;
    controlClassName?: string;
    controlHoverClassName?: string;
  };

  emptyState?: {
    title?: string;
    description?: string;
    className?: string;
  };

  input?: {
    containerClassName?: string;
    inputClassName?: string;
    inputPlaceholder?: string;
    dictationPlaceholder?: string;
    toolbarClassName?: string;
    toolbarButtonClassName?: string;
    toolbarButtonHoverClassName?: string;
    submitButtonClassName?: string;
    submitButtonHoverClassName?: string;
  };

  messages?: {
    contentClassName?: string;
    userClassName?: string;
    assistantClassName?: string;
    userTextClassName?: string;
    assistantTextClassName?: string;
    reasoningClassName?: string;
    thinkingStepsClassName?: string;
    replyClassName?: string;
    markdownClassName?: string;
    markdownMutedClassName?: string;
  };

  conversation?: {
    className?: string;
    contentClassName?: string;
  };

  reasoning?: {
    triggerClassName?: string;
    triggerHoverClassName?: string;
    contentClassName?: string;
    shimmerClassName?: string;
  };

  thinkingSteps?: {
    containerClassName?: string;
    itemClassName?: string;
    summaryClassName?: string;
    iconClassName?: string;
  };

  loading?: {
    containerClassName?: string;
    labelClassName?: string;
    shimmerClassName?: string;
  };

  suggestions?: {
    groupClassName?: string;
    headerClassName?: string;
    gridClassName?: string;
    cardClassName?: string;
    cardHoverClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
  };

  tools?: {
    containerClassName?: string;
    headerClassName?: string;
    contentClassName?: string;
    mutedPanelClassName?: string;
  };

  chainOfThought?: {
    containerClassName?: string;
    headerClassName?: string;
    stepClassName?: string;
    descriptionClassName?: string;
    connectorClassName?: string;
  };

  plan?: {
    cardClassName?: string;
    headerClassName?: string;
    descriptionClassName?: string;
    triggerClassName?: string;
  };

  shimmer?: {
    className?: string;
    backgroundColor?: string;
  };

  artifacts?: {
    panelClassName?: string;
    panelChatClassName?: string;
    panelContentClassName?: string;
    panelViewportClassName?: string;
    panelInputClassName?: string;
    headerClassName?: string;
    contentClassName?: string;
    previewHeaderClassName?: string;
    previewContentClassName?: string;
    editorClassName?: string;
    editorHeaderClassName?: string;
    errorClassName?: string;
  };
}
Files wired to the styling config
Provider
features/ai-assistant/providers/assistant-root-provider.tsx
features/ai-assistant/providers/assistant-style-context.tsx
Shell and primary UI
features/ai-assistant/components/shell/assistant-shell-header.tsx
features/ai-assistant/components/shell/assistant-shell-content.tsx
features/ai-assistant/components/ui/empty-state.tsx
features/ai-assistant/components/prompt-input.tsx
features/ai-assistant/components/message-list.tsx
Conversation styling
features/ai-assistant/components/generic/ai-elements/reasoning.tsx
features/ai-assistant/components/generic/ai-elements/chain-of-thought.tsx
features/ai-assistant/components/generic/ai-elements/plan.tsx
features/ai-assistant/components/generic/ai-elements/shimmer.tsx
features/ai-assistant/components/generic/ai-elements/loader.tsx
features/ai-assistant/components/generic/ai-elements/tool.tsx
features/ai-assistant/components/thinking-steps/thinking-steps.tsx
features/ai-assistant/components/thinking-steps/thinking-step-item.tsx
features/ai-assistant/components/ui/markdown-text.tsx
features/ai-assistant/components/ui/intro-suggestions.tsx
features/ai-assistant/components/ui/item-type-card.tsx
features/ai-assistant/components/ui/discussion-card.tsx
Artifact styling
features/ai-assistant/components/artifacts/components/artifact-panel.tsx
features/ai-assistant/components/artifacts/components/artifact-panel-messages.tsx
features/ai-assistant/components/artifacts/components/document-header-chat-card.tsx
features/ai-assistant/components/artifacts/components/document-content-chat-card.tsx
features/ai-assistant/components/artifacts/text/components/text-artifact-content.tsx
features/ai-assistant/components/artifacts/sheet/components/sheet-artifact-content.tsx
features/ai-assistant/components/artifacts/chart/components/chart-artifact-content.tsx
Files still available for future refinement
These controls were not fully extracted yet:
features/ai-assistant/components/artifacts/components/artifact-close-button.tsx
features/ai-assistant/components/artifacts/components/artifact-download-button.tsx
features/ai-assistant/components/artifacts/components/artifact-copy-button.tsx
features/ai-assistant/components/artifacts/components/version-history-management-buttons.tsx
features/ai-assistant/components/artifacts/components/version-history-header.tsx
features/ai-assistant/components/artifacts/text/components/document-preview.tsx
Default-config principle
The default config should contain the existing Tailwind classes exactly or as close as possible.
This allows the migration to be verified visually before a host application supplies overrides.
Example:
export const defaultAssistantStyleConfig: AssistantStyleConfig = {
  shell: {
    contentClassName: 'bg-[#FFFFFF]',
    mainClassName: 'bg-[#FFFFFF]',
    sidebarClassName: 'bg-gray-50 dark:bg-gray-900',
    sidebarBorderClassName: 'border-r border-gray-200 dark:border-gray-800',
  },

  messages: {
    userClassName: '!bg-[#dbdbdb] !text-black !ml-auto text-right w-fit',
    assistantClassName: '!bg-[#313131]/0 !text-black w-full',
  },
};
Host overrides
Hosts should pass only branding and visual overrides:
<AssistantStyleProvider
  config={{
    branding: {
      name: 'Closer Assistant',
      logoSrc: '/images/closer-logo.png',
    },
    shell: {
      headerClassName: 'bg-slate-900 text-white',
    },
  }}
>
  <AssistantShell />
</AssistantStyleProvider>
The config merge should be shallow per section:
export function mergeAssistantStyleConfig(
  overrides?: AssistantStyleConfig,
): AssistantStyleConfig {
  return {
    ...defaultAssistantStyleConfig,
    ...overrides,
    shell: {
      ...defaultAssistantStyleConfig.shell,
      ...overrides?.shell,
    },
    branding: {
      ...defaultAssistantStyleConfig.branding,
      ...overrides?.branding,
    },
    messages: {
      ...defaultAssistantStyleConfig.messages,
      ...overrides?.messages,
    },
    artifacts: {
      ...defaultAssistantStyleConfig.artifacts,
      ...overrides?.artifacts,
    },
  };
}
Verification checklist
After wiring the config:
Confirm shell header and sidebar look unchanged.
Confirm prompt input, microphone button, model picker, and submit button look unchanged.
Confirm user and assistant message bubbles look unchanged.
Confirm reasoning opens while streaming and closes after completion.
Confirm thinking steps appear during streaming and survive refresh.
Confirm suggestion cards and tool panels look unchanged.
Confirm compact artifacts and fullscreen artifact panels look unchanged.
Run: