-- HALObroker Partner and Broker Portal Database Schema

-- Partner profiles and account management
CREATE TABLE public.halobroker_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address JSONB,
  partner_type TEXT NOT NULL DEFAULT 'broker', -- broker, partner, agent
  tier_level TEXT NOT NULL DEFAULT 'bronze', -- bronze, silver, gold, platinum
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, suspended, inactive
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  license_number TEXT,
  license_expiry DATE,
  territory TEXT[],
  specializations TEXT[],
  onboarded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lead registration and tracking
CREATE TABLE public.halobroker_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES halobroker_partners(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  company_size TEXT,
  industry TEXT,
  annual_revenue DECIMAL(15,2),
  services_interested TEXT[],
  lead_source TEXT,
  stage TEXT NOT NULL DEFAULT 'registered', -- registered, qualified, contacted, proposal, won, lost
  stage_history JSONB DEFAULT '[]'::jsonb,
  priority TEXT DEFAULT 'medium', -- low, medium, high
  notes TEXT,
  duplicate_check_hash TEXT,
  assigned_to UUID,
  converted_at TIMESTAMP WITH TIME ZONE,
  expected_close_date DATE,
  estimated_value DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Commission tracking and calculations
CREATE TABLE public.halobroker_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES halobroker_partners(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES halobroker_leads(id),
  client_id UUID, -- Reference to actual client when converted
  commission_type TEXT NOT NULL, -- referral, recurring, bonus
  product_category TEXT NOT NULL, -- payroll, lms, ats, benefits, etc
  base_amount DECIMAL(15,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(15,2) NOT NULL,
  tier_bonus DECIMAL(15,2) DEFAULT 0,
  total_commission DECIMAL(15,2) GENERATED ALWAYS AS (commission_amount + tier_bonus) STORED,
  period_start DATE,
  period_end DATE,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, paid, disputed
  payment_date DATE,
  statement_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Commission statements
CREATE TABLE public.halobroker_commission_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES halobroker_partners(id) ON DELETE CASCADE,
  statement_number TEXT NOT NULL UNIQUE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_commissions DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_deductions DECIMAL(15,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_commissions - total_deductions) STORED,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, paid
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance documents and licensing
CREATE TABLE public.halobroker_compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES halobroker_partners(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- agreement, license, insurance, tax_form
  document_name TEXT NOT NULL,
  file_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, expired
  expiry_date DATE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Training modules and content
CREATE TABLE public.halobroker_training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL, -- video, document, interactive, quiz
  content_url TEXT,
  duration_minutes INTEGER,
  category TEXT NOT NULL, -- product_training, sales_training, compliance, certification
  difficulty_level TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
  prerequisites UUID[],
  passing_score INTEGER DEFAULT 80,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Partner certifications and progress
CREATE TABLE public.halobroker_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES halobroker_partners(id) ON DELETE CASCADE,
  training_module_id UUID REFERENCES halobroker_training_modules(id),
  certification_type TEXT NOT NULL, -- halo_certified, product_specialist, sales_expert
  status TEXT NOT NULL DEFAULT 'in_progress', -- not_started, in_progress, completed, expired
  score INTEGER,
  attempts INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Marketing assets and toolkit
CREATE TABLE public.halobroker_marketing_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- brochure, presentation, video, banner, logo
  category TEXT NOT NULL, -- general, product_specific, event, seasonal
  file_path TEXT,
  file_size INTEGER,
  file_format TEXT,
  description TEXT,
  white_label_available BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referral widgets for broker websites
CREATE TABLE public.halobroker_referral_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES halobroker_partners(id) ON DELETE CASCADE,
  widget_name TEXT NOT NULL,
  widget_type TEXT NOT NULL, -- form, button, banner
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  embed_code TEXT,
  tracking_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications and alerts
CREATE TABLE public.halobroker_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES halobroker_partners(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- commission_update, lead_status, compliance_reminder, training_due
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logs for referral changes and payments
CREATE TABLE public.halobroker_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES halobroker_partners(id),
  entity_type TEXT NOT NULL, -- lead, commission, compliance, training
  entity_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- created, updated, deleted, status_changed
  old_values JSONB,
  new_values JSONB,
  performed_by UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_halobroker_partners_user_id ON halobroker_partners(user_id);
CREATE INDEX idx_halobroker_partners_status ON halobroker_partners(status);
CREATE INDEX idx_halobroker_partners_tier_level ON halobroker_partners(tier_level);

CREATE INDEX idx_halobroker_leads_partner_id ON halobroker_leads(partner_id);
CREATE INDEX idx_halobroker_leads_stage ON halobroker_leads(stage);
CREATE INDEX idx_halobroker_leads_created_at ON halobroker_leads(created_at DESC);
CREATE INDEX idx_halobroker_leads_duplicate_check ON halobroker_leads(duplicate_check_hash);

CREATE INDEX idx_halobroker_commissions_partner_id ON halobroker_commissions(partner_id);
CREATE INDEX idx_halobroker_commissions_payment_status ON halobroker_commissions(payment_status);
CREATE INDEX idx_halobroker_commissions_period ON halobroker_commissions(period_start, period_end);

CREATE INDEX idx_halobroker_compliance_partner_id ON halobroker_compliance_documents(partner_id);
CREATE INDEX idx_halobroker_compliance_status ON halobroker_compliance_documents(status);
CREATE INDEX idx_halobroker_compliance_expiry ON halobroker_compliance_documents(expiry_date);

CREATE INDEX idx_halobroker_certifications_partner_id ON halobroker_certifications(partner_id);
CREATE INDEX idx_halobroker_certifications_status ON halobroker_certifications(status);

CREATE INDEX idx_halobroker_notifications_partner_id ON halobroker_notifications(partner_id);
CREATE INDEX idx_halobroker_notifications_read ON halobroker_notifications(is_read);
CREATE INDEX idx_halobroker_notifications_created_at ON halobroker_notifications(created_at DESC);

CREATE INDEX idx_halobroker_audit_logs_partner_id ON halobroker_audit_logs(partner_id);
CREATE INDEX idx_halobroker_audit_logs_entity ON halobroker_audit_logs(entity_type, entity_id);
CREATE INDEX idx_halobroker_audit_logs_created_at ON halobroker_audit_logs(created_at DESC);

-- Row Level Security Policies

-- Partners can only access their own data
ALTER TABLE halobroker_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can view their own profile" ON halobroker_partners
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Partners can update their own profile" ON halobroker_partners
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Super admins can manage all partners" ON halobroker_partners
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Leads access
ALTER TABLE halobroker_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own leads" ON halobroker_leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM halobroker_partners p 
      WHERE p.id = halobroker_leads.partner_id 
      AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Super admins can manage all leads" ON halobroker_leads
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Commissions access
ALTER TABLE halobroker_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can view their own commissions" ON halobroker_commissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM halobroker_partners p 
      WHERE p.id = halobroker_commissions.partner_id 
      AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Super admins can manage all commissions" ON halobroker_commissions
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Commission statements access
ALTER TABLE halobroker_commission_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can view their own statements" ON halobroker_commission_statements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM halobroker_partners p 
      WHERE p.id = halobroker_commission_statements.partner_id 
      AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Super admins can manage all statements" ON halobroker_commission_statements
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Compliance documents access
ALTER TABLE halobroker_compliance_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own compliance docs" ON halobroker_compliance_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM halobroker_partners p 
      WHERE p.id = halobroker_compliance_documents.partner_id 
      AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Super admins can manage all compliance docs" ON halobroker_compliance_documents
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Training modules - viewable by all authenticated users
ALTER TABLE halobroker_training_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can view active training modules" ON halobroker_training_modules
  FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);
CREATE POLICY "Super admins can manage training modules" ON halobroker_training_modules
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Certifications access
ALTER TABLE halobroker_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own certifications" ON halobroker_certifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM halobroker_partners p 
      WHERE p.id = halobroker_certifications.partner_id 
      AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Super admins can manage all certifications" ON halobroker_certifications
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Marketing assets - viewable by all authenticated users
ALTER TABLE halobroker_marketing_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can view active marketing assets" ON halobroker_marketing_assets
  FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);
CREATE POLICY "Super admins can manage marketing assets" ON halobroker_marketing_assets
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Referral widgets access
ALTER TABLE halobroker_referral_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own widgets" ON halobroker_referral_widgets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM halobroker_partners p 
      WHERE p.id = halobroker_referral_widgets.partner_id 
      AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Super admins can manage all widgets" ON halobroker_referral_widgets
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Notifications access
ALTER TABLE halobroker_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own notifications" ON halobroker_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM halobroker_partners p 
      WHERE p.id = halobroker_notifications.partner_id 
      AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Super admins can manage all notifications" ON halobroker_notifications
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Audit logs - read only for partners, full access for admins
ALTER TABLE halobroker_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can view their own audit logs" ON halobroker_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM halobroker_partners p 
      WHERE p.id = halobroker_audit_logs.partner_id 
      AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Super admins can manage all audit logs" ON halobroker_audit_logs
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "System can insert audit logs" ON halobroker_audit_logs
  FOR INSERT WITH CHECK (true);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_halobroker_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_halobroker_partners_updated_at
  BEFORE UPDATE ON halobroker_partners
  FOR EACH ROW EXECUTE FUNCTION update_halobroker_updated_at();

CREATE TRIGGER update_halobroker_leads_updated_at
  BEFORE UPDATE ON halobroker_leads
  FOR EACH ROW EXECUTE FUNCTION update_halobroker_updated_at();

CREATE TRIGGER update_halobroker_commissions_updated_at
  BEFORE UPDATE ON halobroker_commissions
  FOR EACH ROW EXECUTE FUNCTION update_halobroker_updated_at();

CREATE TRIGGER update_halobroker_commission_statements_updated_at
  BEFORE UPDATE ON halobroker_commission_statements
  FOR EACH ROW EXECUTE FUNCTION update_halobroker_updated_at();

CREATE TRIGGER update_halobroker_compliance_documents_updated_at
  BEFORE UPDATE ON halobroker_compliance_documents
  FOR EACH ROW EXECUTE FUNCTION update_halobroker_updated_at();

CREATE TRIGGER update_halobroker_training_modules_updated_at
  BEFORE UPDATE ON halobroker_training_modules
  FOR EACH ROW EXECUTE FUNCTION update_halobroker_updated_at();

CREATE TRIGGER update_halobroker_certifications_updated_at
  BEFORE UPDATE ON halobroker_certifications
  FOR EACH ROW EXECUTE FUNCTION update_halobroker_updated_at();

CREATE TRIGGER update_halobroker_marketing_assets_updated_at
  BEFORE UPDATE ON halobroker_marketing_assets
  FOR EACH ROW EXECUTE FUNCTION update_halobroker_updated_at();

CREATE TRIGGER update_halobroker_referral_widgets_updated_at
  BEFORE UPDATE ON halobroker_referral_widgets
  FOR EACH ROW EXECUTE FUNCTION update_halobroker_updated_at();

CREATE TRIGGER update_halobroker_notifications_updated_at
  BEFORE UPDATE ON halobroker_notifications
  FOR EACH ROW EXECUTE FUNCTION update_halobroker_updated_at();

-- Helper function to generate unique statement numbers
CREATE OR REPLACE FUNCTION generate_halobroker_statement_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'HB-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('halobroker_statement_sequence')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for statement numbers
CREATE SEQUENCE IF NOT EXISTS halobroker_statement_sequence START 1;

-- Auto-generate statement numbers
CREATE OR REPLACE FUNCTION auto_generate_halobroker_statement_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statement_number IS NULL OR NEW.statement_number = '' THEN
    NEW.statement_number := generate_halobroker_statement_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_statement_number
  BEFORE INSERT ON halobroker_commission_statements
  FOR EACH ROW EXECUTE FUNCTION auto_generate_halobroker_statement_number();