/**
 * Supabase Database Types
 * 
 * Purpose: TypeScript types for database tables and related operations
 * Used in: API routes, database queries, client components
 * Why: Provides type safety for database operations
 */

/**
 * Document Kind
 * 
 * Represents the type of artifact document
 */
export type DocumentKind = 'text' | 'code' | 'sheet';

/**
 * Document (Select)
 * 
 * Type for documents retrieved from the database
 * Matches the structure of the Document table in Supabase
 */
export interface Document {
  /** Document ID (UUID). Multiple rows can have same id for version history */
  id: string;
  
  /** Timestamp when this version was created. Used with id as composite primary key */
  createdAt: string; // ISO timestamp string
  
  /** Document title */
  title: string;
  
  /** Full document content (can be large for tables/code) */
  content: string | null;
  
  /** Artifact type: text, code, or sheet */
  kind: DocumentKind;
  
  /** User ID who owns this document */
  userId: string;
}

/**
 * Document Insert
 * 
 * Type for inserting new documents into the database
 * createdAt is optional (defaults to NOW() in database)
 */
export interface DocumentInsert {
  /** Document ID (UUID) */
  id: string;
  
  /** Document title */
  title: string;
  
  /** Full document content */
  content: string | null;
  
  /** Artifact type */
  kind: DocumentKind;
  
  /** User ID who owns this document */
  userId: string;
  
  /** Timestamp (optional, defaults to NOW() in database) */
  createdAt?: string;
}

/**
 * Document Update
 * 
 * Type for updating existing documents
 * Note: In practice, we create new versions (new rows) rather than updating
 * This type is provided for potential future use cases
 */
export interface DocumentUpdate {
  title?: string;
  content?: string | null;
  kind?: DocumentKind;
}

/**
 * Document Query Filters
 * 
 * Type for filtering document queries
 */
export interface DocumentFilters {
  /** Filter by document ID */
  id?: string;
  
  /** Filter by user ID */
  userId?: string;
  
  /** Filter by document kind */
  kind?: DocumentKind;
  
  /** Filter by date range (start) */
  createdAtFrom?: string;
  
  /** Filter by date range (end) */
  createdAtTo?: string;
}

/**
 * Document Query Options
 * 
 * Options for querying documents
 */
export interface DocumentQueryOptions {
  /** Order by field */
  orderBy?: 'createdAt' | 'title';
  
  /** Order direction */
  orderDirection?: 'asc' | 'desc';
  
  /** Limit number of results */
  limit?: number;
  
  /** Offset for pagination */
  offset?: number;
}

// ============================================
// User Types
// ============================================

/**
 * User (Select)
 * 
 * Type for users retrieved from the database
 * Matches the structure of the User table in Supabase
 */
export interface User {
  /** User ID (UUID primary key) */
  id: string;
  
  /** User email address (unique) */
  email: string;
  
  /** User display name (optional) */
  name: string | null;
  
  /** Timestamp when user was created */
  createdAt: string; // ISO timestamp string
  
  /** Timestamp when user was last updated */
  updatedAt: string; // ISO timestamp string
}

/**
 * User Insert
 * 
 * Type for inserting new users into the database
 * createdAt and updatedAt are optional (defaults to NOW() in database)
 */
export interface UserInsert {
  /** User email address (required, must be unique) */
  email: string;
  
  /** User display name (optional) */
  name?: string | null;
  
  /** User ID (optional, defaults to gen_random_uuid() in database) */
  id?: string;
  
  /** Timestamp (optional, defaults to NOW() in database) */
  createdAt?: string;
  
  /** Timestamp (optional, defaults to NOW() in database) */
  updatedAt?: string;
}

/**
 * User Update
 * 
 * Type for updating existing users
 */
export interface UserUpdate {
  /** Update email address */
  email?: string;
  
  /** Update display name */
  name?: string | null;
  
  /** Update timestamp (automatically set on update) */
  updatedAt?: string;
}

