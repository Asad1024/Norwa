# How to Check and Change Admin Roles in Supabase

The admin role is stored in the `user_metadata.role` field as either `'admin'` or `'user'`.

## Method 1: Using SQL Editor (Recommended)

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Check Which Users Are Admin

Run this query to see all users and their roles:

```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'role' as role,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
```

To see only admin users:

```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin';
```

### Step 3: Change a User's Role to Admin

**To make a user admin (by email):**
```sql
UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'user@example.com';
```

**To make a user admin (by user ID):**
```sql
UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE id = 'user-uuid-here';
```

**To remove admin role (make them a regular user):**
```sql
UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "user"}'::jsonb
WHERE email = 'user@example.com';
```

**To transfer admin from one user to another:**
```sql
-- First, remove admin from old admin
UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "user"}'::jsonb
WHERE email = 'old-admin@example.com';

-- Then, make new user admin
UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'new-admin@example.com';
```

## Method 2: Using Authentication UI (Alternative)

### Step 1: Access Authentication
1. Go to your Supabase Dashboard
2. Click on **Authentication** in the left sidebar
3. Click on **Users**

### Step 2: View User Details
**Important:** The `role` field is NOT visible in the users list table. You need to:
1. Find the user you want to check/modify in the list
2. **Click on the user's email** (or anywhere on that row) to open their detailed view
3. This will open a side panel or modal with the user's full details

### Step 3: Find and Edit User Metadata
1. In the user details panel, scroll down past the basic fields (UID, Email, Phone, etc.)
2. Look for a section called:
   - **"User Metadata"** or
   - **"Raw User Meta Data"** or
   - **"Metadata"** or
   - A JSON editor/viewer section
3. You'll see a JSON object that might look like:
   ```json
   {
     "full_name": "John Doe",
     "name": "John Doe",
     "phone": "+47 123 45 678"
   }
   ```
4. **If `role` doesn't exist**, you need to add it:
   - Click **Edit** button (if available) or modify the JSON directly
   - Add `"role": "admin"` or `"role": "user"` to the JSON
   - Example:
     ```json
     {
       "full_name": "John Doe",
       "name": "John Doe",
       "phone": "+47 123 45 678",
       "role": "admin"
     }
     ```
   - Save the changes

**Note:** If you can't find the User Metadata section or can't edit it in the UI, use **Method 1 (SQL Editor)** instead - it's more reliable and easier.

**Example User Metadata:**
```json
{
  "full_name": "John Doe",
  "name": "John Doe",
  "phone": "+47 123 45 678",
  "role": "admin"
}
```

## Important Notes

1. **After changing roles**, users may need to:
   - Log out and log back in for the changes to take effect
   - Clear their browser cache/cookies

2. **Security**: Only users with admin access to your Supabase project can change roles. Make sure you're logged in as a project owner/admin.

3. **Verification**: After updating, run the check query again to verify the role was changed correctly.

4. **Multiple Admins**: You can have multiple admin users. The system checks for `role === 'admin'` in the user metadata.

## Quick Reference

- **Check all admins**: `WHERE raw_user_meta_data->>'role' = 'admin'`
- **Make admin**: `'{"role": "admin"}'::jsonb`
- **Make user**: `'{"role": "user"}'::jsonb`
- **User metadata location**: `auth.users.raw_user_meta_data` (JSONB column)
