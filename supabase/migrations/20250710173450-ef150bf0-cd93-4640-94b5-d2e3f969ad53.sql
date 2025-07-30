-- Create Pay Types module for payroll engine

-- Create enum for pay categories
CREATE TYPE public.pay_category AS ENUM (
  'earnings',
  'reimbursement', 
  'fringe_benefit',
  'deduction',
  'other'
);

-- Create pay types table
CREATE TABLE public.pay_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  pay_category pay_category NOT NULL DEFAULT 'earnings',
  description TEXT,
  
  -- Tax attributes
  is_taxable_federal BOOLEAN DEFAULT true,
  is_taxable_state BOOLEAN DEFAULT true,
  is_taxable_fica BOOLEAN DEFAULT true,
  is_taxable_medicare BOOLEAN DEFAULT true,
  is_taxable_sdi BOOLEAN DEFAULT true,
  is_taxable_sui BOOLEAN DEFAULT true,
  
  -- Calculation attributes
  subject_to_overtime BOOLEAN DEFAULT true,
  counts_toward_hours_worked BOOLEAN DEFAULT true,
  includable_in_regular_rate BOOLEAN DEFAULT true,
  default_rate_multiplier DECIMAL(4,2) DEFAULT 1.0,
  
  -- Reporting attributes
  reportable_on_w2 BOOLEAN DEFAULT true,
  w2_box_code TEXT,
  gl_mapping_code TEXT,
  
  -- State-specific handling
  state_specific_rules JSONB DEFAULT '{}',
  
  -- System attributes
  is_system_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  company_id UUID, -- NULL for system defaults
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  
  CONSTRAINT pay_types_code_company_unique UNIQUE (code, company_id)
);

-- Create pay type audit trail
CREATE TABLE public.pay_type_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_type_id UUID NOT NULL REFERENCES public.pay_types(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'updated', 'disabled', 'enabled')),
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  performed_by UUID,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.pay_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_type_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pay_types
CREATE POLICY "System pay types viewable by authenticated users"
ON public.pay_types
FOR SELECT
TO authenticated
USING (is_system_default = true OR company_id IS NULL);

CREATE POLICY "Company admins can view their company pay types"
ON public.pay_types
FOR SELECT
TO authenticated
USING (
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage their company pay types"
ON public.pay_types
FOR ALL
TO authenticated
USING (
  (company_id = get_user_company_id(auth.uid()) AND has_role(auth.uid(), 'company_admin'::app_role)) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (company_id = get_user_company_id(auth.uid()) AND has_role(auth.uid(), 'company_admin'::app_role)) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Super admins can manage system pay types"
ON public.pay_types
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for audit trail
CREATE POLICY "Company admins can view their pay type audit trail"
ON public.pay_type_audit_trail
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pay_types pt
    WHERE pt.id = pay_type_audit_trail.pay_type_id
    AND (
      pt.company_id = get_user_company_id(auth.uid()) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

CREATE POLICY "System can insert audit trail"
ON public.pay_type_audit_trail
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add update triggers
CREATE TRIGGER update_pay_types_updated_at
    BEFORE UPDATE ON public.pay_types
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.log_pay_type_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if this is an actual change
  IF TG_OP = 'UPDATE' AND OLD IS NOT DISTINCT FROM NEW THEN
    RETURN NEW;
  END IF;
  
  INSERT INTO public.pay_type_audit_trail (
    pay_type_id,
    action_type,
    old_values,
    new_values,
    changed_fields,
    performed_by
  )
  VALUES (
    COALESCE(NEW.id, OLD.id),
    CASE TG_OP
      WHEN 'INSERT' THEN 'created'
      WHEN 'UPDATE' THEN 'updated'
      WHEN 'DELETE' THEN 'disabled'
    END,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    CASE 
      WHEN TG_OP = 'UPDATE' THEN 
        ARRAY(
          SELECT key FROM jsonb_each(to_jsonb(NEW)) 
          WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
        )
      ELSE NULL
    END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create audit trigger
CREATE TRIGGER pay_types_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.pay_types
    FOR EACH ROW
    EXECUTE FUNCTION public.log_pay_type_changes();

-- Insert system default pay types
INSERT INTO public.pay_types (
  name, code, pay_category, description, 
  is_taxable_federal, is_taxable_state, is_taxable_fica, is_taxable_medicare, is_taxable_sdi, is_taxable_sui,
  subject_to_overtime, counts_toward_hours_worked, includable_in_regular_rate, 
  default_rate_multiplier, reportable_on_w2, w2_box_code, is_system_default
) VALUES 
  ('Regular Pay', 'REG', 'earnings', 'Standard hourly or salary pay', true, true, true, true, true, true, true, true, true, 1.0, true, '1', true),
  ('Overtime', 'OT', 'earnings', 'Overtime pay at 1.5x rate', true, true, true, true, true, true, false, true, false, 1.5, true, '1', true),
  ('Double Time', 'DT', 'earnings', 'Double time pay at 2x rate', true, true, true, true, true, true, false, true, false, 2.0, true, '1', true),
  ('Holiday Pay', 'HOL', 'earnings', 'Holiday premium pay', true, true, true, true, true, true, true, true, true, 1.0, true, '1', true),
  ('Sick Pay', 'SICK', 'earnings', 'Paid sick leave', true, true, true, true, true, true, true, false, false, 1.0, true, '1', true),
  ('Vacation Pay', 'VAC', 'earnings', 'Paid vacation/PTO', true, true, true, true, true, true, true, false, false, 1.0, true, '1', true),
  ('Bonus', 'BON', 'earnings', 'Performance or discretionary bonus', true, true, true, true, true, true, false, false, false, 1.0, true, '1', true),
  ('Commission', 'COMM', 'earnings', 'Sales commission', true, true, true, true, true, true, false, false, true, 1.0, true, '1', true),
  ('Retroactive Pay', 'RETRO', 'earnings', 'Retroactive pay adjustment', true, true, true, true, true, true, false, false, true, 1.0, true, '1', true),
  ('Severance Pay', 'SEV', 'earnings', 'Severance payment', true, true, true, true, false, true, false, false, false, 1.0, true, '1', true),
  ('Bereavement', 'BER', 'earnings', 'Bereavement leave pay', true, true, true, true, true, true, true, false, false, 1.0, true, '1', true),
  ('Jury Duty', 'JURY', 'earnings', 'Jury duty pay', true, true, true, true, true, true, true, false, false, 1.0, true, '1', true),
  ('Per Diem', 'PERDIEM', 'reimbursement', 'Daily allowance/stipend', false, false, false, false, false, false, false, false, false, 1.0, false, null, true),
  ('On-call Pay', 'ONCALL', 'earnings', 'On-call availability pay', true, true, true, true, true, true, true, true, true, 1.0, true, '1', true),
  ('Shift Differential', 'SHIFT', 'earnings', 'Premium for specific shifts', true, true, true, true, true, true, true, true, true, 1.0, true, '1', true),
  ('Reimbursement', 'REIMB', 'reimbursement', 'Non-taxable expense reimbursement', false, false, false, false, false, false, false, false, false, 1.0, false, null, true);

-- Add state-specific rules for California sick pay
UPDATE public.pay_types 
SET state_specific_rules = '{"CA": {"min_accrual_rate": 0.0333, "max_accrual_hours": 48, "carryover_limit": 24}}'
WHERE code = 'SICK' AND is_system_default = true;