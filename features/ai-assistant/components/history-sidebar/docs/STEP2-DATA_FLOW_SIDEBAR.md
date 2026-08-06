# Data Flow: Sidebar Chat History

> **Purpose**: Documents the data flow for displaying chat history in the sidebar
>

> **Status**: Implementation in progress

---

## Overview

The sidebar displays a user's chat history, grouped by date (Today, Yesterday, Last 7 days, etc.), with pagination support. Users can click on any chat item to navigate to that chat via URL.

---

## Data Flow Steps

### Step 1: Sidebar Fetches User's Chats

**Component**: `features/ai-assistant/history-sidebar/components/sidebar-history.tsx`

**How it works**:
1. Uses `useSWRInfinite` hook to fetch paginated chat history
2. Fetches from `/api/history` endpoint
3. Groups chats by date (Today, Yesterday, Last 7 days, Last 30 days, Older)
4. Displays loading states and empty states
5. Supports infinite scroll pagination

**Key Features**:
- Pagination with `ending_before` cursor
- Date grouping for better UX
- Loading skeletons
- Empty state when no chats exist

---

### Step 2: History API Route

**File**: `app/api/history/route.ts`

**Endpoints**:
- `GET /api/history?limit=20&ending_before={chatId}` - Fetch paginated chats
- `DELETE /api/history` - Delete all user's chats (future)

**Query Parameters**:
- `limit` (optional, default: 20) - Number of chats per page
- `ending_before` (optional) - Chat ID to fetch chats before (for pagination)

**Response Format**:
```typescript
{
  chats: Chat[];
  hasMore: boolean;
}
```

**Flow**:
1. Authenticate/get user from session
2. Call `getChatsByUserId()` with pagination params
3. Return paginated results

---

### Step 3: Database Query for User's Chats

**File**: `features/ai-assistant/shared/infrastructure/supabase/queries/chat-queries.ts`

**Function**: `getChatsByUserId()`

**Parameters**:
- `userId` - User ID to fetch chats for
- `limit` - Number of chats to return
- `endingBefore` (optional) - Chat ID to fetch chats before (cursor-based pagination)

**Returns**:
```typescript
{
  chats: Chat[];
  hasMore: boolean;
}
```

**How it works**:
1. Query `Chat` table filtered by `userId`
2. Order by `createdAt` DESC (newest first)
3. If `endingBefore` provided, fetch chats created before that chat's `createdAt`
4. Fetch `limit + 1` to determine if there are more pages
5. Return `limit` chats and `hasMore` flag

**SQL Logic**:
```sql
SELECT * FROM "Chat"
WHERE "userId" = :userId
  AND ("createdAt" < :endingBeforeCreatedAt OR :endingBefore IS NULL)
ORDER BY "createdAt" DESC
LIMIT :limit + 1
```

---

### Step 4: Chat Item Navigation (Updated)

**Component**: `features/ai-assistant/history-sidebar/components/chat-item.tsx`

**How it works**:
1. Uses `useNavigateToChat()` hook from chat-navigation utils
2. On click: Updates URL search params with chatId (no page navigation)
3. Highlights active chat (when current URL search param matches chat ID)
4. Shows chat title
5. Optional: Delete button, share options (future)

**URL Format**:
- `/current-page?chatId={chatId}` - Updates search params, loads chat in current container

**Active State**:
- Compares current URL search param `chatId` with item's `chatId`
- Applies active styling when matched

---

## Component Structure

```
features/ai-assistant/history-sidebar/
├── components/
│   ├── sidebar-history.tsx          # Main sidebar component with SWR
│   ├── chat-item.tsx                # Individual chat item with link
│   └── index.ts                     # Exports
├── hooks/
│   ├── use-chat-history.ts          # SWR hook for fetching chats
│   └── index.ts                     # Exports
├── utils/
│   ├── date-grouping.ts             # Group chats by date
│   ├── pagination-key.ts            # SWR pagination key generator
│   ├── chat-navigation.ts           # URL-based chat navigation utilities
│   ├── message-conversion.ts        # Convert DB messages to UIMessage format
│   └── index.ts                     # Exports
├── hooks/
│   ├── use-sidebar-refresh.ts       # Hook for triggering sidebar refresh
│   └── index.ts                     # Exports
└── README.md                         # Sidebar documentation
```

