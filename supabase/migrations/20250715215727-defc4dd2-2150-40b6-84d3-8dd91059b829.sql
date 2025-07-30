-- Create a safer duplicate detection function that doesn't rely on complex similarity scoring
CREATE OR REPLACE FUNCTION public.find_potential_duplicate_companies(
  p_company_name TEXT,
  p_ein TEXT DEFAULT NULL,
  p_domain TEXT DEFAULT NULL,
  p_similarity_threshold FLOAT DEFAULT 0.85
) RETURNS TABLE (
  company_id UUID,
  company_name TEXT,
  website TEXT,
  match_type TEXT,
  similarity_score FLOAT,
  confidence TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  normalized_input TEXT;
  domain_input TEXT;
BEGIN
  -- Safely normalize the input
  normalized_input := COALESCE(normalize_company_name(p_company_name), '');
  
  -- Extract domain from website if provided
  IF p_domain IS NOT NULL AND LENGTH(trim(p_domain)) > 0 THEN
    domain_input := regexp_replace(trim(p_domain), '^https?://(www\.)?', '', 'i');
    domain_input := regexp_replace(domain_input, '/.*$', '');
    domain_input := lower(trim(domain_input));
  END IF;
  
  RETURN QUERY
  SELECT 
    cs.id as company_id,
    cs.company_name,
    cs.website,
    CASE 
      WHEN cs.website IS NOT NULL AND domain_input IS NOT NULL THEN
        CASE 
          WHEN lower(regexp_replace(COALESCE(cs.website, ''), '^https?://(www\.)?', '', 'i')) = domain_input THEN 'website_exact'
          ELSE 'name_similar'
        END
      ELSE 'name_similar'
    END as match_type,
    CASE 
      WHEN cs.website IS NOT NULL AND domain_input IS NOT NULL AND
           lower(regexp_replace(COALESCE(cs.website, ''), '^https?://(www\.)?', '', 'i')) = domain_input THEN 1.0::FLOAT
      WHEN lower(COALESCE(normalize_company_name(cs.company_name), '')) = lower(normalized_input) THEN 1.0::FLOAT
      WHEN COALESCE(normalize_company_name(cs.company_name), '') ILIKE '%' || normalized_input || '%' THEN 0.9::FLOAT
      WHEN normalized_input ILIKE '%' || COALESCE(normalize_company_name(cs.company_name), '') || '%' THEN 0.9::FLOAT
      ELSE 0.7::FLOAT
    END as similarity_score,
    CASE 
      WHEN cs.website IS NOT NULL AND domain_input IS NOT NULL AND 
           lower(regexp_replace(COALESCE(cs.website, ''), '^https?://(www\.)?', '', 'i')) = domain_input THEN 'high'
      WHEN lower(COALESCE(normalize_company_name(cs.company_name), '')) = lower(normalized_input) THEN 'high'
      WHEN COALESCE(normalize_company_name(cs.company_name), '') ILIKE '%' || normalized_input || '%' THEN 'medium'
      WHEN normalized_input ILIKE '%' || COALESCE(normalize_company_name(cs.company_name), '') || '%' THEN 'medium'
      ELSE 'low'
    END as confidence
  FROM public.company_settings cs
  WHERE 
    cs.company_name IS NOT NULL AND
    LENGTH(trim(cs.company_name)) > 0 AND
    (
      -- Website exact match
      (cs.website IS NOT NULL AND domain_input IS NOT NULL AND 
       lower(regexp_replace(COALESCE(cs.website, ''), '^https?://(www\.)?', '', 'i')) = domain_input) OR
      -- Exact name match
      lower(COALESCE(normalize_company_name(cs.company_name), '')) = lower(normalized_input) OR
      -- Partial name matches
      COALESCE(normalize_company_name(cs.company_name), '') ILIKE '%' || normalized_input || '%' OR
      normalized_input ILIKE '%' || COALESCE(normalize_company_name(cs.company_name), '') || '%'
    )
  ORDER BY 
    CASE 
      WHEN cs.website IS NOT NULL AND domain_input IS NOT NULL AND
           lower(regexp_replace(COALESCE(cs.website, ''), '^https?://(www\.)?', '', 'i')) = domain_input THEN 4
      WHEN lower(COALESCE(normalize_company_name(cs.company_name), '')) = lower(normalized_input) THEN 3
      WHEN COALESCE(normalize_company_name(cs.company_name), '') ILIKE '%' || normalized_input || '%' THEN 2
      WHEN normalized_input ILIKE '%' || COALESCE(normalize_company_name(cs.company_name), '') || '%' THEN 1
      ELSE 0
    END DESC
  LIMIT 10;
END;
$$;