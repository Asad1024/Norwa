-- Fix RLS policies for product_user_assignments table
-- This migration fixes the permission denied error by using auth.jwt() instead of querying auth.users

-- Drop existing policies (using CASCADE to handle dependencies)
DO $$ 
BEGIN
    -- Drop admin policy if it exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'product_user_assignments' 
        AND policyname = 'Admins can manage product assignments'
    ) THEN
        DROP POLICY "Admins can manage product assignments" ON product_user_assignments;
    END IF;
    
    -- Drop user policy if it exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'product_user_assignments' 
        AND policyname = 'Users can view own assignments'
    ) THEN
        DROP POLICY "Users can view own assignments" ON product_user_assignments;
    END IF;
END $$;

-- Recreate policy: Only admins can view and manage assignments
-- Using auth.jwt() which is available in RLS context without needing to query auth.users
CREATE POLICY "Admins can manage product assignments" ON product_user_assignments
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Recreate policy: Users can view their own assignments
CREATE POLICY "Users can view own assignments" ON product_user_assignments
  FOR SELECT USING (auth.uid() = user_id);
