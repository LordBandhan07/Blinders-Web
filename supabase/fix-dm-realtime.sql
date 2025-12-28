-- Force Refresh Realtime & RLS for Direct Messages

-- 1. Ensure Table Permissions are Correct
GRANT ALL ON TABLE public.direct_messages TO authenticated;
GRANT ALL ON TABLE public.direct_messages TO service_role;

-- 2. Drop and Re-create Policies (to be absolutely sure)
DROP POLICY IF EXISTS "Users can read own DMs" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send DMs" ON public.direct_messages;

CREATE POLICY "Users can read own DMs"
ON public.direct_messages FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send DMs"
ON public.direct_messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

-- 3. Force Realtime Re-add
ALTER PUBLICATION supabase_realtime DROP TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- 4. Verify
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'direct_messages';
