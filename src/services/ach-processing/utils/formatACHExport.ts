/**
 * ACH Export Formatting Utilities
 * Handles formatting of ACH data for various export formats (NACHA, CSV, JSON)
 */

export interface NACHAFileHeader {
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

export interface NACHABatchHeader {
  serviceClassCode: string;
  companyName: string;
  companyDiscretionaryData: string;
  companyIdentification: string;
  standardEntryClassCode: string;
  companyEntryDescription: string;
  companyDescriptiveDate: string;
  effectiveEntryDate: string;
  settlementDate: string;
  originatorStatusCode: string;
  originatingDFIIdentification: string;
  batchNumber: string;
}

export interface NACHAEntryDetail {
  transactionCode: string;
  receivingDFIIdentification: string;
  checkDigit: string;
  dfiAccountNumber: string;
  amount: string;
  individualIdentificationNumber: string;
  individualName: string;
  discretionaryData: string;
  addendaRecordIndicator: string;
  traceNumber: string;
}

/**
 * Format ACH batch data into NACHA file format
 */
export const formatNACHAFile = (
  batchData: any,
  entries: any[],
  companyInfo: any
): string => {
  const lines: string[] = [];
  
  // File Header Record (Type 1)
  const fileHeader = formatFileHeader(companyInfo);
  lines.push(fileHeader);
  
  // Batch Header Record (Type 5)
  const batchHeader = formatBatchHeader(batchData, companyInfo);
  lines.push(batchHeader);
  
  // Entry Detail Records (Type 6)
  entries.forEach((entry, index) => {
    const entryDetail = formatEntryDetail(entry, index + 1);
    lines.push(entryDetail);
  });
  
  // Batch Control Record (Type 8)
  const batchControl = formatBatchControl(entries, batchData);
  lines.push(batchControl);
  
  // File Control Record (Type 9)
  const fileControl = formatFileControl(entries, batchData);
  lines.push(fileControl);
  
  // Add filler records to make file length divisible by 10
  while (lines.length % 10 !== 0) {
    lines.push('9'.repeat(94));
  }
  
  return lines.join('\r\n');
};

/**
 * Format file header record (Type 1)
 */
const formatFileHeader = (companyInfo: any): string => {
  const now = new Date();
  const date = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
  const time = now.toTimeString().slice(0, 4); // HHMM
  
  return [
    '1',                                    // Record Type Code
    '01',                                   // Priority Code
    ' 123456789',                          // Immediate Destination (bank routing)
    '1234567890',                          // Immediate Origin (company federal ID)
    date,                                   // File Creation Date
    time,                                   // File Creation Time
    'A',                                    // File ID Modifier
    '094',                                  // Record Size
    '10',                                   // Blocking Factor
    '1',                                    // Format Code
    'BANK NAME'.padEnd(23),                // Immediate Destination Name
    (companyInfo?.company_name || 'COMPANY').padEnd(23), // Immediate Origin Name
    '        '                              // Reference Code
  ].join('');
};

/**
 * Format batch header record (Type 5)
 */
const formatBatchHeader = (batchData: any, companyInfo: any): string => {
  const effectiveDate = new Date(batchData.scheduled_date || new Date());
  const effectiveDateStr = effectiveDate.toISOString().slice(2, 10).replace(/-/g, '');
  
  return [
    '5',                                    // Record Type Code
    '220',                                  // Service Class Code (220 = mixed debits and credits)
    (companyInfo?.company_name || 'COMPANY').padEnd(16), // Company Name
    '                    ',                 // Company Discretionary Data
    '1234567890',                          // Company Identification
    'PPD',                                  // Standard Entry Class Code
    'PAYROLL   ',                          // Company Entry Description
    '      ',                              // Company Descriptive Date
    effectiveDateStr.slice(2),             // Effective Entry Date (YYMMDD)
    '   ',                                  // Settlement Date
    '1',                                    // Originator Status Code
    '12345678',                            // Originating DFI Identification
    '0000001'                              // Batch Number
  ].join('');
};

/**
 * Format entry detail record (Type 6)
 */
const formatEntryDetail = (entry: any, sequenceNumber: number): string => {
  const amount = Math.abs(entry.amount * 100).toString().padStart(10, '0');
  const transactionCode = entry.transaction_type === 'credit' ? '22' : '27';
  
  return [
    '6',                                    // Record Type Code
    transactionCode,                        // Transaction Code
    entry.routing_number.slice(0, 8),      // Receiving DFI Identification
    entry.routing_number.slice(8, 9),      // Check Digit
    entry.account_number.padEnd(17).slice(0, 17), // DFI Account Number
    amount,                                 // Amount
    (entry.employee_id || '').padEnd(15).slice(0, 15), // Individual ID Number
    (entry.employee_name || 'EMPLOYEE').padEnd(22).slice(0, 22), // Individual Name
    '  ',                                   // Discretionary Data
    '0',                                    // Addenda Record Indicator
    '12345678' + sequenceNumber.toString().padStart(7, '0') // Trace Number
  ].join('');
};

/**
 * Format batch control record (Type 8)
 */
const formatBatchControl = (entries: any[], batchData: any): string => {
  const entryCount = entries.length;
  const entryHash = entries.reduce((sum, entry) => {
    return sum + parseInt(entry.routing_number.slice(0, 8), 10);
  }, 0).toString().slice(-10).padStart(10, '0');
  
  const totalDebits = entries
    .filter(e => e.transaction_type === 'debit')
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);
  
