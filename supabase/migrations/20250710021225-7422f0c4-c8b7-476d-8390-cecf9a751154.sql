-- Phase 5: Scheduling & Workforce Management
-- Create tables for scheduling, time tracking, shifts, and attendance

-- Work Schedules table
CREATE TABLE public.work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  client_id UUID REFERENCES public.staffing_clients(id),
  job_order_id UUID REFERENCES public.job_orders(id),
  schedule_name TEXT NOT NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('fixed', 'rotating', 'flexible', 'on_call')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Schedule Templates table (for recurring schedules)
CREATE TABLE public.schedule_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  client_id UUID REFERENCES public.staffing_clients(id),
  schedule_pattern JSONB NOT NULL, -- Contains weekly pattern, shift times, etc.
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Work Shifts table
CREATE TABLE public.work_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.work_schedules(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  client_id UUID REFERENCES public.staffing_clients(id),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 0,
  shift_type TEXT NOT NULL CHECK (shift_type IN ('regular', 'overtime', 'holiday', 'emergency')),
  position_title TEXT,
  location_details TEXT,
  hourly_rate DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Time Entries table (for tracking actual work time)
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID REFERENCES public.work_shifts(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  client_id UUID REFERENCES public.staffing_clients(id),
  entry_date DATE NOT NULL,
  clock_in_time TIMESTAMP WITH TIME ZONE,
  clock_out_time TIMESTAMP WITH TIME ZONE,
  break_start_time TIMESTAMP WITH TIME ZONE,
  break_end_time TIMESTAMP WITH TIME ZONE,
  total_hours DECIMAL(5,2),
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  break_hours DECIMAL(5,2) DEFAULT 0,
  entry_type TEXT NOT NULL DEFAULT 'automatic' CHECK (entry_type IN ('automatic', 'manual', 'adjusted')),
  entry_method TEXT CHECK (entry_method IN ('mobile_app', 'web_portal', 'admin_entry', 'time_clock')),
  location_logged JSONB, -- GPS coordinates or location details
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disputed', 'rejected')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Attendance Records table
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  shift_id UUID REFERENCES public.work_shifts(id),
  client_id UUID REFERENCES public.staffing_clients(id),
  attendance_date DATE NOT NULL,
  scheduled_start_time TIME,
  scheduled_end_time TIME,
  actual_start_time TIME,
  actual_end_time TIME,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'early_departure', 'no_show', 'excused')),
  late_minutes INTEGER DEFAULT 0,
  early_departure_minutes INTEGER DEFAULT 0,
  absence_reason TEXT,
  is_excused BOOLEAN DEFAULT false,
  documented_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Schedule Conflicts table (to track and resolve scheduling conflicts)
CREATE TABLE public.schedule_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('double_booking', 'overtime_violation', 'availability_conflict', 'break_violation')),
  primary_shift_id UUID REFERENCES public.work_shifts(id),
  conflicting_shift_id UUID REFERENCES public.work_shifts(id),
  conflict_date DATE NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'resolved', 'acknowledged', 'ignored')),
  resolution_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shift Change Requests table
CREATE TABLE public.shift_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID REFERENCES public.work_shifts(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('time_change', 'date_change', 'cancellation', 'coverage_request')),
  original_date DATE,
  original_start_time TIME,
  original_end_time TIME,
  requested_date DATE,
  requested_start_time TIME,
  requested_end_time TIME,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  response_notes TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_work_schedules_employee ON public.work_schedules(employee_id);
CREATE INDEX idx_work_schedules_client ON public.work_schedules(client_id);
CREATE INDEX idx_work_schedules_dates ON public.work_schedules(start_date, end_date);

CREATE INDEX idx_work_shifts_employee ON public.work_shifts(employee_id);
CREATE INDEX idx_work_shifts_client ON public.work_shifts(client_id);
CREATE INDEX idx_work_shifts_date ON public.work_shifts(shift_date);
CREATE INDEX idx_work_shifts_schedule ON public.work_shifts(schedule_id);

CREATE INDEX idx_time_entries_employee ON public.time_entries(employee_id);
CREATE INDEX idx_time_entries_shift ON public.time_entries(shift_id);
CREATE INDEX idx_time_entries_date ON public.time_entries(entry_date);
CREATE INDEX idx_time_entries_status ON public.time_entries(status);

CREATE INDEX idx_attendance_employee ON public.attendance_records(employee_id);
CREATE INDEX idx_attendance_date ON public.attendance_records(attendance_date);
CREATE INDEX idx_attendance_status ON public.attendance_records(status);

