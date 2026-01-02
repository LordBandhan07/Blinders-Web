-- ============================================
-- BLINDERS - COMPLETE SUPABASE SETUP SQL
-- ============================================
-- Run this ENTIRE script in Supabase Dashboard → SQL Editor
-- This will create all tables, policies, and enable Realtime

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    profile_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (for group/channel chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    media_url TEXT,
    media_type TEXT,
    reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Direct Messages table (for 1-on-1 chat)
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table (for DM threads)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Message Reactions table (for group chat)
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- DM Reactions table (for direct messages)
CREATE TABLE IF NOT EXISTS public.dm_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- ============================================
-- 2. CREATE INDEXES (for performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_channel ON public.messages(channel);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver ON public.direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_users ON public.conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_dm_reactions_message ON public.dm_reactions(message_id);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_reactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. DROP OLD POLICIES (clean slate)
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;

-- Messages
DROP POLICY IF EXISTS "Anyone can read messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can read messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;

-- Direct Messages
DROP POLICY IF EXISTS "Users can read own DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can view DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can insert DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "allow_read_own_messages" ON public.direct_messages;
DROP POLICY IF EXISTS "allow_insert_own_messages" ON public.direct_messages;

-- Conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Reactions
DROP POLICY IF EXISTS "Users can view reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can add reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can remove own reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can view DM reactions" ON public.dm_reactions;
DROP POLICY IF EXISTS "Users can add DM reactions" ON public.dm_reactions;
DROP POLICY IF EXISTS "Users can remove own DM reactions" ON public.dm_reactions;

-- ============================================
-- 5. CREATE RLS POLICIES
-- ============================================

-- PROFILES POLICIES
CREATE POLICY "allow_public_read_profiles"
ON public.profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "allow_users_update_own_profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- MESSAGES POLICIES (Group Chat)
CREATE POLICY "allow_authenticated_read_messages"
ON public.messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_authenticated_insert_messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- DIRECT MESSAGES POLICIES
CREATE POLICY "allow_users_read_own_dms"
ON public.direct_messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "allow_users_insert_dms"
ON public.direct_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- CONVERSATIONS POLICIES
CREATE POLICY "allow_users_read_own_conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "allow_users_create_conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- MESSAGE REACTIONS POLICIES
CREATE POLICY "allow_users_read_reactions"
ON public.message_reactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_users_add_reactions"
ON public.message_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_users_delete_own_reactions"
ON public.message_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- DM REACTIONS POLICIES
CREATE POLICY "allow_users_read_dm_reactions"
ON public.dm_reactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_users_add_dm_reactions"
ON public.dm_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_users_delete_own_dm_reactions"
ON public.dm_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- 6. GRANT PERMISSIONS
-- ============================================

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.direct_messages TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.message_reactions TO authenticated;
GRANT ALL ON public.dm_reactions TO authenticated;

GRANT SELECT ON public.profiles TO anon;

-- ============================================
-- 7. ENABLE REALTIME
-- ============================================

-- Add tables to Realtime publication
-- Note: If tables are already in publication, this will error - that's OK, just continue
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_reactions;

-- ============================================
-- 8. CREATE TRIGGERS (auto-update timestamps)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. VERIFY SETUP
-- ============================================

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'messages', 'direct_messages', 'conversations', 'message_reactions', 'dm_reactions');

-- Check Realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- ✅ SETUP COMPLETE!
-- Next: Configure Storage buckets manually (see MANUAL_SETUP_STEPS.md)
