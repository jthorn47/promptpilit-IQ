-- Fix remaining security warnings

-- 1. Fix Function Search Path Mutable issues for the two functions
CREATE OR REPLACE FUNCTION public.calculate_next_generation_date(frequency text, schedule_time time without time zone, day_of_week integer DEFAULT NULL::integer, day_of_month integer DEFAULT NULL::integer)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 STABLE
 SET search_path = 'public'
AS $function$
DECLARE
  next_date TIMESTAMPTZ;
  current_ts TIMESTAMPTZ := now();
BEGIN
  CASE frequency
    WHEN 'daily' THEN
      next_date := (CURRENT_DATE + interval '1 day' + schedule_time::interval);
      IF next_date <= current_ts THEN
        next_date := next_date + interval '1 day';
      END IF;
    
    WHEN 'weekly' THEN
      next_date := (CURRENT_DATE + (7 - EXTRACT(DOW FROM CURRENT_DATE) + day_of_week)::integer % 7 * interval '1 day' + schedule_time::interval);
      IF next_date <= current_ts THEN
        next_date := next_date + interval '7 days';
      END IF;
    
    WHEN 'monthly' THEN
      next_date := (date_trunc('month', CURRENT_DATE) + interval '1 month' + (day_of_month - 1) * interval '1 day' + schedule_time::interval);
      IF next_date <= current_ts THEN
        next_date := next_date + interval '1 month';
      END IF;
    
    WHEN 'quarterly' THEN
      next_date := (date_trunc('quarter', CURRENT_DATE) + interval '3 months' + schedule_time::interval);
      IF next_date <= current_ts THEN
        next_date := next_date + interval '3 months';
      END IF;
    
    ELSE
      next_date := current_ts + interval '1 day';
  END CASE;
  
  RETURN next_date;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_next_generation_date()
 RETURNS trigger
 LANGUAGE plpgsql
 STABLE
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.next_generation_at := calculate_next_generation_date(
    NEW.schedule_frequency,
    NEW.schedule_time,
    NEW.schedule_day_of_week,
    NEW.schedule_day_of_month
  );
  RETURN NEW;
END;
$function$;