
-- Phase 6: Payroll & Billing Management

-- Billing rates for different position types and clients
CREATE TABLE public.staffing_billing_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.staffing_clients(id) ON DELETE CASCADE,
    position_type TEXT NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    overtime_rate DECIMAL(10,2),
    holiday_rate DECIMAL(10,2),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employee pay rates
CREATE TABLE public.staffing_employee_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL, -- References employees table
    position_type TEXT NOT NULL,
    hourly_wage DECIMAL(10,2) NOT NULL,
    overtime_wage DECIMAL(10,2),
    holiday_wage DECIMAL(10,2),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoice management
CREATE TABLE public.staffing_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.staffing_clients(id) ON DELETE RESTRICT,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    due_date DATE NOT NULL,
    sent_date DATE,
    paid_date DATE,
    notes TEXT,
    payment_terms INTEGER NOT NULL DEFAULT 30, -- days
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoice line items
CREATE TABLE public.staffing_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.staffing_invoices(id) ON DELETE CASCADE,
    employee_id UUID, -- References employees table
    description TEXT NOT NULL,
    quantity DECIMAL(8,2) NOT NULL, -- hours worked
    rate DECIMAL(10,2) NOT NULL, -- hourly rate
    amount DECIMAL(12,2) NOT NULL, -- quantity * rate
    work_date DATE,
    position_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payroll periods for staffing
CREATE TABLE public.staffing_payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'processing', 'completed', 'cancelled')),
    total_gross_pay DECIMAL(12,2) DEFAULT 0,
    total_net_pay DECIMAL(12,2) DEFAULT 0,
    total_employees INTEGER DEFAULT 0,
    created_by UUID NOT NULL,
    processed_by UUID,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payroll calculations for staffing employees
CREATE TABLE public.staffing_payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_period_id UUID REFERENCES public.staffing_payroll_periods(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL, -- References employees table
    regular_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    overtime_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    holiday_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    regular_rate DECIMAL(10,2) NOT NULL,
    overtime_rate DECIMAL(10,2),
    holiday_rate DECIMAL(10,2),
    gross_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    deductions DECIMAL(10,2) NOT NULL DEFAULT 0,
    net_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'paid')),
    calculations JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment tracking
CREATE TABLE public.staffing_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.staffing_invoices(id) ON DELETE RESTRICT,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('check', 'ach', 'wire', 'credit_card', 'cash')),
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    reference_number TEXT,
    notes TEXT,
    recorded_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staffing_billing_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffing_employee_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffing_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffing_payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffing_payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffing_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Billing rates
CREATE POLICY "Admins and recruiters can manage billing rates" ON public.staffing_billing_rates
FOR ALL USING (has_staffing_role(auth.uid(), 'admin'::staffing_role) OR has_staffing_role(auth.uid(), 'recruiter'::staffing_role));

-- Employee rates
CREATE POLICY "Admins can manage employee rates" ON public.staffing_employee_rates
FOR ALL USING (has_staffing_role(auth.uid(), 'admin'::staffing_role));

-- Invoices
CREATE POLICY "Admins and recruiters can manage invoices" ON public.staffing_invoices
FOR ALL USING (has_staffing_role(auth.uid(), 'admin'::staffing_role) OR has_staffing_role(auth.uid(), 'recruiter'::staffing_role));

-- Invoice items
CREATE POLICY "Admins and recruiters can manage invoice items" ON public.staffing_invoice_items
FOR ALL USING (has_staffing_role(auth.uid(), 'admin'::staffing_role) OR has_staffing_role(auth.uid(), 'recruiter'::staffing_role));

-- Payroll periods
CREATE POLICY "Admins can manage payroll periods" ON public.staffing_payroll_periods
FOR ALL USING (has_staffing_role(auth.uid(), 'admin'::staffing_role));

-- Payroll records
CREATE POLICY "Admins can manage payroll records" ON public.staffing_payroll_records
FOR ALL USING (has_staffing_role(auth.uid(), 'admin'::staffing_role));

-- Payments
CREATE POLICY "Admins and recruiters can manage payments" ON public.staffing_payments
FOR ALL USING (has_staffing_role(auth.uid(), 'admin'::staffing_role) OR has_staffing_role(auth.uid(), 'recruiter'::staffing_role));

-- Triggers for updated_at
CREATE TRIGGER update_staffing_billing_rates_updated_at
    BEFORE UPDATE ON public.staffing_billing_rates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_staffing_employee_rates_updated_at
    BEFORE UPDATE ON public.staffing_employee_rates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_staffing_invoices_updated_at
    BEFORE UPDATE ON public.staffing_invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_staffing_payroll_periods_updated_at
    BEFORE UPDATE ON public.staffing_payroll_periods
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_staffing_payroll_records_updated_at
    BEFORE UPDATE ON public.staffing_payroll_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_staffing();

-- Indexes for performance
CREATE INDEX idx_staffing_billing_rates_client_active ON public.staffing_billing_rates(client_id, is_active);
CREATE INDEX idx_staffing_employee_rates_employee_active ON public.staffing_employee_rates(employee_id, is_active);
CREATE INDEX idx_staffing_invoices_client_status ON public.staffing_invoices(client_id, status);
CREATE INDEX idx_staffing_invoices_status_due_date ON public.staffing_invoices(status, due_date);
CREATE INDEX idx_staffing_invoice_items_invoice ON public.staffing_invoice_items(invoice_id);
CREATE INDEX idx_staffing_payroll_records_period ON public.staffing_payroll_records(payroll_period_id);
CREATE INDEX idx_staffing_payments_invoice ON public.staffing_payments(invoice_id);

-- Generate invoice numbers automatically
CREATE SEQUENCE public.staffing_invoice_sequence START 1000;

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION public.generate_staffing_invoice_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('public.staffing_invoice_sequence')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-generate invoice numbers
CREATE OR REPLACE FUNCTION public.auto_generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_staffing_invoice_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_invoice_number_trigger
    BEFORE INSERT ON public.staffing_invoices
    FOR EACH ROW EXECUTE FUNCTION public.auto_generate_invoice_number();
