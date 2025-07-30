-- Add source field to clients table to track how they originated
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Add comment for clarity
COMMENT ON COLUMN public.clients.source IS 'Tracks how the client originated: eCommerce, Sales, Manual Deal';

-- Create client conversion audit trail table
CREATE TABLE IF NOT EXISTS public.client_conversion_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  conversion_type TEXT NOT NULL, -- 'ecommerce_purchase', 'deal_closure', 'manual_migration'
  source_data JSONB DEFAULT '{}',
  converted_by UUID,
  converted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.client_conversion_audit ENABLE ROW LEVEL SECURITY;

-- Create policy for audit table
CREATE POLICY "CRM users can view conversion audit" ON public.client_conversion_audit
FOR SELECT 
USING (has_crm_role(auth.uid(), 'internal_staff'::app_role) OR has_crm_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert conversion audit" ON public.client_conversion_audit
FOR INSERT 
WITH CHECK (true);

-- Create function to migrate company to client with full data transfer
CREATE OR REPLACE FUNCTION public.migrate_company_to_client(
  p_company_id UUID,
  p_source TEXT DEFAULT 'manual',
  p_deal_id UUID DEFAULT NULL,
  p_converted_by UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_company_record RECORD;
  v_client_id UUID;
  v_deal_record RECORD;
BEGIN
  -- Get company record
  SELECT * INTO v_company_record
  FROM public.company_settings
  WHERE id = p_company_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Company not found';
  END IF;
  
  -- Get deal information if provided
  IF p_deal_id IS NOT NULL THEN
    SELECT * INTO v_deal_record
    FROM public.deals
    WHERE id = p_deal_id;
  END IF;
  
  -- Create client record
  INSERT INTO public.clients (
    company_name,
    company_settings_id,
    source,
    contract_value,
    currency,
    status,
    onboarding_status,
    date_won,
    notes,
    account_manager,
    primary_contact_phone,
    plan_type,
    services_purchased,
    company_address_street,
    company_address_city,
    company_address_state,
    company_address_zip,
    deal_id
  ) VALUES (
    v_company_record.company_name,
    p_company_id,
    p_source,
    COALESCE(v_deal_record.value, 50000),
    COALESCE(v_deal_record.currency, 'USD'),
    'active',
    'pending',
    COALESCE(v_deal_record.expected_close_date::date, CURRENT_DATE),
    COALESCE(v_deal_record.notes, 'Migrated from company'),
    v_company_record.account_manager,
    v_company_record.primary_contact_phone,
    'basic',
    CASE 
      WHEN v_company_record.service_type IS NOT NULL THEN ARRAY[v_company_record.service_type]
      ELSE ARRAY['LMS']
    END,
    v_company_record.address,
    v_company_record.city,
    v_company_record.state,
    v_company_record.postal_code,
    p_deal_id
  ) RETURNING id INTO v_client_id;
  
  -- Create audit trail
  INSERT INTO public.client_conversion_audit (
    company_id,
    client_id,
    conversion_type,
    source_data,
    converted_by,
    notes
  ) VALUES (
    p_company_id,
    v_client_id,
    CASE 
      WHEN p_source = 'eCommerce' THEN 'ecommerce_purchase'
      WHEN p_deal_id IS NOT NULL THEN 'deal_closure'
      ELSE 'manual_migration'
    END,
    jsonb_build_object(
      'company_data', to_jsonb(v_company_record),
      'deal_data', to_jsonb(v_deal_record),
      'migration_date', now()
    ),
    COALESCE(p_converted_by, auth.uid()),
    format('Company %s migrated to client with source: %s', v_company_record.company_name, p_source)
  );
  
  -- Update company lifecycle stage to 'client' to maintain relationship
  UPDATE public.company_settings
  SET 
    lifecycle_stage = 'client',
    updated_at = now()
  WHERE id = p_company_id;
  
  RETURN v_client_id;
END;
$$;

-- Create function to handle deal closure and trigger migration
CREATE OR REPLACE FUNCTION public.handle_deal_closure()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_client_id UUID;
BEGIN
  -- Only process when deal status changes to 'won'
  IF NEW.status = 'won' AND (OLD.status IS NULL OR OLD.status != 'won') THEN
    
    -- Check if this deal is linked to a company (not already a client)
    IF EXISTS (
      SELECT 1 FROM public.company_settings cs 
      WHERE cs.company_name = NEW.company_name 
      AND cs.lifecycle_stage != 'client'
    ) THEN
      
      -- Find the company and migrate to client
      SELECT cs.id INTO v_client_id
      FROM public.company_settings cs
      WHERE cs.company_name = NEW.company_name
      AND cs.lifecycle_stage != 'client';
      
      IF FOUND THEN
        -- Migrate company to client
        PERFORM public.migrate_company_to_client(
          v_client_id,
          'Sales',
          NEW.id,
          NEW.assigned_to::UUID
        );
        
        RAISE NOTICE 'Deal % closed - migrated company % to client', NEW.id, NEW.company_name;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for deal closure
DROP TRIGGER IF EXISTS trigger_deal_closure ON public.deals;
CREATE TRIGGER trigger_deal_closure
  AFTER UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_deal_closure();

-- Create function to check for duplicates across company and client tables
CREATE OR REPLACE FUNCTION public.check_duplicate_company_client(
  p_company_name TEXT,
  p_email TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_result JSONB;
  v_company_exists BOOLEAN := false;
  v_client_exists BOOLEAN := false;
  v_company_id UUID;
  v_client_id UUID;
BEGIN
  -- Check if company exists
  SELECT id INTO v_company_id
  FROM public.company_settings
  WHERE company_name ILIKE p_company_name
  LIMIT 1;
  
  IF FOUND THEN
    v_company_exists := true;
  END IF;
  
  -- Check if client exists
  SELECT id INTO v_client_id
  FROM public.clients
  WHERE company_name ILIKE p_company_name
  LIMIT 1;
  
  IF FOUND THEN
    v_client_exists := true;
  END IF;
  
  v_result := jsonb_build_object(
    'has_duplicates', (v_company_exists AND v_client_exists),
    'company_exists', v_company_exists,
    'client_exists', v_client_exists,
    'company_id', v_company_id,
    'client_id', v_client_id,
    'recommendation', 
    CASE 
      WHEN v_company_exists AND v_client_exists THEN 'merge_or_consolidate'
      WHEN v_client_exists THEN 'add_to_existing_client'
      WHEN v_company_exists THEN 'convert_to_client_or_update_company'
      ELSE 'safe_to_create'
    END
  );
  
  RETURN v_result;
END;
$$;