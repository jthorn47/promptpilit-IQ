
-- Add effective dating to pay_types table
ALTER TABLE public.pay_types ADD COLUMN IF NOT EXISTS effective_start_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.pay_types ADD COLUMN IF NOT EXISTS effective_end_date DATE;
ALTER TABLE public.pay_types ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Add effective dating to deduction_definitions table  
ALTER TABLE public.deduction_definitions ADD COLUMN IF NOT EXISTS effective_start_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.deduction_definitions ADD COLUMN IF NOT EXISTS effective_end_date DATE;
ALTER TABLE public.deduction_definitions ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Update client_earnings_config to better handle inheritance
ALTER TABLE public.client_earnings_config ADD COLUMN IF NOT EXISTS parent_pay_type_id UUID REFERENCES public.pay_types(id);
ALTER TABLE public.client_earnings_config ADD COLUMN IF NOT EXISTS is_inherited BOOLEAN DEFAULT true;
ALTER TABLE public.client_earnings_config ADD COLUMN IF NOT EXISTS override_created_at TIMESTAMP WITH TIME ZONE;

-- Update client_deductions_config to better handle inheritance
ALTER TABLE public.client_deductions_config ADD COLUMN IF NOT EXISTS parent_deduction_id UUID REFERENCES public.deduction_definitions(id);
ALTER TABLE public.client_deductions_config ADD COLUMN IF NOT EXISTS is_inherited BOOLEAN DEFAULT true;
ALTER TABLE public.client_deductions_config ADD COLUMN IF NOT EXISTS override_created_at TIMESTAMP WITH TIME ZONE;

