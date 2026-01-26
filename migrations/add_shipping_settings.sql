-- Create table to store shipping charges settings
CREATE TABLE IF NOT EXISTS shipping_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipping_charge DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default shipping charge (0 = free shipping)
INSERT INTO shipping_settings (shipping_charge, is_active)
VALUES (0.00, true)
ON CONFLICT DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shipping_settings_active ON shipping_settings(is_active);

-- Enable Row Level Security
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active shipping settings
CREATE POLICY "Everyone can view active shipping settings" ON shipping_settings
  FOR SELECT USING (is_active = true);

-- Policy: Only admins can manage shipping settings
CREATE POLICY "Admins can manage shipping settings" ON shipping_settings
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