---

## Implementation Checklist

### Step 1: Sidebar Component
- [ ] Create `sidebar-history.tsx` component
- [ ] Integrate `useSWRInfinite` for pagination
- [ ] Add date grouping logic
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add infinite scroll detection

### Step 2: History API Route
- [ ] Create `app/api/history/route.ts`
- [ ] Implement GET endpoint with pagination
- [ ] Get user from session/constant user
- [ ] Call `getChatsByUserId()` query
- [ ] Return paginated response

### Step 3: Database Query
- [ ] Add `getChatsByUserId()` to `chat-queries.ts`
- [ ] Implement cursor-based pagination
- [ ] Handle `endingBefore` parameter
- [ ] Return `hasMore` flag
- [ ] Add error handling

### Step 4: Chat Item Component
- [x] Create `chat-item.tsx` component
- [x] Use `useNavigateToChat()` to update URL search params
- [x] Add active state detection (from URL search params)
- [x] Display chat title
- [x] Add hover states

### Step 5-10: Chat Navigation (New)
- [x] Create `chat-navigation.ts` utils file
- [x] Create `message-conversion.ts` utils file
- [x] Update `chat-item.tsx` to use navigation utils
- [x] Update `chat-container.tsx` to fetch and load messages
- [x] Create `/api/chat/[chatId]/messages` route
- [x] Update `chat-wrapper.tsx` to use URL search params

---

## Future Enhancements

1. **Delete Chat**: Add delete functionality to chat items
2. **Search**: Add search/filter for chats
3. **Share**: Add share functionality (public/private)
4. **Rename**: Allow users to rename chats
5. **Favorites**: Mark chats as favorites
6. **Archive**: Archive old chats

---

## Notes

- **Pagination**: Uses cursor-based pagination with `ending_before` for better performance
- **Date Grouping**: Groups chats by relative dates (Today, Yesterday, etc.) for better UX
- **SWR**: Uses `useSWRInfinite` for automatic caching and revalidation
- **URL Navigation**: Chat items update URL search params (`/current-page?chatId=xxx`) without page navigation
- **Message Loading**: Chat container automatically fetches and loads messages when chatId changes
- **User Session**: Currently uses constant user, will be replaced with proper auth later

---

## Chat Navigation: URL-Based Chat Selection

### Overview

Users can click on sidebar chat items to load that chat's messages in the current chat container, without navigating to a new page. The chatId is stored in URL search params, allowing users to continue conversations and share chat URLs.

---

### Step 5: Chat Navigation Utilities

**File**: `features/ai-assistant/history-sidebar/utils/chat-navigation.ts`

**Purpose**: Utilities for navigating between chats using URL search params

**Functions**:

1. **`useCurrentChatId()`**: Hook to get current chatId from URL search params
   ```typescript
   const chatId = useCurrentChatId(); // Returns: 'abc-123' or null
   ```

2. **`useNavigateToChat()`**: Hook to navigate to a chat by updating URL
   ```typescript
   const navigateToChat = useNavigateToChat();
   navigateToChat('abc-123'); // Updates URL to /current-page?chatId=abc-123
   ```

3. **`useClearChat()`**: Hook to clear chat selection from URL
   ```typescript
   const clearChat = useClearChat();
   clearChat(); // Removes chatId from URL
   ```

**How it works**:
- Uses Next.js `useRouter` and `useSearchParams` hooks
- Updates URL without full page navigation (`router.push` with `scroll: false`)
- Stores chatId in search params: `/current-page?chatId=abc-123`

---

### Step 6: Message Conversion Utilities

**File**: `features/ai-assistant/history-sidebar/utils/message-conversion.ts`

**Purpose**: Convert database Message format to UIMessage format for useChat

**Functions**:

1. **`convertMessageToUIMessage(message: Message): UIMessage`**
   - Converts single database message to AI SDK UIMessage format
   - Maps: `id`, `role`, `parts`, `attachments`

2. **`convertMessagesToUIMessages(messages: Message[]): UIMessage[]`**
   - Converts array of database messages to UIMessage array
   - Used when loading chat history

---

