-- Create enum for staffing user roles
CREATE TYPE staffing_role AS ENUM ('pop', 'recruiter', 'admin');

-- Create territories table
CREATE TABLE public.territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  cities TEXT[] DEFAULT '{}',
  zip_codes TEXT[] DEFAULT '{}',
  is_locked BOOLEAN DEFAULT false,
  locked_by UUID REFERENCES auth.users(id),
  locked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create staffing user roles table
CREATE TABLE public.staffing_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role staffing_role NOT NULL,
  territory_id UUID REFERENCES public.territories(id),
  commission_rate DECIMAL(5,2) DEFAULT 70.00, -- Default 70% for POPs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create POP hierarchy table for downline tracking
CREATE TABLE public.pop_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_pop_id UUID NOT NULL REFERENCES auth.users(id),
  junior_pop_id UUID NOT NULL REFERENCES auth.users(id),
  hierarchy_level INTEGER NOT NULL DEFAULT 1, -- 1, 2, or 3 levels deep
  commission_rate DECIMAL(5,2) NOT NULL, -- 5%, 2%, or 1%
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(senior_pop_id, junior_pop_id)
);

-- Enable RLS
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffing_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pop_hierarchy ENABLE ROW LEVEL SECURITY;

-- RLS Policies for territories
CREATE POLICY "Everyone can view territories" ON public.territories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage territories" ON public.territories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.staffing_user_roles sur 
      WHERE sur.user_id = auth.uid() AND sur.role = 'admin'
    )
  );

-- RLS Policies for staffing_user_roles
CREATE POLICY "Users can view their own roles" ON public.staffing_user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.staffing_user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.staffing_user_roles sur 
      WHERE sur.user_id = auth.uid() AND sur.role = 'admin'
    )
  );

CREATE POLICY "Users can view roles in their territory" ON public.staffing_user_roles
  FOR SELECT USING (
    territory_id IN (
      SELECT territory_id FROM public.staffing_user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for pop_hierarchy
CREATE POLICY "POPs can view their hierarchy" ON public.pop_hierarchy
  FOR SELECT USING (
    senior_pop_id = auth.uid() OR junior_pop_id = auth.uid()
  );

CREATE POLICY "Admins can manage hierarchy" ON public.pop_hierarchy
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.staffing_user_roles sur 
      WHERE sur.user_id = auth.uid() AND sur.role = 'admin'
    )
  );

-- Create functions for role checking
CREATE OR REPLACE FUNCTION public.has_staffing_role(_user_id uuid, _role staffing_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staffing_user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Create function to get user's territory
CREATE OR REPLACE FUNCTION public.get_user_territory(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT territory_id
  FROM public.staffing_user_roles
  WHERE user_id = _user_id
    AND is_active = true
  LIMIT 1
$$;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_staffing()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_territories_updated_at
  BEFORE UPDATE ON public.territories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_staffing_user_roles_updated_at
  BEFORE UPDATE ON public.staffing_user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_staffing();

-- Insert some default territories
INSERT INTO public.territories (name, state, cities) VALUES
  ('Los Angeles Metro', 'CA', ARRAY['Los Angeles', 'Beverly Hills', 'Santa Monica', 'Burbank']),
  ('San Francisco Bay Area', 'CA', ARRAY['San Francisco', 'Oakland', 'San Jose', 'Palo Alto']),
  ('Orange County', 'CA', ARRAY['Anaheim', 'Irvine', 'Newport Beach', 'Huntington Beach']),
  ('San Diego County', 'CA', ARRAY['San Diego', 'Carlsbad', 'Oceanside', 'Chula Vista']),
  ('Dallas-Fort Worth', 'TX', ARRAY['Dallas', 'Fort Worth', 'Plano', 'Irving']),
  ('Houston Metro', 'TX', ARRAY['Houston', 'Sugar Land', 'The Woodlands', 'Pearland']),
  ('Miami-Dade', 'FL', ARRAY['Miami', 'Miami Beach', 'Coral Gables', 'Aventura']),
  ('New York Metro', 'NY', ARRAY['New York', 'Brooklyn', 'Queens', 'Bronx']);