-- Fix remaining functions with search path warnings

-- 13. Fix handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- 14. Fix check_training_completion
CREATE OR REPLACE FUNCTION public.check_training_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
    completion_scene_id UUID;
    module_id UUID;
    assignment_id UUID;
BEGIN
    -- Get the scene's module and check if it's a completion scene
    SELECT ts.training_module_id, ts.is_completion_scene
    INTO module_id, completion_scene_id
    FROM public.training_scenes ts
    WHERE ts.id = NEW.scene_id;
    
    -- If this is a completion scene and the learner completed it
    IF completion_scene_id = true AND NEW.status = 'completed' THEN
        -- Find the training assignment for this employee and module
        SELECT ta.id INTO assignment_id
        FROM public.training_assignments ta
        JOIN public.training_modules tm ON ta.training_module_id = tm.id
        WHERE tm.id = module_id AND ta.employee_id = NEW.employee_id;
        
        -- Update or insert training completion
        INSERT INTO public.training_completions (
            assignment_id,
            training_module_id,
            employee_id,
            completed_at,
            status,
            progress_percentage
        )
        VALUES (
            assignment_id,
            module_id,
            NEW.employee_id,
            NEW.completed_at,
            'completed',
            100
        )
        ON CONFLICT (assignment_id)
        DO UPDATE SET
            completed_at = NEW.completed_at,
            status = 'completed',
            progress_percentage = 100,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 15. Fix create_test_user_role
CREATE OR REPLACE FUNCTION public.create_test_user_role(user_email text, user_role app_role, company_name text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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

-- 16. Fix process_automatic_renewals
CREATE OR REPLACE FUNCTION public.process_automatic_renewals()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  renewal_record RECORD;
  completion_record RECORD;
  new_assignment_id uuid;
  renewal_due_date timestamp with time zone;
BEGIN
  -- Find all active renewal schedules that need processing
  FOR renewal_record IN
    SELECT rs.*, tm.title as module_title
    FROM public.renewal_schedules rs
    JOIN public.training_modules tm ON rs.training_module_id = tm.id
    WHERE rs.is_active = true 
    AND rs.auto_assign = true
    AND (rs.next_renewal_check IS NULL OR rs.next_renewal_check <= now())
  LOOP
    -- Find completed training that needs renewal
    FOR completion_record IN
      SELECT tc.*, e.id as employee_id, e.company_id
      FROM public.training_completions tc
      JOIN public.training_assignments ta ON tc.assignment_id = ta.id
      JOIN public.employees e ON ta.employee_id = e.id
      WHERE tc.training_module_id = renewal_record.training_module_id
      AND tc.status = 'completed'
      AND tc.completed_at IS NOT NULL
      AND (
        renewal_record.company_id IS NULL OR 
        e.company_id = renewal_record.company_id
      )
      -- Check if renewal is due (completion date + renewal period)
      AND tc.completed_at + (renewal_record.renewal_period_months || ' months')::interval <= now()
      -- Make sure we haven't already created a renewal for this completion
      AND NOT EXISTS (
        SELECT 1 FROM public.renewal_history rh
        WHERE rh.original_completion_id = tc.id
        AND rh.training_module_id = renewal_record.training_module_id
        AND rh.employee_id = completion_record.employee_id
      )
    LOOP
      -- Calculate renewal due date
      renewal_due_date := completion_record.completed_at + 
        (renewal_record.renewal_period_months || ' months')::interval + 
        (renewal_record.grace_period_days || ' days')::interval;
      
      -- Create new training assignment for renewal
      INSERT INTO public.training_assignments (
        employee_id,
        training_module_id,
        assigned_by,
        due_date,
        status,
        priority
      ) VALUES (
        completion_record.employee_id,
        renewal_record.training_module_id,
        NULL, -- System assigned
        renewal_due_date,
        'assigned',
        'high'
      ) RETURNING id INTO new_assignment_id;
      
      -- Create renewal history record
      INSERT INTO public.renewal_history (
        employee_id,
        training_module_id,
        original_completion_id,
        renewal_assignment_id,
        renewal_date,
        renewal_type,
        status,
        due_date
      ) VALUES (
        completion_record.employee_id,
        renewal_record.training_module_id,
        completion_record.id,
        new_assignment_id,
        now(),
        'automatic',
        'assigned',
        renewal_due_date
      );
      
      RAISE NOTICE 'Created renewal assignment for employee % on module %', 
        completion_record.employee_id, renewal_record.module_title;
    END LOOP;
    
    -- Update next renewal check (check again in 1 day)
    UPDATE public.renewal_schedules
    SET next_renewal_check = now() + interval '1 day'
    WHERE id = renewal_record.id;
  END LOOP;
END;
$function$;