### Step 7: Chat Item Navigation

**File**: `features/ai-assistant/history-sidebar/components/chat-item.tsx`

**Changes**:
- Removed `Link` component (no page navigation)
- Added `useNavigateToChat()` hook
- On click: Updates URL search params with chatId
- Chat container detects URL change and loads messages

**Flow**:
```
User clicks chat item
  ↓
navigateToChat(chatId) called
  ↓
URL updated: /current-page?chatId=abc-123
  ↓
Chat container detects chatId change
  ↓
Fetches messages from API
  ↓
Loads messages into useChat
```

---

### Step 8: Chat Container Message Loading

**File**: `features/ai-assistant/chat-container.tsx`

**Changes**:
- Added `useEffect` to watch `chatId` prop
- When `chatId` changes:
  1. Fetches messages from `/api/chat/[chatId]/messages`
  2. Converts database messages to UIMessage format
  3. Loads messages into `useChat` via `setMessages()`
  4. User can continue conversation in same chat

**Features**:
- Only fetches if chatId actually changed (prevents duplicate fetches)
- Handles 404 gracefully (new chat, no messages yet)
- Shows loading state while fetching
- Continues conversation in same chat when user sends new message

---

### Step 9: Chat Messages API Route

**File**: `app/api/chat/[chatId]/messages/route.ts`

**Endpoint**: `GET /api/chat/[chatId]/messages`

**Flow**:
1. Extract `chatId` from route params
2. Call `getMessagesByChatId()` database query
3. Return messages array as JSON

**Response Format**:
```typescript
{
  messages: Message[]; // Database messages
}
```

---

### Step 10: Chat Wrapper URL Integration

**File**: `features/ai-assistant/chat-wrapper.tsx`

**Changes**:
- Uses `useCurrentChatId()` to get chatId from URL search params
- Falls back to prop `chatId` if no URL param (for new chats)
- Passes both `chatId` (combined) and `urlChatId` (from URL) to ChatContainer
- `urlChatId` can be `null` when cleared for new chat

**Flow**:
```
URL: /current-page?chatId=abc-123
  ↓
useCurrentChatId() returns 'abc-123'
  ↓
ChatContainer receives:
  - chatId='abc-123' (for useChat hook)
  - urlChatId='abc-123' (for useChatMessages hook)
  ↓
ChatContainer fetches and loads messages
```

---

### Step 11: New Chat Button

**File**: `features/ai-assistant/history-sidebar/components/sidebar-history.tsx`

**Purpose**: Allow users to start a fresh conversation by clearing the current chat selection

**Changes**:
- Added "+" button to the left of refresh button in sidebar header
- Uses `Plus` icon from lucide-react
- Calls `handleNewChat()` which uses `useClearChat()` hook
- Button appears in both empty state and chat list views

**How it works**:
1. User clicks "+" button
2. `clearChat()` removes `chatId` from URL search params
3. `useCurrentChatId()` returns `null`
4. `useChatMessages` detects `null` and resets messages
5. User can start typing a new message
6. When first message is submitted, API creates new chat and returns new `chatId`
7. New chat is saved to database and appears in sidebar

**UI Placement**:
- Located in sidebar header, to the left of refresh button
- Same styling as refresh button (hover effects, etc.)
- Accessible with proper ARIA labels

---

### Step 12: Message Reset on New Chat

**File**: `features/ai-assistant/history-sidebar/hooks/use-chat-messages.ts`

**Changes**:
- Updated to accept `chatId: string | null` (was `string`)
- Detects when `chatId` is `null` (URL cleared for new chat)
- Resets messages when chatId transitions from a value to `null`
- Only resets if a chatId was previously loaded (not on initial mount)

**Logic**:
```typescript
// If chatId is cleared (new chat), reset messages and ref
if (!chatId) {
  // Only reset if we had a chatId loaded before (not initial mount)
  if (lastLoadedChatIdRef.current !== null) {
    logger.info('[useChatMessages] Chat cleared, resetting messages for new chat');
    lastLoadedChatIdRef.current = null;
    setMessages([]);
  }
  return;
}
```

**Why**:
- When user clicks "+" to start new chat, we need to clear the current messages
- This allows user to start fresh without seeing previous chat's messages
- Chat will only be saved to database when first message is submitted

