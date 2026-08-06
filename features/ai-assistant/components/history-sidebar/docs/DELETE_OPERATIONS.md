## Chat Delete Flow (Sidebar)

- **Trigger**: User clicks `Delete` in the chat item ellipsis menu (`ChatItemActions`).
- **API**: Calls `DELETE /api/chat/[chatId]`, which:
  - Verifies chat exists and belongs to the (constant) user.
  - Deletes all messages (explicit) and the chat record.
- **Client refresh**:
  - `ChatItemActions` calls `onDeleted(chatId)` on success.
  - In `SidebarHistory`, `onDeleted` calls `mutate()` to revalidate chat history.
  - If the deleted chat is the active one, `clearChat()` removes `chatId` from URL, starting a new chat.
- **Related files**:
  - `features/ai-assistant/history-sidebar/components/chat-item-actions.tsx`
  - `features/ai-assistant/history-sidebar/components/sidebar-history.tsx`
  - `app/api/chat/[chatId]/route.ts`
  - `shared/infrastructure/supabase/queries/chat-queries.ts` (deleteChatById)

