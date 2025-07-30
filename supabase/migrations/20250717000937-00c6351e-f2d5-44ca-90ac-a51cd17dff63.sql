-- Add unique constraint on email column for leads table to enable upsert operations
ALTER TABLE public.leads ADD CONSTRAINT leads_email_unique UNIQUE (email);