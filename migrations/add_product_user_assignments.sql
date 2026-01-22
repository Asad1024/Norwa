-- Migration: Add product-user assignments table
-- This allows admins to assign specific products to specific users

-- Create product_user_assignments table
CREATE TABLE IF NOT EXISTS product_user_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_user_assignments_product_id ON product_user_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_user_assignments_user_id ON product_user_assignments(user_id);

-- Enable Row Level Security
ALTER TABLE product_user_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view and manage assignments
CREATE POLICY "Admins can manage product assignments" ON product_user_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Users can view their own assignments
CREATE POLICY "Users can view own assignments" ON product_user_assignments
  FOR SELECT USING (auth.uid() = user_id);
