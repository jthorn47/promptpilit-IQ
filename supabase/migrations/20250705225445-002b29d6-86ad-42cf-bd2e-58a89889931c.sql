-- Create subscriptions table to track user subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  package_id UUID REFERENCES course_packages(id),
  employee_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
FOR SELECT
USING (user_id = auth.uid());

-- Create policy for super admins to view all subscriptions
CREATE POLICY "Super admins can view all subscriptions" ON public.subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create policy for company admins to view their company subscriptions
CREATE POLICY "Company admins can view company subscriptions" ON public.subscriptions
FOR SELECT
USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = subscriptions.user_id 
    AND p.company_id = get_user_company_id(auth.uid())
  )
);

-- Create policy for system to insert/update subscriptions
CREATE POLICY "System can manage subscriptions" ON public.subscriptions
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update updated_at column
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create one-time payments table for tracking non-subscription purchases
CREATE TABLE public.one_time_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT UNIQUE,
  package_id UUID REFERENCES course_packages(id),
  employee_count INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.one_time_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for one-time payments (similar to subscriptions)
CREATE POLICY "Users can view own payments" ON public.one_time_payments
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all payments" ON public.one_time_payments
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can view company payments" ON public.one_time_payments
FOR SELECT
USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = one_time_payments.user_id 
    AND p.company_id = get_user_company_id(auth.uid())
  )
);

CREATE POLICY "System can manage payments" ON public.one_time_payments
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_one_time_payments_updated_at
  BEFORE UPDATE ON public.one_time_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();