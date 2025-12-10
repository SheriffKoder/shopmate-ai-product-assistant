# Step 1: User Initialization & Message Persistence

> **Purpose**: Implement basic user management and message persistence for chat
> 
> **Status**: Planning Phase
> **Priority**: High - Foundation for chat persistence

---

## Overview

This step implements the foundation for chat persistence:
1. **User Management**: Create users table and simple user initialization
2. **Message Persistence**: Save user and AI messages to database

**Note**: For now, we'll use a simple constant user (no full authentication system).

---

## Part 1: User Initialization

### 1.1 Database Schema: Users Table

**File**: `features/ai-assistant/lib/supabase/migrations/002_create_user_table.sql`

```sql
-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(64) NOT NULL,
  name VARCHAR(255),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);

-- Create index for createdAt (for sorting)
CREATE INDEX IF NOT EXISTS idx_user_created_at ON "User"(createdAt);
```

**Purpose**: Store user records (simplified - no password/auth for now)

---

### 1.2 TypeScript Types

**File**: `features/ai-assistant/lib/supabase/types.ts` (add to existing)

```typescript
// Add to existing types
export type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
};
```

---

### 1.3 Database Queries: User Operations

**File**: `features/ai-assistant/lib/supabase/queries/user-queries.ts` (new file)

```typescript
/**
 * User Database Queries
 * 
 * Purpose: Database operations for user management
 * Used in: User initialization and session management
 * Why: Centralized database queries for user operations
 */

import { createClient } from '@/features/ai-assistant/lib/supabase/client';
import type { User } from '@/features/ai-assistant/lib/supabase/types';

/**
 * Create a new user in the database
 * 
 * Steps:
 * 1. Connect to Supabase client
 * 2. Insert user record with email and name
 * 3. Return created user or null if error
 * 
 * @param email - User email address
 * @param name - User name (optional)
 * @returns Created user object or null
 */
export async function createUser({
  email,
  name,
}: {
  email: string;
  name?: string;
}): Promise<User | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('User')
      .insert({
        email,
        name: name || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('[createUser] Error:', error);
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error('[createUser] Exception:', error);
    return null;
  }
}

/**
 * Get user by email
 * 
 * Steps:
 * 1. Connect to Supabase client
 * 2. Query User table by email
 * 3. Return first matching user or null
 * 
 * @param email - User email address
 * @returns User object or null if not found
 */
export async function getUserByEmail({
  email,
}: {
  email: string;
}): Promise<User | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      // User not found is not an error - return null
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[getUserByEmail] Error:', error);
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error('[getUserByEmail] Exception:', error);
    return null;
  }
}

/**
 * Get user by ID
 * 
 * Steps:
 * 1. Connect to Supabase client
 * 2. Query User table by ID
 * 3. Return user or null if not found
 * 
 * @param id - User ID (UUID)
 * @returns User object or null if not found
 */
export async function getUserById({
  id,
}: {
  id: string;
}): Promise<User | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[getUserById] Error:', error);
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error('[getUserById] Exception:', error);
    return null;
  }
}

/**
 * Get or create a constant user (for demo purposes)
 * 
 * Steps:
 * 1. Try to get existing user with constant email
 * 2. If not found, create new user
 * 3. Return user object
 * 
 * @returns User object (existing or newly created)
 */
export async function getOrCreateConstantUser(): Promise<User | null> {
  const CONSTANT_USER_EMAIL = 'shopmate-user@example.com';
  const CONSTANT_USER_NAME = 'ShopMate User';
  
  // Try to get existing user
  const existingUser = await getUserByEmail({ email: CONSTANT_USER_EMAIL });
  
  if (existingUser) {
    return existingUser;
  }
  
  // Create new user
  return await createUser({
    email: CONSTANT_USER_EMAIL,
    name: CONSTANT_USER_NAME,
  });
}
```

---

### 1.4 API Routes: User Operations

**File**: `app/api/user/route.ts` (new file)

