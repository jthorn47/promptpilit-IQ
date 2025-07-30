-- HALOnet ACH Payment Orchestration Schema

-- ACH Provider Configuration
CREATE TABLE public.halonet_ach_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id),
  provider_name TEXT NOT NULL, -- 'modern_treasury', 'stripe_treasury', 'dwolla', 'nacha_direct'
  provider_config JSONB NOT NULL DEFAULT '{}', -- API keys, endpoints, settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  daily_limit DECIMAL(12,2),
  monthly_limit DECIMAL(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment Batches
CREATE TABLE public.halonet_payment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id),
  batch_number TEXT NOT NULL,
  batch_type TEXT NOT NULL, -- 'payroll', 'garnishment', 'bonus', 'correction'
  effective_date DATE NOT NULL,
  created_by UUID NOT NULL,
  
  -- Batch totals
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,
  credit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  debit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'submitted', 'processing', 'completed', 'failed', 'cancelled'
  approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  submission_status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'confirmed', 'failed'
  
  -- Provider information
  provider_id UUID REFERENCES public.halonet_ach_providers(id),
  provider_batch_id TEXT, -- External provider's batch ID
  provider_response JSONB,
  
  -- Approval workflow
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  approval_threshold DECIMAL(12,2),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejected_by UUID,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Submission tracking
  submitted_by UUID,
  submitted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  
  -- NACHA file generation
  nacha_file_content TEXT,
  nacha_file_hash TEXT,
  entry_hash BIGINT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(company_id, batch_number)
);

-- Individual Payment Entries
CREATE TABLE public.halonet_payment_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.halonet_payment_batches(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.company_settings(id),
  
  -- Employee/recipient info
  employee_id UUID,
  recipient_name TEXT NOT NULL,
  recipient_account_number TEXT NOT NULL, -- Encrypted
  recipient_routing_number TEXT NOT NULL,
  recipient_account_type TEXT NOT NULL, -- 'checking', 'savings'
  
  -- Payment details
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  transaction_type TEXT NOT NULL, -- 'credit', 'debit'
  payment_type TEXT NOT NULL, -- 'salary', 'bonus', 'garnishment', 'child_support', 'tax_levy'
  
  -- Garnishment specific
  garnishment_id UUID,
  garnishment_priority INTEGER,
  court_order_number TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'submitted', 'processing', 'completed', 'returned', 'failed', 'voided'
  provider_transaction_id TEXT,
  trace_number TEXT,
  
  -- Return/NSF handling
  return_code TEXT,
  return_reason TEXT,
  return_date TIMESTAMPTZ,
  nsf_fee DECIMAL(10,2),
  
  -- Addenda information
  addenda_info TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Approval Workflows
CREATE TABLE public.halonet_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.halonet_payment_batches(id),
  company_id UUID NOT NULL REFERENCES public.company_settings(id),
  
  -- Request details
  request_type TEXT NOT NULL, -- 'batch_approval', 'void_request', 'emergency_release'
  requested_by UUID NOT NULL,
  request_reason TEXT,
  
  -- Approval requirements
  required_approvers JSONB NOT NULL, -- Array of role requirements
  approval_threshold INTEGER NOT NULL DEFAULT 1,
  requires_2fa BOOLEAN NOT NULL DEFAULT false,
  
  -- Current status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
  approved_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timing
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual Approvals
CREATE TABLE public.halonet_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_request_id UUID NOT NULL REFERENCES public.halonet_approval_requests(id),
  approved_by UUID NOT NULL,
  
  -- Approval details
  decision TEXT NOT NULL, -- 'approved', 'rejected'
  comments TEXT,
  two_factor_verified BOOLEAN NOT NULL DEFAULT false,
  
  -- Risk assessment
  risk_score INTEGER,
  risk_factors JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk Controls and Thresholds
CREATE TABLE public.halonet_risk_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id),
  
  -- Control type and conditions
  control_type TEXT NOT NULL, -- 'amount_threshold', 'velocity_check', 'account_validation', 'time_restriction'
  control_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Threshold settings
  threshold_config JSONB NOT NULL,
  
  -- Actions when triggered
  action_type TEXT NOT NULL, -- 'require_approval', 'block', 'flag', 'delay'
  action_config JSONB DEFAULT '{}',
  
  -- Priority and ordering
  priority INTEGER NOT NULL DEFAULT 1,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk Events and Violations
