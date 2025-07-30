-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_id UUID REFERENCES public.company_settings(id),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'client_admin', 'onboarding_manager', 'learner');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  company_id UUID REFERENCES public.company_settings(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, company_id)
);

-- Enable RLS on user roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check company-specific roles
CREATE OR REPLACE FUNCTION public.has_company_role(_user_id UUID, _role app_role, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (company_id = _company_id OR role = 'super_admin')
  )
$$;

-- Create function to get user's company ID
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT company_id
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role IN ('company_admin', 'learner')
  LIMIT 1
$$;

-- Create trigger function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_count INTEGER;
    new_company_id UUID;
    company_name_from_meta TEXT;
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (user_id, email)
    VALUES (new.id, new.email);
    
    -- Check if this is the first user
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    -- If first user, make them super admin
    IF user_count <= 1 THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (new.id, 'super_admin');
    ELSE
        -- For other users, check if company name was provided in metadata
        company_name_from_meta := new.raw_user_meta_data ->> 'company_name';
        
        IF company_name_from_meta IS NOT NULL AND company_name_from_meta != '' THEN
            -- Create company with the provided name
            INSERT INTO public.company_settings (company_name)
            VALUES (company_name_from_meta)
            RETURNING id INTO new_company_id;
            
            -- Update profile with company
            UPDATE public.profiles 
            SET company_id = new_company_id 
            WHERE user_id = new.id;
            
            -- Assign client_admin role
            INSERT INTO public.user_roles (user_id, role, company_id)
            VALUES (new.id, 'client_admin', new_company_id);
        ELSE
            -- Default to learner role for users without company
            INSERT INTO public.user_roles (user_id, role)
            VALUES (new.id, 'learner');
        END IF;
    END IF;
    
    RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Onboarding managers can view profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'onboarding_manager'));

-- RLS Policies for user roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can view company roles" ON public.user_roles
  FOR SELECT USING (
    has_company_role(auth.uid(), 'client_admin', company_id) OR 
    has_role(auth.uid(), 'onboarding_manager')
  );

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();