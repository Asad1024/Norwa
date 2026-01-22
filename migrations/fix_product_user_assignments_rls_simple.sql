-- Simple fix: Drop and recreate RLS policies for product_user_assignments table
-- Run this if the other fix migration gives errors

-- Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Admins can manage product assignments" ON product_user_assignments CASCADE;
DROP POLICY IF EXISTS "Users can view own assignments" ON product_user_assignments CASCADE;

-- Recreate policy: Only admins can view and manage assignments
CREATE POLICY "Admins can manage product assignments" ON product_user_assignments
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Recreate policy: Users can view their own assignments
CREATE POLICY "Users can view own assignments" ON product_user_assignments
  FOR SELECT USING (auth.uid() = user_id);
