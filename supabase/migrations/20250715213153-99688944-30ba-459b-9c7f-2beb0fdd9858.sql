-- Create company creation audit table
CREATE TABLE IF NOT EXISTS public.company_creation_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  normalized_name TEXT,
  potential_duplicates JSONB DEFAULT '[]',
  duplicate_override BOOLEAN DEFAULT false,
  flagged_for_review BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

-- Create company normalization function
CREATE OR REPLACE FUNCTION public.normalize_company_name(company_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  normalized TEXT;
BEGIN
  -- Convert to lowercase and trim
  normalized := lower(trim(company_name));
  
  -- Remove common suffixes
  normalized := regexp_replace(normalized, '\s+(inc\.?|incorporated|llc|ltd\.?|limited|corp\.?|corporation|co\.?|company|enterprises?|group|holdings?|solutions?|services?|systems?|technologies?|tech)$', '', 'g');
  
  -- Remove extra whitespace
  normalized := regexp_replace(normalized, '\s+', ' ', 'g');
  
  -- Remove special characters except spaces and hyphens
  normalized := regexp_replace(normalized, '[^a-z0-9\s\-]', '', 'g');
  
  RETURN trim(normalized);
END;
$$;

-- Create fuzzy matching function using Levenshtein distance
CREATE OR REPLACE FUNCTION public.levenshtein_distance(s1 TEXT, s2 TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  s1_len INTEGER := length(s1);
  s2_len INTEGER := length(s2);
  matrix INTEGER[][];
  i INTEGER;
  j INTEGER;
  cost INTEGER;
BEGIN
  -- Handle empty strings
  IF s1_len = 0 THEN RETURN s2_len; END IF;
  IF s2_len = 0 THEN RETURN s1_len; END IF;
  
  -- Initialize matrix
  FOR i IN 0..s1_len LOOP
    matrix[i][0] := i;
  END LOOP;
  
  FOR j IN 0..s2_len LOOP
    matrix[0][j] := j;
  END LOOP;
  
  -- Fill matrix
  FOR i IN 1..s1_len LOOP
    FOR j IN 1..s2_len LOOP
      IF substring(s1, i, 1) = substring(s2, j, 1) THEN
        cost := 0;
      ELSE
        cost := 1;
      END IF;
      
      matrix[i][j] := LEAST(
        matrix[i-1][j] + 1,    -- deletion
        matrix[i][j-1] + 1,    -- insertion
        matrix[i-1][j-1] + cost -- substitution
      );
    END LOOP;
  END LOOP;
  
  RETURN matrix[s1_len][s2_len];
END;
$$;

-- Create similarity function (returns percentage)
CREATE OR REPLACE FUNCTION public.similarity_score(s1 TEXT, s2 TEXT)
RETURNS FLOAT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  max_len INTEGER;
  distance INTEGER;
BEGIN
  max_len := GREATEST(length(s1), length(s2));
  IF max_len = 0 THEN RETURN 1.0; END IF;
  
  distance := levenshtein_distance(s1, s2);
  RETURN 1.0 - (distance::FLOAT / max_len::FLOAT);
END;
$$;

-- Create function to find potential duplicate companies
CREATE OR REPLACE FUNCTION public.find_potential_duplicate_companies(
  p_company_name TEXT,
  p_ein TEXT DEFAULT NULL,
  p_domain TEXT DEFAULT NULL,
  p_similarity_threshold FLOAT DEFAULT 0.85
)
RETURNS TABLE(
  company_id UUID,
  company_name TEXT,
  ein TEXT,
  domain TEXT,
  match_type TEXT,
  similarity_score FLOAT,
  confidence TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  normalized_input TEXT;
BEGIN
  normalized_input := normalize_company_name(p_company_name);
  
  RETURN QUERY
  SELECT 
    cs.id,
    cs.company_name,
    cs.ein,
    cs.domain,
    CASE 
      WHEN cs.ein IS NOT NULL AND cs.ein = p_ein THEN 'ein_exact'
      WHEN cs.domain IS NOT NULL AND cs.domain = p_domain THEN 'domain_exact'
      WHEN cs.domain IS NOT NULL AND p_domain IS NOT NULL AND 
           similarity_score(cs.domain, p_domain) >= 0.9 THEN 'domain_similar'
      ELSE 'name_similar'
    END as match_type,
    CASE 
      WHEN cs.ein IS NOT NULL AND cs.ein = p_ein THEN 1.0
      WHEN cs.domain IS NOT NULL AND cs.domain = p_domain THEN 1.0
      WHEN cs.domain IS NOT NULL AND p_domain IS NOT NULL THEN 
           similarity_score(cs.domain, p_domain)
      ELSE similarity_score(normalize_company_name(cs.company_name), normalized_input)
    END as similarity_score,
    CASE 
      WHEN cs.ein IS NOT NULL AND cs.ein = p_ein THEN 'high'
      WHEN cs.domain IS NOT NULL AND cs.domain = p_domain THEN 'high'
      WHEN cs.domain IS NOT NULL AND p_domain IS NOT NULL AND 
           similarity_score(cs.domain, p_domain) >= 0.9 THEN 'high'
      WHEN similarity_score(normalize_company_name(cs.company_name), normalized_input) >= 0.9 THEN 'high'
      WHEN similarity_score(normalize_company_name(cs.company_name), normalized_input) >= 0.8 THEN 'medium'
      ELSE 'low'
    END as confidence
  FROM public.company_settings cs
  WHERE 
    -- EIN exact match
    (cs.ein IS NOT NULL AND cs.ein = p_ein) OR
    -- Domain exact match
    (cs.domain IS NOT NULL AND cs.domain = p_domain) OR
    -- Domain similarity
    (cs.domain IS NOT NULL AND p_domain IS NOT NULL AND 
     similarity_score(cs.domain, p_domain) >= 0.9) OR
    -- Name similarity
    (similarity_score(normalize_company_name(cs.company_name), normalized_input) >= p_similarity_threshold)
  ORDER BY similarity_score DESC, confidence DESC
  LIMIT 10;
END;
$$;

-- Create function to log company creation
CREATE OR REPLACE FUNCTION public.log_company_creation(
  p_company_id UUID,
  p_created_by UUID,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_normalized_name TEXT,
  p_potential_duplicates JSONB DEFAULT '[]',
  p_duplicate_override BOOLEAN DEFAULT false,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.company_creation_audit (
    company_id,
    created_by,
    ip_address,
    user_agent,
    normalized_name,
    potential_duplicates,
    duplicate_override,
    flagged_for_review,
    metadata
  ) VALUES (
    p_company_id,
    p_created_by,
    p_ip_address::INET,
    p_user_agent,
    p_normalized_name,
    p_potential_duplicates,
    p_duplicate_override,
    p_duplicate_override, -- Flag for review if overridden
    p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Add RLS policies for company creation audit
ALTER TABLE public.company_creation_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all audit logs"
ON public.company_creation_audit
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view their own audit logs"
ON public.company_creation_audit
FOR SELECT
USING (created_by = auth.uid());

CREATE POLICY "System can insert audit logs"
ON public.company_creation_audit
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_creation_audit_company_id ON public.company_creation_audit(company_id);
CREATE INDEX IF NOT EXISTS idx_company_creation_audit_created_by ON public.company_creation_audit(created_by);
CREATE INDEX IF NOT EXISTS idx_company_creation_audit_created_at ON public.company_creation_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_company_creation_audit_flagged ON public.company_creation_audit(flagged_for_review);

-- Create index for faster company name fuzzy matching
CREATE INDEX IF NOT EXISTS idx_company_settings_normalized_name ON public.company_settings USING gin(normalize_company_name(company_name) gin_trgm_ops);

-- Enable the pg_trgm extension for better text search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;