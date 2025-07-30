import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NACHAGenerationRequest {
  batch_id: string;
  company_id: string;
  effective_date: string;
}

interface NACHAFileHeader {
  immediateDestination: string;
  immediateOrigin: string;
  fileCreationDate: string;
  fileCreationTime: string;
  fileIdModifier: string;
  recordSize: string;
  blockingFactor: string;
  formatCode: string;
  immediateDestinationName: string;
  immediateOriginName: string;
  referenceCode: string;
}

class NACHAGenerator {
  private static readonly RECORD_SIZE = 94;
  private static readonly BLOCKING_FACTOR = 10;
  
  static generateFileHeader(companyName: string, routingNumber: string): string {
    const now = new Date();
    const fileCreationDate = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const fileCreationTime = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
    
    const header = [
      '1',                                    // Record Type Code
      '01',                                   // Priority Code
      ' ' + routingNumber.padEnd(9, ' '),     // Immediate Destination (10 chars)
      routingNumber.padEnd(10, ' '),          // Immediate Origin (10 chars)
      fileCreationDate,                       // File Creation Date (6 chars)
      fileCreationTime.slice(0, 4),          // File Creation Time (4 chars)
      'A',                                    // File ID Modifier
      '094',                                  // Record Size
      '10',                                   // Blocking Factor
      '1',                                    // Format Code
      companyName.padEnd(23, ' '),           // Immediate Destination Name (23 chars)
      companyName.padEnd(23, ' '),           // Immediate Origin Name (23 chars)
      '        '                              // Reference Code (8 chars)
    ].join('');
    
    return header.padEnd(this.RECORD_SIZE, ' ');
  }
  
  static generateBatchHeader(
    companyId: string,
    companyName: string,
    routingNumber: string,
    accountNumber: string,
    effectiveDate: string,
    batchNumber: number
  ): string {
    const serviceClassCode = '200'; // Mixed Debits and Credits
    const standardEntryClassCode = 'PPD'; // Prearranged Payment and Deposit
    const companyDescriptiveDate = effectiveDate.replace(/-/g, '').slice(2); // YYMMDD
    
    const header = [
      '5',                                    // Record Type Code
      serviceClassCode,                       // Service Class Code
      companyName.padEnd(16, ' '),           // Company Name (16 chars)
      '                    ',                 // Company Discretionary Data (20 chars)
      companyId.padEnd(10, ' '),             // Company Identification (10 chars)
      standardEntryClassCode,                 // Standard Entry Class Code (3 chars)
      'PAYROLL   ',                          // Company Entry Description (10 chars)
      companyDescriptiveDate,                 // Company Descriptive Date (6 chars)
      companyDescriptiveDate,                 // Effective Entry Date (6 chars)
      '   ',                                 // Settlement Date (3 chars)
      '1',                                   // Originator Status Code
      routingNumber.slice(0, 8),             // Originating DFI Identification (8 chars)
      batchNumber.toString().padStart(7, '0') // Batch Number (7 chars)
    ].join('');
    
    return header.padEnd(this.RECORD_SIZE, ' ');
  }
  
  static generateEntryDetail(
    transactionCode: string,
    routingNumber: string,
    accountNumber: string,
    amount: number,
    individualIdNumber: string,
    individualName: string,
    traceNumber: string
  ): string {
    const amountCents = Math.round(amount * 100);
    
    const entry = [
      '6',                                    // Record Type Code
      transactionCode,                        // Transaction Code (2 chars)
      routingNumber.slice(0, 8),             // Receiving DFI Identification (8 chars)
      routingNumber.slice(-1),               // Check Digit (1 char)
      accountNumber.padEnd(17, ' '),         // DFI Account Number (17 chars)
      amountCents.toString().padStart(10, '0'), // Amount (10 chars)
      individualIdNumber.padEnd(15, ' '),    // Individual Identification Number (15 chars)
      individualName.padEnd(22, ' '),        // Individual Name (22 chars)
      '  ',                                  // Discretionary Data (2 chars)
      '0',                                   // Addenda Record Indicator
      traceNumber.padStart(15, '0')          // Trace Number (15 chars)
    ].join('');
    
    return entry.padEnd(this.RECORD_SIZE, ' ');
  }
  
