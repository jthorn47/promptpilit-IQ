-- Create table to track supported states for tax calculations
CREATE TABLE IF NOT EXISTS public.supported_tax_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_code TEXT NOT NULL UNIQUE,
  state_name TEXT NOT NULL,
  is_supported BOOLEAN NOT NULL DEFAULT false,
  support_priority TEXT NOT NULL DEFAULT 'low', -- low, medium, high, critical
  employee_count INTEGER DEFAULT 0,
  last_employee_added TIMESTAMP WITH TIME ZONE,
  tax_tables_implemented BOOLEAN DEFAULT false,
  implementation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to track state expansion requests
CREATE TABLE IF NOT EXISTS public.state_expansion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_code TEXT NOT NULL,
  state_name TEXT NOT NULL,
  employee_id UUID,
  employee_name TEXT,
  request_reason TEXT DEFAULT 'New employee added',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, declined
  assigned_to UUID,
  estimated_completion DATE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert California as the supported state
INSERT INTO public.supported_tax_states (state_code, state_name, is_supported, tax_tables_implemented, implementation_notes)
VALUES ('CA', 'California', true, true, 'Fully implemented with tax brackets and SDI calculations')
ON CONFLICT (state_code) DO UPDATE SET
  is_supported = EXCLUDED.is_supported,
  tax_tables_implemented = EXCLUDED.tax_tables_implemented,
  implementation_notes = EXCLUDED.implementation_notes;

-- Insert common states that might be needed (initially unsupported)
INSERT INTO public.supported_tax_states (state_code, state_name, is_supported, support_priority)
VALUES 
  ('TX', 'Texas', false, 'high'),
  ('NY', 'New York', false, 'high'),
  ('FL', 'Florida', false, 'high'),
  ('WA', 'Washington', false, 'medium'),
  ('OR', 'Oregon', false, 'medium'),
  ('AZ', 'Arizona', false, 'medium'),
  ('NV', 'Nevada', false, 'medium'),
  ('CO', 'Colorado', false, 'medium'),
  ('UT', 'Utah', false, 'low'),
  ('ID', 'Idaho', false, 'low')
ON CONFLICT (state_code) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.supported_tax_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.state_expansion_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for supported states (readable by authenticated users, manageable by admins)
CREATE POLICY "Authenticated users can view supported states" 
ON public.supported_tax_states FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage supported states" 
ON public.supported_tax_states FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Create policies for expansion requests (admins only)
CREATE POLICY "Admins can manage state expansion requests" 
ON public.state_expansion_requests FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Add triggers for updated_at columns
CREATE TRIGGER update_supported_tax_states_updated_at
  BEFORE UPDATE ON public.supported_tax_states
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_state_expansion_requests_updated_at
  BEFORE UPDATE ON public.state_expansion_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if a state needs tax support
CREATE OR REPLACE FUNCTION public.check_state_tax_support()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  state_record RECORD;
  employee_record RECORD;
BEGIN
  -- Skip if no state information
  IF NEW.state IS NULL OR NEW.state = '' THEN
    RETURN NEW;
  END IF;
  
  -- Get employee details
  SELECT first_name, last_name, company_id INTO employee_record
  FROM employees 
  WHERE id = NEW.id;
  
  -- Check if state is supported
  SELECT * INTO state_record
  FROM supported_tax_states 
  WHERE state_code = UPPER(NEW.state);
  
  -- If state doesn't exist in our tracking, add it
  IF NOT FOUND THEN
    INSERT INTO supported_tax_states (state_code, state_name, is_supported, employee_count, last_employee_added)
    VALUES (UPPER(NEW.state), UPPER(NEW.state), false, 1, now());
    
    -- Create expansion request
    INSERT INTO state_expansion_requests (
      state_code, state_name, employee_id, employee_name, 
      request_reason, priority, status
    ) VALUES (
      UPPER(NEW.state), UPPER(NEW.state), NEW.id, 
      COALESCE(employee_record.first_name, '') || ' ' || COALESCE(employee_record.last_name, ''),
      'New employee added in unsupported state', 'high', 'pending'
    );
    
    -- Trigger notification (will be handled by edge function)
    PERFORM net.http_post(
      url := 'https://xfamotequcavggiqndfj.supabase.co/functions/v1/notify-state-expansion',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW1vdGVxdWNhdmdnaXFuZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTg2NTEsImV4cCI6MjA2NzE5NDY1MX0.f3yZ55pFCc9yLOUvUssb1S04-alf_IZ2e_f5wJ0bGWw"}'::jsonb,
      body := json_build_object(
        'trigger', 'new_unsupported_state',
        'state_code', UPPER(NEW.state),
        'employee_name', COALESCE(employee_record.first_name, '') || ' ' || COALESCE(employee_record.last_name, ''),
        'employee_id', NEW.id,
        'company_id', employee_record.company_id
      )::text
    );
    
  -- If state exists but is not supported
  ELSIF NOT state_record.is_supported THEN
    -- Update employee count and last added date
    UPDATE supported_tax_states 
    SET employee_count = employee_count + 1,
        last_employee_added = now(),
        support_priority = CASE 
          WHEN employee_count + 1 >= 10 THEN 'critical'
          WHEN employee_count + 1 >= 5 THEN 'high'
          WHEN employee_count + 1 >= 2 THEN 'medium'
          ELSE 'low'
        END
    WHERE state_code = UPPER(NEW.state);
    
    -- Create expansion request if priority is high or critical
    IF state_record.employee_count + 1 >= 5 THEN
      INSERT INTO state_expansion_requests (
        state_code, state_name, employee_id, employee_name,
        request_reason, priority, status
      ) VALUES (
        UPPER(NEW.state), state_record.state_name, NEW.id,
        COALESCE(employee_record.first_name, '') || ' ' || COALESCE(employee_record.last_name, ''),
        'High priority: ' || (state_record.employee_count + 1) || ' employees in unsupported state',
        CASE WHEN state_record.employee_count + 1 >= 10 THEN 'critical' ELSE 'high' END,
        'pending'
      );
      
      -- Trigger notification
      PERFORM net.http_post(
        url := 'https://xfamotequcavggiqndfj.supabase.co/functions/v1/notify-state-expansion',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW1vdGVxdWNhdmdnaXFuZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTg2NTEsImV4cCI6MjA2NzE5NDY1MX0.f3yZ55pFCc9yLOUvUssb1S04-alf_IZ2e_f5wJ0bGWw"}'::jsonb,
        body := json_build_object(
          'trigger', 'high_priority_state',
          'state_code', UPPER(NEW.state),
          'employee_name', COALESCE(employee_record.first_name, '') || ' ' || COALESCE(employee_record.last_name, ''),
          'employee_id', NEW.id,
          'company_id', employee_record.company_id,
          'employee_count', state_record.employee_count + 1,
          'priority', CASE WHEN state_record.employee_count + 1 >= 10 THEN 'critical' ELSE 'high' END
        )::text
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on employees table to check state support
DROP TRIGGER IF EXISTS check_employee_state_support ON public.employees;
CREATE TRIGGER check_employee_state_support
  AFTER INSERT ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.check_state_tax_support();