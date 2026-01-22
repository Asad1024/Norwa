-- Migration: Add stock field to products table

-- Add stock column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Update existing products to have stock (set to a default value if needed)
UPDATE products 
SET stock = 0 
WHERE stock IS NULL;

-- Add constraint to ensure stock is non-negative
ALTER TABLE products 
ADD CONSTRAINT stock_non_negative CHECK (stock >= 0);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
