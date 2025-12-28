-- Create message_reactions table for channel messages
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Create dm_reactions table for direct messages
CREATE TABLE IF NOT EXISTS public.dm_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Create indexes for better performance
CREATE INDEX idx_reactions_message ON public.message_reactions(message_id);
CREATE INDEX idx_reactions_user ON public.message_reactions(user_id);
CREATE INDEX idx_dm_reactions_message ON public.dm_reactions(message_id);
CREATE INDEX idx_dm_reactions_user ON public.dm_reactions(user_id);

-- Enable Row Level Security
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for message_reactions
CREATE POLICY "Users can view all reactions"
ON public.message_reactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can add reactions"
ON public.message_reactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own reactions"
ON public.message_reactions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Policies for dm_reactions
CREATE POLICY "Users can view DM reactions"
ON public.dm_reactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can add DM reactions"
ON public.dm_reactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own DM reactions"
ON public.dm_reactions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE dm_reactions;
