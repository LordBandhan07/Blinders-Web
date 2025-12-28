-- ⚠️ CRITICAL FIX FOR REALTIME MESSAGES
-- Run this EXACTLY in Supabase Dashboard -> SQL Editor
-- This fixes the "messages save but don't appear" issue

-- Step 1: Enable Realtime on the table
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.direct_messages;

-- Step 2: Grant permissions
GRANT ALL ON TABLE public.direct_messages TO authenticated;
GRANT ALL ON TABLE public.direct_messages TO anon;

-- Step 3: Drop old policies (if they exist)
DROP POLICY IF EXISTS "Users can read own DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can insert DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can view DMs" ON public.direct_messages;

-- Step 4: Create NEW policies (correct ones)
CREATE POLICY "Users can view DMs"
ON public.direct_messages FOR SELECT
TO authenticated
USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
);

CREATE POLICY "Users can send DMs"
ON public.direct_messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

-- Step 5: Verify RLS is enabled
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- ✅ Done! Refresh your app after running this.
