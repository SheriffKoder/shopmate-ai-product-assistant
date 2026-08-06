-- Migration: Create Shadow Catalog Tables
-- Purpose: Store public category and product data for server-first shadow pages
-- Date: 2026-08-03

-- Create ShopMate categories table
CREATE TABLE IF NOT EXISTS "sm_categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL,
  "name" JSONB NOT NULL,
  "description" JSONB,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY ("id")
);

-- Create stable category lookup indexes
CREATE UNIQUE INDEX IF NOT EXISTS "sm_categories_slug_idx" ON "sm_categories"("slug");
CREATE INDEX IF NOT EXISTS "sm_categories_active_sort_idx" ON "sm_categories"("is_active", "sort_order", "slug");

-- Create ShopMate products table
CREATE TABLE IF NOT EXISTS "sm_products" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL,
  "category_id" UUID NOT NULL,
  "name" JSONB NOT NULL,
  "short_description" JSONB NOT NULL,
  "description" JSONB NOT NULL,
  "price" NUMERIC(10, 2) NOT NULL,
  "rating" NUMERIC(2, 1) NOT NULL DEFAULT 0,
  "reviews_count" INTEGER NOT NULL DEFAULT 0,
  "features" JSONB NOT NULL DEFAULT '{"en":[],"ar":[]}'::jsonb,
  "image_url" TEXT,
  "image_url_variations" TEXT[] NOT NULL DEFAULT '{}',
  "is_featured" BOOLEAN NOT NULL DEFAULT FALSE,
  "keywords" TEXT[] NOT NULL DEFAULT '{}',
  "colors" TEXT[] NOT NULL DEFAULT '{}',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY ("id"),
  CONSTRAINT "sm_products_category_id_fkey"
    FOREIGN KEY ("category_id")
    REFERENCES "sm_categories"("id")
    ON DELETE RESTRICT,
  CONSTRAINT "sm_products_price_check" CHECK ("price" >= 0),
  CONSTRAINT "sm_products_rating_check" CHECK ("rating" >= 0 AND "rating" <= 5),
  CONSTRAINT "sm_products_reviews_count_check" CHECK ("reviews_count" >= 0)
);

-- Create stable product lookup indexes
CREATE UNIQUE INDEX IF NOT EXISTS "sm_products_slug_idx" ON "sm_products"("slug");
CREATE INDEX IF NOT EXISTS "sm_products_category_id_idx" ON "sm_products"("category_id");
CREATE INDEX IF NOT EXISTS "sm_products_active_featured_idx" ON "sm_products"("is_active", "is_featured", "slug");
CREATE INDEX IF NOT EXISTS "sm_products_active_category_idx" ON "sm_products"("is_active", "category_id", "slug");

-- Add comments for documentation
COMMENT ON TABLE "sm_categories" IS 'Public ShopMate catalog categories with stable slugs and localized EN/AR text.';
COMMENT ON TABLE "sm_products" IS 'Public ShopMate catalog products for server-first pages, linked to ShopMate categories.';

COMMENT ON COLUMN "sm_categories"."slug" IS 'Stable category slug used for static route params.';
COMMENT ON COLUMN "sm_categories"."name" IS 'Localized category name JSON object, expected to include en and ar keys.';
COMMENT ON COLUMN "sm_categories"."description" IS 'Optional localized category description JSON object.';

COMMENT ON COLUMN "sm_products"."slug" IS 'Stable product slug used for static route params.';
COMMENT ON COLUMN "sm_products"."name" IS 'Localized product name JSON object, expected to include en and ar keys.';
COMMENT ON COLUMN "sm_products"."short_description" IS 'Localized product card description JSON object.';
COMMENT ON COLUMN "sm_products"."description" IS 'Localized product detail description JSON object.';
COMMENT ON COLUMN "sm_products"."features" IS 'Localized feature lists JSON object, expected to include en and ar arrays.';
