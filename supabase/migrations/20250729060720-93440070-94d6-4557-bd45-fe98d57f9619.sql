-- Fix existing NULL values in email_templates before setting NOT NULL constraint
UPDATE public.email_templates 
SET brand_identity = 'easeworks' 
WHERE brand_identity IS NULL;

-- Step 4: Add brand_identity to email_logs table
ALTER TABLE public.email_logs 
ADD COLUMN IF NOT EXISTS brand_identity brand_identity DEFAULT 'easeworks'::brand_identity NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_brand_identity ON public.email_logs(brand_identity);

-- Convert email_templates brand_identity column to proper enum type
ALTER TABLE public.email_templates 
ALTER COLUMN brand_identity TYPE brand_identity 
USING brand_identity::brand_identity;

-- Step 6: Make brand_identity NOT NULL on email_templates (after fixing NULLs)
ALTER TABLE public.email_templates 
ALTER COLUMN brand_identity SET NOT NULL;

-- Add check constraint for valid brands
ALTER TABLE public.email_templates 
ADD CONSTRAINT check_valid_brand_identity 
CHECK (brand_identity IN ('easeworks', 'easelearn', 'dual'));

-- Create trigger to prevent brand_identity changes after insert
CREATE OR REPLACE FUNCTION public.prevent_brand_identity_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.brand_identity IS DISTINCT FROM NEW.brand_identity THEN
    RAISE EXCEPTION 'Cannot change brand_identity after creation for security reasons';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_email_template_brand_change
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_brand_identity_change();

-- Company settings tenant isolation
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS brand_identity brand_identity DEFAULT 'easeworks'::brand_identity NOT NULL;

-- Enhanced email logging function
CREATE OR REPLACE FUNCTION public.log_branded_email(
  p_to_email text,
  p_from_email text,
  p_subject text,
  p_html text,
  p_brand_identity brand_identity,
  p_user_id uuid DEFAULT auth.uid(),
  p_message_id text DEFAULT NULL,
  p_context jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.email_logs (
    to_email,
    from_email,
    subject,
    body,
    brand_identity,
    sender_id,
    message_id,
    status,
    sent_at,
    metadata
  ) VALUES (
    p_to_email,
    p_from_email,
    p_subject,
    p_html,
    p_brand_identity,
    p_user_id,
    p_message_id,
    'sent',
    now(),
    p_context
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;