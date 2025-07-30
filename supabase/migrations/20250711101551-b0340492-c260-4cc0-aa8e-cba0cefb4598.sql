-- Fix remaining Function Search Path Mutable issues

-- Update generate_nacha_file function
CREATE OR REPLACE FUNCTION public.generate_nacha_file(batch_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    batch_record RECORD;
    company_record RECORD;
    entry_record RECORD;
    file_content TEXT := '';
    file_header TEXT;
    batch_header TEXT;
    entry_detail TEXT;
    batch_control TEXT;
    file_control TEXT;
    entry_count INTEGER := 0;
    total_debit DECIMAL(12,2) := 0;
    total_credit DECIMAL(12,2) := 0;
    entry_hash BIGINT := 0;
    current_date TEXT := to_char(now(), 'YYMMDD');
    current_time TEXT := to_char(now(), 'HHMM');
    trace_counter INTEGER := 1;
BEGIN
    -- Get batch information
    SELECT ab.*, cs.company_name
    INTO batch_record
    FROM public.ach_batches ab
    JOIN public.company_settings cs ON ab.company_id = cs.id
    WHERE ab.id = batch_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Batch not found';
    END IF;
    
    -- Get company ACH settings
    SELECT * INTO company_record
    FROM public.company_ach_settings
    WHERE company_id = batch_record.company_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Company ACH settings not configured';
    END IF;
    
    -- File Header Record (Type '1')
    file_header := '1' || -- Record Type Code
                  '01' || -- Priority Code
                  rpad(company_record.immediate_destination, 10, ' ') || -- Immediate Destination
                  rpad(company_record.immediate_origin, 10, ' ') || -- Immediate Origin
                  current_date || -- File Creation Date
                  current_time || -- File Creation Time
                  company_record.file_id_modifier || -- File ID Modifier
                  '094' || -- Record Size
                  '10' || -- Blocking Factor
                  '1' || -- Format Code
                  rpad(company_record.immediate_destination, 23, ' ') || -- Immediate Destination Name
                  rpad(company_record.company_name, 23, ' ') || -- Immediate Origin Name
                  rpad('', 8, ' '); -- Reference Code
    
    file_content := file_content || file_header || E'\n';
    
    -- Batch Header Record (Type '5')
    batch_header := '5' || -- Record Type Code
                   '200' || -- Service Class Code (200 = mixed debits and credits)
                   rpad(company_record.company_name, 16, ' ') || -- Company Name
                   rpad('', 20, ' ') || -- Company Discretionary Data
                   company_record.company_identification || -- Company Identification
                   'PPD' || -- Standard Entry Class Code
                   rpad(batch_record.batch_description, 10, ' ') || -- Company Entry Description
                   to_char(batch_record.effective_date, 'YYMMDD') || -- Company Descriptive Date
                   to_char(batch_record.effective_date, 'YYMMDD') || -- Effective Entry Date
                   '   ' || -- Settlement Date
                   '1' || -- Originator Status Code
                   substring(company_record.originating_dfi_routing, 1, 8) || -- Originating DFI Identification
                   lpad(batch_record.batch_number::TEXT, 7, '0'); -- Batch Number
    
    file_content := file_content || batch_header || E'\n';
    
    -- Entry Detail Records (Type '6')
    FOR entry_record IN
        SELECT 
            abe.*,
            CASE eba.account_type 
                WHEN 'checking' THEN '22'
                WHEN 'savings' THEN '32'
                ELSE '22'
            END as transaction_code
        FROM public.ach_batch_entries abe
        JOIN public.employee_bank_accounts eba ON abe.bank_account_id = eba.id
        WHERE abe.batch_id = batch_id
        ORDER BY abe.created_at
    LOOP
        entry_count := entry_count + 1;
        total_credit := total_credit + entry_record.amount;
        
        entry_detail := '6' || -- Record Type Code
                       entry_record.transaction_code || -- Transaction Code
                       substring(entry_record.trace_number, 1, 8) || -- Receiving DFI Identification
                       '0' || -- Check Digit (simplified)
                       rpad('XXXXXXXXXXXX', 17, 'X') || -- DFI Account Number (encrypted/masked)
                       lpad((entry_record.amount * 100)::BIGINT::TEXT, 10, '0') || -- Amount in cents
                       rpad(entry_record.individual_name, 22, ' ') || -- Individual Name
                       rpad('', 2, ' ') || -- Discretionary Data
                       '0' || -- Addenda Record Indicator
                       lpad(trace_counter::TEXT, 15, '0'); -- Trace Number
        
        file_content := file_content || entry_detail || E'\n';
        trace_counter := trace_counter + 1;
    END LOOP;
    
    -- Calculate entry hash (sum of routing numbers)
    SELECT COALESCE(SUM(substring(abe.trace_number, 1, 8)::BIGINT), 0) INTO entry_hash
    FROM public.ach_batch_entries abe
    WHERE abe.batch_id = batch_id;
    
    -- Batch Control Record (Type '8')
    batch_control := '8' || -- Record Type Code
                    '200' || -- Service Class Code
                    lpad(entry_count::TEXT, 6, '0') || -- Entry/Addenda Count
                    lpad((entry_hash % 10000000000)::TEXT, 10, '0') || -- Entry Hash
                    lpad('0', 12, '0') || -- Total Debit Entry Dollar Amount
                    lpad((total_credit * 100)::BIGINT::TEXT, 12, '0') || -- Total Credit Entry Dollar Amount
                    company_record.company_identification || -- Company Identification
                    rpad('', 19, ' ') || -- Message Authentication Code
                    rpad('', 6, ' ') || -- Reserved
                    substring(company_record.originating_dfi_routing, 1, 8) || -- Originating DFI Identification
                    lpad(batch_record.batch_number::TEXT, 7, '0'); -- Batch Number
    
    file_content := file_content || batch_control || E'\n';
    
    -- File Control Record (Type '9')
    file_control := '9' || -- Record Type Code
                   lpad('1', 6, '0') || -- Batch Count
                   lpad((entry_count / 10 + 1)::TEXT, 6, '0') || -- Block Count
                   lpad(entry_count::TEXT, 8, '0') || -- Entry/Addenda Count
                   lpad((entry_hash % 10000000000)::TEXT, 10, '0') || -- Entry Hash
                   lpad('0', 12, '0') || -- Total Debit Entry Dollar Amount
                   lpad((total_credit * 100)::BIGINT::TEXT, 12, '0') || -- Total Credit Entry Dollar Amount
                   rpad('', 39, ' '); -- Reserved
    
    file_content := file_content || file_control || E'\n';
    
    -- Update batch with calculated totals
    UPDATE public.ach_batches
    SET 
        total_credit_amount = total_credit,
        entry_hash = entry_hash,
        total_entries = entry_count,
        nacha_file_content = file_content,
        status = 'generated',
        generated_at = now()
    WHERE id = batch_id;
    
    RETURN file_content;
END;
$function$;

-- Update generate_onboarding_code function
CREATE OR REPLACE FUNCTION public.generate_onboarding_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.onboarding_codes WHERE code = code) INTO exists_check;
    
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$function$;