-- Create table to store user checkout preferences (delivery and order information)
CREATE TABLE IF NOT EXISTS user_checkout_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Delivery Information
  delivery_customer TEXT,
  delivery_address TEXT,
  delivery_postal_code TEXT,
  delivery_postal_place TEXT,
  delivery_type TEXT,
  -- Order Information
  email_for_order_confirmation TEXT,
  customer_reference TEXT,
  delivery_instructions TEXT,
  dispatch_date DATE,
  delivery_time TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_checkout_preferences_user_id ON user_checkout_preferences(user_id);
