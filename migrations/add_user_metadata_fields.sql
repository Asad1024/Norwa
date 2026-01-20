-- Migration: Add Name and Phone to User Metadata
-- 
-- This migration documents the user metadata structure used in Supabase Auth.
-- Note: Supabase Auth stores user metadata in the auth.users table's raw_user_meta_data JSONB column.
-- No actual database schema changes are needed as JSONB supports dynamic fields.
--
-- User metadata fields stored:
--   - full_name: User's full name
--   - name: User's name (alternative field name)
--   - phone: User's phone number
--   - phone_number: User's phone number (alternative field name)
--   - role: User role ('admin' or 'user')

-- Example: View users with their metadata (Run this in Supabase SQL Editor)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'phone' as phone,
  raw_user_meta_data->>'phone_number' as phone_number,
  raw_user_meta_data->>'role' as role
FROM auth.users;

-- Example: Update user metadata for existing users (if needed)
-- UPDATE auth.users
-- SET raw_user_meta_data = raw_user_meta_data || '{"full_name": "John Doe", "phone": "+47 123 45 678"}'::jsonb
-- WHERE id = 'user-uuid-here';

-- The user metadata is automatically populated when users register:
-- 1. Regular registration: Name and phone are set via signUp options
-- 2. Google OAuth: Name and phone are set when completing profile on /register page
