import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneralLedgerRow {
  company_id: string;
  account_name: string;
  name: string;
  type: string;
  split_account: string;
  amount: number;
  balance: number;
  date: string;
  description?: string;
  reference?: string;
}

Deno.serve(async (req) => {
  console.log(`🚀 import-general-ledger function called with method: ${req.method}`);
  console.log(`🚀 Request URL: ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    if (req.method === 'POST') {
      console.log('📨 Processing POST request');
      const requestBody = await req.json();
      console.log('📋 Request body:', requestBody);
      
      const { company_id, file_url } = requestBody;

      if (!company_id) {
        console.error('❌ Company ID is missing');
        throw new Error('Company ID is required');
      }

      if (!file_url) {
        console.error('❌ File URL is missing');
        throw new Error('File URL is required');
      }

      console.log(`📥 Processing general ledger import for company ${company_id}`);
      console.log(`📁 File URL: ${file_url}`);

      // Fetch the Excel file
      console.log('🌐 Fetching Excel file...');
      const fileResponse = await fetch(file_url);
      if (!fileResponse.ok) {
        console.error(`❌ Failed to fetch file: ${fileResponse.status} - ${fileResponse.statusText}`);
        throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
      }
      console.log('✅ File fetched successfully');

      const fileBuffer = await fileResponse.arrayBuffer();
      const workbook = XLSX.read(fileBuffer);
      
      // Get the first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log(`Found ${rawData.length} rows in Excel file`);
      console.log('First few rows:', rawData.slice(0, 5));

      if (rawData.length < 2) {
        throw new Error('Excel file appears to be empty or has no data rows');
      }

      // Find the header row by looking for expected column names
      let headerRowIndex = -1;
      let originalHeaders: string[] = [];
      
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const row = rawData[i] as string[];
        if (row && row.some(cell => 
          cell && typeof cell === 'string' && 
          (cell.toLowerCase().includes('date') || 
           cell.toLowerCase().includes('amount') || 
           cell.toLowerCase().includes('balance') ||
           cell.toLowerCase().includes('transaction'))
        )) {
          headerRowIndex = i;
          originalHeaders = row; // Keep the original headers including empty ones
          break;
        }
      }
      
      if (headerRowIndex === -1 || originalHeaders.length === 0) {
        throw new Error('Could not find header row with expected columns (Date, Amount, Balance, etc.)');
      }
      
      console.log(`Found header row at index ${headerRowIndex}`);
      console.log('Original headers:', originalHeaders);
      
      const dataRows = rawData.slice(headerRowIndex + 1);

      // Map common column names to our database fields
      const columnMapping: { [key: string]: string } = {
        'Date': 'date',
        'Account': 'account_name',
        'Account Name': 'account_name', 
        'Name': 'name',
        'Type': 'type',
        'Transaction Type': 'type',
        'Split': 'split_account',
        'Amount': 'amount',
        'Balance': 'balance',
        'Description': 'description',
        'Memo': 'description',
        'Memo/Description': 'description',
        'Reference': 'reference',
        'Ref': 'reference',
        'Num': 'reference',
        'Debit': 'amount',
        'Credit': 'amount'
      };

      // Find column indices based on the original headers (including empty ones)
      const columnIndices: { [key: string]: number } = {};
      originalHeaders.forEach((header, index) => {
        if (header && header.trim() !== '') {
          const cleanHeader = header.trim();
          // First try direct mapping
          if (columnMapping[cleanHeader]) {
            columnIndices[columnMapping[cleanHeader]] = index;
          }
          // Also add the original header as lowercase with underscores
          const normalizedHeader = cleanHeader.toLowerCase().replace(/[\/\s]+/g, '_');
          columnIndices[normalizedHeader] = index;
        }
      });
      
      console.log('Original headers:', originalHeaders);
      console.log('Column mapping:', columnIndices);
      console.log('First few data rows after header:', dataRows.slice(0, 3));

      // Process and insert data
      const processedRows: GeneralLedgerRow[] = [];
      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        try {
          const row = dataRows[i] as any[];
          const rowNumber = i + 2; // +2 because we start from row 2 (after header)
          
          // Skip empty rows
          if (!row || row.every(cell => !cell || cell === '')) {
            skippedCount++;
            continue;
          }

          // Extract data using column mapping
          const dateValue = row[columnIndices.date];
          const accountName = row[columnIndices.split_account] || 'Unknown Account';
          const name = row[columnIndices.name] || accountName;
          const type = row[columnIndices.type] || 'Unknown';
          const splitAccount = row[columnIndices.split_account] || accountName;
          const amount = parseFloat(row[columnIndices.amount] || 0);
          const balance = parseFloat(row[columnIndices.balance] || 0);
          const description = row[columnIndices.description] || row[columnIndices.memo_description] || '';
          const reference = row[columnIndices.reference] || '';

          // Parse date with improved error handling
          let parsedDate: string;
          if (dateValue !== null && dateValue !== undefined && dateValue !== '') {
            // Log problematic values for debugging
            if (rowNumber <= 20 || (rowNumber % 1000 === 0)) {
              console.log(`Row ${rowNumber} date value:`, dateValue, `(type: ${typeof dateValue})`);
            }
            
            if (typeof dateValue === 'number') {
              // Excel date serial number validation
              // Valid Excel dates are typically between 1 (1900-01-01) and 2958465 (9999-12-31)
              if (dateValue >= 1 && dateValue <= 2958465) {
                try {
                  const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
                  if (!isNaN(excelDate.getTime()) && excelDate.getFullYear() >= 1900 && excelDate.getFullYear() <= 2100) {
                    parsedDate = excelDate.toISOString().split('T')[0];
                  } else {
                    if (rowNumber <= 10) console.log(`Invalid Excel date result at row ${rowNumber}: ${dateValue} -> ${excelDate}`);
                    skippedCount++;
                    continue;
                  }
                } catch (error) {
                  if (rowNumber <= 10) console.log(`Excel date conversion error at row ${rowNumber}: ${dateValue}`, error);
                  skippedCount++;
                  continue;
                }
              } else {
                // Very large numbers - probably not dates
                if (rowNumber <= 10) console.log(`Number too large to be Excel date at row ${rowNumber}: ${dateValue}`);
                skippedCount++;
                continue;
              }
            } else if (typeof dateValue === 'string') {
              // Try to parse string date
              const dateStr = dateValue.trim();
              if (dateStr === '' || dateStr.toLowerCase() === 'null' || dateStr.toLowerCase() === 'undefined') {
                skippedCount++;
                continue;
              }
              
              try {
                let date: Date;
                
                // Try MM/DD/YYYY format
                if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                  date = new Date(dateStr);
                }
                // Try YYYY-MM-DD format
                else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  date = new Date(dateStr);
                }
                // Try other common formats
                else {
                  date = new Date(dateStr);
                }
                
                if (isNaN(date.getTime())) {
                  if (rowNumber <= 10) console.log(`Invalid date string at row ${rowNumber}: "${dateStr}"`);
                  skippedCount++;
                  continue;
                }
                
                // Check if date is reasonable (between 1900 and 2100)
                if (date.getFullYear() < 1900 || date.getFullYear() > 2100) {
                  if (rowNumber <= 10) console.log(`Date out of range at row ${rowNumber}: ${dateStr} -> ${date.getFullYear()}`);
                  skippedCount++;
                  continue;
                }
                
                parsedDate = date.toISOString().split('T')[0];
              } catch (error) {
                if (rowNumber <= 10) console.log(`Date parsing error at row ${rowNumber}: "${dateStr}"`, error);
                skippedCount++;
                continue;
              }
            } else {
              if (rowNumber <= 10) console.log(`Unexpected date type at row ${rowNumber}: ${typeof dateValue}, value:`, dateValue);
              skippedCount++;
              continue;
            }
          } else {
            // Skip rows with missing dates
            skippedCount++;
            continue;
          }

          // Validate required fields
          if (!accountName) {
            errors.push(`Missing account name at row ${rowNumber}`);
            skippedCount++;
            continue;
          }

          const processedRow: GeneralLedgerRow = {
            company_id,
            account_name: accountName.toString().trim(),
            name: (name || accountName).toString().trim(),
            type: type.toString().trim(),
            split_account: (splitAccount || accountName).toString().trim(),
            amount: isNaN(amount) ? 0 : amount,
            balance: isNaN(balance) ? 0 : balance,
            date: parsedDate,
            description: description.toString().trim(),
            reference: reference.toString().trim()
          };

          processedRows.push(processedRow);
          successCount++;

        } catch (error) {
          console.error(`Error processing row ${i + 2}:`, error);
          errors.push(`Error processing row ${i + 2}: ${error.message}`);
          errorCount++;
        }
      }

      console.log(`Processed ${successCount} rows successfully, ${errorCount} errors, ${skippedCount} skipped`);
      
      // Log first few errors for debugging
      if (errors.length > 0) {
        console.log('First 10 errors:', errors.slice(0, 10));
      }

      if (processedRows.length === 0) {
        const errorMessage = errors.length > 0 
          ? `No valid data rows found to import. Common issues: ${errors.slice(0, 5).join('; ')}`
          : 'No valid data rows found to import. Please check the file format and ensure it contains valid data.';
        throw new Error(errorMessage);
      }

      // Insert data in batches
      const batchSize = 100;
      let insertedCount = 0;

      for (let i = 0; i < processedRows.length; i += batchSize) {
        const batch = processedRows.slice(i, i + batchSize);
        
        const { data, error } = await supabaseClient
          .from('general_ledger')
          .insert(batch);

        if (error) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
          throw error;
        }

        insertedCount += batch.length;
        console.log(`Inserted batch ${i / batchSize + 1}: ${batch.length} records`);
      }

      console.log(`Successfully imported ${insertedCount} general ledger entries`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully imported ${insertedCount} general ledger entries`,
          inserted_count: insertedCount,
          processed_count: successCount,
          error_count: errorCount,
          skipped_count: skippedCount,
          total_rows: dataRows.length,
          errors: errors.slice(0, 10) // Return first 10 errors for debugging
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );

  } catch (error) {
    console.error('💥 Critical error in import-general-ledger function:');
    console.error('Error type:', typeof error);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error object:', error);
    
    // Create detailed error response
    const errorMessage = error?.message || 'Internal server error';
    const errorDetails = {
      name: error?.name || 'UnknownError',
      message: errorMessage,
      stack: error?.stack || 'No stack trace available',
      timestamp: new Date().toISOString()
    };
    
    console.error('📤 Sending error response:', errorDetails);
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        success: false,
        details: errorDetails,
        debug: {
          timestamp: new Date().toISOString(),
          function: 'import-general-ledger'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});