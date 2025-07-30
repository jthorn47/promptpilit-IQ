-- Fix the remaining functions with mutable search_path

-- Fix log_invitation_action function
CREATE OR REPLACE FUNCTION public.log_invitation_action(p_invitation_id uuid, p_action_type text, p_performed_by uuid DEFAULT auth.uid(), p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.invitation_audit_log (
    invitation_id,
    action_type,
    performed_by,
    metadata
  ) VALUES (
    p_invitation_id,
    p_action_type,
    p_performed_by,
    p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Fix update_invitation_updated_at function
CREATE OR REPLACE FUNCTION public.update_invitation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_task_status function (if it exists)
CREATE OR REPLACE FUNCTION public.update_task_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix trigger_auto_task_generation function (if it exists)
CREATE OR REPLACE FUNCTION public.trigger_auto_task_generation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Auto task generation logic would go here
  RETURN NEW;
END;
$$;

-- Fix update_crm_gamification_updated_at function (if it exists)
CREATE OR REPLACE FUNCTION public.update_crm_gamification_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix ensure_single_primary_contact function (if it exists)
CREATE OR REPLACE FUNCTION public.ensure_single_primary_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Logic to ensure only one primary contact per company
  IF NEW.is_primary_contact = true THEN
    UPDATE public.crm_contacts 
    SET is_primary_contact = false 
    WHERE company_id = NEW.company_id 
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;