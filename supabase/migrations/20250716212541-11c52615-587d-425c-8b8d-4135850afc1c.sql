-- Create rate limiting function for webhooks
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_integration_id UUID,
  p_limit_type TEXT,
  p_window_minutes INTEGER DEFAULT 1,
  p_max_requests INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMPTZ;
BEGIN
  -- Calculate window start time
  window_start := now() - (p_window_minutes * interval '1 minute');
  
  -- Count requests in the current window
  SELECT COUNT(*)
  INTO current_count
  FROM api_usage_logs
  WHERE integration_id = p_integration_id
    AND created_at >= window_start;
  
  -- Return true if under limit, false if over limit
  RETURN current_count < p_max_requests;
END;
$$;