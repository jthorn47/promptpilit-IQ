-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_ach_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_ach_settings_updated_at
    BEFORE UPDATE ON public.company_ach_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ach_updated_at_column();

CREATE TRIGGER update_employee_bank_accounts_updated_at
    BEFORE UPDATE ON public.employee_bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ach_updated_at_column();

CREATE TRIGGER update_ach_batches_updated_at
    BEFORE UPDATE ON public.ach_batches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ach_updated_at_column();

-- Function to validate routing numbers using checksum
CREATE OR REPLACE FUNCTION public.validate_routing_number(routing_number TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    sum_total INTEGER := 0;
    digit INTEGER;
    multiplier INTEGER;
BEGIN
    -- Must be exactly 9 digits
    IF length(routing_number) != 9 OR routing_number !~ '^[0-9]+$' THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate checksum: (3×d1 + 7×d2 + 1×d3 + 3×d4 + 7×d5 + 1×d6 + 3×d7 + 7×d8 + 1×d9) mod 10 = 0
    FOR i IN 1..9 LOOP
        digit := substring(routing_number FROM i FOR 1)::INTEGER;
        CASE (i - 1) % 3
            WHEN 0 THEN multiplier := 3;
            WHEN 1 THEN multiplier := 7;
            WHEN 2 THEN multiplier := 1;
        END CASE;
        sum_total := sum_total + (digit * multiplier);
    END LOOP;
    
    RETURN (sum_total % 10) = 0;
END;
$$ LANGUAGE plpgsql STABLE;