CREATE INDEX idx_schedule_conflicts_employee ON public.schedule_conflicts(employee_id);
CREATE INDEX idx_schedule_conflicts_date ON public.schedule_conflicts(conflict_date);
CREATE INDEX idx_schedule_conflicts_status ON public.schedule_conflicts(status);

-- Add triggers for updated_at
CREATE TRIGGER update_work_schedules_updated_at
  BEFORE UPDATE ON public.work_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_schedule_templates_updated_at
  BEFORE UPDATE ON public.schedule_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_work_shifts_updated_at
  BEFORE UPDATE ON public.work_shifts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_schedule_conflicts_updated_at
  BEFORE UPDATE ON public.schedule_conflicts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_shift_change_requests_updated_at
  BEFORE UPDATE ON public.shift_change_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_staffing();

-- Enable RLS
ALTER TABLE public.work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_change_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Work Schedules
CREATE POLICY "Admins can manage all work schedules"
  ON public.work_schedules FOR ALL
  TO authenticated
  USING (has_staffing_role(auth.uid(), 'admin'::staffing_role))
  WITH CHECK (has_staffing_role(auth.uid(), 'admin'::staffing_role));

CREATE POLICY "Recruiters can manage work schedules in their territory"
  ON public.work_schedules FOR ALL
  TO authenticated
  USING (
    has_staffing_role(auth.uid(), 'recruiter'::staffing_role) OR
    has_staffing_role(auth.uid(), 'admin'::staffing_role)
  )
  WITH CHECK (
    has_staffing_role(auth.uid(), 'recruiter'::staffing_role) OR
    has_staffing_role(auth.uid(), 'admin'::staffing_role)
  );

-- RLS Policies for Work Shifts
CREATE POLICY "Admins and recruiters can manage work shifts"
  ON public.work_shifts FOR ALL
  TO authenticated
  USING (
    has_staffing_role(auth.uid(), 'admin'::staffing_role) OR
    has_staffing_role(auth.uid(), 'recruiter'::staffing_role)
  )
  WITH CHECK (
    has_staffing_role(auth.uid(), 'admin'::staffing_role) OR
    has_staffing_role(auth.uid(), 'recruiter'::staffing_role)
  );

-- RLS Policies for Time Entries
CREATE POLICY "Admins and recruiters can manage time entries"
  ON public.time_entries FOR ALL
  TO authenticated
  USING (
    has_staffing_role(auth.uid(), 'admin'::staffing_role) OR
    has_staffing_role(auth.uid(), 'recruiter'::staffing_role)
  )
  WITH CHECK (
    has_staffing_role(auth.uid(), 'admin'::staffing_role) OR
    has_staffing_role(auth.uid(), 'recruiter'::staffing_role)
  );

-- RLS Policies for Attendance Records
CREATE POLICY "Admins and recruiters can manage attendance records"
  ON public.attendance_records FOR ALL
  TO authenticated
  USING (
    has_staffing_role(auth.uid(), 'admin'::staffing_role) OR
    has_staffing_role(auth.uid(), 'recruiter'::staffing_role)
  )
  WITH CHECK (
    has_staffing_role(auth.uid(), 'admin'::staffing_role) OR
    has_staffing_role(auth.uid(), 'recruiter'::staffing_role)
  );

-- Apply similar RLS policies to other tables
CREATE POLICY "Admins can manage schedule templates"
  ON public.schedule_templates FOR ALL
  TO authenticated
  USING (has_staffing_role(auth.uid(), 'admin'::staffing_role))
  WITH CHECK (has_staffing_role(auth.uid(), 'admin'::staffing_role));

CREATE POLICY "Admins and recruiters can view schedule conflicts"
  ON public.schedule_conflicts FOR ALL
  TO authenticated
  USING (
    has_staffing_role(auth.uid(), 'admin'::staffing_role) OR
    has_staffing_role(auth.uid(), 'recruiter'::staffing_role)
  )
  WITH CHECK (
    has_staffing_role(auth.uid(), 'admin'::staffing_role) OR
    has_staffing_role(auth.uid(), 'recruiter'::staffing_role)
  );

CREATE POLICY "Admins and recruiters can manage shift change requests"
  ON public.shift_change_requests FOR ALL
  TO authenticated
  USING (
    has_staffing_role(auth.uid(), 'admin'::staffing_role) OR
    has_staffing_role(auth.uid(), 'recruiter'::staffing_role)
  )
  WITH CHECK (
    has_staffing_role(auth.uid(), 'admin'::staffing_role) OR
    has_staffing_role(auth.uid(), 'recruiter'::staffing_role)
  );