-- HALObill: Pricing & Billing Engine for HALOworks

-- Pricing Models and SKUs
CREATE TABLE public.halobill_pricing_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('per_check', 'per_employee', 'flat_fee', 'hybrid')),
  base_rate DECIMAL(10,4) NOT NULL DEFAULT 0,
  per_check_rate DECIMAL(10,4) DEFAULT NULL,
  per_employee_rate DECIMAL(10,4) DEFAULT NULL,
  minimum_fee DECIMAL(10,2) DEFAULT NULL,
  maximum_fee DECIMAL(10,2) DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_date DATE DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.halobill_feature_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_code TEXT UNIQUE NOT NULL,
  feature_name TEXT NOT NULL,
  description TEXT,
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('one_time', 'monthly', 'per_use', 'per_employee')),
  unit_price DECIMAL(10,4) NOT NULL,
  billing_trigger TEXT NOT NULL CHECK (billing_trigger IN ('activation', 'usage', 'monthly', 'quarterly', 'annually')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Client Subscriptions and Billing
CREATE TABLE public.halobill_client_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  pricing_model_id UUID REFERENCES public.halobill_pricing_models(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'pending')),
  billing_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_frequency IN ('weekly', 'bi_weekly', 'monthly', 'quarterly', 'annually')),
  next_billing_date DATE NOT NULL,
  grace_period_days INTEGER NOT NULL DEFAULT 15,
  auto_cutoff_enabled BOOLEAN NOT NULL DEFAULT true,
  cutoff_grace_days INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.halobill_subscription_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.halobill_client_subscriptions(id) ON DELETE CASCADE,
  feature_sku_id UUID REFERENCES public.halobill_feature_skus(id),
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deactivated_at TIMESTAMPTZ DEFAULT NULL,
  usage_limit INTEGER DEFAULT NULL,
  current_usage INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage Tracking
CREATE TABLE public.halobill_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  feature_sku_id UUID REFERENCES public.halobill_feature_skus(id),
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  usage_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  billable_amount DECIMAL(10,4) DEFAULT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoicing System
CREATE TABLE public.halobill_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.halobill_client_subscriptions(id),
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded')),
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  paid_date DATE DEFAULT NULL,
  payment_method TEXT CHECK (payment_method IN ('ach', 'credit_card', 'wire', 'check')),
  payment_reference TEXT,
  late_fee_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  pdf_url TEXT,
  sent_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.halobill_invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.halobill_invoices(id) ON DELETE CASCADE,
  feature_sku_id UUID REFERENCES public.halobill_feature_skus(id),
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,4) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  usage_period_start DATE,
  usage_period_end DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment Processing
CREATE TABLE public.halobill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.halobill_invoices(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('ach', 'credit_card', 'wire', 'check', 'manual')),
  processor TEXT NOT NULL CHECK (processor IN ('stripe', 'modern_treasury', 'manual')),
  processor_payment_id TEXT,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  failure_reason TEXT,
  processed_at TIMESTAMPTZ DEFAULT NULL,
  refunded_at TIMESTAMPTZ DEFAULT NULL,
  refund_amount DECIMAL(12,2) DEFAULT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partner Revenue Sharing
CREATE TABLE public.halobill_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('broker', 'referral', 'reseller', 'implementation')),
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
  payment_schedule TEXT NOT NULL DEFAULT 'monthly' CHECK (payment_schedule IN ('weekly', 'monthly', 'quarterly')),
  minimum_payout DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  contact_email TEXT NOT NULL,
  tax_id TEXT,
  payment_method TEXT DEFAULT 'ach' CHECK (payment_method IN ('ach', 'wire', 'check')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.halobill_partner_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.halobill_partners(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  commission_rate DECIMAL(5,4) NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_date DATE DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(partner_id, client_id)
);

CREATE TABLE public.halobill_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.halobill_partners(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.halobill_invoices(id) ON DELETE CASCADE,
  commission_period_start DATE NOT NULL,
  commission_period_end DATE NOT NULL,
  revenue_amount DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'disputed')),
  paid_date DATE DEFAULT NULL,
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Revenue Analytics
CREATE TABLE public.halobill_revenue_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('daily_revenue', 'monthly_recurring', 'annual_recurring', 'churn_rate', 'new_revenue')),
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  client_count INTEGER DEFAULT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(metric_date, metric_type)
);

CREATE TABLE public.halobill_billing_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('missed_billing', 'payment_failure', 'high_usage', 'commission_due', 'revenue_drop')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.halobill_invoices(id) ON DELETE CASCADE,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ DEFAULT NULL,
  resolved_by UUID DEFAULT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_halobill_usage_tracking_client_date ON public.halobill_usage_tracking(client_id, usage_date);
