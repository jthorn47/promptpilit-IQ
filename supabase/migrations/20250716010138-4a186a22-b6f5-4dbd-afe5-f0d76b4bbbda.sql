-- Fix remaining Function Search Path Mutable warnings

-- Fix update_updated_at_video_tables function
CREATE OR REPLACE FUNCTION public.update_updated_at_video_tables()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix ensure_single_primary_contact function
CREATE OR REPLACE FUNCTION public.ensure_single_primary_contact()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If setting a contact as primary, unset others for this company
  IF NEW.is_primary = true AND (OLD.is_primary IS NULL OR OLD.is_primary = false) THEN
    UPDATE public.company_contacts 
    SET is_primary = false, updated_at = now()
    WHERE company_id = NEW.company_id AND id != NEW.id AND is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix extract_domain_from_email function
CREATE OR REPLACE FUNCTION public.extract_domain_from_email(email_address text)
 RETURNS text
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  IF email_address IS NULL OR email_address = '' THEN
    RETURN NULL;
  END IF;
  
  -- Extract domain part after @
  RETURN lower(split_part(email_address, '@', 2));
END;
$function$;

-- Fix create_default_client_modules function
CREATE OR REPLACE FUNCTION public.create_default_client_modules()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Insert platform modules for new client
    INSERT INTO public.client_module_access (client_id, module_id, module_type, is_enabled)
    SELECT 
        NEW.id,
        unnest(ARRAY['lms', 'assessments', 'payroll', 'ats', 'onboarding', 'benefits', 'performance', 'scheduling', 'processing_schedules', 'express_tracking', 'hr_management', 'workers_comp', 'time_attendance', 'wpv_wizard', 'crm', 'compliance', 'reports', 'business_intelligence']),
        'platform',
        false;
    
    -- Insert training modules for new client
    INSERT INTO public.client_module_access (client_id, module_id, module_type, is_enabled)
    SELECT 
        NEW.id,
        tm.module_id,
        'training',
        false
    FROM public.training_modules_catalog tm;
    
    RETURN NEW;
END;
$function$;

-- Fix update_training_module_client_access_updated_at function
CREATE OR REPLACE FUNCTION public.update_training_module_client_access_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix log_lifecycle_stage_change function
CREATE OR REPLACE FUNCTION public.log_lifecycle_stage_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only log if stage actually changed
  IF OLD.sales_lifecycle_stage IS DISTINCT FROM NEW.sales_lifecycle_stage THEN
    NEW.stage_transition_history = COALESCE(OLD.stage_transition_history, '[]'::jsonb) || 
      jsonb_build_object(
        'from_stage', OLD.sales_lifecycle_stage,
        'to_stage', NEW.sales_lifecycle_stage,
        'changed_at', now(),
        'changed_by', auth.uid()
      );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix log_investment_analysis_changes function
CREATE OR REPLACE FUNCTION public.log_investment_analysis_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO public.investment_analysis_audit (
            investment_analysis_id,
            action_type,
            old_values,
            new_values,
            changed_by
        )
        VALUES (
            NEW.id,
            'updated',
            to_jsonb(OLD),
            to_jsonb(NEW),
            auth.uid()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$function$;

-- Fix has_active_paying_clients function
CREATE OR REPLACE FUNCTION public.has_active_paying_clients(company_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.clients c
    WHERE c.company_settings_id = company_id
    AND c.status = 'active'
    AND (
      c.payment_status IN ('paid', 'active') OR
      c.subscription_status = 'active' OR
      c.stripe_subscription_id IS NOT NULL
    )
  );
END;
$function$;