  static generateBatchControl(
    serviceClassCode: string,
    entryCount: number,
    entryHash: number,
    totalDebits: number,
    totalCredits: number,
    companyId: string,
    routingNumber: string,
    batchNumber: number
  ): string {
    const control = [
      '8',                                    // Record Type Code
      serviceClassCode,                       // Service Class Code (3 chars)
      entryCount.toString().padStart(6, '0'), // Entry/Addenda Count (6 chars)
      entryHash.toString().padStart(10, '0'), // Entry Hash (10 chars)
      Math.round(totalDebits * 100).toString().padStart(12, '0'), // Total Debit Entry Dollar Amount (12 chars)
      Math.round(totalCredits * 100).toString().padStart(12, '0'), // Total Credit Entry Dollar Amount (12 chars)
      companyId.padEnd(10, ' '),             // Company Identification (10 chars)
      '                   ',                  // Message Authentication Code (19 chars)
      '      ',                              // Reserved (6 chars)
      routingNumber.slice(0, 8),             // Originating DFI Identification (8 chars)
      batchNumber.toString().padStart(7, '0') // Batch Number (7 chars)
    ].join('');
    
    return control.padEnd(this.RECORD_SIZE, ' ');
  }
  
  static generateFileControl(
    batchCount: number,
    blockCount: number,
    entryCount: number,
    entryHash: number,
    totalDebits: number,
    totalCredits: number
  ): string {
    const control = [
      '9',                                    // Record Type Code
      batchCount.toString().padStart(6, '0'), // Batch Count (6 chars)
      blockCount.toString().padStart(6, '0'), // Block Count (6 chars)
      entryCount.toString().padStart(8, '0'), // Entry/Addenda Count (8 chars)
      entryHash.toString().padStart(10, '0'), // Entry Hash (10 chars)
      Math.round(totalDebits * 100).toString().padStart(12, '0'), // Total Debit Entry Dollar Amount (12 chars)
      Math.round(totalCredits * 100).toString().padStart(12, '0'), // Total Credit Entry Dollar Amount (12 chars)
      '                                      ' // Reserved (39 chars)
    ].join('');
    
    return control.padEnd(this.RECORD_SIZE, ' ');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { batch_id, company_id, effective_date }: NACHAGenerationRequest = await req.json();

    console.log(`Generating NACHA file for batch: ${batch_id}`);

    // Get batch details
    const { data: batch, error: batchError } = await supabase
      .from('ach_batches')
      .select('*')
      .eq('id', batch_id)
      .single();

    if (batchError || !batch) {
      throw new Error(`Batch not found: ${batchError?.message}`);
    }

    // Get company settings for ACH configuration
    const { data: company, error: companyError } = await supabase
      .from('company_settings')
      .select('company_name, ach_routing_number, ach_account_number, ach_company_id')
      .eq('id', company_id)
      .single();

    if (companyError || !company) {
      throw new Error(`Company ACH settings not found: ${companyError?.message}`);
    }

    // Validate ACH configuration
    if (!company.ach_routing_number || !company.ach_account_number || !company.ach_company_id) {
      throw new Error('Company ACH configuration incomplete. Missing routing number, account number, or company ID.');
    }

    // Get batch entries
    const { data: entries, error: entriesError } = await supabase
      .from('ach_batch_entries')
      .select(`
        *,
        bank_accounts:bank_account_id (
          account_number,
          routing_number,
          account_type
        )
      `)
      .eq('batch_id', batch_id)
      .eq('status', 'pending');

    if (entriesError) {
      throw new Error(`Failed to fetch batch entries: ${entriesError.message}`);
    }

    if (!entries || entries.length === 0) {
      throw new Error('No pending entries found for this batch');
    }

    console.log(`Processing ${entries.length} ACH entries`);

    // Validate all entries
    const validationErrors = [];
    for (const entry of entries) {
      if (!entry.bank_accounts?.routing_number) {
        validationErrors.push(`Entry ${entry.id}: Missing routing number`);
      }
      if (!entry.bank_accounts?.account_number) {
        validationErrors.push(`Entry ${entry.id}: Missing account number`);
      }
      if (!entry.amount || entry.amount <= 0) {
        validationErrors.push(`Entry ${entry.id}: Invalid amount`);
      }
      if (!entry.individual_name) {
        validationErrors.push(`Entry ${entry.id}: Missing individual name`);
      }
    }

    if (validationErrors.length > 0) {
      throw new Error(`Validation errors:\n${validationErrors.join('\n')}`);
    }

    // Generate NACHA file content
    const nachaLines = [];
    let entryHash = 0;
    let totalCredits = 0;
    let totalDebits = 0;

    // File Header
    nachaLines.push(NACHAGenerator.generateFileHeader(
      company.company_name,
      company.ach_routing_number
    ));

    // Batch Header
    nachaLines.push(NACHAGenerator.generateBatchHeader(
      company.ach_company_id,
      company.company_name,
      company.ach_routing_number,
      company.ach_account_number,
      effective_date,
      batch.batch_number
    ));

    // Entry Details
    entries.forEach((entry, index) => {
      const transactionCode = entry.transaction_code || '22'; // 22 = Automated Deposit (Credit)
      const routingNumber = entry.bank_accounts.routing_number;
      const accountNumber = entry.bank_accounts.account_number;
      const amount = entry.amount;
      const individualName = entry.individual_name;
      const traceNumber = `${company.ach_routing_number.slice(0, 8)}${(index + 1).toString().padStart(7, '0')}`;

      // Calculate entry hash (sum of first 8 digits of routing numbers)
      entryHash += parseInt(routingNumber.slice(0, 8));

      if (transactionCode.startsWith('2')) {
        totalCredits += amount;
      } else {
        totalDebits += amount;
      }

      nachaLines.push(NACHAGenerator.generateEntryDetail(
        transactionCode,
        routingNumber,
        accountNumber,
        amount,
        entry.employee_id || entry.id,
        individualName,
        traceNumber
      ));

      // Update entry with trace number
      supabase.from('ach_batch_entries').update({
        trace_number: traceNumber,
        status: 'processed'
      }).eq('id', entry.id).then();
    });

    // Batch Control
    nachaLines.push(NACHAGenerator.generateBatchControl(
      '200', // Mixed Debits and Credits
      entries.length,
      entryHash,
      totalDebits,
      totalCredits,
      company.ach_company_id,
      company.ach_routing_number,
      batch.batch_number
    ));

    // File Control
    const blockCount = Math.ceil(nachaLines.length / 10);
    nachaLines.push(NACHAGenerator.generateFileControl(
      1, // Batch count
      blockCount,
      entries.length,
      entryHash,
      totalDebits,
      totalCredits
    ));

    // Pad to block boundary (multiples of 10 records)
    while (nachaLines.length % 10 !== 0) {
      nachaLines.push('9'.repeat(94)); // Blank records
    }

    const nachaContent = nachaLines.join('\n');
    const fileName = `ACH_${batch.batch_number}_${effective_date.replace(/-/g, '')}.txt`;

    // Update batch with file details
    await supabase
      .from('ach_batches')
      .update({
        status: 'generated',
        file_name: fileName,
        nacha_file_content: nachaContent,
        total_credit_amount: totalCredits,
        total_debit_amount: totalDebits,
        total_entries: entries.length,
        entry_hash: entryHash,
        generated_at: new Date().toISOString()
      })
      .eq('id', batch_id);

    // Log the generation
    await supabase
      .from('ach_audit_logs')
      .insert({
        company_id: company_id,
        batch_id: batch_id,
        action_type: 'nacha_file_generated',
        action_details: {
          file_name: fileName,
          total_entries: entries.length,
          total_credits: totalCredits,
          total_debits: totalDebits,
          entry_hash: entryHash
        },
        performed_by: 'system'
      });

    console.log(`✅ NACHA file generated: ${fileName}`);
    console.log(`📊 ${entries.length} entries, $${totalCredits.toFixed(2)} credits, $${totalDebits.toFixed(2)} debits`);

    return new Response(JSON.stringify({
      success: true,
      file_name: fileName,
      file_content: nachaContent,
      summary: {
        total_entries: entries.length,
        total_credits: totalCredits,
        total_debits: totalDebits,
        entry_hash: entryHash,
        effective_date: effective_date
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('NACHA generation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'NACHA file generation failed',
      details: error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});