-- First migration: Add new enum values (must be committed separately)
ALTER TYPE public.sales_lifecycle_stage ADD VALUE IF NOT EXISTS 'lead_new';
ALTER TYPE public.sales_lifecycle_stage ADD VALUE IF NOT EXISTS 'prospect_qualified';
ALTER TYPE public.sales_lifecycle_stage ADD VALUE IF NOT EXISTS 'client_active';
ALTER TYPE public.sales_lifecycle_stage ADD VALUE IF NOT EXISTS 'client_inactive';
ALTER TYPE public.sales_lifecycle_stage ADD VALUE IF NOT EXISTS 'disqualified_no_fit';