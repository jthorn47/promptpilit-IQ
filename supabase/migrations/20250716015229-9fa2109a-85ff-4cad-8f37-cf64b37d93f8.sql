-- Enable real-time for email tables

-- Enable REPLICA IDENTITY FULL for better real-time updates
ALTER TABLE public.crm_email_messages REPLICA IDENTITY FULL;
ALTER TABLE public.email_campaigns REPLICA IDENTITY FULL;
ALTER TABLE public.email_sending_history REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Add tables to real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_email_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_sending_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;