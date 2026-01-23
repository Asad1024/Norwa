-- Migration: Add technical_data_url column to products table
-- This allows products to have associated technical documentation files (PDF, DOC, DOCX, etc.)

-- Add technical_data_url column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS technical_data_url TEXT;

-- Create index for better query performance (optional, but useful if filtering by technical data)
CREATE INDEX IF NOT EXISTS idx_products_technical_data_url ON products(technical_data_url) WHERE technical_data_url IS NOT NULL;
