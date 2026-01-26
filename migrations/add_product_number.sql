-- Add product_number column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_number VARCHAR(8);

-- Add constraint to ensure product_number is 6-8 digits
ALTER TABLE products
ADD CONSTRAINT product_number_format CHECK (
  product_number IS NULL OR 
  (LENGTH(product_number) >= 6 AND LENGTH(product_number) <= 8 AND product_number ~ '^[0-9]+$')
);

-- Create index for product_number
CREATE INDEX IF NOT EXISTS idx_products_product_number ON products(product_number);
