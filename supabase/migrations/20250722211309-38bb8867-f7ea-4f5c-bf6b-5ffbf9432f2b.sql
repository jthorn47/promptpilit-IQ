-- Create function to get enum values
CREATE OR REPLACE FUNCTION public.get_enum_values(enum_name text)
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT ARRAY(
    SELECT enumlabel
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = enum_name
    ORDER BY e.enumsortorder
  );
$function$;