-- Fix array subscript out of range errors in find_potential_duplicate_companies function
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
          WHEN similarity_score(
            lower(regexp_replace(COALESCE(cs.website, ''), '^https?://(www\.)?', '', 'i')),
            domain_input
          ) >= 0.9 THEN 'website_similar'
          ELSE 'name_similar'
        END
      ELSE 'name_similar'
    END as match_type,
    CASE 
      WHEN cs.website IS NOT NULL AND domain_input IS NOT NULL THEN
        CASE 
          WHEN lower(regexp_replace(COALESCE(cs.website, ''), '^https?://(www\.)?', '', 'i')) = domain_input THEN 1.0::FLOAT
          ELSE GREATEST(
            similarity_score(
              lower(regexp_replace(COALESCE(cs.website, ''), '^https?://(www\.)?', '', 'i')),
              domain_input
            ),
            similarity_score(COALESCE(normalize_company_name(cs.company_name), ''), normalized_input)
          )::FLOAT
        END
      ELSE similarity_score(COALESCE(normalize_company_name(cs.company_name), ''), normalized_input)::FLOAT
    END as similarity_score,
    CASE 
      WHEN cs.website IS NOT NULL AND domain_input IS NOT NULL AND 
           lower(regexp_replace(COALESCE(cs.website, ''), '^https?://(www\.)?', '', 'i')) = domain_input THEN 'high'
      WHEN cs.website IS NOT NULL AND domain_input IS NOT NULL AND 
           similarity_score(
             lower(regexp_replace(COALESCE(cs.website, ''), '^https?://(www\.)?', '', 'i')),
             domain_input
           ) >= 0.9 THEN 'high'
      WHEN similarity_score(COALESCE(normalize_company_name(cs.company_name), ''), normalized_input) >= 0.9 THEN 'high'
      WHEN similarity_score(COALESCE(normalize_company_name(cs.company_name), ''), normalized_input) >= 0.8 THEN 'medium'
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
      -- Website similarity
      (cs.website IS NOT NULL AND domain_input IS NOT NULL AND 
       similarity_score(
         lower(regexp_replace(COALESCE(cs.website, ''), '^https?://(www\.)?', '', 'i')),
         domain_input
       ) >= 0.9) OR
      -- Name similarity
      (similarity_score(COALESCE(normalize_company_name(cs.company_name), ''), normalized_input) >= p_similarity_threshold)
    )
  ORDER BY 
    CASE 
      WHEN cs.website IS NOT NULL AND domain_input IS NOT NULL THEN
        GREATEST(
          similarity_score(
            lower(regexp_replace(COALESCE(cs.website, ''), '^https?://(www\.)?', '', 'i')),
            domain_input
          ),
          similarity_score(COALESCE(normalize_company_name(cs.company_name), ''), normalized_input)
        )
      ELSE similarity_score(COALESCE(normalize_company_name(cs.company_name), ''), normalized_input)
    END DESC
  LIMIT 10;
END;
$$;