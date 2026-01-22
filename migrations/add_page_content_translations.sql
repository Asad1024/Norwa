-- Migration: Add translation support for page content
-- This migration updates page_content table to support English and Norwegian translations

-- Update page_content table to support translations
-- We'll store translations in the content JSONB field with structure:
-- {
--   "en": { ... English content ... },
--   "no": { ... Norwegian content ... }
-- }

-- First, let's migrate existing data to the new structure
DO $$
DECLARE
  page_record RECORD;
  current_content JSONB;
  new_content JSONB;
BEGIN
  FOR page_record IN SELECT * FROM page_content LOOP
    -- Get current content
    current_content := page_record.content;
    
    -- If content doesn't have language structure, wrap it in English
    IF current_content->'en' IS NULL AND current_content->'no' IS NULL THEN
      -- Wrap existing content in English translation
      new_content := jsonb_build_object(
        'en', current_content,
        'no', current_content  -- Copy English as default for Norwegian
      );
      
      -- Update the record
      UPDATE page_content
      SET content = new_content
      WHERE id = page_record.id;
    END IF;
  END LOOP;
END $$;

-- Add title_translations and subtitle_translations columns for easier access
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS title_translations JSONB DEFAULT '{"en": "", "no": ""}',
ADD COLUMN IF NOT EXISTS subtitle_translations JSONB DEFAULT '{"en": "", "no": ""}';

-- Migrate existing title and subtitle to translations
UPDATE page_content
SET 
  title_translations = jsonb_build_object('en', COALESCE(title, ''), 'no', COALESCE(title, '')),
  subtitle_translations = jsonb_build_object('en', COALESCE(subtitle, ''), 'no', COALESCE(subtitle, ''))
WHERE title_translations IS NULL OR title_translations = '{"en": "", "no": ""}'::jsonb;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_page_content_title_translations ON page_content USING GIN (title_translations);
CREATE INDEX IF NOT EXISTS idx_page_content_subtitle_translations ON page_content USING GIN (subtitle_translations);
