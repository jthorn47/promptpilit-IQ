-- Add missing received_at column to webhook_logs table
ALTER TABLE public.webhook_logs 
ADD COLUMN IF NOT EXISTS received_at TIMESTAMP WITH TIME ZONE DEFAULT now();