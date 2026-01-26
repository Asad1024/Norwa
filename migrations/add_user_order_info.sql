-- Create table to store multiple order information entries per user
CREATE TABLE IF NOT EXISTS user_order_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Default',
  email_for_order_confirmation TEXT,
  customer_reference TEXT,
  delivery_instructions TEXT,
  dispatch_date DATE,
  delivery_time TEXT,
  phone_number TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_order_info_user_id ON user_order_info(user_id);

-- Update user_addresses to support multiple addresses (already exists, but ensure is_default works)
-- Note: user_addresses table already exists, we just need to ensure it supports multiple entries