CREATE TABLE public.halonet_risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id),
  batch_id UUID REFERENCES public.halonet_payment_batches(id),
  entry_id UUID REFERENCES public.halonet_payment_entries(id),
  control_id UUID NOT NULL REFERENCES public.halonet_risk_controls(id),
  
  -- Event details
  event_type TEXT NOT NULL, -- 'threshold_exceeded', 'velocity_violation', 'suspicious_pattern'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  
  -- Risk data
  risk_score INTEGER NOT NULL,
  risk_factors JSONB NOT NULL,
  detected_patterns JSONB,
  
  -- Resolution
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'resolved', 'false_positive', 'suppressed'
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment Status History
CREATE TABLE public.halonet_payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.halonet_payment_batches(id),
  entry_id UUID REFERENCES public.halonet_payment_entries(id),
  
  -- Status change
  previous_status TEXT,
  new_status TEXT NOT NULL,
  status_reason TEXT,
  
  -- Actor information
  changed_by UUID,
  change_source TEXT NOT NULL, -- 'user', 'system', 'provider_webhook', 'batch_processor'
  
  -- Additional context
  provider_response JSONB,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhooks Configuration
CREATE TABLE public.halonet_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id),
  
  -- Webhook details
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT NOT NULL, -- For signature verification
  event_types TEXT[] NOT NULL, -- 'batch.submitted', 'payment.completed', 'payment.returned', etc.
  
  -- Status and retry configuration
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_retries INTEGER NOT NULL DEFAULT 3,
  retry_delay_seconds INTEGER NOT NULL DEFAULT 60,
  
  -- Headers and authentication
  custom_headers JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook Delivery Log
CREATE TABLE public.halonet_webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.halonet_webhooks(id),
  
  -- Event details
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  
  -- Delivery details
  http_status INTEGER,
  response_body TEXT,
  response_headers JSONB,
  delivery_attempt INTEGER NOT NULL DEFAULT 1,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'delivered', 'failed', 'abandoned'
  error_message TEXT,
  
  -- Timing
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Garnishment Routing Rules
CREATE TABLE public.halonet_garnishment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id),
  
  -- Rule identification
  rule_name TEXT NOT NULL,
  garnishment_type TEXT NOT NULL, -- 'child_support', 'tax_levy', 'student_loan', 'bankruptcy', 'wage_garnishment'
  
  -- Routing configuration
  routing_config JSONB NOT NULL,
  
  -- Priority and limits
  priority INTEGER NOT NULL,
  max_percentage DECIMAL(5,2), -- Maximum percentage of disposable income
  max_amount DECIMAL(10,2),    -- Maximum dollar amount per pay period
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_halonet_batches_company_status ON public.halonet_payment_batches(company_id, status);
CREATE INDEX idx_halonet_batches_effective_date ON public.halonet_payment_batches(effective_date);
CREATE INDEX idx_halonet_entries_batch ON public.halonet_payment_entries(batch_id);
CREATE INDEX idx_halonet_entries_employee ON public.halonet_payment_entries(employee_id);
CREATE INDEX idx_halonet_entries_status ON public.halonet_payment_entries(status);
CREATE INDEX idx_halonet_approvals_request ON public.halonet_approvals(approval_request_id);
CREATE INDEX idx_halonet_risk_events_company ON public.halonet_risk_events(company_id, status);
CREATE INDEX idx_halonet_payment_history_entry ON public.halonet_payment_history(entry_id);
CREATE INDEX idx_halonet_webhook_deliveries_webhook ON public.halonet_webhook_deliveries(webhook_id, status);

-- Enable Row Level Security
ALTER TABLE public.halonet_ach_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halonet_payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halonet_payment_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halonet_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halonet_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halonet_risk_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halonet_risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halonet_payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halonet_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halonet_webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halonet_garnishment_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies using the existing HALO permission system
CREATE POLICY "HALOnet providers access" ON public.halonet_ach_providers
  FOR ALL USING (has_halo_permission(auth.uid(), 'HALOnet', 'read', company_id));

