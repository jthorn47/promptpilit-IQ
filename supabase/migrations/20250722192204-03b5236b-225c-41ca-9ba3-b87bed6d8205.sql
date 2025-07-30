-- Update existing tables and create missing tables for Client Payroll Processing

-- Add missing columns to existing payroll_periods table
ALTER TABLE public.payroll_periods ADD COLUMN IF NOT EXISTS pay_group_id UUID;
ALTER TABLE public.payroll_periods ADD COLUMN IF NOT EXISTS check_date DATE;

-- Add foreign key constraint for pay_group_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payroll_periods_pay_group_id_fkey'
    ) THEN
        ALTER TABLE public.payroll_periods 
        ADD CONSTRAINT payroll_periods_pay_group_id_fkey 
        FOREIGN KEY (pay_group_id) REFERENCES public.pay_groups(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create pay group employee assignments table if not exists
CREATE TABLE IF NOT EXISTS public.pay_group_employee_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pay_group_id UUID NOT NULL REFERENCES public.pay_groups(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  employee_email TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create timecard entries table if not exists
CREATE TABLE IF NOT EXISTS public.timecard_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  pay_period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
  date_worked DATE NOT NULL,
  regular_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  overtime_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  double_time_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  sick_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  vacation_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  holiday_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables (existing tables already have RLS)
ALTER TABLE public.pay_group_employee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timecard_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pay_group_employee_assignments
DROP POLICY IF EXISTS "Company admins can manage employee assignments" ON public.pay_group_employee_assignments;
CREATE POLICY "Company admins can manage employee assignments"
  ON public.pay_group_employee_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pay_groups pg
      WHERE pg.id = pay_group_employee_assignments.pay_group_id
      AND (has_company_role(auth.uid(), 'company_admin'::app_role, pg.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pay_groups pg
      WHERE pg.id = pay_group_employee_assignments.pay_group_id
      AND (has_company_role(auth.uid(), 'company_admin'::app_role, pg.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

-- Create RLS policies for timecard_entries
DROP POLICY IF EXISTS "Company admins can manage timecard entries" ON public.timecard_entries;
CREATE POLICY "Company admins can manage timecard entries"
  ON public.timecard_entries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.payroll_periods pp
      JOIN public.pay_groups pg ON pp.pay_group_id = pg.id
      WHERE pp.id = timecard_entries.pay_period_id
      AND (has_company_role(auth.uid(), 'company_admin'::app_role, pg.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.payroll_periods pp
      JOIN public.pay_groups pg ON pp.pay_group_id = pg.id
      WHERE pp.id = timecard_entries.pay_period_id
      AND (has_company_role(auth.uid(), 'company_admin'::app_role, pg.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payroll_periods_pay_group_id ON public.payroll_periods(pay_group_id);
CREATE INDEX IF NOT EXISTS idx_pay_group_assignments_pay_group_id ON public.pay_group_employee_assignments(pay_group_id);
CREATE INDEX IF NOT EXISTS idx_timecard_entries_employee_period ON public.timecard_entries(employee_id, pay_period_id);

-- Create triggers for updated_at (if functions don't exist)
DROP TRIGGER IF EXISTS update_pay_group_assignments_updated_at ON public.pay_group_employee_assignments;
CREATE TRIGGER update_pay_group_assignments_updated_at
  BEFORE UPDATE ON public.pay_group_employee_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_timecard_entries_updated_at ON public.timecard_entries;
CREATE TRIGGER update_timecard_entries_updated_at
  BEFORE UPDATE ON public.timecard_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert test data for TestClient_2025
INSERT INTO public.pay_groups (
  id,
  company_id,
  name,
  description,
  pay_frequency
) VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Weekly Hourly',
  'Weekly pay group for hourly employees',
  'weekly'
) ON CONFLICT (id) DO NOTHING;

-- Insert payroll period for testing
INSERT INTO public.payroll_periods (
  id,
  company_id,
  pay_group_id,
  start_date,
  end_date,
  check_date,
  period_type,
  status
) VALUES (
  'bbbbbbbb-cccc-dddd-eeee-222222222222'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid,
  '2025-07-14',
  '2025-07-20',
  '2025-07-25',
  'weekly',
  'draft'
) ON CONFLICT (id) DO NOTHING;

-- Insert 10 test employees into the pay group
INSERT INTO public.pay_group_employee_assignments (
  pay_group_id,
  employee_id,
  employee_name,
  employee_email
) VALUES 
  ('aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid, '33333333-0001-0001-0001-000000000001'::uuid, 'John WeeklyWorker', 'john.weekly@testclient2025.com'),
  ('aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid, '33333333-0001-0001-0001-000000000002'::uuid, 'Jane WeeklySmith', 'jane.weekly@testclient2025.com'),
  ('aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid, '33333333-0001-0001-0001-000000000003'::uuid, 'Mike WeeklyJones', 'mike.weekly@testclient2025.com'),
  ('aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid, '33333333-0001-0001-0001-000000000004'::uuid, 'Sarah WeeklyBrown', 'sarah.weekly@testclient2025.com'),
  ('aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid, '33333333-0001-0001-0001-000000000005'::uuid, 'David WeeklyDavis', 'david.weekly@testclient2025.com'),
  ('aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid, gen_random_uuid(), 'Lisa WeeklyMiller', 'lisa.weekly@testclient2025.com'),
  ('aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid, gen_random_uuid(), 'Tom WeeklyWilson', 'tom.weekly@testclient2025.com'),
  ('aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid, gen_random_uuid(), 'Amy WeeklyGarcia', 'amy.weekly@testclient2025.com'),
  ('aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid, gen_random_uuid(), 'Robert WeeklyLee', 'robert.weekly@testclient2025.com'),
  ('aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid, gen_random_uuid(), 'Jennifer WeeklyTaylor', 'jennifer.weekly@testclient2025.com')
ON CONFLICT DO NOTHING;

-- Insert sample timecard entries for all employees
DO $$
DECLARE
    emp_record RECORD;
    work_date DATE;
BEGIN
    -- Loop through all employees in the pay group
    FOR emp_record IN 
        SELECT employee_id FROM public.pay_group_employee_assignments 
        WHERE pay_group_id = 'aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid
    LOOP
        -- Insert timecard entries for each day of the pay period
        FOR work_date IN 
            SELECT generate_series('2025-07-14'::date, '2025-07-20'::date, '1 day'::interval)::date
        LOOP
            -- Skip Sunday (day 0) 
            IF EXTRACT(DOW FROM work_date) != 0 THEN
                INSERT INTO public.timecard_entries (
                    employee_id,
                    pay_period_id,
                    date_worked,
                    regular_hours,
                    overtime_hours
                ) VALUES (
                    emp_record.employee_id,
                    'bbbbbbbb-cccc-dddd-eeee-222222222222'::uuid,
                    work_date,
                    8.0, -- 8 regular hours per day
                    CASE 
                        WHEN EXTRACT(DOW FROM work_date) = 6 THEN 2.0 -- 2 overtime hours on Saturday
                        ELSE 0.0
                    END
                ) ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;