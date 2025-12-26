-- =====================================================
-- PROFILE PHOTO UPLOAD SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add profile_photo_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Step 2: Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Set up RLS policies for profile-photos bucket

-- Allow authenticated users to upload their own profile photo
CREATE POLICY "Users can upload their own profile photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own profile photo
CREATE POLICY "Users can update their own profile photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own profile photo
CREATE POLICY "Users can delete their own profile photo"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow everyone to view profile photos (public read)
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'profile_photo_url';

-- Check if bucket was created
SELECT * FROM storage.buckets WHERE id = 'profile-photos';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- =====================================================
-- NOTES
-- =====================================================
-- After running this:
-- 1. Users can upload profile photos via the upload API
-- 2. Photos are stored in format: profile-photos/{user_id}/{filename}
-- 3. URLs are publicly accessible
-- 4. Only the owner can upload/update/delete their photo
