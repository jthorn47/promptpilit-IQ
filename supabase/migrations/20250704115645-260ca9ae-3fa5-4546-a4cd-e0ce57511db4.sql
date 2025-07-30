-- Fix the create_test_user_role function to handle the constraint properly
CREATE OR REPLACE FUNCTION public.create_test_user_role(user_email text, user_role app_role, company_name text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    target_user_id uuid;
    target_company_id uuid;
    existing_role_id uuid;
BEGIN
    -- Find the user by email
    SELECT au.id INTO target_user_id
    FROM auth.users au
    WHERE au.email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- If company admin or learner, find or create company
    IF user_role IN ('company_admin', 'learner') AND company_name IS NOT NULL THEN
        SELECT cs.id INTO target_company_id
        FROM company_settings cs
        WHERE cs.company_name = create_test_user_role.company_name;
        
        -- If company doesn't exist, create it
        IF target_company_id IS NULL THEN
            INSERT INTO company_settings (company_name, primary_color)
            VALUES (company_name, '#655DC6')
            RETURNING id INTO target_company_id;
        END IF;
    END IF;
    
    -- Check if user already has this role
    SELECT id INTO existing_role_id
    FROM user_roles 
    WHERE user_id = target_user_id AND role = user_role;
    
    IF existing_role_id IS NOT NULL THEN
        -- Update existing role with new company_id
        UPDATE user_roles 
        SET company_id = target_company_id,
            updated_at = now()
        WHERE id = existing_role_id;
    ELSE
        -- Insert new role
        INSERT INTO user_roles (user_id, role, company_id)
        VALUES (target_user_id, user_role, target_company_id);
    END IF;
    
    -- Update the profile with company_id if applicable
    IF target_company_id IS NOT NULL THEN
        UPDATE profiles 
        SET company_id = target_company_id
        WHERE profiles.user_id = target_user_id;
    END IF;
END;
$function$;