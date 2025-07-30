-- Phase 2: Service Integration Database Schema

-- 1. Create case routing rules table
CREATE TABLE IF NOT EXISTS case_routing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  case_type TEXT NOT NULL,
  priority_level TEXT NOT NULL CHECK (priority_level IN ('low', 'standard', 'high', 'urgent')),
  consultant_id UUID NOT NULL,
  auto_assign BOOLEAN DEFAULT true,
  max_concurrent_cases INTEGER DEFAULT 10,
  skill_requirements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on case_routing_rules
ALTER TABLE case_routing_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for case_routing_rules
CREATE POLICY "Company admins can manage routing rules" 
ON case_routing_rules 
FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- 2. Create service deliverables table
CREATE TABLE IF NOT EXISTS service_deliverables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  retainer_id UUID REFERENCES hroiq_client_retainers(id),
  case_id UUID REFERENCES cases(id),
  deliverable_type TEXT NOT NULL CHECK (deliverable_type IN ('policy', 'document', 'training', 'consultation', 'audit', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'review', 'approved', 'delivered')),
  version TEXT DEFAULT '1.0',
  file_url TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  approved_by UUID,
  client_visible BOOLEAN DEFAULT false,
  billable_hours NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on service_deliverables
ALTER TABLE service_deliverables ENABLE ROW LEVEL SECURITY;

-- Create policies for service_deliverables
CREATE POLICY "Company admins can manage their deliverables" 
ON service_deliverables 
FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  created_by = auth.uid()
);

CREATE POLICY "Clients can view their deliverables" 
ON service_deliverables 
FOR SELECT 
USING (
  client_visible = true AND 
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
);

-- 3. Create service audit trail table
CREATE TABLE IF NOT EXISTS service_audit_trail (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deliverable_id UUID NOT NULL REFERENCES service_deliverables(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'updated', 'reviewed', 'approved', 'delivered', 'accessed')),
  performed_by UUID NOT NULL,
  action_details JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on service_audit_trail
ALTER TABLE service_audit_trail ENABLE ROW LEVEL SECURITY;

-- Create policies for service_audit_trail
CREATE POLICY "Users can view audit trail for their deliverables" 
ON service_audit_trail 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM service_deliverables sd 
    WHERE sd.id = service_audit_trail.deliverable_id 
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, sd.company_id) OR 
      has_role(auth.uid(), 'super_admin'::app_role) OR
      sd.created_by = auth.uid()
    )
  )
);

-- 4. Create billing integrations table
CREATE TABLE IF NOT EXISTS billing_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  retainer_id UUID NOT NULL REFERENCES hroiq_client_retainers(id),
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  base_retainer_amount NUMERIC DEFAULT 0,
  hours_included NUMERIC DEFAULT 0,
  hours_used NUMERIC DEFAULT 0,
  overage_hours NUMERIC DEFAULT 0,
  overage_rate NUMERIC DEFAULT 0,
  overage_amount NUMERIC DEFAULT 0,
  case_hours_breakdown JSONB DEFAULT '[]',
  service_hours_breakdown JSONB DEFAULT '[]',
  discount_applied NUMERIC DEFAULT 0,
  discount_reason TEXT,
  invoice_generated BOOLEAN DEFAULT false,
  invoice_id UUID,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'invoiced', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on billing_integrations
ALTER TABLE billing_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for billing_integrations
CREATE POLICY "Company admins can view their billing" 
ON billing_integrations 
FOR SELECT 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "HRO IQ staff can manage billing" 
ON billing_integrations 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 5. Create consultant capacity tracking table
CREATE TABLE IF NOT EXISTS consultant_capacity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultant_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  planned_hours NUMERIC DEFAULT 40,
  actual_hours NUMERIC DEFAULT 0,
  utilization_percentage NUMERIC DEFAULT 0,
  active_cases INTEGER DEFAULT 0,
  capacity_status TEXT DEFAULT 'available' CHECK (capacity_status IN ('available', 'at_capacity', 'overloaded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(consultant_id, week_start_date)
);

-- Enable RLS on consultant_capacity
ALTER TABLE consultant_capacity ENABLE ROW LEVEL SECURITY;

-- Create policies for consultant_capacity
CREATE POLICY "Consultants can view their own capacity" 
ON consultant_capacity 
FOR SELECT 
USING (
  consultant_id = auth.uid() OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "HRO IQ staff can manage capacity" 
ON consultant_capacity 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_routing_rules_company_type ON case_routing_rules(company_id, case_type);
CREATE INDEX IF NOT EXISTS idx_service_deliverables_company_status ON service_deliverables(company_id, status);
CREATE INDEX IF NOT EXISTS idx_service_audit_trail_deliverable ON service_audit_trail(deliverable_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_billing_integrations_company_period ON billing_integrations(company_id, billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_consultant_capacity_consultant_week ON consultant_capacity(consultant_id, week_start_date);

-- 7. Create triggers for updated_at columns
CREATE TRIGGER update_case_routing_rules_updated_at
  BEFORE UPDATE ON case_routing_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_deliverables_updated_at
  BEFORE UPDATE ON service_deliverables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_integrations_updated_at
  BEFORE UPDATE ON billing_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultant_capacity_updated_at
  BEFORE UPDATE ON consultant_capacity
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Create function to auto-update consultant capacity
CREATE OR REPLACE FUNCTION update_consultant_capacity()
RETURNS TRIGGER AS $$
DECLARE
  week_start DATE;
  consultant_uuid UUID;
  total_hours NUMERIC;
  case_count INTEGER;
BEGIN
  -- Get the Monday of the week for the work_date
  week_start := DATE_TRUNC('week', NEW.work_date::DATE) + INTERVAL '1 day';
  consultant_uuid := NEW.logged_by;
  
  -- Skip if no logged_by user
  IF consultant_uuid IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculate total hours for this consultant this week
  SELECT COALESCE(SUM(hours_logged), 0) INTO total_hours
  FROM unified_time_entries
  WHERE logged_by = consultant_uuid
  AND work_date >= week_start
  AND work_date < week_start + INTERVAL '7 days';
  
  -- Count active cases
  SELECT COUNT(*) INTO case_count
  FROM cases
  WHERE assigned_consultant_id = consultant_uuid
  AND status IN ('open', 'in_progress', 'assigned');
  
  -- Update or insert capacity record
  INSERT INTO consultant_capacity (
    consultant_id, week_start_date, actual_hours, 
    utilization_percentage, active_cases, capacity_status
  ) VALUES (
    consultant_uuid, week_start, total_hours,
    (total_hours / 40 * 100),
    case_count,
    CASE 
      WHEN total_hours > 45 THEN 'overloaded'
      WHEN total_hours > 35 THEN 'at_capacity'
      ELSE 'available'
    END
  )
  ON CONFLICT (consultant_id, week_start_date)
  DO UPDATE SET
    actual_hours = total_hours,
    utilization_percentage = (total_hours / 40 * 100),
    active_cases = case_count,
    capacity_status = CASE 
      WHEN total_hours > 45 THEN 'overloaded'
      WHEN total_hours > 35 THEN 'at_capacity'
      ELSE 'available'
    END,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for capacity updates
CREATE TRIGGER update_consultant_capacity_trigger
  AFTER INSERT OR UPDATE ON unified_time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_consultant_capacity();