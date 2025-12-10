-- Migration: Create Document Table for Artifacts
-- Purpose: Store artifact documents (text, code, sheet) with version history
-- Date: 2024

-- Create document table
CREATE TABLE IF NOT EXISTS "Document" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "title" TEXT NOT NULL,
  "content" TEXT,
  "kind" VARCHAR(20) NOT NULL DEFAULT 'text',
  "userId" UUID NOT NULL,
  
  PRIMARY KEY ("id", "createdAt")
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS "Document_id_idx" ON "Document"("id");
CREATE INDEX IF NOT EXISTS "Document_userId_idx" ON "Document"("userId");
CREATE INDEX IF NOT EXISTS "Document_createdAt_idx" ON "Document"("createdAt" DESC);

-- Add check constraint for kind enum
ALTER TABLE "Document" 
  ADD CONSTRAINT "Document_kind_check" 
  CHECK ("kind" IN ('text', 'code', 'sheet'));

-- Add comment for documentation
COMMENT ON TABLE "Document" IS 'Stores artifact documents (text, code, sheet) with version history. Composite primary key (id, createdAt) enables multiple versions per document.';

COMMENT ON COLUMN "Document"."id" IS 'Document ID (UUID). Multiple rows can have same id for version history.';
COMMENT ON COLUMN "Document"."createdAt" IS 'Timestamp when this version was created. Used with id as composite primary key.';
COMMENT ON COLUMN "Document"."title" IS 'Document title';
COMMENT ON COLUMN "Document"."content" IS 'Full document content (can be large for tables/code)';
COMMENT ON COLUMN "Document"."kind" IS 'Artifact type: text, code, or sheet';
COMMENT ON COLUMN "Document"."userId" IS 'User ID who owns this document';

