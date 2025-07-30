-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  target_company_id UUID;
  user_role_value app_role := 'learner';
BEGIN
  -- Get user role from metadata, default to 'learner'
  IF NEW.raw_user_meta_data ? 'user_role' THEN
    user_role_value := (NEW.raw_user_meta_data ->> 'user_role')::app_role;
  END IF;
  
  -- Create or find company if company_name is provided
  IF NEW.raw_user_meta_data ? 'company_name' THEN
    SELECT cs.id INTO target_company_id
    FROM company_settings cs
    WHERE cs.company_name = NEW.raw_user_meta_data ->> 'company_name';
    
    -- If company doesn't exist, create it
    IF target_company_id IS NULL THEN
      INSERT INTO company_settings (company_name, primary_color)
      VALUES (NEW.raw_user_meta_data ->> 'company_name', '#655DC6')
      RETURNING id INTO target_company_id;
    END IF;
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (user_id, email, company_id)
  VALUES (NEW.id, NEW.email, target_company_id);
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, role, company_id)
  VALUES (NEW.id, user_role_value, target_company_id);
  
  RETURN NEW;
END;
$$;

-- Create trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();