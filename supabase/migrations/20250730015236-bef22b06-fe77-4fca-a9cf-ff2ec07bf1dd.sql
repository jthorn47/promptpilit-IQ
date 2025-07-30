-- Drop trigger if it exists to recreate it properly
DROP TRIGGER IF EXISTS update_sms_conversations_updated_at ON public.sms_conversations;

-- Make sure the table has the correct structure without client_id
ALTER TABLE public.sms_conversations 
DROP COLUMN IF EXISTS client_id;