  const totalCredits = entries
    .filter(e => e.transaction_type === 'credit')
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);
  
  return [
    '8',                                    // Record Type Code
    '220',                                  // Service Class Code
    entryCount.toString().padStart(6, '0'), // Entry/Addenda Count
    entryHash,                             // Entry Hash
    (totalDebits * 100).toString().padStart(12, '0'), // Total Debit Entry Dollar Amount
    (totalCredits * 100).toString().padStart(12, '0'), // Total Credit Entry Dollar Amount
    '1234567890',                          // Company Identification
    '                   ',                  // Message Authentication Code
    '      ',                              // Reserved
    '12345678',                            // Originating DFI Identification
    '0000001'                              // Batch Number
  ].join('');
};

/**
 * Format file control record (Type 9)
 */
const formatFileControl = (entries: any[], batchData: any): string => {
  const batchCount = 1;
  const blockCount = Math.ceil((entries.length + 4) / 10); // +4 for header/control records
  const entryCount = entries.length;
  
  const entryHash = entries.reduce((sum, entry) => {
    return sum + parseInt(entry.routing_number.slice(0, 8), 10);
  }, 0).toString().slice(-10).padStart(10, '0');
  
  const totalDebits = entries
    .filter(e => e.transaction_type === 'debit')
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);
  
  const totalCredits = entries
    .filter(e => e.transaction_type === 'credit')
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);
  
  return [
    '9',                                    // Record Type Code
    batchCount.toString().padStart(6, '0'), // Batch Count
    blockCount.toString().padStart(6, '0'), // Block Count
    entryCount.toString().padStart(8, '0'), // Entry/Addenda Count
    entryHash,                             // Entry Hash
    (totalDebits * 100).toString().padStart(12, '0'), // Total Debit Entry Dollar Amount
    (totalCredits * 100).toString().padStart(12, '0'), // Total Credit Entry Dollar Amount
    ''.padEnd(39)                          // Reserved
  ].join('');
};

/**
 * Format ACH data as CSV
 */
export const formatACHCSV = (entries: any[]): string => {
  const headers = [
    'Transaction Type',
    'Routing Number',
    'Account Number',
    'Amount',
    'Employee ID',
    'Employee Name',
    'Description',
    'Effective Date'
  ];
  
  const rows = entries.map(entry => [
    entry.transaction_type,
    entry.routing_number,
    entry.account_number,
    entry.amount.toString(),
    entry.employee_id || '',
    entry.employee_name || '',
    entry.description || '',
    entry.effective_date || ''
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
};

/**
 * Format ACH data as JSON
 */
export const formatACHJSON = (batchData: any, entries: any[]): string => {
  return JSON.stringify({
    batch: {
      id: batchData.id,
      name: batchData.disbursement_type,
      effectiveDate: batchData.scheduled_date,
      status: batchData.status,
      totalAmount: batchData.total_amount,
      entryCount: entries.length
    },
    entries: entries.map(entry => ({
      transactionType: entry.transaction_type,
      routingNumber: entry.routing_number,
      accountNumber: entry.account_number,
      amount: entry.amount,
      employeeId: entry.employee_id,
      employeeName: entry.employee_name,
      description: entry.description,
      effectiveDate: entry.effective_date
    }))
  }, null, 2);
};

/**
 * Validate routing number using check digit algorithm
 */
export const validateRoutingNumber = (routingNumber: string): boolean => {
  if (!/^\d{9}$/.test(routingNumber)) {
    return false;
  }
  
  const digits = routingNumber.split('').map(Number);
  const checkSum = 
    3 * (digits[0] + digits[3] + digits[6]) +
    7 * (digits[1] + digits[4] + digits[7]) +
    1 * (digits[2] + digits[5] + digits[8]);
  
  return checkSum % 10 === 0;
};

/**
 * Validate account number format
 */
export const validateAccountNumber = (accountNumber: string): boolean => {
  // Basic validation - alphanumeric, 4-17 characters
  return /^[a-zA-Z0-9]{4,17}$/.test(accountNumber);
};

/**
 * Generate trace number for ACH entry
 */
export const generateTraceNumber = (
  originatingDFI: string,
  sequenceNumber: number
): string => {
  return originatingDFI.slice(0, 8) + sequenceNumber.toString().padStart(7, '0');
};