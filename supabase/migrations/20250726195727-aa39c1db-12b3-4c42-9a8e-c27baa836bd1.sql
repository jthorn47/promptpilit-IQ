-- Add time tracking fields to existing payroll_employees table
ALTER TABLE public.payroll_employees 
ADD COLUMN time_tracking_enabled boolean DEFAULT false,
ADD COLUMN time_tracking_pin_hash text,
ADD COLUMN photo_reference_url text,
ADD COLUMN badge_qr_code text,
ADD COLUMN default_location_id uuid,
ADD COLUMN last_clock_in_device_id text,
ADD COLUMN time_tracking_timezone text;

-- Create index for fast PIN lookups
CREATE INDEX idx_payroll_employees_pin_hash ON public.payroll_employees(time_tracking_pin_hash) WHERE time_tracking_pin_hash IS NOT NULL;

-- Create index for QR code lookups
CREATE INDEX idx_payroll_employees_qr_code ON public.payroll_employees(badge_qr_code) WHERE badge_qr_code IS NOT NULL;

-- Update time_punches table to reference payroll_employees instead of separate employee table
ALTER TABLE public.time_punches 
DROP CONSTRAINT IF EXISTS time_punches_employee_id_fkey,
ADD CONSTRAINT time_punches_employee_id_fkey 
FOREIGN KEY (employee_id) REFERENCES public.payroll_employees(id) ON DELETE CASCADE;

-- Create trigger to auto-disable time tracking when employee is terminated
CREATE OR REPLACE FUNCTION public.handle_employee_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If employee is terminated, disable time tracking
  IF NEW.employment_status = 'terminated' AND OLD.employment_status != 'terminated' THEN
    NEW.time_tracking_enabled = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER employee_status_change_trigger
  BEFORE UPDATE ON public.payroll_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_employee_status_change();

-- Function to generate secure QR code for badge
CREATE OR REPLACE FUNCTION public.generate_employee_qr_code()
RETURNS text AS $$
BEGIN
  RETURN 'EMP-' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;