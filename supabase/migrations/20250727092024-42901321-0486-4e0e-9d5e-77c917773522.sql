-- Fix missing RLS policies for CRM tables
-- These are critical security issues that need to be addressed

-- Add RLS policies for crm_metrics
CREATE POLICY "Company users can view CRM metrics" ON crm_metrics
  FOR SELECT USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'internal_staff'::app_role)
  );

CREATE POLICY "Company admins can manage CRM metrics" ON crm_metrics
  FOR ALL USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'internal_staff'::app_role)
  );

-- Add RLS policies for crm_gamification_settings
CREATE POLICY "Company admins can manage gamification settings" ON crm_gamification_settings
  FOR ALL USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Add RLS policies for crm_admin_settings  
CREATE POLICY "Company admins can manage admin settings" ON crm_admin_settings
  FOR ALL USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Add RLS policies for crm_email_settings
CREATE POLICY "Company users can manage email settings" ON crm_email_settings
  FOR ALL USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'internal_staff'::app_role)
  );

-- Fix search_path for functions (security issue)
-- Update existing functions to include search_path

CREATE OR REPLACE FUNCTION public.update_opportunity_stage_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Update stage timestamp when stage changes
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
        NEW.stage_updated_at = now();
        
        -- Update last activity date
        NEW.last_activity_date = now();
        
        -- Update company last activity date
        UPDATE public.crm_companies 
        SET last_activity_date = now() 
        WHERE id = NEW.company_id;
    END IF;
    
    RETURN NEW;
END;
$function$;