CREATE INDEX idx_halobill_usage_tracking_feature_date ON public.halobill_usage_tracking(feature_sku_id, usage_date);
CREATE INDEX idx_halobill_invoices_client_status ON public.halobill_invoices(client_id, status);
CREATE INDEX idx_halobill_invoices_due_date ON public.halobill_invoices(due_date) WHERE status IN ('sent', 'overdue');
CREATE INDEX idx_halobill_payments_status ON public.halobill_payments(status);
CREATE INDEX idx_halobill_commissions_partner_period ON public.halobill_commissions(partner_id, commission_period_start, commission_period_end);
CREATE INDEX idx_halobill_revenue_metrics_date_type ON public.halobill_revenue_metrics(metric_date, metric_type);

-- RLS Policies
ALTER TABLE public.halobill_pricing_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_feature_skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_client_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_partner_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_revenue_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halobill_billing_alerts ENABLE ROW LEVEL SECURITY;

-- Admin access policies
CREATE POLICY "Super admins can manage all HALObill data" ON public.halobill_pricing_models FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage all HALObill data" ON public.halobill_feature_skus FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage all HALObill data" ON public.halobill_client_subscriptions FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage all HALObill data" ON public.halobill_subscription_features FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage all HALObill data" ON public.halobill_usage_tracking FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage all HALObill data" ON public.halobill_invoices FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage all HALObill data" ON public.halobill_invoice_line_items FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage all HALObill data" ON public.halobill_payments FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage all HALObill data" ON public.halobill_partners FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage all HALObill data" ON public.halobill_partner_clients FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage all HALObill data" ON public.halobill_commissions FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage all HALObill data" ON public.halobill_revenue_metrics FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can manage all HALObill data" ON public.halobill_billing_alerts FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Client access policies (clients can view their own billing data)
CREATE POLICY "Clients can view their subscriptions" ON public.halobill_client_subscriptions FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.clients c WHERE c.id = client_id AND has_company_role(auth.uid(), 'company_admin'::app_role, c.company_settings_id))
);

CREATE POLICY "Clients can view their invoices" ON public.halobill_invoices FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.clients c WHERE c.id = client_id AND has_company_role(auth.uid(), 'company_admin'::app_role, c.company_settings_id))
);

CREATE POLICY "Clients can view their payments" ON public.halobill_payments FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.clients c WHERE c.id = client_id AND has_company_role(auth.uid(), 'company_admin'::app_role, c.company_settings_id))
);

-- Partner access policies
CREATE POLICY "Partners can view their commissions" ON public.halobill_commissions FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.halobill_partners p WHERE p.id = partner_id AND p.contact_email = auth.email())
);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_halobill_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_halobill_pricing_models_updated_at BEFORE UPDATE ON public.halobill_pricing_models FOR EACH ROW EXECUTE FUNCTION public.update_halobill_updated_at();
CREATE TRIGGER update_halobill_feature_skus_updated_at BEFORE UPDATE ON public.halobill_feature_skus FOR EACH ROW EXECUTE FUNCTION public.update_halobill_updated_at();
CREATE TRIGGER update_halobill_client_subscriptions_updated_at BEFORE UPDATE ON public.halobill_client_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_halobill_updated_at();
CREATE TRIGGER update_halobill_subscription_features_updated_at BEFORE UPDATE ON public.halobill_subscription_features FOR EACH ROW EXECUTE FUNCTION public.update_halobill_updated_at();
CREATE TRIGGER update_halobill_invoices_updated_at BEFORE UPDATE ON public.halobill_invoices FOR EACH ROW EXECUTE FUNCTION public.update_halobill_updated_at();
CREATE TRIGGER update_halobill_payments_updated_at BEFORE UPDATE ON public.halobill_payments FOR EACH ROW EXECUTE FUNCTION public.update_halobill_updated_at();
CREATE TRIGGER update_halobill_partners_updated_at BEFORE UPDATE ON public.halobill_partners FOR EACH ROW EXECUTE FUNCTION public.update_halobill_updated_at();
CREATE TRIGGER update_halobill_partner_clients_updated_at BEFORE UPDATE ON public.halobill_partner_clients FOR EACH ROW EXECUTE FUNCTION public.update_halobill_updated_at();
CREATE TRIGGER update_halobill_commissions_updated_at BEFORE UPDATE ON public.halobill_commissions FOR EACH ROW EXECUTE FUNCTION public.update_halobill_updated_at();
CREATE TRIGGER update_halobill_billing_alerts_updated_at BEFORE UPDATE ON public.halobill_billing_alerts FOR EACH ROW EXECUTE FUNCTION public.update_halobill_updated_at();

-- Functions for invoice number generation
CREATE OR REPLACE FUNCTION public.generate_halobill_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'HB-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('public.halobill_invoice_sequence')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE public.halobill_invoice_sequence START 1;

-- Auto-generate invoice numbers
CREATE OR REPLACE FUNCTION public.auto_generate_halobill_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_halobill_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_halobill_invoice_number BEFORE INSERT ON public.halobill_invoices FOR EACH ROW EXECUTE FUNCTION public.auto_generate_halobill_invoice_number();