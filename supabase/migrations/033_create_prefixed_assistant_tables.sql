-- Migration: Create prefixed assistant persistence tables
-- Purpose: Keep catalog and assistant data in the unified Supabase project
-- Tables: sm_users, sm_chats, sm_messages, sm_documents

-- Application user records are linked to Supabase Auth in the next migration step.
CREATE TABLE IF NOT EXISTS "sm_users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "auth_user_id" UUID,
  "email" VARCHAR(64) NOT NULL,
  "name" VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "sm_users_email_idx" ON "sm_users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "sm_users_auth_user_id_idx"
  ON "sm_users"("auth_user_id")
  WHERE "auth_user_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "sm_users_createdAt_idx" ON "sm_users"("createdAt" DESC);

COMMENT ON TABLE "sm_users" IS 'Application users linked to Supabase Auth users.';

CREATE TABLE IF NOT EXISTS "sm_chats" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "sm_users"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sm_chats_userId_idx" ON "sm_chats"("userId");
CREATE INDEX IF NOT EXISTS "sm_chats_createdAt_idx" ON "sm_chats"("createdAt" DESC);

COMMENT ON TABLE "sm_chats" IS 'Assistant conversations owned by application users.';

CREATE TABLE IF NOT EXISTS "sm_messages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "chatId" UUID NOT NULL REFERENCES "sm_chats"("id") ON DELETE CASCADE,
  "role" VARCHAR(20) NOT NULL CHECK ("role" IN ('user', 'assistant', 'system')),
  "parts" JSONB NOT NULL,
  "attachments" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sm_messages_chatId_idx" ON "sm_messages"("chatId");
CREATE INDEX IF NOT EXISTS "sm_messages_createdAt_idx" ON "sm_messages"("createdAt" ASC);

COMMENT ON TABLE "sm_messages" IS 'Assistant messages belonging to application chats.';

CREATE TABLE IF NOT EXISTS "sm_documents" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "title" TEXT NOT NULL,
  "content" TEXT,
  "kind" VARCHAR(20) NOT NULL DEFAULT 'text',
  "userId" UUID NOT NULL,

  PRIMARY KEY ("id", "createdAt")
);

CREATE INDEX IF NOT EXISTS "sm_documents_id_idx" ON "sm_documents"("id");
CREATE INDEX IF NOT EXISTS "sm_documents_userId_idx" ON "sm_documents"("userId");
CREATE INDEX IF NOT EXISTS "sm_documents_createdAt_idx" ON "sm_documents"("createdAt" DESC);

ALTER TABLE "sm_documents"
  ADD CONSTRAINT "sm_documents_kind_check"
  CHECK ("kind" IN ('text', 'code', 'sheet', 'chart'));

COMMENT ON TABLE "sm_documents" IS 'Assistant artifacts with version history.';
