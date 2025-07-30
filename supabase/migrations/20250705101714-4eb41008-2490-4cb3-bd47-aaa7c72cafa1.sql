-- Create Worker's Comp codes table
CREATE TABLE public.worker_comp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  base_rate DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
  category TEXT,
  hazard_level TEXT DEFAULT 'Medium',
  effective_year INTEGER NOT NULL DEFAULT 2024,
  state_code TEXT DEFAULT 'ALL',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_worker_comp_codes_code ON public.worker_comp_codes(code);
CREATE INDEX idx_worker_comp_codes_category ON public.worker_comp_codes(category);
CREATE INDEX idx_worker_comp_codes_effective_year ON public.worker_comp_codes(effective_year);

-- Enable RLS
ALTER TABLE public.worker_comp_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Worker comp codes are viewable by everyone" 
ON public.worker_comp_codes 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage worker comp codes" 
ON public.worker_comp_codes 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_worker_comp_codes_updated_at
BEFORE UPDATE ON public.worker_comp_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some common worker comp codes as examples
INSERT INTO public.worker_comp_codes (code, description, base_rate, category, hazard_level) VALUES
('8810', 'Clerical Office Employees', 0.35, 'Office', 'Low'),
('8820', 'Attorney - All Employees', 0.54, 'Professional', 'Low'),
('8832', 'Accountant - All Employees', 0.27, 'Professional', 'Low'),
('8833', 'Insurance Agency - All Employees', 0.89, 'Professional', 'Low'),
('9015', 'Building Operation - Office Building', 2.38, 'Building Operations', 'Medium'),
('9101', 'Building Operation - Mercantile Building', 3.15, 'Building Operations', 'Medium'),
('5102', 'Carpentry - Residential', 12.81, 'Construction', 'High'),
('5190', 'Carpentry - Commercial', 15.23, 'Construction', 'High'),
('5213', 'Concrete Construction', 8.92, 'Construction', 'High'),
('5474', 'Painting - Interior', 6.78, 'Construction', 'Medium'),
('7219', 'Truckmen - Local', 4.35, 'Transportation', 'Medium'),
('7380', 'Drivers - Truck', 7.26, 'Transportation', 'Medium');