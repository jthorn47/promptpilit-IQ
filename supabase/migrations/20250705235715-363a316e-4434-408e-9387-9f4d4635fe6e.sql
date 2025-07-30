-- Update the handle_new_user function to create company and assign company_admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    user_count INTEGER;
    new_company_id UUID;
    company_name_from_meta TEXT;
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (user_id, email)
    VALUES (new.id, new.email);
    
    -- Check if this is the first user
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    -- If first user, make them super admin
    IF user_count <= 1 THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (new.id, 'super_admin');
    ELSE
        -- For other users, check if company name was provided in metadata
        company_name_from_meta := new.raw_user_meta_data ->> 'company_name';
        
        IF company_name_from_meta IS NOT NULL AND company_name_from_meta != '' THEN
            -- Create company with the provided name
            INSERT INTO public.company_settings (company_name, primary_color)
            VALUES (company_name_from_meta, '#655DC6')
            RETURNING id INTO new_company_id;
            
            -- Make user a company admin for this company
            INSERT INTO public.user_roles (user_id, role, company_id)
            VALUES (new.id, 'company_admin', new_company_id);
            
            -- Update profile with company_id
            UPDATE public.profiles 
            SET company_id = new_company_id
            WHERE user_id = new.id;
        ELSE
            -- Default to company admin without specific company (will need to set up later)
            INSERT INTO public.user_roles (user_id, role)
            VALUES (new.id, 'company_admin');
        END IF;
    END IF;
    
    RETURN new;
END;
$$;