-- Create function to get active pay types for a date range
CREATE OR REPLACE FUNCTION public.get_active_pay_types(
  p_company_id UUID,
  p_effective_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  code TEXT,
  is_inherited BOOLEAN,
  parent_id UUID
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Get client-specific pay types (overrides and custom)
  SELECT 
    pt.id,
    pt.name,
    pt.code,
    CASE WHEN cec.is_inherited = true THEN true ELSE false END as is_inherited,
    cec.parent_pay_type_id as parent_id
  FROM public.pay_types pt
  LEFT JOIN public.client_earnings_config cec ON pt.id = cec.pay_type_id AND cec.client_id = p_company_id
  WHERE pt.company_id = p_company_id
    AND pt.is_active = true
    AND pt.effective_start_date <= p_effective_date
    AND (pt.effective_end_date IS NULL OR pt.effective_end_date >= p_effective_date)
  
  UNION
  
  -- Get global pay types that client hasn't overridden
  SELECT 
    pt.id,
    pt.name,
    pt.code,
    true as is_inherited,
    pt.id as parent_id
  FROM public.pay_types pt
  WHERE pt.is_global = true
    AND pt.is_active = true
    AND pt.effective_start_date <= p_effective_date
    AND (pt.effective_end_date IS NULL OR pt.effective_end_date >= p_effective_date)
    AND NOT EXISTS (
      SELECT 1 FROM public.client_earnings_config cec2
      WHERE cec2.client_id = p_company_id 
      AND cec2.parent_pay_type_id = pt.id
    );
END;
$$;

-- Create function to get active deductions for a date range
CREATE OR REPLACE FUNCTION public.get_active_deductions(
  p_company_id UUID,
  p_effective_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  code TEXT,
  is_inherited BOOLEAN,
  parent_id UUID
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Get client-specific deductions (overrides and custom)
  SELECT 
    dd.id,
    dd.name,
    dd.code,
    CASE WHEN cdc.is_inherited = true THEN true ELSE false END as is_inherited,
    cdc.parent_deduction_id as parent_id
  FROM public.deduction_definitions dd
  LEFT JOIN public.client_deductions_config cdc ON dd.id = cdc.deduction_id AND cdc.client_id = p_company_id
  WHERE dd.company_id = p_company_id
    AND dd.is_active = true
    AND dd.effective_start_date <= p_effective_date
    AND (dd.effective_end_date IS NULL OR dd.effective_end_date >= p_effective_date)
  
  UNION
  
  -- Get global deductions that client hasn't overridden
  SELECT 
    dd.id,
    dd.name,
    dd.code,
    true as is_inherited,
    dd.id as parent_id
  FROM public.deduction_definitions dd
  WHERE dd.is_global = true
    AND dd.is_active = true
    AND dd.effective_start_date <= p_effective_date
    AND (dd.effective_end_date IS NULL OR dd.effective_end_date >= p_effective_date)
    AND NOT EXISTS (
      SELECT 1 FROM public.client_deductions_config cdc2
      WHERE cdc2.client_id = p_company_id 
      AND cdc2.parent_deduction_id = dd.id
    );
END;
$$;

-- Create function to create client override from global pay type
CREATE OR REPLACE FUNCTION public.create_pay_type_override(
  p_client_id UUID,
  p_global_pay_type_id UUID,
  p_overrides JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_pay_type_id UUID;
  v_global_pay_type RECORD;
BEGIN
  -- Get the global pay type
  SELECT * INTO v_global_pay_type
  FROM public.pay_types
  WHERE id = p_global_pay_type_id AND is_global = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Global pay type not found';
  END IF;
  
  -- Create client-specific copy
  INSERT INTO public.pay_types (
    company_id, name, code, pay_category, description, rate,
    default_rate_multiplier, is_active, is_system_default,
    is_taxable_federal, is_taxable_state, is_taxable_fica,
    is_taxable_medicare, is_taxable_sdi, is_taxable_sui,
    subject_to_overtime, counts_toward_hours_worked,
    includable_in_regular_rate, reportable_on_w2, w2_box_code,
    gl_mapping_code, effective_start_date, effective_end_date,
    is_global, gl_code, show_on_pay_stub, include_in_overtime_calculation,
    employer_match_percentage, per_check_limit, annual_limit,
    calculation_method, deduction_schedule, is_reimbursable, w2_reporting_code
  )
  SELECT 
    p_client_id,
    COALESCE((p_overrides->>'name')::TEXT, v_global_pay_type.name),
    COALESCE((p_overrides->>'code')::TEXT, v_global_pay_type.code),
    COALESCE((p_overrides->>'pay_category')::TEXT, v_global_pay_type.pay_category),
    COALESCE((p_overrides->>'description')::TEXT, v_global_pay_type.description),
    COALESCE((p_overrides->>'rate')::NUMERIC, v_global_pay_type.rate),
    COALESCE((p_overrides->>'default_rate_multiplier')::NUMERIC, v_global_pay_type.default_rate_multiplier),
    COALESCE((p_overrides->>'is_active')::BOOLEAN, v_global_pay_type.is_active),
    false, -- is_system_default always false for client overrides
    COALESCE((p_overrides->>'is_taxable_federal')::BOOLEAN, v_global_pay_type.is_taxable_federal),
    COALESCE((p_overrides->>'is_taxable_state')::BOOLEAN, v_global_pay_type.is_taxable_state),
    COALESCE((p_overrides->>'is_taxable_fica')::BOOLEAN, v_global_pay_type.is_taxable_fica),
    COALESCE((p_overrides->>'is_taxable_medicare')::BOOLEAN, v_global_pay_type.is_taxable_medicare),
    COALESCE((p_overrides->>'is_taxable_sdi')::BOOLEAN, v_global_pay_type.is_taxable_sdi),
    COALESCE((p_overrides->>'is_taxable_sui')::BOOLEAN, v_global_pay_type.is_taxable_sui),
    COALESCE((p_overrides->>'subject_to_overtime')::BOOLEAN, v_global_pay_type.subject_to_overtime),
    COALESCE((p_overrides->>'counts_toward_hours_worked')::BOOLEAN, v_global_pay_type.counts_toward_hours_worked),
    COALESCE((p_overrides->>'includable_in_regular_rate')::BOOLEAN, v_global_pay_type.includable_in_regular_rate),
    COALESCE((p_overrides->>'reportable_on_w2')::BOOLEAN, v_global_pay_type.reportable_on_w2),
    COALESCE((p_overrides->>'w2_box_code')::TEXT, v_global_pay_type.w2_box_code),
    COALESCE((p_overrides->>'gl_mapping_code')::TEXT, v_global_pay_type.gl_mapping_code),
    COALESCE((p_overrides->>'effective_start_date')::DATE, CURRENT_DATE),
    (p_overrides->>'effective_end_date')::DATE,
    false, -- is_global always false for client overrides
    COALESCE((p_overrides->>'gl_code')::TEXT, v_global_pay_type.gl_code),
    COALESCE((p_overrides->>'show_on_pay_stub')::BOOLEAN, v_global_pay_type.show_on_pay_stub),
    COALESCE((p_overrides->>'include_in_overtime_calculation')::BOOLEAN, v_global_pay_type.include_in_overtime_calculation),
    COALESCE((p_overrides->>'employer_match_percentage')::NUMERIC, v_global_pay_type.employer_match_percentage),
    COALESCE((p_overrides->>'per_check_limit')::NUMERIC, v_global_pay_type.per_check_limit),
    COALESCE((p_overrides->>'annual_limit')::NUMERIC, v_global_pay_type.annual_limit),
    COALESCE((p_overrides->>'calculation_method')::TEXT, v_global_pay_type.calculation_method),
    COALESCE((p_overrides->>'deduction_schedule')::TEXT, v_global_pay_type.deduction_schedule),
    COALESCE((p_overrides->>'is_reimbursable')::BOOLEAN, v_global_pay_type.is_reimbursable),
    COALESCE((p_overrides->>'w2_reporting_code')::TEXT, v_global_pay_type.w2_reporting_code)
  RETURNING id INTO v_new_pay_type_id;
  
  -- Create client earnings config entry
  INSERT INTO public.client_earnings_config (
    client_id, pay_type_id, parent_pay_type_id, is_inherited, 
    override_created_at, is_enabled
  ) VALUES (
    p_client_id, v_new_pay_type_id, p_global_pay_type_id, false,
    now(), true
  );
  
  RETURN v_new_pay_type_id;
END;
$$;
