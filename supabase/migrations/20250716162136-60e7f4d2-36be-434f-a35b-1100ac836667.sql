-- Create state tax settings table for SUTA/FUTA wage caps by state
CREATE TABLE public.state_tax_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_code VARCHAR(2) NOT NULL UNIQUE,
  state_name VARCHAR(100) NOT NULL,
  suta_wage_base NUMERIC(12,2) NOT NULL DEFAULT 7000.00,
  futa_wage_base NUMERIC(12,2) NOT NULL DEFAULT 7000.00,
  suta_rate_min NUMERIC(5,2) DEFAULT 0.1,
  suta_rate_max NUMERIC(5,2) DEFAULT 10.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.state_tax_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "State tax settings are viewable by everyone" 
ON public.state_tax_settings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Super admins can manage state tax settings" 
ON public.state_tax_settings 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_state_tax_settings_updated_at
    BEFORE UPDATE ON public.state_tax_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert common states with default wage bases
INSERT INTO public.state_tax_settings (state_code, state_name, suta_wage_base, futa_wage_base) VALUES 
('AL', 'Alabama', 8000.00, 7000.00),
('AK', 'Alaska', 47700.00, 7000.00),
('AZ', 'Arizona', 8000.00, 7000.00),
('AR', 'Arkansas', 12000.00, 7000.00),
('CA', 'California', 7000.00, 7000.00),
('CO', 'Colorado', 17000.00, 7000.00),
('CT', 'Connecticut', 15000.00, 7000.00),
('DE', 'Delaware', 18500.00, 7000.00),
('FL', 'Florida', 7000.00, 7000.00),
('GA', 'Georgia', 9500.00, 7000.00),
('HI', 'Hawaii', 58100.00, 7000.00),
('ID', 'Idaho', 48600.00, 7000.00),
('IL', 'Illinois', 13590.00, 7000.00),
('IN', 'Indiana', 9500.00, 7000.00),
('IA', 'Iowa', 36300.00, 7000.00),
('KS', 'Kansas', 14000.00, 7000.00),
('KY', 'Kentucky', 11100.00, 7000.00),
('LA', 'Louisiana', 7700.00, 7000.00),
('ME', 'Maine', 12000.00, 7000.00),
('MD', 'Maryland', 8500.00, 7000.00),
('MA', 'Massachusetts', 15000.00, 7000.00),
('MI', 'Michigan', 9500.00, 7000.00),
('MN', 'Minnesota', 40000.00, 7000.00),
('MS', 'Mississippi', 14000.00, 7000.00),
('MO', 'Missouri', 13500.00, 7000.00),
('MT', 'Montana', 37800.00, 7000.00),
('NE', 'Nebraska', 10500.00, 7000.00),
('NV', 'Nevada', 33400.00, 7000.00),
('NH', 'New Hampshire', 14000.00, 7000.00),
('NJ', 'New Jersey', 39800.00, 7000.00),
('NM', 'New Mexico', 27300.00, 7000.00),
('NY', 'New York', 12000.00, 7000.00),
('NC', 'North Carolina', 27700.00, 7000.00),
('ND', 'North Dakota', 39200.00, 7000.00),
('OH', 'Ohio', 9000.00, 7000.00),
('OK', 'Oklahoma', 24000.00, 7000.00),
('OR', 'Oregon', 50400.00, 7000.00),
('PA', 'Pennsylvania', 12000.00, 7000.00),
('RI', 'Rhode Island', 25900.00, 7000.00),
('SC', 'South Carolina', 14000.00, 7000.00),
('SD', 'South Dakota', 15000.00, 7000.00),
('TN', 'Tennessee', 7000.00, 7000.00),
('TX', 'Texas', 9000.00, 7000.00),
('UT', 'Utah', 43800.00, 7000.00),
('VT', 'Vermont', 13500.00, 7000.00),
('VA', 'Virginia', 8000.00, 7000.00),
('WA', 'Washington', 67600.00, 7000.00),
('WV', 'West Virginia', 9000.00, 7000.00),
('WI', 'Wisconsin', 14000.00, 7000.00),
('WY', 'Wyoming', 28200.00, 7000.00);