```typescript
/**
 * User API Route
 * 
 * Purpose: Handle user creation and retrieval
 * Used in: Chat header buttons (cloud-upload, cloud-download)
 * Why: Server-side API for user operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, getOrCreateConstantUser } from '@/features/ai-assistant/lib/supabase/queries/user-queries';

/**
 * POST /api/user - Create a new user
 * 
 * Body: { email: string, name?: string }
 * Returns: { user: User } or { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists', user: existingUser },
        { status: 409 }
      );
    }
    
    // Create new user
    const user = await createUser({ email, name });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/user] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user - Get user by email or get/create constant user
 * 
 * Query params:
 *   - email: Get user by email
 *   - constant: Get or create constant user (no params needed)
 * 
 * Returns: { user: User } or { error: string }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const constant = searchParams.get('constant');
    
    // Get or create constant user
    if (constant === 'true') {
      const user = await getOrCreateConstantUser();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Failed to get or create constant user' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ user });
    }
    
    // Get user by email
    if (email) {
      const user = await getUserByEmail({ email });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ user });
    }
    
    return NextResponse.json(
      { error: 'Email or constant parameter required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[GET /api/user] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### 1.5 Client-Side: User Session Management

**File**: `features/ai-assistant/hooks/use-user-session.ts` (new file)

```typescript
/**
 * User Session Hook
 * 
 * Purpose: Manage user session state (client-side)
 * Used in: Chat components, user initialization
 * Why: Centralized user state management
 * 
 * How it works:
 * 1. Stores user in localStorage
 * 2. Provides functions to create/load user
 * 3. Syncs with API routes
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/features/ai-assistant/lib/supabase/types';

const USER_STORAGE_KEY = 'shopmate-user';

/**
 * Hook to manage user session
 * 
 * Returns:
 * - user: Current user object or null
 * - isLoading: Whether user is being loaded
 * - createUser: Function to create constant user
 * - loadUser: Function to load user from API
 * - clearUser: Function to clear user session
 */
export function useUserSession() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('[useUserSession] Failed to parse stored user:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);
  
  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);
  
  /**
   * Create constant user (cloud-upload action)
   * 
   * Steps:
   * 1. Call API to get or create constant user
   * 2. Update local state
   * 3. Save to localStorage
   */
  const createUser = useCallback(async (): Promise<User | null> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/user?constant=true');
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[createUser] API error:', data.error);
        return null;
      }
      
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('[createUser] Exception:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Load user from API (cloud-download action)
   * 
   * Steps:
   * 1. Call API to get constant user
   * 2. Update local state
   * 3. Save to localStorage
   */
  const loadUser = useCallback(async (): Promise<User | null> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/user?constant=true');
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[loadUser] API error:', data.error);
        return null;
      }
      
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('[loadUser] Exception:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Clear user session
   */
  const clearUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);
  
  return {
    user,
    isLoading,
    createUser,
    loadUser,
    clearUser,
  };
}
```

---

### 1.6 UI: Chat Header Buttons

**File**: `features/ai-assistant/chat-wrapper.tsx` (modify existing)

Add cloud-upload and cloud-download icons beside the chevron:

```typescript
// Add imports
import { CloudUpload, CloudDownload } from 'lucide-react';
import { useUserSession } from '@/features/ai-assistant/hooks/use-user-session';
import { toast } from 'sonner'; // or your toast library

// Inside ChatWrapper component, modify the header section:
<div
  onClick={() => setIsChatCollapsed(!isChatCollapsed)}
  className={`p-4 font-semibold flex flex-row items-center justify-between gap-2 cursor-pointer transition-colors
    ${isChatCollapsed ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gradient-to-r from-black to-black'}`}
  role="button"
  tabIndex={0}
  aria-label={isChatCollapsed ? 'Expand chat' : 'Collapse chat'}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsChatCollapsed(!isChatCollapsed);
    }
  }}
>
  <div className="flex flex-row items-center gap-2">
    <Image src="/images/icon.png" alt="Liora AI Assistant" width={24} height={24} />
    <span className="text-white">ShopMate AI</span>
  </div>
  
  {/* Add user action buttons */}
  <div className="flex flex-row items-center gap-2">
    {/* Cloud Upload: Create user */}
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent collapse toggle
        handleCreateUser();
      }}
      className="p-1.5 rounded hover:bg-white/10 transition-colors"
      aria-label="Create user"
      title="Create user in database"
    >
      <CloudUpload className="w-4 h-4 text-white" />
    </button>
    
    {/* Cloud Download: Load user */}
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent collapse toggle
        handleLoadUser();
      }}
      className="p-1.5 rounded hover:bg-white/10 transition-colors"
      aria-label="Load user"
      title="Load user from database"
    >
      <CloudDownload className="w-4 h-4 text-white" />
    </button>
    
    {/* Chevron: Collapse/Expand */}
    <div className="p-1">
      {isChatCollapsed ? (
        <ChevronUp className="w-5 h-5 text-white" />
      ) : (
        <ChevronDown className="w-5 h-5 text-white" />
      )}
    </div>
  </div>
