-- Create renewal schedules table
CREATE TABLE public.renewal_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_module_id uuid NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.company_settings(id) ON DELETE CASCADE,
  renewal_period_months integer NOT NULL DEFAULT 12,
  grace_period_days integer NOT NULL DEFAULT 30,
  auto_assign boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  next_renewal_check timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create renewal history table
CREATE TABLE public.renewal_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  training_module_id uuid NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  original_completion_id uuid REFERENCES public.training_completions(id),
  renewal_assignment_id uuid REFERENCES public.training_assignments(id),
  renewal_date timestamp with time zone NOT NULL,
  renewal_type text NOT NULL DEFAULT 'automatic', -- 'automatic', 'manual'
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'assigned', 'completed', 'overdue'
  due_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.renewal_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewal_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for renewal_schedules
CREATE POLICY "Company admins can manage their renewal schedules"
ON public.renewal_schedules
FOR ALL
USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND 
  (company_id = get_user_company_id(auth.uid()) OR company_id IS NULL)
);

CREATE POLICY "Super admins can manage all renewal schedules"
ON public.renewal_schedules
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for renewal_history
CREATE POLICY "Company admins can view their renewal history"
ON public.renewal_history
FOR SELECT
USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND 
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = renewal_history.employee_id 
    AND e.company_id = get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Super admins can view all renewal history"
ON public.renewal_history
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_renewal_schedules_updated_at
  BEFORE UPDATE ON public.renewal_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_renewal_history_updated_at
  BEFORE UPDATE ON public.renewal_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to process automatic renewals
CREATE OR REPLACE FUNCTION public.process_automatic_renewals()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  renewal_record RECORD;
  completion_record RECORD;
  new_assignment_id uuid;
  renewal_due_date timestamp with time zone;
BEGIN
  -- Find all active renewal schedules that need processing
  FOR renewal_record IN
    SELECT rs.*, tm.title as module_title
    FROM public.renewal_schedules rs
    JOIN public.training_modules tm ON rs.training_module_id = tm.id
    WHERE rs.is_active = true 
    AND rs.auto_assign = true
    AND (rs.next_renewal_check IS NULL OR rs.next_renewal_check <= now())
  LOOP
    -- Find completed training that needs renewal
    FOR completion_record IN
      SELECT tc.*, e.id as employee_id, e.company_id
      FROM public.training_completions tc
      JOIN public.training_assignments ta ON tc.assignment_id = ta.id
      JOIN public.employees e ON ta.employee_id = e.id
      WHERE tc.training_module_id = renewal_record.training_module_id
      AND tc.status = 'completed'
      AND tc.completed_at IS NOT NULL
      AND (
        renewal_record.company_id IS NULL OR 
        e.company_id = renewal_record.company_id
      )
      -- Check if renewal is due (completion date + renewal period)
      AND tc.completed_at + (renewal_record.renewal_period_months || ' months')::interval <= now()
      -- Make sure we haven't already created a renewal for this completion
      AND NOT EXISTS (
        SELECT 1 FROM public.renewal_history rh
        WHERE rh.original_completion_id = tc.id
        AND rh.training_module_id = renewal_record.training_module_id
        AND rh.employee_id = completion_record.employee_id
      )
    LOOP
      -- Calculate renewal due date
      renewal_due_date := completion_record.completed_at + 
        (renewal_record.renewal_period_months || ' months')::interval + 
        (renewal_record.grace_period_days || ' days')::interval;
      
      -- Create new training assignment for renewal
      INSERT INTO public.training_assignments (
        employee_id,
        training_module_id,
        assigned_by,
        due_date,
        status,
        priority
      ) VALUES (
        completion_record.employee_id,
        renewal_record.training_module_id,
        NULL, -- System assigned
        renewal_due_date,
        'assigned',
        'high'
      ) RETURNING id INTO new_assignment_id;
      
      -- Create renewal history record
      INSERT INTO public.renewal_history (
        employee_id,
        training_module_id,
        original_completion_id,
        renewal_assignment_id,
        renewal_date,
        renewal_type,
        status,
        due_date
      ) VALUES (
        completion_record.employee_id,
        renewal_record.training_module_id,
        completion_record.id,
        new_assignment_id,
        now(),
        'automatic',
        'assigned',
        renewal_due_date
      );
      
      RAISE NOTICE 'Created renewal assignment for employee % on module %', 
        completion_record.employee_id, renewal_record.module_title;
    END LOOP;
    
    -- Update next renewal check (check again in 1 day)
    UPDATE public.renewal_schedules
    SET next_renewal_check = now() + interval '1 day'
    WHERE id = renewal_record.id;
  END LOOP;
END;
$$;