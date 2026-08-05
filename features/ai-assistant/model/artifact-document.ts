/** Provider-neutral artifact document types used by assistant UI and API clients. */
export type DocumentKind = 'text' | 'code' | 'sheet' | 'chart';

export interface AssistantDocument {
  id: string;
  createdAt: string;
  title: string;
  content: string | null;
  kind: DocumentKind;
  userId: string;
}
