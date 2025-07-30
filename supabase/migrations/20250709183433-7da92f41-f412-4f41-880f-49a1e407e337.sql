-- Fix database functions to have stable search paths

-- Fix update_updated_at_learning function
CREATE OR REPLACE FUNCTION public.update_updated_at_learning()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix generate_article_slug function
CREATE OR REPLACE FUNCTION public.generate_article_slug(title text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$function$;

-- Fix update_article_view_count function
CREATE OR REPLACE FUNCTION public.update_article_view_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.knowledge_base_articles 
  SET view_count = view_count + 1,
      last_viewed_at = NEW.viewed_at
  WHERE id = NEW.article_id;
  RETURN NEW;
END;
$function$;

-- Fix search_companies function
CREATE OR REPLACE FUNCTION public.search_companies(search_term text, status_filter text DEFAULT 'all'::text, limit_count integer DEFAULT 50)
 RETURNS TABLE(id uuid, company_name text, company_logo_url text, primary_color text, certificate_template text, email_notifications boolean, max_employees integer, subscription_status text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.company_name,
    cs.company_logo_url,
    cs.primary_color,
    cs.certificate_template,
    cs.email_notifications,
    cs.max_employees,
    cs.subscription_status,
    cs.created_at,
    cs.updated_at
  FROM public.company_settings cs
  WHERE 
    (search_term = '' OR cs.company_name ILIKE '%' || search_term || '%')
    AND (status_filter = 'all' OR cs.subscription_status = status_filter)
  ORDER BY cs.created_at DESC
  LIMIT limit_count;
END;
$function$;

-- Fix create_super_admin_user function
CREATE OR REPLACE FUNCTION public.create_super_admin_user(user_email text, user_password text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Check if user already exists
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF new_user_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User already exists',
      'user_id', new_user_id
    );
  END IF;
  
  -- Generate new UUID for user
  new_user_id := gen_random_uuid();
  
  -- Insert directly into auth.users with email confirmed
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );
  
  -- Create super_admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'super_admin');
  
  RETURN json_build_object(
    'success', true,
    'message', 'Super admin user created successfully',
    'user_id', new_user_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;

-- Fix handle_assessment_completion function
CREATE OR REPLACE FUNCTION public.handle_assessment_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  assignee_id UUID;
  completion_notification_id UUID;
  achievement_earned BOOLEAN := false;
BEGIN
  -- Only process when status changes to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Create completion notifications for all assigned users
    IF NEW.assigned_to IS NOT NULL THEN
      FOREACH assignee_id IN ARRAY NEW.assigned_to LOOP
        INSERT INTO public.assessment_notifications (
          assessment_id,
          user_id,
          notification_type,
          title,
          message,
          action_url,
          metadata
        ) VALUES (
          NEW.id,
          assignee_id,
          'completion',
          'Assessment Completed!',
          'You have successfully completed the assessment: ' || NEW.company_name || ' Risk Assessment',
          '/admin/my-assessments',
          jsonb_build_object(
            'assessment_id', NEW.id,
            'risk_score', NEW.risk_score,
            'risk_level', NEW.risk_level,
            'completed_at', NEW.updated_at
          )
        ) RETURNING id INTO completion_notification_id;

        -- Award achievement points for assessment completion
        INSERT INTO public.user_points (user_id, company_id, total_points, points_this_month, points_this_week)
        VALUES (assignee_id, NULL, 25, 25, 25)
        ON CONFLICT (user_id, company_id)
        DO UPDATE SET
          total_points = user_points.total_points + 25,
          points_this_month = user_points.points_this_month + 25,
          points_this_week = user_points.points_this_week + 25,
          updated_at = now();

        -- Check for first assessment achievement
        IF NOT EXISTS (
          SELECT 1 FROM public.user_achievements 
          WHERE user_id = assignee_id 
          AND achievement_id = (SELECT id FROM public.achievement_definitions WHERE name = 'Risk Assessment Pro')
        ) THEN
          -- Award first assessment achievement
          INSERT INTO public.user_achievements (user_id, achievement_id, metadata)
          SELECT assignee_id, id, jsonb_build_object('assessment_id', NEW.id, 'risk_score', NEW.risk_score)
          FROM public.achievement_definitions 
          WHERE name = 'Risk Assessment Pro';
          
          achievement_earned := true;
        END IF;

        -- Notify about achievement if earned
        IF achievement_earned THEN
          INSERT INTO public.assessment_notifications (
            assessment_id,
            user_id,
            notification_type,
            title,
            message,
            action_url,
            metadata
          ) VALUES (
            NEW.id,
            assignee_id,
            'completion',
            '🏆 Achievement Unlocked!',
            'You earned the "Risk Assessment Pro" achievement for completing your first assessment!',
            '/admin/my-achievements',
            jsonb_build_object('achievement', 'Risk Assessment Pro', 'points_earned', 50)
          );
        END IF;

      END LOOP;
    END IF;

    -- Notify the assignor (if different from assignee)
    IF NEW.assigned_by IS NOT NULL AND NEW.assigned_by != ALL(COALESCE(NEW.assigned_to, ARRAY[]::UUID[])) THEN
      INSERT INTO public.assessment_notifications (
        assessment_id,
        user_id,
        notification_type,
        title,
        message,
        action_url,
        metadata
      ) VALUES (
        NEW.id,
        NEW.assigned_by,
        'completion',
        'Assessment Completed',
        'An assessment you assigned has been completed for: ' || NEW.company_name,
        '/admin/assessments?filter=completed',
        jsonb_build_object(
          'assessment_id', NEW.id,
          'completed_by', NEW.assigned_to,
          'risk_score', NEW.risk_score
        )
      );
    END IF;

  END IF;

  RETURN NEW;
END;
$function$;

-- Fix has_permission function
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
      AND p.name = _permission_name
  )
$function$;

-- Fix get_user_permissions function
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
 RETURNS TABLE(permission_name text, resource text, action text, description text)
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT DISTINCT p.name, p.resource, p.action, p.description
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
  ORDER BY p.resource, p.action
$function$;