-- First, let's add a status field to company_settings if it doesn't exist, and create a trigger
-- to automatically create clients when lifecycle_stage changes to 'client'

-- Add additional fields to company_settings for the company workflow
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS contract_value DECIMAL(12,2) DEFAULT 50000,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'LMS',
ADD COLUMN IF NOT EXISTS account_manager TEXT,
ADD COLUMN IF NOT EXISTS primary_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS date_won DATE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create function to automatically create client when company becomes active
CREATE OR REPLACE FUNCTION public.handle_company_to_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if lifecycle_stage changed to 'client' 
    IF NEW.lifecycle_stage = 'client' AND (OLD.lifecycle_stage IS NULL OR OLD.lifecycle_stage != 'client') THEN
        -- Insert into clients table
        INSERT INTO public.clients (
            company_name,
            contract_value,
            currency,
            status,
            onboarding_status,
            date_won,
            notes,
            account_manager,
            primary_contact_phone,
            plan_type,
            subscription_status,
            services_purchased,
            company_settings_id
        ) VALUES (
            NEW.company_name,
            COALESCE(NEW.contract_value, 50000),
            COALESCE(NEW.currency, 'USD'),
            'active',
            COALESCE(NEW.onboarding_status, 'pending'),
            COALESCE(NEW.date_won, CURRENT_DATE),
            COALESCE(NEW.notes, 'Automatically created from company lifecycle change'),
            NEW.account_manager,
            NEW.primary_contact_phone,
            'basic',
            NEW.subscription_status,
            CASE 
                WHEN NEW.service_type IS NOT NULL THEN ARRAY[NEW.service_type]
                ELSE ARRAY['LMS']
            END,
            NEW.id
        )
        ON CONFLICT (company_settings_id) DO UPDATE SET
            company_name = EXCLUDED.company_name,
            contract_value = EXCLUDED.contract_value,
            currency = EXCLUDED.currency,
            status = EXCLUDED.status,
            onboarding_status = EXCLUDED.onboarding_status,
            date_won = EXCLUDED.date_won,
            notes = EXCLUDED.notes,
            account_manager = EXCLUDED.account_manager,
            primary_contact_phone = EXCLUDED.primary_contact_phone,
            subscription_status = EXCLUDED.subscription_status,
            services_purchased = EXCLUDED.services_purchased,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic client creation
DROP TRIGGER IF EXISTS trigger_company_to_client ON public.company_settings;
CREATE TRIGGER trigger_company_to_client
    AFTER UPDATE ON public.company_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_company_to_client();