-- Recreate profile for Jeffrey
INSERT INTO public.profiles (user_id, email) 
VALUES ('51e451af-1fde-4094-ae08-36769470b783', 'jeffrey@easeworks.com');

-- Now assign super_admin role
INSERT INTO public.user_roles (user_id, role) 
VALUES ('51e451af-1fde-4094-ae08-36769470b783', 'super_admin');