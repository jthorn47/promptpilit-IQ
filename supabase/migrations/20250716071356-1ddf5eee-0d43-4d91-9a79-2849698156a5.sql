-- Insert default FICA and payroll tax settings for PropGEN Pro if they don't exist
DO $$
BEGIN
  -- Check and insert each setting individually
  IF NOT EXISTS (SELECT 1 FROM public.system_settings WHERE key = 'fica_employer_rate') THEN
    INSERT INTO public.system_settings (key, value, category, description, is_public, created_by)
    VALUES ('fica_employer_rate', '6.2', 'propgen', 'The employer''s contribution rate for Social Security taxes', false, '00000000-0000-0000-0000-000000000000');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.system_settings WHERE key = 'fica_wage_cap') THEN
    INSERT INTO public.system_settings (key, value, category, description, is_public, created_by)
    VALUES ('fica_wage_cap', '176100', 'propgen', 'Maximum annual earnings subject to Social Security tax', false, '00000000-0000-0000-0000-000000000000');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.system_settings WHERE key = 'medicare_employer_rate') THEN
    INSERT INTO public.system_settings (key, value, category, description, is_public, created_by)
    VALUES ('medicare_employer_rate', '1.45', 'propgen', 'The employer''s contribution rate for Medicare taxes', false, '00000000-0000-0000-0000-000000000000');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.system_settings WHERE key = 'futa_gross_rate') THEN
    INSERT INTO public.system_settings (key, value, category, description, is_public, created_by)
    VALUES ('futa_gross_rate', '6.0', 'propgen', 'Federal Unemployment Tax Act gross rate before credits', false, '00000000-0000-0000-0000-000000000000');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.system_settings WHERE key = 'futa_wage_base') THEN
    INSERT INTO public.system_settings (key, value, category, description, is_public, created_by)
    VALUES ('futa_wage_base', '7000', 'propgen', 'Maximum annual earnings per employee subject to FUTA tax', false, '00000000-0000-0000-0000-000000000000');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.system_settings WHERE key = 'futa_credit_reduction') THEN
    INSERT INTO public.system_settings (key, value, category, description, is_public, created_by)
    VALUES ('futa_credit_reduction', '5.4', 'propgen', 'Standard credit reduction for state unemployment taxes', false, '00000000-0000-0000-0000-000000000000');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.system_settings WHERE key = 'futa_net_rate') THEN
    INSERT INTO public.system_settings (key, value, category, description, is_public, created_by)
    VALUES ('futa_net_rate', '0.6', 'propgen', 'Effective FUTA rate after applying credit reduction', false, '00000000-0000-0000-0000-000000000000');
  END IF;
END $$;