/**
 * User Query Filters
 * 
 * Type for filtering user queries
 */
export interface UserFilters {
  /** Filter by user ID */
  id?: string;
  
  /** Filter by email address */
  email?: string;
  
  /** Filter by date range (start) */
  createdAtFrom?: string;
  
  /** Filter by date range (end) */
  createdAtTo?: string;
}

// ============================================
// Chat Types
// ============================================

/**
 * Chat (Select)
 * 
 * Type for chats retrieved from the database
 * Matches the structure of the Chat table in Supabase
 */
export interface Chat {
  /** Chat ID (UUID primary key). Used in URL routing (/chat/[id]) */
  id: string;
  
  /** User ID who owns this chat (foreign key to User table) */
  userId: string;
  
  /** Chat title (auto-generated from first user message) */
  title: string;
  
  /** Timestamp when chat was created */
  createdAt: string; // ISO timestamp string
  
  /** Timestamp when chat was last updated */
  updatedAt: string; // ISO timestamp string
}

/**
 * Chat Insert
 * 
 * Type for inserting new chats into the database
 * createdAt and updatedAt are optional (defaults to NOW() in database)
 */
export interface ChatInsert {
  /** Chat ID (optional, defaults to gen_random_uuid() in database) */
  id?: string;
  
  /** User ID who owns this chat (required) */
  userId: string;
  
  /** Chat title (required) */
  title: string;
  
  /** Timestamp (optional, defaults to NOW() in database) */
  createdAt?: string;
  
  /** Timestamp (optional, defaults to NOW() in database) */
  updatedAt?: string;
}

/**
 * Chat Update
 * 
 * Type for updating existing chats
 */
export interface ChatUpdate {
  /** Update chat title */
  title?: string;
  
  /** Update timestamp (automatically set on update) */
  updatedAt?: string;
}

// ============================================
// Message Types
// ============================================

/**
 * Message Role
 * 
 * Represents the role of a message in a conversation
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Message (Select)
 * 
 * Type for messages retrieved from the database
 * Matches the structure of the Message table in Supabase
 * 
 * Note: Each row represents ONE message (user OR assistant).
 * The `parts` field contains the components of that single message.
 */
export interface Message {
  /** Message ID (UUID primary key) */
  id: string;
  
  /** Chat ID this message belongs to (foreign key to Chat table) */
  chatId: string;
  
  /** Message role: user, assistant, or system */
  role: MessageRole;
  
  /** JSON array of message parts (text, tool calls, tool results, etc.) */
  parts: any[]; // JSON array - structure depends on message content
  
  /** JSON array of message attachments (files, images, etc.) */
  attachments: any[]; // JSON array - structure depends on attachment type
  
  /** Timestamp when message was created (used for chronological ordering) */
  createdAt: string; // ISO timestamp string
}

/**
 * Message Insert
 * 
 * Type for inserting new messages into the database
 * createdAt is optional (defaults to NOW() in database)
 */
export interface MessageInsert {
  /** Message ID (optional, defaults to gen_random_uuid() in database) */
  id?: string;
  
  /** Chat ID this message belongs to (required) */
  chatId: string;
  
  /** Message role (required) */
  role: MessageRole;
  
  /** JSON array of message parts (required) */
  parts: any[];
  
  /** JSON array of message attachments (optional, defaults to empty array) */
  attachments?: any[];
  
  /** Timestamp (optional, defaults to NOW() in database) */
  createdAt?: string;
}

/**
 * Message Query Filters
 * 
 * Type for filtering message queries
 */
export interface MessageFilters {
  /** Filter by message ID */
  id?: string;
  
  /** Filter by chat ID */
  chatId?: string;
  
  /** Filter by message role */
  role?: MessageRole;
  
  /** Filter by date range (start) */
  createdAtFrom?: string;
  
  /** Filter by date range (end) */
  createdAtTo?: string;
}