</div>

// Add handlers inside component:
const { user, createUser, loadUser } = useUserSession();

const handleCreateUser = async () => {
  const newUser = await createUser();
  if (newUser) {
    toast.success('User created successfully!');
  } else {
    toast.error('Failed to create user');
  }
};

const handleLoadUser = async () => {
  const loadedUser = await loadUser();
  if (loadedUser) {
    toast.success('User loaded successfully!');
  } else {
    toast.error('Failed to load user');
  }
};
```

---

## Part 2: Messages / Chats Persistence

### 2.1 Database Schema: Chat and Message Tables

**File**: `features/ai-assistant/lib/supabase/migrations/003_create_chat_and_message_tables.sql`

```sql
-- Create Chat table
CREATE TABLE IF NOT EXISTS "Chat" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Message table
CREATE TABLE IF NOT EXISTS "Message" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "chatId" UUID NOT NULL REFERENCES "Chat"(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  parts JSONB NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON "Chat"("userId");
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON "Chat"("createdAt");
CREATE INDEX IF NOT EXISTS idx_message_chat_id ON "Message"("chatId");
CREATE INDEX IF NOT EXISTS idx_message_created_at ON "Message"("createdAt");
```

**Purpose**: Store chats and messages linked to users

---

### 2.2 TypeScript Types

**File**: `features/ai-assistant/lib/supabase/types.ts` (add to existing)

```typescript
// Add to existing types
export type Chat = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  parts: any[]; // JSON array of message parts
  attachments: any[]; // JSON array of attachments
  createdAt: string;
};
```

---

### 2.3 Database Queries: Chat and Message Operations

**File**: `features/ai-assistant/lib/supabase/queries/chat-queries.ts` (new file)

```typescript
/**
 * Chat Database Queries
 * 
 * Purpose: Database operations for chat and message management
 * Used in: Chat API route, message persistence
 * Why: Centralized database queries for chat operations
 */

import { createClient } from '@/features/ai-assistant/lib/supabase/client';
import type { Chat, Message } from '@/features/ai-assistant/lib/supabase/types';

/**
 * Create a new chat
 */
export async function createChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}): Promise<Chat | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('Chat')
      .insert({
        id,
        userId,
        title,
      })
      .select()
      .single();
    
    if (error) {
      console.error('[createChat] Error:', error);
      return null;
    }
    
    return data as Chat;
  } catch (error) {
    console.error('[createChat] Exception:', error);
    return null;
  }
}

/**
 * Get chat by ID
 */
export async function getChatById({
  id,
}: {
  id: string;
}): Promise<Chat | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('Chat')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[getChatById] Error:', error);
      return null;
    }
    
    return data as Chat;
  } catch (error) {
    console.error('[getChatById] Exception:', error);
    return null;
  }
}

/**
 * Save messages to database
 */
export async function saveMessages({
  messages,
}: {
  messages: Omit<Message, 'createdAt'>[];
}): Promise<Message[] | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('Message')
      .insert(messages)
      .select();
    
    if (error) {
      console.error('[saveMessages] Error:', error);
      return null;
    }
    
    return data as Message[];
  } catch (error) {
    console.error('[saveMessages] Exception:', error);
    return null;
  }
}

/**
 * Get messages by chat ID (ordered by createdAt)
 */
export async function getMessagesByChatId({
  chatId,
}: {
  chatId: string;
}): Promise<Message[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('Message')
      .select('*')
      .eq('chatId', chatId)
      .order('createdAt', { ascending: true });
    
    if (error) {
      console.error('[getMessagesByChatId] Error:', error);
      return [];
    }
    
    return (data || []) as Message[];
  } catch (error) {
    console.error('[getMessagesByChatId] Exception:', error);
    return [];
  }
}
```

---

### 2.4 Update Chat API Route: Save Messages

**File**: `app/api/ai-assistant/route.ts` (modify existing)

Add message saving logic:

```typescript
// Add imports at top
import { createChat, getChatById, saveMessages } from '@/features/ai-assistant/lib/supabase/queries/chat-queries';
import { getOrCreateConstantUser } from '@/features/ai-assistant/lib/supabase/queries/user-queries';

