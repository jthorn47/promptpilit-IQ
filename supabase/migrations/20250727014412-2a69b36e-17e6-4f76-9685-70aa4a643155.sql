-- Create trigger for company to client conversion
CREATE OR REPLACE FUNCTION handle_company_to_client_conversion()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the lifecycle stage is being changed to 'client_active'
    IF NEW.sales_lifecycle_stage = 'client_active' AND 
       (OLD.sales_lifecycle_stage IS NULL OR OLD.sales_lifecycle_stage != 'client_active') THEN
        
        -- Check if a client record already exists for this company
        IF NOT EXISTS (
            SELECT 1 FROM clients 
            WHERE company_settings_id = NEW.id
        ) THEN
            -- Create a new client record
            INSERT INTO clients (
                company_settings_id,
                company_name,
                date_won,
                contract_value,
                currency,
                contract_start_date,
                onboarding_status,
                status,
                subscription_status,
                source,
                company_address_country,
                notes
            ) VALUES (
                NEW.id,
                NEW.company_name,
                COALESCE(NEW.date_won, NOW()),
                COALESCE(NEW.contract_value, 0),
                COALESCE(NEW.currency, 'USD'),
                COALESCE(NEW.payment_start_date, CURRENT_DATE),
                COALESCE(NEW.onboarding_status, 'pending'),
                'active',
                'active',
                'crm_conversion',
                COALESCE(NEW.country, 'US'),
                'Automatically created from company lifecycle stage change to client_active'
            );
            
            -- Update the company record to reflect the conversion
            NEW.lifecycle_stage = 'client';
            NEW.date_won = COALESCE(NEW.date_won, NOW());
            
            -- Log the conversion in the stage transition history
            NEW.stage_transition_history = COALESCE(NEW.stage_transition_history, '[]'::jsonb) || 
                jsonb_build_object(
                    'from_stage', OLD.sales_lifecycle_stage,
                    'to_stage', 'client_active',
                    'timestamp', NOW(),
                    'auto_client_created', true,
                    'performed_by', auth.uid()
                );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;