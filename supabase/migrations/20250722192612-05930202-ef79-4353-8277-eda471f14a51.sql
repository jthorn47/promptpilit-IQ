-- Create helper functions for timecard operations

CREATE OR REPLACE FUNCTION public.get_timecard_entries(p_employee_id UUID, p_pay_period_id UUID)
RETURNS TABLE(
  id UUID,
  employee_id UUID,
  pay_period_id UUID,
  date_worked DATE,
  regular_hours NUMERIC,
  overtime_hours NUMERIC,
  double_time_hours NUMERIC,
  sick_hours NUMERIC,
  vacation_hours NUMERIC,
  holiday_hours NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tc.id,
    tc.employee_id,
    tc.pay_period_id,
    tc.date_worked,
    tc.regular_hours,
    tc.overtime_hours,
    tc.double_time_hours,
    tc.sick_hours,
    tc.vacation_hours,
    tc.holiday_hours,
    tc.notes,
    tc.created_at,
    tc.updated_at
  FROM public.timecard_entries tc
  WHERE tc.employee_id = p_employee_id 
  AND tc.pay_period_id = p_pay_period_id
  ORDER BY tc.date_worked;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_timecard_entry(p_entry_id UUID, p_updates JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_id UUID;
BEGIN
  UPDATE public.timecard_entries
  SET 
    regular_hours = COALESCE((p_updates->>'regular_hours')::NUMERIC, regular_hours),
    overtime_hours = COALESCE((p_updates->>'overtime_hours')::NUMERIC, overtime_hours),
    double_time_hours = COALESCE((p_updates->>'double_time_hours')::NUMERIC, double_time_hours),
    sick_hours = COALESCE((p_updates->>'sick_hours')::NUMERIC, sick_hours),
    vacation_hours = COALESCE((p_updates->>'vacation_hours')::NUMERIC, vacation_hours),
    holiday_hours = COALESCE((p_updates->>'holiday_hours')::NUMERIC, holiday_hours),
    notes = COALESCE(p_updates->>'notes', notes),
    updated_at = now()
  WHERE id = p_entry_id
  RETURNING id INTO updated_id;
  
  RETURN updated_id;
END;
$$;