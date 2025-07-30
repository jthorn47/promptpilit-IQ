-- Add brand_identity column to email_templates table
ALTER TABLE email_templates 
ADD COLUMN brand_identity TEXT CHECK (brand_identity IN ('easeworks', 'easelearn', 'dual')) DEFAULT NULL;

-- Create index for efficient brand filtering
CREATE INDEX idx_email_templates_brand_identity ON email_templates(brand_identity);

-- Add brand_identity to system_email_templates table as well
ALTER TABLE system_email_templates 
ADD COLUMN brand_identity TEXT CHECK (brand_identity IN ('easeworks', 'easelearn', 'dual')) DEFAULT NULL;

-- Create index for efficient brand filtering on system templates
CREATE INDEX idx_system_email_templates_brand_identity ON system_email_templates(brand_identity);

-- Create function to get brand email domain (for use in edge functions)
CREATE OR REPLACE FUNCTION public.get_brand_email_domain(p_brand_identity TEXT, p_context TEXT DEFAULT 'default')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  CASE p_brand_identity
    WHEN 'easeworks' THEN
      RETURN 'easeworks.com';
    WHEN 'easelearn' THEN
      RETURN 'easelearn.com';
    WHEN 'dual' THEN
      -- For dual brand, use context to determine domain
      IF p_context IN ('training', 'lms', 'learning') THEN
        RETURN 'easelearn.com';
      ELSE
        RETURN 'easeworks.com';
      END IF;
    ELSE
      RETURN 'easeworks.com';  -- Default fallback
  END CASE;
END;
$$;