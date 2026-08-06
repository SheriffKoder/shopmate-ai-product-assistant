# History Sidebar

> **Purpose**: Sidebar component for displaying and navigating chat history
>

> **Status**: Ready for integration

---

## Overview

The history sidebar displays a user's chat history, grouped by date (Today, Yesterday, Last 7 days, etc.), with infinite scroll pagination. Users can click on any chat item to navigate to that chat.

---

## Structure

```
history-sidebar/
├── components/
│   ├── sidebar-history.tsx    # Main sidebar component with SWR
│   ├── chat-item.tsx          # Individual chat item with link
│   └── index.ts               # Exports
├── hooks/
│   └── (future hooks if needed)
├── utils/
│   ├── date-grouping.ts       # Group chats by date
│   ├── pagination-key.ts      # SWR pagination key generator
│   └── index.ts               # Exports
└── README.md                  # This file
```

---

## Components

### SidebarHistory

Main component that:
- Fetches chat history using `useSWRInfinite`
- Groups chats by date
- Displays loading and empty states
- Supports infinite scroll
- Highlights active chat

**Usage**:
```tsx
import { SidebarHistory } from '@/features/ai-assistant/history-sidebar';

<SidebarHistory />
```

### ChatItem

Individual chat item that:
- Links to `/chat/[chatId]` route
- Highlights when active
- Shows chat title
- Memoized for performance

**Usage**:
```tsx
import { ChatItem } from '@/features/ai-assistant/history-sidebar';

<ChatItem

  chat={chat}

  isActive={chat.id === currentChatId}
/>
```

---

## Utils

### date-grouping.ts

Groups chats by relative dates:
- Today
- Yesterday
- Last 7 days
- Last 30 days
- Older

### pagination-key.ts

Generates SWR pagination keys for infinite scroll:
- First page: `/api/history?limit=20`
- Subsequent pages: `/api/history?ending_before={chatId}&limit=20`

---

## API Integration

The sidebar fetches data from:
- `GET /api/history?limit=20&ending_before={chatId}`

See `app/api/history/route.ts` for API implementation.

---

## Database Integration

Uses `getChatsByUserId()` from:
- `shared/infrastructure/supabase/queries/chat-queries.ts`

---

## Dependencies

- `swr` - For data fetching and caching
- `swr/infinite` - For infinite scroll pagination
- `date-fns` - For date grouping
- `next/navigation` - For routing and params
- `useUserSession` - For user state

---

## Future Enhancements

1. **Delete Chat**: Add delete functionality
2. **Search**: Add search/filter
3. **Rename**: Allow renaming chats
4. **Favorites**: Mark chats as favorites
5. **Archive**: Archive old chats

---

**Last Updated**: 2025-01-XX

