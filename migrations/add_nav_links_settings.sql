-- Migration: Add navigation links settings table
-- This allows admins to enable/disable navigation links

-- Create nav_links_settings table
CREATE TABLE IF NOT EXISTS nav_links_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_key TEXT UNIQUE NOT NULL,
  href TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default navigation links
INSERT INTO nav_links_settings (link_key, href, is_enabled, sort_order) VALUES
  ('products', '/products', true, 1),
  ('about', '/about', true, 2),
  ('how-to-use', '/how-to-use', true, 3),
  ('contact', '/contact', true, 4)
ON CONFLICT (link_key) DO NOTHING;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_nav_links_settings_enabled ON nav_links_settings(is_enabled);
CREATE INDEX IF NOT EXISTS idx_nav_links_settings_sort_order ON nav_links_settings(sort_order);

-- Enable Row Level Security
ALTER TABLE nav_links_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read enabled nav links
CREATE POLICY "Everyone can view enabled nav links" ON nav_links_settings
  FOR SELECT USING (is_enabled = true);

-- Policy: Only admins can view all nav links and manage settings
CREATE POLICY "Admins can manage nav links" ON nav_links_settings
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
