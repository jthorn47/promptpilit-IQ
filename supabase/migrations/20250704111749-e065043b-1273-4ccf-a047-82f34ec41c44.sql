-- Create test users with roles for easy testing
-- Note: These will be actual users that can sign in

-- First, let's insert some test user roles directly 
-- (This assumes test users will be created manually or via the interface)

-- Create a function to assign roles to test users
CREATE OR REPLACE FUNCTION create_test_user_role(
    user_email text,
    user_role app_role,
    company_name text DEFAULT null
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id uuid;
    target_company_id uuid;
BEGIN
    -- Find the user by email
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- If company admin or learner, find or create company
    IF user_role IN ('company_admin', 'learner') AND company_name IS NOT NULL THEN
        SELECT id INTO target_company_id
        FROM company_settings
        WHERE company_settings.company_name = create_test_user_role.company_name;
        
        -- If company doesn't exist, create it
        IF target_company_id IS NULL THEN
            INSERT INTO company_settings (company_name, primary_color)
            VALUES (company_name, '#655DC6')
            RETURNING id INTO target_company_id;
        END IF;
    END IF;
    
    -- Insert or update the user role
    INSERT INTO user_roles (user_id, role, company_id)
    VALUES (user_id, user_role, target_company_id)
    ON CONFLICT (user_id, role) 
    DO UPDATE SET company_id = EXCLUDED.company_id;
    
    -- Update the profile with company_id if applicable
    IF target_company_id IS NOT NULL THEN
        UPDATE profiles 
        SET company_id = target_company_id
        WHERE user_id = create_test_user_role.user_id;
    END IF;
END;
$$;