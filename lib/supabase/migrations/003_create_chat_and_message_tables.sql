-- Migration: Create Chat and Message Tables
-- Purpose: Store chat conversations and messages for persistence
-- Date: 2025-01-XX

-- Create Chat table
CREATE TABLE IF NOT EXISTS "Chat" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY ("id")
);

-- Create Message table
CREATE TABLE IF NOT EXISTS "Message" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "chatId" UUID NOT NULL REFERENCES "Chat"("id") ON DELETE CASCADE,
  "role" VARCHAR(20) NOT NULL CHECK ("role" IN ('user', 'assistant', 'system')),
  "parts" JSONB NOT NULL,
  "attachments" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY ("id")
);

-- Create indexes for performance
-- Index on Chat.userId for faster user chat lookups
CREATE INDEX IF NOT EXISTS "Chat_userId_idx" ON "Chat"("userId");

-- Index on Chat.createdAt for sorting chats by date
CREATE INDEX IF NOT EXISTS "Chat_createdAt_idx" ON "Chat"("createdAt" DESC);

-- Index on Message.chatId for faster message lookups by chat
CREATE INDEX IF NOT EXISTS "Message_chatId_idx" ON "Message"("chatId");

-- Index on Message.createdAt for sorting messages chronologically
CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message"("createdAt" ASC);

-- Add comments for documentation
COMMENT ON TABLE "Chat" IS 'Stores chat conversations. Each chat belongs to a user and contains multiple messages.';

COMMENT ON COLUMN "Chat"."id" IS 'Chat ID (UUID primary key). Used in URL routing (/chat/[id])';
COMMENT ON COLUMN "Chat"."userId" IS 'User ID who owns this chat (foreign key to User table)';
COMMENT ON COLUMN "Chat"."title" IS 'Chat title (auto-generated from first user message)';
COMMENT ON COLUMN "Chat"."createdAt" IS 'Timestamp when chat was created';
COMMENT ON COLUMN "Chat"."updatedAt" IS 'Timestamp when chat was last updated';

COMMENT ON TABLE "Message" IS 'Stores individual messages in conversations. Each row represents one message (user or assistant).';

COMMENT ON COLUMN "Message"."id" IS 'Message ID (UUID primary key)';
COMMENT ON COLUMN "Message"."chatId" IS 'Chat ID this message belongs to (foreign key to Chat table)';
COMMENT ON COLUMN "Message"."role" IS 'Message role: user, assistant, or system';
COMMENT ON COLUMN "Message"."parts" IS 'JSON array of message parts (text, tool calls, tool results, etc.)';
COMMENT ON COLUMN "Message"."attachments" IS 'JSON array of message attachments (files, images, etc.)';
COMMENT ON COLUMN "Message"."createdAt" IS 'Timestamp when message was created (used for chronological ordering)';

