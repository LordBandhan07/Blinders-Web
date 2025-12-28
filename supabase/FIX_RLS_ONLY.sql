-- ✅ REALTIME IS ALREADY ENABLED!
-- The error means the table is already in the publication.
-- The problem is RLS POLICIES blocking realtime events.

-- Run this to fix RLS policies:

-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "Users can read own DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can view DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can insert DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "dm_select_policy" ON public.direct_messages;
DROP POLICY IF EXISTS "dm_insert_policy" ON public.direct_messages;

-- 2. Create CORRECT policies
CREATE POLICY "allow_read_own_messages" 
ON public.direct_messages
FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);

CREATE POLICY "allow_insert_own_messages"
ON public.direct_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
);

-- 3. Ensure RLS is enabled
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- 4. Grant necessary permissions
GRANT SELECT, INSERT ON public.direct_messages TO authenticated;

-- ✅ DONE! Now refresh your browser and test.
