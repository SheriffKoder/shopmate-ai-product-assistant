-- Migration: Create User Table
-- Purpose: Store user accounts for chat persistence
-- Date: 2025-01-XX

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" VARCHAR(64) NOT NULL,
  "name" VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY ("id")
);

-- Create unique index for email (ensures one user per email)
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- Create index for createdAt (for sorting)
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt" DESC);

-- Add comment for documentation
COMMENT ON TABLE "User" IS 'Stores user accounts for chat persistence. Simplified version without authentication for now.';

COMMENT ON COLUMN "User"."id" IS 'User ID (UUID primary key)';
COMMENT ON COLUMN "User"."email" IS 'User email address (unique)';
COMMENT ON COLUMN "User"."name" IS 'User display name (optional)';
COMMENT ON COLUMN "User"."createdAt" IS 'Timestamp when user was created';
COMMENT ON COLUMN "User"."updatedAt" IS 'Timestamp when user was last updated';

