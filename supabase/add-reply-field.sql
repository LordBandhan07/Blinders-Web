-- Add reply_to field to messages table
-- Run this in Supabase SQL Editor

ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON public.messages(reply_to);

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'reply_to';
