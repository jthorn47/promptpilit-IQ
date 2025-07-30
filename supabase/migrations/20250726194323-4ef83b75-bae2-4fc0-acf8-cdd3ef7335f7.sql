-- Create time tracking kiosk tables

-- Table for storing time punches with biometric data
CREATE TABLE IF NOT EXISTS public.time_punches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  punch_type TEXT NOT NULL CHECK (punch_type IN ('clock_in', 'clock_out', 'break_start', 'break_end', 'meal_start', 'meal_end')),
  punch_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location_name TEXT,
  device_id TEXT,
  ip_address INET,
  photo_url TEXT,
  biometric_verified BOOLEAN DEFAULT false,
  pin_verified BOOLEAN DEFAULT false,
  override_reason TEXT,
  override_by UUID,
  notes TEXT,
  is_offline_punch BOOLEAN DEFAULT false,
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for kiosk device settings
CREATE TABLE IF NOT EXISTS public.kiosk_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  location_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  biometric_enabled BOOLEAN NOT NULL DEFAULT true,
  photo_verification_enabled BOOLEAN NOT NULL DEFAULT true,
  geofencing_enabled BOOLEAN NOT NULL DEFAULT false,
  allowed_lat DECIMAL(10, 8),
  allowed_lng DECIMAL(11, 8),
  geofence_radius_meters INTEGER DEFAULT 100,
  grace_period_minutes INTEGER DEFAULT 15,
  require_break_tracking BOOLEAN DEFAULT false,
  auto_break_duration_minutes INTEGER DEFAULT 30,
  company_logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_company_device UNIQUE (company_id, device_id)
);

-- Table for employee biometric reference data
CREATE TABLE IF NOT EXISTS public.employee_biometric_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  reference_photo_url TEXT,
  biometric_template TEXT, -- Encrypted biometric template (not raw data)
  face_encoding TEXT, -- Face recognition encoding
  pin_hash TEXT, -- Hashed PIN for backup authentication
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_employee_biometric UNIQUE (employee_id, company_id)
);

-- Table for tracking punch verification results
CREATE TABLE IF NOT EXISTS public.punch_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  punch_id UUID NOT NULL REFERENCES public.time_punches(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('face_id', 'photo_match', 'pin', 'manual_override')),
  verification_result TEXT NOT NULL CHECK (verification_result IN ('verified', 'failed', 'pending')),
  confidence_score DECIMAL(5, 4), -- 0.0000 to 1.0000
  verification_data JSONB, -- Additional verification metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_punches_employee_company ON public.time_punches(employee_id, company_id);
CREATE INDEX IF NOT EXISTS idx_time_punches_punch_time ON public.time_punches(punch_time);
CREATE INDEX IF NOT EXISTS idx_time_punches_device ON public.time_punches(device_id);
CREATE INDEX IF NOT EXISTS idx_kiosk_settings_company ON public.kiosk_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_biometric_company ON public.employee_biometric_data(company_id);

-- Enable RLS
ALTER TABLE public.time_punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosk_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_biometric_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_punches
CREATE POLICY "Company admins can manage time punches" ON public.time_punches
  FOR ALL USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Employees can view their own punches" ON public.time_punches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = time_punches.employee_id 
      AND e.user_id = auth.uid()
    ) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for kiosk_settings
CREATE POLICY "Company admins can manage kiosk settings" ON public.kiosk_settings
  FOR ALL USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for employee_biometric_data
CREATE POLICY "Company admins can manage biometric data" ON public.employee_biometric_data
  FOR ALL USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Employees can view their own biometric data" ON public.employee_biometric_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = employee_biometric_data.employee_id 
      AND e.user_id = auth.uid()
    ) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for punch_verifications
CREATE POLICY "Company admins can view punch verifications" ON public.punch_verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.time_punches tp 
      WHERE tp.id = punch_verifications.punch_id 
      AND (
        has_company_role(auth.uid(), 'company_admin'::app_role, tp.company_id) OR 
        has_role(auth.uid(), 'super_admin'::app_role)
      )
    )
  );

-- Create storage bucket for biometric photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'biometric-photos', 
  'biometric-photos', 
  false, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for biometric photos
CREATE POLICY "Company admins can manage biometric photos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'biometric-photos' AND
    (has_role(auth.uid(), 'super_admin'::app_role) OR 
     has_role(auth.uid(), 'company_admin'::app_role))
  );

CREATE POLICY "System can insert biometric photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'biometric-photos'
  );

-- Create triggers for updated_at
CREATE TRIGGER update_time_punches_updated_at
  BEFORE UPDATE ON public.time_punches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kiosk_settings_updated_at
  BEFORE UPDATE ON public.kiosk_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_biometric_data_updated_at
  BEFORE UPDATE ON public.employee_biometric_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();