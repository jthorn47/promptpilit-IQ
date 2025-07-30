-- Create brand identity enum
CREATE TYPE brand_identity AS ENUM ('easeworks', 'easelearn', 'dual');

-- Add brand_identity column to company_settings table
ALTER TABLE public.company_settings 
ADD COLUMN brand_identity brand_identity;

-- Add brand_identity column to clients table  
ALTER TABLE public.clients
ADD COLUMN brand_identity brand_identity;

-- Add brand_identity column to user_roles table (nullable, auto-inherited)
ALTER TABLE public.user_roles
ADD COLUMN brand_identity brand_identity;

-- Create function to auto-inherit brand_identity to user_roles
CREATE OR REPLACE FUNCTION public.inherit_brand_identity()
RETURNS TRIGGER AS $$
BEGIN
    -- If user_role is being created/updated and has a company_id, inherit brand from company
    IF NEW.company_id IS NOT NULL THEN
        SELECT brand_identity INTO NEW.brand_identity
        FROM public.company_settings
        WHERE id = NEW.company_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-inherit brand_identity when user_roles are created/updated
CREATE TRIGGER inherit_brand_identity_trigger
    BEFORE INSERT OR UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.inherit_brand_identity();

-- Create function to update user brand_identity when company brand changes
CREATE OR REPLACE FUNCTION public.update_user_brand_identity()
RETURNS TRIGGER AS $$
BEGIN
    -- When company brand_identity changes, update all associated user_roles
    IF OLD.brand_identity IS DISTINCT FROM NEW.brand_identity THEN
        UPDATE public.user_roles
        SET brand_identity = NEW.brand_identity
        WHERE company_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to cascade brand_identity changes from company to users
CREATE TRIGGER update_user_brand_identity_trigger
    AFTER UPDATE ON public.company_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_brand_identity();

-- Create function to prevent deletion of companies/clients without brand_identity
CREATE OR REPLACE FUNCTION public.validate_brand_identity_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.brand_identity IS NULL THEN
        RAISE EXCEPTION 'Cannot delete record without brand_identity. Please assign a brand identity first.';
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to prevent deletion without brand_identity
CREATE TRIGGER validate_company_brand_deletion
    BEFORE DELETE ON public.company_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_brand_identity_deletion();

CREATE TRIGGER validate_client_brand_deletion
    BEFORE DELETE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_brand_identity_deletion();

-- Create function to get brand-appropriate email domain
CREATE OR REPLACE FUNCTION public.get_brand_email_domain(p_brand_identity brand_identity, p_context text DEFAULT 'default')
RETURNS text AS $$
BEGIN
    CASE p_brand_identity
        WHEN 'easeworks' THEN
            RETURN 'easeworks.com';
        WHEN 'easelearn' THEN
            RETURN 'easelearn.com';
        WHEN 'dual' THEN
            -- For dual brand, use context to determine domain
            CASE p_context
                WHEN 'training', 'lms', 'learning' THEN
                    RETURN 'easelearn.com';
                ELSE
                    RETURN 'easeworks.com';
            END CASE;
        ELSE
            RETURN 'easeworks.com'; -- Default fallback
    END CASE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create audit trigger for brand_identity changes
CREATE OR REPLACE FUNCTION public.audit_brand_identity_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if brand_identity actually changed and user is authenticated
    IF OLD.brand_identity IS DISTINCT FROM NEW.brand_identity AND auth.uid() IS NOT NULL THEN
        INSERT INTO public.admin_audit_log (
            user_id,
            company_id,
            action_type,
            resource_type,
            resource_id,
            action_details,
            old_values,
            new_values
        ) VALUES (
            auth.uid(),
            CASE TG_TABLE_NAME 
                WHEN 'company_settings' THEN NEW.id
                WHEN 'clients' THEN NEW.company_settings_id
                ELSE NULL
            END,
            'brand_identity_changed',
            TG_TABLE_NAME,
            NEW.id,
            jsonb_build_object(
                'table', TG_TABLE_NAME,
                'field', 'brand_identity',
                'timestamp', now()
            ),
            jsonb_build_object('brand_identity', OLD.brand_identity),
            jsonb_build_object('brand_identity', NEW.brand_identity)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for brand_identity changes
CREATE TRIGGER audit_company_brand_changes
    AFTER UPDATE ON public.company_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_brand_identity_changes();

CREATE TRIGGER audit_client_brand_changes
    AFTER UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_brand_identity_changes();