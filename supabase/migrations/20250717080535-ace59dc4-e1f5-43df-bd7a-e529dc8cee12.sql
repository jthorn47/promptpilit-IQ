-- Create halobill_pricing_models table
CREATE TABLE public.halobill_pricing_models (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  model_type text NOT NULL CHECK (model_type IN ('per_employee', 'per_check', 'flat_fee', 'hybrid')),
  base_rate numeric NOT NULL DEFAULT 0,
  per_check_rate numeric DEFAULT 0,
  per_employee_rate numeric DEFAULT 0,
  minimum_fee numeric DEFAULT 0,
  maximum_fee numeric DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  expires_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create halobill_feature_skus table
CREATE TABLE public.halobill_feature_skus (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku_code text NOT NULL UNIQUE,
  feature_name text NOT NULL,
  description text,
  pricing_type text NOT NULL CHECK (pricing_type IN ('one_time', 'monthly', 'per_use', 'per_employee')),
  unit_price numeric NOT NULL DEFAULT 0,
  billing_trigger text NOT NULL CHECK (billing_trigger IN ('activation', 'usage', 'monthly', 'quarterly', 'annually')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create halobill_client_subscriptions table
CREATE TABLE public.halobill_client_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL,
  pricing_model_id uuid NOT NULL REFERENCES public.halobill_pricing_models(id),
  subscription_start_date date NOT NULL DEFAULT CURRENT_DATE,
  subscription_end_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'cancelled')),
  billing_frequency text NOT NULL DEFAULT 'monthly' CHECK (billing_frequency IN ('weekly', 'monthly', 'quarterly', 'annually')),
  next_billing_date date NOT NULL,
  auto_renew boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create halobill_subscription_features table
CREATE TABLE public.halobill_subscription_features (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid NOT NULL REFERENCES public.halobill_client_subscriptions(id) ON DELETE CASCADE,
  feature_sku_id uuid NOT NULL REFERENCES public.halobill_feature_skus(id),
  activated_date date NOT NULL DEFAULT CURRENT_DATE,
  deactivated_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(subscription_id, feature_sku_id)
);

-- Create halobill_usage_tracking table
CREATE TABLE public.halobill_usage_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL,
  feature_sku_id uuid NOT NULL REFERENCES public.halobill_feature_skus(id),
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  usage_quantity numeric NOT NULL DEFAULT 1,
  unit_type text NOT NULL DEFAULT 'count',
  metadata jsonb DEFAULT '{}',
  processed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create halobill_invoice_sequence table for auto-incrementing invoice numbers
CREATE TABLE public.halobill_invoice_sequence (
  id serial PRIMARY KEY,
  year integer NOT NULL,
  sequence_number integer NOT NULL DEFAULT 0,
  UNIQUE(year)
);

-- Create halobill_invoices table
CREATE TABLE public.halobill_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number text NOT NULL UNIQUE,
  client_id uuid NOT NULL,
  subscription_id uuid REFERENCES public.halobill_client_subscriptions(id),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled')),
  billing_period_start date NOT NULL,
  billing_period_end date NOT NULL,
  subtotal_amount numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  due_date date NOT NULL,
  paid_date date,
  late_fee_amount numeric DEFAULT 0,
  payment_terms text DEFAULT 'NET_30',
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create halobill_invoice_line_items table
CREATE TABLE public.halobill_invoice_line_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid NOT NULL REFERENCES public.halobill_invoices(id) ON DELETE CASCADE,
  feature_sku_id uuid REFERENCES public.halobill_feature_skus(id),
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  line_total numeric NOT NULL DEFAULT 0,
  billing_period_start date,
  billing_period_end date,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create halobill_payments table
CREATE TABLE public.halobill_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid NOT NULL REFERENCES public.halobill_invoices(id),
  client_id uuid NOT NULL,
  payment_amount numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('ach', 'credit_card', 'wire', 'check', 'cash')),
  payment_processor text,
  processor_transaction_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  failure_reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create halobill_partners table
CREATE TABLE public.halobill_partners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_name text NOT NULL,
  partner_type text NOT NULL CHECK (partner_type IN ('broker', 'referral', 'reseller', 'implementation')),
  commission_rate numeric NOT NULL DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 1),
  payment_schedule text NOT NULL DEFAULT 'monthly' CHECK (payment_schedule IN ('weekly', 'monthly', 'quarterly')),
  minimum_payout numeric NOT NULL DEFAULT 100,
  contact_email text NOT NULL,
  contact_phone text,
  tax_id text,
  payment_method text NOT NULL DEFAULT 'ach' CHECK (payment_method IN ('ach', 'wire', 'check')),
  payment_details jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create halobill_partner_clients table
CREATE TABLE public.halobill_partner_clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid NOT NULL REFERENCES public.halobill_partners(id),
  client_id uuid NOT NULL,
  referral_date date NOT NULL DEFAULT CURRENT_DATE,
  commission_rate_override numeric CHECK (commission_rate_override >= 0 AND commission_rate_override <= 1),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(partner_id, client_id)
);

-- Create halobill_commissions table
CREATE TABLE public.halobill_commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid NOT NULL REFERENCES public.halobill_partners(id),
  client_id uuid NOT NULL,
  invoice_id uuid NOT NULL REFERENCES public.halobill_invoices(id),
  commission_period_start date NOT NULL,
  commission_period_end date NOT NULL,
  base_amount numeric NOT NULL,
  commission_rate numeric NOT NULL,
  commission_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'disputed')),
  approved_by uuid,
  approved_at timestamp with time zone,
  paid_date date,
  payment_reference text,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create halobill_revenue_metrics table
