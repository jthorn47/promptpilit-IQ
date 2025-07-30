-- Fix the remaining functions that still have search_path warnings
-- Continue systematically adding search_path to all functions

-- Update generate_registration_token with search_path
CREATE OR REPLACE FUNCTION public.generate_registration_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN 'reg_' || encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Update generate_employee_qr_code with search_path  
CREATE OR REPLACE FUNCTION public.generate_employee_qr_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN 'EMP-' || encode(gen_random_bytes(16), 'hex');
END;
$$;

-- Update generate_vaultpay_invoice_number with search_path
CREATE OR REPLACE FUNCTION public.generate_vaultpay_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    next_number INTEGER;
    invoice_number TEXT;
BEGIN
    -- Get the next sequential number
    SELECT COALESCE(MAX(
        CASE 
            WHEN invoice_number ~ '^VP-[0-9]+$' THEN 
                CAST(SUBSTRING(invoice_number FROM 4) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO next_number
    FROM public.vaultpay_invoices;
    
    -- Format as VP-XXXX
    invoice_number := 'VP-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN invoice_number;
END;
$$;

-- Update generate_journal_number with search_path
CREATE OR REPLACE FUNCTION public.generate_journal_number(p_company_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    settings_record RECORD;
    new_number INTEGER;
    journal_number TEXT;
BEGIN
    -- Get or create settings
    SELECT * INTO settings_record
    FROM public.gl_settings
    WHERE company_id = p_company_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.gl_settings (company_id)
        VALUES (p_company_id)
        RETURNING * INTO settings_record;
    END IF;
    
    -- Get next number and increment
    new_number := settings_record.next_journal_number;
    journal_number := settings_record.auto_journal_number_prefix || '-' || LPAD(new_number::TEXT, 6, '0');
    
    -- Update next number
    UPDATE public.gl_settings
    SET next_journal_number = next_journal_number + 1,
        updated_at = now()
    WHERE company_id = p_company_id;
    
    RETURN journal_number;
END;
$$;