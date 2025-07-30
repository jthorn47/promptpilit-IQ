-- Create terms acknowledgments table
CREATE TABLE public.terms_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version TEXT NOT NULL DEFAULT 'v1.0',
  privacy_version TEXT NOT NULL DEFAULT 'v1.0',
  acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.terms_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own acknowledgments"
ON public.terms_acknowledgments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own acknowledgments"
ON public.terms_acknowledgments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all acknowledgments"
ON public.terms_acknowledgments
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage all acknowledgments"
ON public.terms_acknowledgments
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create index for performance
CREATE INDEX idx_terms_acknowledgments_user_id ON public.terms_acknowledgments(user_id);
CREATE INDEX idx_terms_acknowledgments_versions ON public.terms_acknowledgments(terms_version, privacy_version);

-- Create trigger for updated_at
CREATE TRIGGER update_terms_acknowledgments_updated_at
BEFORE UPDATE ON public.terms_acknowledgments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if user has acknowledged current terms
CREATE OR REPLACE FUNCTION public.has_acknowledged_current_terms(
  _user_id UUID,
  _terms_version TEXT DEFAULT 'v1.0',
  _privacy_version TEXT DEFAULT 'v1.0'
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.terms_acknowledgments
    WHERE user_id = _user_id
      AND terms_version = _terms_version
      AND privacy_version = _privacy_version
  )
$$;