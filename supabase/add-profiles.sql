-- Add Profiles for Existing Users
-- Run this AFTER creating users in Supabase Dashboard

-- First, check if users exist in auth.users
-- SELECT id, email FROM auth.users;

-- Insert profiles for the 4 users
-- Replace the UUIDs with actual user IDs from auth.users table

-- 1. God of Blinders (Admin)
INSERT INTO public.profiles (id, email, display_name, role, is_online)
SELECT 
    id,
    'arthur.b@blinders.chief',
    'God of Blinders',
    'admin',
    true
FROM auth.users 
WHERE email = 'arthur.b@blinders.chief'
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role;

-- 2. President
INSERT INTO public.profiles (id, email, display_name, role, is_online)
SELECT 
    id,
    'steve.s@blinders.president',
    'President',
    'president',
    true
FROM auth.users 
WHERE email = 'steve.s@blinders.president'
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role;

-- 3. Chief Member
INSERT INTO public.profiles (id, email, display_name, role, is_online)
SELECT 
    id,
    'robert.s@blinders.chiefmember',
    'Chief Member',
    'chief_member',
    false
FROM auth.users 
WHERE email = 'robert.s@blinders.chiefmember'
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role;

-- 4. Senior Member
INSERT INTO public.profiles (id, email, display_name, role, is_online)
SELECT 
    id,
    'anthoni.b@blinders.seniormember',
    'Senior Member',
    'senior_member',
    false
FROM auth.users 
WHERE email = 'anthoni.b@blinders.seniormember'
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role;

-- Verify all profiles were created
SELECT id, email, display_name, role, is_online 
FROM public.profiles 
ORDER BY created_at;
