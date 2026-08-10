/**
 * @file features/ai-assistant/config/assistant-style-config.ts
 * Defines the host-provided visual contract for the generic assistant UI.
 */

import type { ReactNode } from 'react';

/**
 * Describes configurable presentation values supplied by an assistant host.
 */
export interface AssistantStyleConfig {
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
    submitButtonHoverClassName?: string;
    submitButtonClassName?: string;
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
  conversation?: {
    className?: string;
    contentClassName?: string;
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

/**
 * Provides neutral defaults so the generic assistant remains usable without a host theme.
 */
export const defaultAssistantStyleConfig: AssistantStyleConfig = {
  shell: {
    className: 'bg-background text-foreground',
    headerClassName: 'bg-foreground text-background',
    contentClassName: 'bg-[#FFFFFF]',
    sidebarClassName: 'bg-gray-50 dark:bg-gray-900',
    sidebarBorderClassName: 'border-r border-gray-200 dark:border-gray-800',
    mainClassName: 'bg-[#FFFFFF]',
  },
  branding: {
    name: 'Shop Assistant',
    logoSrc: '/images/icon.png',
    logoAlt: 'AI Assistant',
    logoClassName: 'p-1 bg-white rounded h-6 w-12',
    nameClassName: 'text-white',
    controlClassName: 'bg-foreground text-background',
    controlHoverClassName: 'hover:bg-foreground/90',
  },
  emptyState: {
    title: 'AI Assistant',
    description: 'Ask about products, orders, or your cart.',
    className: 'text-black',
  },
  input: {
    containerClassName: 'flex items-center gap-1 border-2 m-2 rounded-lg p-1 border-[#dbdbdb] flex-shrink-0',
    inputClassName: 'flex-1 border-none bg-white/10 focus:bg-white/15 focus-visible:ring-[0px] transition-all duration-300 text-black',
    inputPlaceholder: 'Ask about any product...',
    dictationPlaceholder: 'Ask about any product, or use the mic button (say stop to end)',
    toolbarClassName: 'flex items-center gap-1 text-foreground bg-foreground/10 rounded-md',
    toolbarButtonClassName: 'p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
    toolbarButtonHoverClassName: 'hover:bg-accent hover:bg-foreground hover:text-background',
    submitButtonHoverClassName: 'hover:bg-accent hover:opacity-90',
    submitButtonClassName: 'p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-foreground cursor-pointer transition-all duration-300 text-background',
  },
  messages: {
    contentClassName: 'rounded-lg px-4 py-3',
    userClassName: '!bg-[#dbdbdb] !text-black !ml-auto text-right w-fit',
    assistantClassName: '!bg-[#313131]/0 !text-black w-full',
    userTextClassName: '!text-black',
    assistantTextClassName: '!text-black',
    reasoningClassName: 'text-muted-foreground',
    thinkingStepsClassName: 'text-muted-foreground',
    replyClassName: 'text-foreground',
    markdownClassName: 'text-black',
    markdownMutedClassName: 'border-gray-300 text-black/50',
  },
  reasoning: {
    triggerClassName: 'flex w-full items-center gap-2 pl-4 text-black/70 text-xs',
    triggerHoverClassName: 'transition-colors hover:text-black',
    contentClassName: 'mt-4 text-sm text-muted-foreground',
    shimmerClassName: '',
  },
  thinkingSteps: {
    containerClassName: 'mb-3 border-l-2 border-primary/30 pl-3',
    itemClassName: 'flex items-start gap-2 py-1 text-xs text-black/70',
    summaryClassName: 'text-black/50',
    iconClassName: 'mt-0.5 text-primary',
  },
  loading: {
    containerClassName: 'flex flex-row items-center justify-start gap-2 opacity-70 pl-4',
    labelClassName: 'text-sm text-black dark:text-white shimmer-text',
    shimmerClassName: '',
  },
  suggestions: {
    groupClassName: 'space-y-3',
    headerClassName: 'text-left text-sm font-semibold text-black/70 uppercase tracking-wide',
    gridClassName: 'grid grid-cols-3 gap-3',
    cardClassName: 'bg-gradient-to-r from-primary to-primary text-foreground cursor-pointer text-left',
    cardHoverClassName: 'hover:bg-[#e0e0e0]',
    titleClassName: 'mb-1 text-sm font-medium opacity-70',
    descriptionClassName: 'text-xs opacity-90',
  },
  tools: {
    containerClassName: 'not-prose mb-4 w-full rounded-md border',
    headerClassName: 'flex w-full items-center justify-between gap-4 p-3',
    contentClassName: 'text-popover-foreground',
    mutedPanelClassName: 'bg-muted/50',
  },
  chainOfThought: {
    containerClassName: 'not-prose max-w-prose space-y-4',
    headerClassName: 'flex w-full items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground',
    stepClassName: 'flex gap-2 text-sm',
    descriptionClassName: 'text-muted-foreground text-xs',
    connectorClassName: '-mx-px absolute top-7 bottom-0 left-1/2 w-px bg-border',
  },
  plan: {
    cardClassName: 'shadow-none',
    headerClassName: 'flex items-start justify-between',
    descriptionClassName: 'text-balance',
    triggerClassName: 'size-8',
  },
  shimmer: {
    className: 'relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent [--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]',
    backgroundColor: 'var(--color-muted-foreground)',
  },
  artifacts: {
    panelClassName: 'bg-background text-foreground',
    panelChatClassName: 'border-r bg-background p-2 pt-4',
    panelContentClassName: 'bg-background',
    panelViewportClassName: 'relative h-full overflow-auto',
    panelInputClassName: 'sticky bottom-0 border-t bg-background',
    headerClassName: 'border-border bg-background',
    contentClassName: 'bg-background text-foreground',
    previewHeaderClassName: 'artifact-header bg-foreground text-background flex flex-row items-start justify-between gap-2 border-b-0 p-4 sm:items-center',
    previewContentClassName: 'h-[257px] artifact-content border border-foreground/20 border-t-0',
    editorClassName: 'h-full flex flex-col text-black',
    editorHeaderClassName: 'sticky top-0 z-10 bg-background border-b p-6 pb-4',
    errorClassName: 'mt-2 text-sm text-red-600 dark:text-red-400',
  },
  conversation: {
    className: 'overflow-hidden bg-[#FFFFFF]',
    contentClassName: 'flex-1 min-h-0 w-full h-full',
  },
};

/**
 * Merges host overrides into the complete generic assistant configuration.
 *
 * @param overrides - Optional host-specific presentation values.
 * @returns A complete assistant style configuration.
 */
export function mergeAssistantStyleConfig(
  overrides?: AssistantStyleConfig,
): AssistantStyleConfig {
  return {
    ...defaultAssistantStyleConfig,
    ...overrides,
    shell: { ...defaultAssistantStyleConfig.shell, ...overrides?.shell },
    branding: { ...defaultAssistantStyleConfig.branding, ...overrides?.branding },
    emptyState: { ...defaultAssistantStyleConfig.emptyState, ...overrides?.emptyState },
    input: { ...defaultAssistantStyleConfig.input, ...overrides?.input },
    messages: { ...defaultAssistantStyleConfig.messages, ...overrides?.messages },
    reasoning: { ...defaultAssistantStyleConfig.reasoning, ...overrides?.reasoning },
    thinkingSteps: { ...defaultAssistantStyleConfig.thinkingSteps, ...overrides?.thinkingSteps },
    loading: { ...defaultAssistantStyleConfig.loading, ...overrides?.loading },
    suggestions: { ...defaultAssistantStyleConfig.suggestions, ...overrides?.suggestions },
    tools: { ...defaultAssistantStyleConfig.tools, ...overrides?.tools },
    chainOfThought: { ...defaultAssistantStyleConfig.chainOfThought, ...overrides?.chainOfThought },
    plan: { ...defaultAssistantStyleConfig.plan, ...overrides?.plan },
    shimmer: { ...defaultAssistantStyleConfig.shimmer, ...overrides?.shimmer },
    artifacts: { ...defaultAssistantStyleConfig.artifacts, ...overrides?.artifacts },
    conversation: { ...defaultAssistantStyleConfig.conversation, ...overrides?.conversation },
  };
}
