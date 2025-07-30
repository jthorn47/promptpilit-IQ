-- Create clients table for storing signup information
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  email text NOT NULL,
  company_name text,
  user_type text,
  status text DEFAULT 'prospect',
  lead_source text DEFAULT 'website_signup',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Easeworks staff can view all clients" 
ON public.clients 
FOR SELECT 
USING (is_easeworks_user(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Easeworks staff can manage clients" 
ON public.clients 
FOR ALL 
USING (is_easeworks_user(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_client_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into clients table when a new user signs up
  INSERT INTO public.clients (
    user_id,
    first_name,
    last_name,
    email,
    user_type,
    status,
    lead_source
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'user_type',
    'prospect',
    'website_signup'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically add signups to clients table
CREATE OR REPLACE TRIGGER on_auth_user_created_add_to_clients
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_client_signup();

-- Create updated_at trigger
CREATE OR REPLACE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();