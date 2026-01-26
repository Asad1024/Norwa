-- Add delivery and order information fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_customer TEXT,
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_postal_code TEXT,
ADD COLUMN IF NOT EXISTS delivery_postal_place TEXT,
ADD COLUMN IF NOT EXISTS delivery_type TEXT,
ADD COLUMN IF NOT EXISTS email_for_order_confirmation TEXT,
ADD COLUMN IF NOT EXISTS customer_reference TEXT,
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
ADD COLUMN IF NOT EXISTS dispatch_date DATE,
ADD COLUMN IF NOT EXISTS periodic_orders BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS alternative_delivery_address BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS delivery_time TEXT;