// Inside POST handler, after receiving request:
export async function POST(request: Request) {
  // ... existing code ...
  
  // Get or create constant user
  const user = await getOrCreateConstantUser();
  if (!user) {
    return NextResponse.json(
      { error: 'User not found. Please create a user first.' },
      { status: 401 }
    );
  }
  
  // Check if chat exists, create if not
  let chat = await getChatById({ id: chatId });
  if (!chat) {
    // Generate title from first user message
    const title = extractTitleFromMessage(body.messages?.[0] || 'New Chat');
    
    chat = await createChat({
      id: chatId,
      userId: user.id,
      title,
    });
    
    if (!chat) {
      return NextResponse.json(
        { error: 'Failed to create chat' },
        { status: 500 }
      );
    }
  }
  
  // Save user message immediately
  const userMessage = body.messages?.find(m => m.role === 'user');
  if (userMessage) {
    await saveMessages({
      messages: [{
        id: userMessage.id || generateUUID(),
        chatId: chat.id,
        role: 'user',
        parts: userMessage.parts || [],
        attachments: userMessage.attachments || [],
      }],
    });
  }
  
  // ... existing streaming code ...
  
  // In onFinish callback, save AI messages:
  onFinish: async ({ messages }) => {
    // Save AI messages
    const aiMessages = messages
      .filter(m => m.role === 'assistant')
      .map(m => ({
        id: m.id,
        chatId: chat.id,
        role: 'assistant' as const,
        parts: m.parts || [],
        attachments: m.attachments || [],
      }));
    
    if (aiMessages.length > 0) {
      await saveMessages({ messages: aiMessages });
    }
  },
  
  // ... rest of existing code ...
}

// Helper function to extract title from message
function extractTitleFromMessage(message: any): string {
  if (typeof message === 'string') {
    return message.slice(0, 50) || 'New Chat';
  }
  if (message?.parts) {
    const textPart = message.parts.find((p: any) => p.type === 'text');
    if (textPart?.text) {
      return textPart.text.slice(0, 50) || 'New Chat';
    }
  }
  return 'New Chat';
}
```

---

## Implementation Checklist

### Part 1: User Initialization

- [ ] Create migration: `002_create_user_table.sql`
- [ ] Add User type to `types.ts`
- [ ] Create `user-queries.ts` with:
  - [ ] `createUser()`
  - [ ] `getUserByEmail()`
  - [ ] `getUserById()`
  - [ ] `getOrCreateConstantUser()`
- [ ] Create API route: `app/api/user/route.ts`
  - [ ] POST endpoint (create user)
  - [ ] GET endpoint (get user by email or constant)
- [ ] Create hook: `use-user-session.ts`
  - [ ] State management
  - [ ] localStorage persistence
  - [ ] `createUser()` function
  - [ ] `loadUser()` function
  - [ ] `clearUser()` function
- [ ] Update `chat-wrapper.tsx`:
  - [ ] Add CloudUpload icon button
  - [ ] Add CloudDownload icon button
  - [ ] Add click handlers
  - [ ] Add toast notifications

### Part 2: Messages / Chats

- [ ] Create migration: `003_create_chat_and_message_tables.sql`
- [ ] Add Chat and Message types to `types.ts`
- [ ] Create `chat-queries.ts` with:
  - [ ] `createChat()`
  - [ ] `getChatById()`
  - [ ] `saveMessages()`
  - [ ] `getMessagesByChatId()`
- [ ] Update `app/api/ai-assistant/route.ts`:
  - [ ] Get or create user at start
  - [ ] Create chat if doesn't exist
  - [ ] Save user message immediately
  - [ ] Save AI messages in `onFinish` callback

---

## Testing Steps

### Part 1 Testing

1. **Create User**:
   - Click cloud-upload icon in chat header
   - Verify toast: "User created successfully!"
   - Check database: User should exist with email `shopmate-user@example.com`

2. **Load User**:
   - Clear localStorage
   - Click cloud-download icon
   - Verify toast: "User loaded successfully!"
   - Check localStorage: User should be stored

### Part 2 Testing

1. **Send Message**:
   - Ensure user is created/loaded
   - Send a message in chat
   - Check database:
     - Chat should be created
     - User message should be saved
     - After AI responds, assistant message should be saved

2. **Verify Persistence**:
   - Refresh page
   - Messages should persist (will be loaded in future step)

---

## Notes

- **Constant User**: For now, we use a single constant user (`shopmate-user@example.com`)
- **No Authentication**: This is a simplified version - no password/auth required
- **Future Enhancement**: Will add proper authentication in later steps
- **Error Handling**: All database operations should handle errors gracefully
- **Toast Notifications**: Use your existing toast library (sonner, react-hot-toast, etc.)

---

**Last Updated**: 2025-01-XX
**Status**: Ready for Implementation

