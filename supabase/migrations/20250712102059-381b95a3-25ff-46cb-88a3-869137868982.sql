-- Extend clients table with complete business profile
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_address_street text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_address_city text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_address_state text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_address_zip text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_address_country text DEFAULT 'US';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS primary_contact_phone text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS plan_type text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS transaction_id text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS payment_status text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS profile_locked boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS activated_at timestamp with time zone;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS plan_started_at timestamp with time zone;

-- Create company_profiles table for detailed business information
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_address jsonb NOT NULL DEFAULT '{}',
  contact_information jsonb NOT NULL DEFAULT '{}',
  business_details jsonb DEFAULT '{}',
  compliance_info jsonb DEFAULT '{}',
  is_locked boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(client_id),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for company profiles
CREATE POLICY "Users can view their own company profile" 
ON public.company_profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own unlocked company profile" 
ON public.company_profiles 
FOR ALL 
USING (user_id = auth.uid() AND is_locked = false);

CREATE POLICY "Easeworks staff can view all company profiles" 
ON public.company_profiles 
FOR SELECT 
USING (is_easeworks_user(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Easeworks staff can manage all company profiles" 
ON public.company_profiles 
FOR ALL 
USING (is_easeworks_user(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create purchase_history table
CREATE TABLE IF NOT EXISTS public.purchase_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL,
  amount_paid numeric NOT NULL,
  currency text DEFAULT 'USD',
  stripe_session_id text,
  stripe_subscription_id text,
  payment_status text DEFAULT 'pending',
  plan_started_at timestamp with time zone,
  plan_expires_at timestamp with time zone,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;

-- Create policies for purchase history
CREATE POLICY "Users can view their own purchase history" 
ON public.purchase_history 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Easeworks staff can view all purchase history" 
ON public.purchase_history 
FOR SELECT 
USING (is_easeworks_user(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert purchase history" 
ON public.purchase_history 
FOR INSERT 
WITH CHECK (true);

-- Update trigger for company_profiles
CREATE OR REPLACE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();