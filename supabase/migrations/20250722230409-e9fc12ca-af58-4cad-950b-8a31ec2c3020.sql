-- Fix the search_path security issue for the new function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;