---

## Complete Data Flow: Chat Navigation

### User Clicks Sidebar Item

```
1. User clicks chat item in sidebar
   ↓
2. navigateToChat(chatId) updates URL: /current-page?chatId=abc-123
   ↓
3. Chat wrapper detects URL change via useCurrentChatId()
   ↓
4. Chat wrapper passes new chatId to ChatContainer
   ↓
5. ChatContainer useEffect detects chatId change
   ↓
6. Fetches messages: GET /api/chat/abc-123/messages
   ↓
7. API route calls getMessagesByChatId({ chatId: 'abc-123' })
   ↓
8. Database returns messages array
   ↓
9. API returns messages to client
   ↓
10. ChatContainer converts messages to UIMessage format
   ↓
11. ChatContainer calls setMessages(uiMessages)
   ↓
12. useChat displays messages in chat UI
   ↓
13. User can continue conversation (sends to same chatId)
```

### User Clicks New Chat Button (+)

```
1. User clicks "+" button in sidebar header
   ↓
2. handleNewChat() calls clearChat()
   ↓
3. clearChat() removes chatId from URL search params
   ↓
4. URL becomes: / (no chatId param)
   ↓
5. useCurrentChatId() returns null
   ↓
6. Chat wrapper passes urlChatId=null to ChatContainer
   ↓
7. useChatMessages detects null chatId
   ↓
8. useChatMessages resets messages: setMessages([])
   ↓
9. Chat UI shows empty state (ready for new message)
   ↓
10. User types and submits first message
   ↓
11. API creates new chat and returns new chatId
   ↓
12. New chat is saved to database
   ↓
13. Sidebar refreshes to show new chat in history
```

---

## Implementation Checklist

### Chat Navigation
- [x] Create `chat-navigation.ts` utils file
- [x] Create `message-conversion.ts` utils file
- [x] Update `chat-item.tsx` to use navigation utils
- [x] Update `chat-container.tsx` to fetch and load messages
- [x] Create `/api/chat/[chatId]/messages` route
- [x] Update `chat-wrapper.tsx` to use URL search params
- [x] Update `sidebar-history.tsx` to get currentChatId from URL

### New Chat Button
- [x] Add "+" button to sidebar header
- [x] Implement `handleNewChat()` function
- [x] Use `useClearChat()` hook to clear URL params
- [x] Update `useChatMessages` to handle null chatId
- [x] Reset messages when chatId is cleared
- [x] Update `chat-wrapper` to pass urlChatId separately

---

**Last Updated**: 2025-01-XX
**Status**: Implementation Complete



## FIX user messages not saved to database

The issue is that useChat generates short IDs like "gUFQnioKIRTfXnUL", which aren't valid UUIDs, but the database requires UUIDs.
Fixed by:
Always generating a UUID for user messages instead of using the ID from useChat.
Generating UUIDs for assistant messages as well.
The error was:
Now all message IDs are generated using generateUUID(), which produces valid UUIDs that the database accepts. User messages should now be saved correctly.
The fix ensures:
User messages get a valid UUID when saved
Assistant messages also get valid UUIDs
The original useChat ID is logged for reference but not used as the database ID
Try sending a message again; user messages should now be saved with the correct role.


# Add: Sidebar live update
add a refetch utility that can be called in chat on finish
and update the sidebar history to Listen for Refetch Events
by a shared state in the chat-wrapper.

# FIX: user-user-session: infinite loops on user load
add isUpdatingRef and handleUserStateChange
and a setTimeout to call window.dispatchEvent

# FIX: User loaded but messages did not load for them
update the sidebar-history component's to add useEffect containing mutate to Revalidate SWR cache when user is loaded
SWR should only fetch when a user exists, and it should revalidate when the user changes. Updating the sidebar to conditionally enable SWR and revalidate on user changes:
Add the sidebar to be next the ChatContainer in the ChatWrapper

## Navigation enhancement
- when we sync the messages on finish with the sidebar, i would like also to update the params but

on finish use the updateChatIdInUrl hook and
in useChatMEssages (fetches based on new chatID from the params from the chat-wrapper)
Skip fetch if URL chatId matches current chatId and messages already exist