CREATE POLICY "HALOnet batches read" ON public.halonet_payment_batches
  FOR SELECT USING (has_halo_permission(auth.uid(), 'HALOnet', 'read', company_id));

CREATE POLICY "HALOnet batches write" ON public.halonet_payment_batches
  FOR INSERT WITH CHECK (has_halo_permission(auth.uid(), 'HALOnet', 'write', company_id));

CREATE POLICY "HALOnet batches update" ON public.halonet_payment_batches
  FOR UPDATE USING (has_halo_permission(auth.uid(), 'HALOnet', 'write', company_id));

CREATE POLICY "HALOnet entries access" ON public.halonet_payment_entries
  FOR ALL USING (has_halo_permission(auth.uid(), 'HALOnet', 'read', company_id));

CREATE POLICY "HALOnet approvals access" ON public.halonet_approval_requests
  FOR ALL USING (has_halo_permission(auth.uid(), 'HALOnet', 'approve', company_id));

CREATE POLICY "HALOnet individual approvals" ON public.halonet_approvals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.halonet_approval_requests ar 
      WHERE ar.id = approval_request_id 
      AND has_halo_permission(auth.uid(), 'HALOnet', 'approve', ar.company_id)
    )
  );

CREATE POLICY "HALOnet risk controls" ON public.halonet_risk_controls
  FOR ALL USING (has_halo_permission(auth.uid(), 'HALOnet', 'admin', company_id));

CREATE POLICY "HALOnet risk events" ON public.halonet_risk_events
  FOR SELECT USING (has_halo_permission(auth.uid(), 'HALOnet', 'read', company_id));

CREATE POLICY "HALOnet payment history" ON public.halonet_payment_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.halonet_payment_batches pb 
      WHERE pb.id = batch_id 
      AND has_halo_permission(auth.uid(), 'HALOnet', 'read', pb.company_id)
    )
  );

CREATE POLICY "HALOnet webhooks" ON public.halonet_webhooks
  FOR ALL USING (has_halo_permission(auth.uid(), 'HALOnet', 'admin', company_id));

CREATE POLICY "HALOnet webhook deliveries" ON public.halonet_webhook_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.halonet_webhooks w 
      WHERE w.id = webhook_id 
      AND has_halo_permission(auth.uid(), 'HALOnet', 'read', w.company_id)
    )
  );

CREATE POLICY "HALOnet garnishment rules" ON public.halonet_garnishment_rules
  FOR ALL USING (has_halo_permission(auth.uid(), 'HALOnet', 'admin', company_id));

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_halonet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_halonet_providers_updated_at
  BEFORE UPDATE ON public.halonet_ach_providers
  FOR EACH ROW EXECUTE FUNCTION update_halonet_updated_at();

CREATE TRIGGER update_halonet_batches_updated_at
  BEFORE UPDATE ON public.halonet_payment_batches
  FOR EACH ROW EXECUTE FUNCTION update_halonet_updated_at();

CREATE TRIGGER update_halonet_entries_updated_at
  BEFORE UPDATE ON public.halonet_payment_entries
  FOR EACH ROW EXECUTE FUNCTION update_halonet_updated_at();

CREATE TRIGGER update_halonet_approval_requests_updated_at
  BEFORE UPDATE ON public.halonet_approval_requests
  FOR EACH ROW EXECUTE FUNCTION update_halonet_updated_at();

CREATE TRIGGER update_halonet_risk_controls_updated_at
  BEFORE UPDATE ON public.halonet_risk_controls
  FOR EACH ROW EXECUTE FUNCTION update_halonet_updated_at();

CREATE TRIGGER update_halonet_webhooks_updated_at
  BEFORE UPDATE ON public.halonet_webhooks
  FOR EACH ROW EXECUTE FUNCTION update_halonet_updated_at();

CREATE TRIGGER update_halonet_garnishment_rules_updated_at
  BEFORE UPDATE ON public.halonet_garnishment_rules
  FOR EACH ROW EXECUTE FUNCTION update_halonet_updated_at();