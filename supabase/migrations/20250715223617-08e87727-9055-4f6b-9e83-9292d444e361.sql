-- Consistency fixes for sales funnel workflow

-- 1. Consolidate lifecycle stage management
-- Update any remaining old lifecycle_stage references to sales_lifecycle_stage
UPDATE public.company_settings 
SET sales_lifecycle_stage = CASE
  WHEN lifecycle_stage = 'client' AND sales_lifecycle_stage = 'prospect' THEN 'active_paying_client'::sales_lifecycle_stage
  WHEN lifecycle_stage = 'lead' AND sales_lifecycle_stage = 'prospect' THEN 'contacted'::sales_lifecycle_stage
  ELSE sales_lifecycle_stage
END
WHERE sales_lifecycle_stage = 'prospect' AND lifecycle_stage IS NOT NULL;

-- 2. Create function to check if company has active paying clients
CREATE OR REPLACE FUNCTION public.has_active_paying_clients(company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.clients c
    WHERE c.company_settings_id = company_id
    AND c.status = 'active'
    AND (
      c.payment_status IN ('paid', 'active') OR
      c.subscription_status = 'active' OR
      c.stripe_subscription_id IS NOT NULL
    )
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. Create function to automatically promote companies to active_paying_client
CREATE OR REPLACE FUNCTION public.auto_promote_to_paying_client()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this client payment change makes the company eligible for promotion
  IF (NEW.payment_status IN ('paid', 'active') OR 
      NEW.subscription_status = 'active' OR 
      NEW.stripe_subscription_id IS NOT NULL) AND
     NEW.status = 'active' THEN
    
    -- Update the company's lifecycle stage to active_paying_client if not already
    UPDATE public.company_settings 
    SET 
      sales_lifecycle_stage = 'active_paying_client'::sales_lifecycle_stage,
      payment_start_date = COALESCE(payment_start_date, NOW()),
      last_activity_date = NOW()
    WHERE id = NEW.company_settings_id 
    AND sales_lifecycle_stage != 'active_paying_client'::sales_lifecycle_stage;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger for automatic stage progression
DROP TRIGGER IF EXISTS trigger_auto_promote_paying_client ON public.clients;
CREATE TRIGGER trigger_auto_promote_paying_client
  AFTER INSERT OR UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_promote_to_paying_client();

-- 5. Create function to check if company should be downgraded from active_paying_client
CREATE OR REPLACE FUNCTION public.check_paying_client_downgrade()
RETURNS TRIGGER AS $$
BEGIN
  -- If a client becomes inactive or loses payment status
  IF (OLD.payment_status IN ('paid', 'active') OR 
      OLD.subscription_status = 'active' OR 
      OLD.stripe_subscription_id IS NOT NULL) AND
     (NEW.payment_status NOT IN ('paid', 'active') AND 
      NEW.subscription_status != 'active' AND 
      NEW.stripe_subscription_id IS NULL) THEN
    
    -- Check if company still has other paying clients
    IF NOT public.has_active_paying_clients(NEW.company_settings_id) THEN
      -- Downgrade to dormant_churned if no other paying clients
      UPDATE public.company_settings 
      SET 
        sales_lifecycle_stage = 'dormant_churned'::sales_lifecycle_stage,
        last_activity_date = NOW()
      WHERE id = NEW.company_settings_id 
      AND sales_lifecycle_stage = 'active_paying_client'::sales_lifecycle_stage;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger for automatic downgrade when clients lose payment status
DROP TRIGGER IF EXISTS trigger_check_paying_client_downgrade ON public.clients;
CREATE TRIGGER trigger_check_paying_client_downgrade
  AFTER UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.check_paying_client_downgrade();

-- 7. Add validation to prevent manual downgrades without confirmation
CREATE OR REPLACE FUNCTION public.validate_lifecycle_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be used for validation but actual confirmation
  -- will be handled in the application layer
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Update any companies that should be active_paying_client based on current data
UPDATE public.company_settings 
SET 
  sales_lifecycle_stage = 'active_paying_client'::sales_lifecycle_stage,
  payment_start_date = COALESCE(payment_start_date, NOW())
WHERE id IN (
  SELECT DISTINCT cs.id
  FROM public.company_settings cs
  JOIN public.clients c ON c.company_settings_id = cs.id
  WHERE c.status = 'active'
  AND (
    c.payment_status IN ('paid', 'active') OR
    c.subscription_status = 'active' OR
    c.stripe_subscription_id IS NOT NULL
  )
  AND cs.sales_lifecycle_stage != 'active_paying_client'::sales_lifecycle_stage
);

-- 9. Create index for better performance on client payment queries
CREATE INDEX IF NOT EXISTS idx_clients_payment_status_active 
ON public.clients(company_settings_id, status, payment_status, subscription_status)
WHERE status = 'active';

-- 10. Add helpful comments
COMMENT ON FUNCTION public.has_active_paying_clients IS 'Checks if a company has any active paying clients';
COMMENT ON FUNCTION public.auto_promote_to_paying_client IS 'Automatically promotes companies to active_paying_client when they get a paying client';
COMMENT ON FUNCTION public.check_paying_client_downgrade IS 'Checks if company should be downgraded when clients lose payment status';