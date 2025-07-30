-- First, add the client_number field
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS client_number TEXT UNIQUE;

-- Make deal_id nullable since these are existing clients not from deals
ALTER TABLE public.clients ALTER COLUMN deal_id DROP NOT NULL;

-- Add validation constraint for client_number (4 digits only for new entries)
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS client_number_format;
ALTER TABLE public.clients ADD CONSTRAINT client_number_format 
CHECK (client_number ~ '^[0-9]{4}$' OR client_number IN ('1', 'ease')); -- Allow existing exceptions