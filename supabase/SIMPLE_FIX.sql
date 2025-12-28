-- ABSOLUTE MINIMAL SQL FIX
-- Copy EXACTLY and run in Supabase SQL Editor

-- 1. Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- 3. Grant permissions
GRANT SELECT ON public.direct_messages TO authenticated;
GRANT INSERT ON public.direct_messages TO authenticated;

-- 4. Enable RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- 5. Drop ALL old policies
DROP POLICY IF EXISTS "Users can read own DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can view DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can insert DMs" ON public.direct_messages;

-- 6. Create simple policies
CREATE POLICY "dm_select_policy" ON public.direct_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "dm_insert_policy" ON public.direct_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

-- 7. Verify it worked
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'direct_messages';

-- You should see one row returned. If not, realtime is NOT enabled.
