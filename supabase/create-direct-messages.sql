-- Create Direct Messages Table for Admin Personal Chat
-- Run this in Supabase SQL Editor

-- Drop existing table if needed (for clean setup)
DROP TABLE IF EXISTS public.direct_messages CASCADE;

-- Create direct_messages table
CREATE TABLE public.direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'voice', 'image')),
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_dm_sender ON public.direct_messages(sender_id);
CREATE INDEX idx_dm_receiver ON public.direct_messages(receiver_id);
CREATE INDEX idx_dm_created_at ON public.direct_messages(created_at DESC);
CREATE INDEX idx_dm_conversation ON public.direct_messages(sender_id, receiver_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send DMs" ON public.direct_messages;

-- Policy: Users can read messages they sent or received
CREATE POLICY "Users can read own DMs"
ON public.direct_messages FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Policy: Users can send messages (sender must be authenticated user)
CREATE POLICY "Users can send DMs"
ON public.direct_messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

-- Enable Realtime for direct_messages
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;

-- Verify table created
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'direct_messages'
ORDER BY ordinal_position;

-- Verify RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'direct_messages';

-- Verify Realtime enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'direct_messages';
