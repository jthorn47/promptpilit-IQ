-- Enable real-time updates for training_modules table
ALTER TABLE public.training_modules REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_modules;