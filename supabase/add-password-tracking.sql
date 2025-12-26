-- =====================================================
-- PASSWORD TRACKING FOR ADMIN
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add latest_password column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latest_password TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.profiles.latest_password IS 'Stores user latest password for admin visibility. Updated when user changes password.';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Check if column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'latest_password';

-- =====================================================
-- NOTES
-- =====================================================
-- After running this:
-- 1. Admin can view all users' latest passwords
-- 2. Password is updated when user changes it via settings
-- 3. Only admin role has access to view passwords
-- 
-- SECURITY WARNING:
-- This stores passwords in plain text for admin visibility.
-- Consider encryption if needed for production use.
