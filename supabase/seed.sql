-- Blinders Database Seed Data
-- This file adds the initial 4 users to the database

-- =====================================================
-- IMPORTANT: Run this AFTER running schema.sql
-- =====================================================

-- Note: Supabase Auth users must be created through the Supabase Dashboard or API
-- This file only creates the profile entries
-- The passwords will be set when creating auth users

-- =====================================================
-- INSERT INITIAL USERS
-- =====================================================

-- 1. God of Blinders (Admin)
-- Email: arthur.b@blinders.chief
-- Password: LordBandhan@Blinders07
-- Role: admin
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'arthur.b@blinders.chief',
    crypt('LordBandhan@Blinders07', gen_salt('bf')),
    NOW(),
    '{"display_name": "God of Blinders", "role": "admin"}',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
    id,
    email,
    display_name,
    role,
    is_online,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'arthur.b@blinders.chief',
    'God of Blinders',
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role;

-- 2. President
-- Email: steve.s@blinders.president
-- Password: MrSteve@Blinders7
-- Role: president
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'steve.s@blinders.president',
    crypt('MrSteve@Blinders7', gen_salt('bf')),
    NOW(),
    '{"display_name": "President", "role": "president"}',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
    id,
    email,
    display_name,
    role,
    is_online,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'steve.s@blinders.president',
    'President',
    'president',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role;

-- 3. Chief Member
-- Email: robert.s@blinders.chiefmember
-- Password: MrRobert@Blinders7
-- Role: chief_member
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    'robert.s@blinders.chiefmember',
    crypt('MrRobert@Blinders7', gen_salt('bf')),
    NOW(),
    '{"display_name": "Chief Member", "role": "chief_member"}',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
    id,
    email,
    display_name,
    role,
    is_online,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    'robert.s@blinders.chiefmember',
    'Chief Member',
    'chief_member',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role;

-- 4. Senior Member
-- Email: anthoni.b@blinders.seniormember
-- Password: MrAnthony@Blinders7
-- Role: senior_member
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    'anthoni.b@blinders.seniormember',
    crypt('MrAnthony@Blinders7', gen_salt('bf')),
    NOW(),
    '{"display_name": "Senior Member", "role": "senior_member"}',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
    id,
    email,
    display_name,
    role,
    is_online,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    'anthoni.b@blinders.seniormember',
    'Senior Member',
    'senior_member',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify all users were created successfully:
-- SELECT id, email, display_name, role, is_online FROM public.profiles ORDER BY created_at;