CREATE TABLE public.halobill_revenue_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_date date NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('daily_revenue', 'monthly_recurring', 'annual_recurring', 'churn_rate', 'client_count')),
  metric_value numeric NOT NULL,
  previous_period_value numeric,
  growth_rate numeric,
  breakdown_data jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(metric_date, metric_type)
);

-- Create halobill_billing_alerts table
CREATE TABLE public.halobill_billing_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type text NOT NULL CHECK (alert_type IN ('payment_failure', 'overdue_invoice', 'subscription_expiring', 'commission_due', 'revenue_anomaly')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  related_entity_id uuid,
  related_entity_type text,
  action_required boolean NOT NULL DEFAULT false,
  resolved boolean NOT NULL DEFAULT false,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.halobill_pricing_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_feature_skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_client_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_invoice_sequence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_partner_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_revenue_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_billing_alerts ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_halobill_pricing_models_active ON public.halobill_pricing_models(is_active, effective_date);
CREATE INDEX idx_halobill_feature_skus_active ON public.halobill_feature_skus(is_active);
CREATE INDEX idx_halobill_client_subscriptions_client ON public.halobill_client_subscriptions(client_id, status);
CREATE INDEX idx_halobill_client_subscriptions_billing ON public.halobill_client_subscriptions(next_billing_date, status);
CREATE INDEX idx_halobill_usage_tracking_client_date ON public.halobill_usage_tracking(client_id, usage_date);
CREATE INDEX idx_halobill_invoices_client_status ON public.halobill_invoices(client_id, status);
CREATE INDEX idx_halobill_invoices_due_date ON public.halobill_invoices(due_date, status);
CREATE INDEX idx_halobill_payments_invoice ON public.halobill_payments(invoice_id, status);
CREATE INDEX idx_halobill_commissions_partner ON public.halobill_commissions(partner_id, status);
CREATE INDEX idx_halobill_billing_alerts_unresolved ON public.halobill_billing_alerts(resolved, severity);

-- RLS Policies for Super Admins (full access)
CREATE POLICY "Super admins can manage pricing models" ON public.halobill_pricing_models FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage feature skus" ON public.halobill_feature_skus FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage client subscriptions" ON public.halobill_client_subscriptions FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage subscription features" ON public.halobill_subscription_features FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage usage tracking" ON public.halobill_usage_tracking FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage invoice sequence" ON public.halobill_invoice_sequence FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage invoices" ON public.halobill_invoices FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage invoice line items" ON public.halobill_invoice_line_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage payments" ON public.halobill_payments FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage partners" ON public.halobill_partners FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage partner clients" ON public.halobill_partner_clients FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage commissions" ON public.halobill_commissions FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage revenue metrics" ON public.halobill_revenue_metrics FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage billing alerts" ON public.halobill_billing_alerts FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for Clients (view their own data)
CREATE POLICY "Clients can view their subscriptions" ON public.halobill_client_subscriptions FOR SELECT TO authenticated USING (client_id = get_user_company_id(auth.uid()));
CREATE POLICY "Clients can view their invoices" ON public.halobill_invoices FOR SELECT TO authenticated USING (client_id = get_user_company_id(auth.uid()));
CREATE POLICY "Clients can view their invoice line items" ON public.halobill_invoice_line_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.halobill_invoices WHERE id = invoice_id AND client_id = get_user_company_id(auth.uid()))
);
CREATE POLICY "Clients can view their payments" ON public.halobill_payments FOR SELECT TO authenticated USING (client_id = get_user_company_id(auth.uid()));
CREATE POLICY "Clients can view their usage data" ON public.halobill_usage_tracking FOR SELECT TO authenticated USING (client_id = get_user_company_id(auth.uid()));

-- RLS Policies for Partners (view their commission data)
CREATE POLICY "Partners can view their commissions" ON public.halobill_commissions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.halobill_partners WHERE id = partner_id AND contact_email = auth.email())
);
CREATE POLICY "Partners can view their partner clients" ON public.halobill_partner_clients FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.halobill_partners WHERE id = partner_id AND contact_email = auth.email())
);

-- Public access for active pricing models and feature SKUs (for sales/signup flows)
CREATE POLICY "Public can view active pricing models" ON public.halobill_pricing_models FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Public can view active feature skus" ON public.halobill_feature_skus FOR SELECT TO authenticated USING (is_active = true);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_halobill_pricing_models_updated_at BEFORE UPDATE ON public.halobill_pricing_models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_halobill_feature_skus_updated_at BEFORE UPDATE ON public.halobill_feature_skus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_halobill_client_subscriptions_updated_at BEFORE UPDATE ON public.halobill_client_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_halobill_subscription_features_updated_at BEFORE UPDATE ON public.halobill_subscription_features FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_halobill_invoices_updated_at BEFORE UPDATE ON public.halobill_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_halobill_payments_updated_at BEFORE UPDATE ON public.halobill_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_halobill_partners_updated_at BEFORE UPDATE ON public.halobill_partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_halobill_partner_clients_updated_at BEFORE UPDATE ON public.halobill_partner_clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_halobill_commissions_updated_at BEFORE UPDATE ON public.halobill_commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  current_year integer;
  next_sequence integer;
  invoice_number text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Get or create sequence for current year
  INSERT INTO public.halobill_invoice_sequence (year, sequence_number)
  VALUES (current_year, 1)
  ON CONFLICT (year) DO UPDATE SET sequence_number = sequence_number + 1
  RETURNING sequence_number INTO next_sequence;
  
  -- Format: INV-YYYY-NNNNNN
  invoice_number := 'INV-' || current_year || '-' || LPAD(next_sequence::text, 6, '0');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION auto_generate_invoice_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_invoice_number_trigger
  BEFORE INSERT ON public.halobill_invoices
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_invoice_number();