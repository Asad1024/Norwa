-- Migration: Add translation support for products and categories
-- This migration adds JSONB columns for storing translations in English (en) and Norwegian (no)

-- Step 1: Add translation columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name_translations JSONB DEFAULT '{"en": "", "no": ""}',
ADD COLUMN IF NOT EXISTS description_translations JSONB DEFAULT '{"en": "", "no": ""}';

-- Step 2: Add translation columns to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS name_translations JSONB DEFAULT '{"en": "", "no": ""}',
ADD COLUMN IF NOT EXISTS description_translations JSONB DEFAULT '{"en": "", "no": ""}';

-- Step 3: Migrate existing products data
-- Copy existing name and description to both English and Norwegian translations
UPDATE products 
SET 
  name_translations = jsonb_build_object('en', COALESCE(name, ''), 'no', COALESCE(name, '')),
  description_translations = jsonb_build_object('en', COALESCE(description, ''), 'no', COALESCE(description, ''))
WHERE name_translations IS NULL OR name_translations = '{"en": "", "no": ""}'::jsonb;

-- Step 4: Migrate existing categories data
-- Copy existing name and description to both English and Norwegian translations
UPDATE categories
SET 
  name_translations = jsonb_build_object('en', COALESCE(name, ''), 'no', COALESCE(name, '')),
  description_translations = jsonb_build_object('en', COALESCE(description, ''), 'no', COALESCE(description, ''))
WHERE name_translations IS NULL OR name_translations = '{"en": "", "no": ""}'::jsonb;

-- Step 5: Create indexes for better query performance on translation fields
CREATE INDEX IF NOT EXISTS idx_products_name_translations ON products USING GIN (name_translations);
CREATE INDEX IF NOT EXISTS idx_products_description_translations ON products USING GIN (description_translations);
CREATE INDEX IF NOT EXISTS idx_categories_name_translations ON categories USING GIN (name_translations);
CREATE INDEX IF NOT EXISTS idx_categories_description_translations ON categories USING GIN (description_translations);

-- Note: The old 'name' and 'description' columns are kept for backward compatibility
-- You can remove them later if you want, but it's safer to keep them for now
