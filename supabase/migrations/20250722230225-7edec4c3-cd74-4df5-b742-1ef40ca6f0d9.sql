-- Add VaultPay configuration fields to company_settings table
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS vaultpay_fee_type TEXT CHECK (vaultpay_fee_type IN ('per_employee', 'flat_fee')) DEFAULT 'per_employee',
ADD COLUMN IF NOT EXISTS vaultpay_rate_per_employee DECIMAL(10,2) DEFAULT 25.00,
ADD COLUMN IF NOT EXISTS vaultpay_flat_fee DECIMAL(10,2) DEFAULT 500.00,
ADD COLUMN IF NOT EXISTS vaultpay_terms_days INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS vaultpay_auto_send_invoice BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS vaultpay_include_register_pdf BOOLEAN DEFAULT false;

-- Add payroll_run_id to vaultpay_invoices for cross-reference
ALTER TABLE public.vaultpay_invoices 
ADD COLUMN IF NOT EXISTS payroll_run_id UUID REFERENCES public.payroll_runs(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vaultpay_invoices_payroll_run_id ON public.vaultpay_invoices(payroll_run_id);

-- Add comments for documentation
COMMENT ON COLUMN public.company_settings.vaultpay_fee_type IS 'Billing model: per_employee or flat_fee';
COMMENT ON COLUMN public.company_settings.vaultpay_rate_per_employee IS 'Rate charged per employee for payroll processing';
COMMENT ON COLUMN public.company_settings.vaultpay_flat_fee IS 'Flat fee for payroll processing (when fee_type is flat_fee)';
COMMENT ON COLUMN public.company_settings.vaultpay_terms_days IS 'Number of days from invoice date to due date';
COMMENT ON COLUMN public.company_settings.vaultpay_auto_send_invoice IS 'Whether to automatically mark invoices as sent';
COMMENT ON COLUMN public.company_settings.vaultpay_include_register_pdf IS 'Whether to attach payroll register PDF to invoice';
COMMENT ON COLUMN public.vaultpay_invoices.payroll_run_id IS 'Reference to the payroll run that generated this invoice';

-- Create function to automatically generate VaultPay invoice when payroll is finalized
CREATE OR REPLACE FUNCTION public.auto_generate_vaultpay_invoice()
RETURNS TRIGGER AS $$
DECLARE
    company_settings_record RECORD;
    invoice_id UUID;
    line_item_id UUID;
    invoice_number TEXT;
    due_date DATE;
    employee_count INTEGER;
    line_item_description TEXT;
    line_item_quantity INTEGER;
    line_item_rate DECIMAL(10,2);
    line_item_total DECIMAL(10,2);
    invoice_status TEXT;
BEGIN
    -- Only proceed if payroll run is being finalized
    IF NEW.status = 'finalized' AND (OLD.status IS NULL OR OLD.status != 'finalized') THEN
        
        -- Get company VaultPay settings
        SELECT 
            vaultpay_fee_type,
            vaultpay_rate_per_employee,
            vaultpay_flat_fee,
            vaultpay_terms_days,
            vaultpay_auto_send_invoice,
            vaultpay_include_register_pdf
        INTO company_settings_record
        FROM public.company_settings 
        WHERE id = NEW.client_id;
        
        -- Skip if no VaultPay settings found
        IF company_settings_record IS NULL THEN
            RETURN NEW;
        END IF;
        
        -- Get employee count for this payroll run
        SELECT COUNT(*) INTO employee_count
        FROM public.payroll_calculations pc
        WHERE pc.payroll_run_id = NEW.id;
        
        -- Calculate due date
        due_date := NEW.finalized_date::DATE + INTERVAL '1 day' * company_settings_record.vaultpay_terms_days;
        
        -- Generate invoice number
        invoice_number := generate_vaultpay_invoice_number();
        
        -- Determine invoice status
        invoice_status := CASE 
            WHEN company_settings_record.vaultpay_auto_send_invoice THEN 'sent'
            ELSE 'draft'
        END;
        
        -- Create invoice
        INSERT INTO public.vaultpay_invoices (
            company_id,
            payroll_run_id,
            invoice_number,
            invoice_date,
            due_date,
            sent_date,
            status,
            category,
            notes,
            total_amount
        ) VALUES (
            NEW.client_id,
            NEW.id,
            invoice_number,
            NEW.finalized_date::DATE,
            due_date,
            CASE WHEN invoice_status = 'sent' THEN NEW.finalized_date::DATE ELSE NULL END,
            invoice_status,
            'payroll',
            'Auto-generated from payroll run for period ' || 
            TO_CHAR(NEW.pay_period_start, 'MM/DD/YYYY') || ' - ' || 
            TO_CHAR(NEW.pay_period_end, 'MM/DD/YYYY'),
            0 -- Will be updated after line items are created
        ) RETURNING id INTO invoice_id;
        
        -- Calculate line item details based on fee type
        IF company_settings_record.vaultpay_fee_type = 'flat_fee' THEN
            line_item_description := 'Payroll Processing: Period ' || 
                TO_CHAR(NEW.pay_period_start, 'MM/DD') || '–' || 
                TO_CHAR(NEW.pay_period_end, 'MM/DD');
            line_item_quantity := 1;
            line_item_rate := company_settings_record.vaultpay_flat_fee;
            line_item_total := company_settings_record.vaultpay_flat_fee;
        ELSE -- per_employee
            line_item_description := 'Payroll Processing: Period ' || 
                TO_CHAR(NEW.pay_period_start, 'MM/DD') || '–' || 
                TO_CHAR(NEW.pay_period_end, 'MM/DD') || ' (' || 
                employee_count || ' employees)';
            line_item_quantity := employee_count;
            line_item_rate := company_settings_record.vaultpay_rate_per_employee;
            line_item_total := employee_count * company_settings_record.vaultpay_rate_per_employee;
        END IF;
        
        -- Create line item
        INSERT INTO public.vaultpay_invoice_line_items (
            invoice_id,
            description,
            quantity,
            unit_price,
            total
        ) VALUES (
            invoice_id,
            line_item_description,
            line_item_quantity,
            line_item_rate,
            line_item_total
        );
        
        -- Update invoice total
        UPDATE public.vaultpay_invoices 
        SET total_amount = line_item_total
        WHERE id = invoice_id;
        
        -- Log the auto-generation
        INSERT INTO public.admin_audit_log (
            user_id,
            action_type,
            resource_type,
            resource_id,
            action_details
        ) VALUES (
            NEW.created_by,
            'auto_created',
            'vaultpay_invoice',
            invoice_id,
            jsonb_build_object(
                'trigger', 'payroll_finalized',
                'payroll_run_id', NEW.id,
                'employee_count', employee_count,
                'total_amount', line_item_total,
                'fee_type', company_settings_record.vaultpay_fee_type
            )
        );
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically generate VaultPay invoices
DROP TRIGGER IF EXISTS trigger_auto_generate_vaultpay_invoice ON public.payroll_runs;
CREATE TRIGGER trigger_auto_generate_vaultpay_invoice
    AFTER UPDATE ON public.payroll_runs
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_vaultpay_invoice();

-- Add helpful constraints and defaults
ALTER TABLE public.company_settings 
ADD CONSTRAINT check_vaultpay_rate_positive CHECK (vaultpay_rate_per_employee > 0),
ADD CONSTRAINT check_vaultpay_flat_fee_positive CHECK (vaultpay_flat_fee > 0),
ADD CONSTRAINT check_vaultpay_terms_positive CHECK (vaultpay_terms_days > 0);

-- Update existing companies with default VaultPay settings if they don't have them
UPDATE public.company_settings 
SET 
    vaultpay_fee_type = COALESCE(vaultpay_fee_type, 'per_employee'),
    vaultpay_rate_per_employee = COALESCE(vaultpay_rate_per_employee, 25.00),
    vaultpay_flat_fee = COALESCE(vaultpay_flat_fee, 500.00),
    vaultpay_terms_days = COALESCE(vaultpay_terms_days, 10),
    vaultpay_auto_send_invoice = COALESCE(vaultpay_auto_send_invoice, true),
    vaultpay_include_register_pdf = COALESCE(vaultpay_include_register_pdf, false)
WHERE 
    vaultpay_fee_type IS NULL OR
    vaultpay_rate_per_employee IS NULL OR
    vaultpay_flat_fee IS NULL OR
    vaultpay_terms_days IS NULL OR
    vaultpay_auto_send_invoice IS NULL OR
    vaultpay_include_register_pdf IS NULL;