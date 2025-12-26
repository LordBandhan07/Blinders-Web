-- Enable Realtime for profiles table
-- Run this in Supabase SQL Editor

-- First, check if Realtime is enabled for profiles
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'profiles';

-- If not enabled, add profiles table to Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Verify it's added
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'profiles';
