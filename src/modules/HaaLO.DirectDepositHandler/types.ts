/**
 * Type definitions for HaaLO Direct Deposit Handler Module
 */

export type ACHFileStatus = 'generated' | 'queued' | 'transmitted' | 'failed' | 'cancelled';
export type ACHEntryStatus = 'pending' | 'processed' | 'returned' | 'failed';
export type AccountType = 'checking' | 'savings';
export type TransmissionMethod = 'sftp' | 'api' | 'manual';
export type ProcessingSchedule = 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
export type TransmissionStatus = 'success' | 'failed' | 'retry';

export interface ACHFile {
  id: string;
  company_id: string;
  batch_id?: string;
  file_name: string;
  file_content?: string;
  file_hash?: string;
  status: ACHFileStatus;
  total_entries: number;
  total_credit_amount: number;
  total_debit_amount: number;
  effective_date: string;
  transmission_method?: TransmissionMethod;
  transmitted_at?: string;
  transmission_reference?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ACHFileEntry {
  id: string;
  ach_file_id: string;
  employee_id: string;
  employee_name: string;
  bank_routing_number: string;
  bank_account_number: string;
  account_type: AccountType;
  transaction_code: string;
  amount: number;
  trace_number?: string;
  addenda_record?: string;
  status: ACHEntryStatus;
  return_reason_code?: string;
  return_description?: string;
  created_at: string;
}

export interface BankingProfile {
  id: string;
  company_id: string;
  company_name: string;
  company_identification: string;
  originating_dfi_id: string;
  company_account_number: string;
  company_account_type: AccountType;
  transmission_method: TransmissionMethod;
  sftp_host?: string;
  sftp_username?: string;
  sftp_port?: number;
  sftp_directory?: string;
  api_endpoint?: string;
  api_key_hash?: string;
  processing_schedule: ProcessingSchedule;
  cutoff_time: string;
  is_test_mode: boolean;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ACHTransmissionLog {
  id: string;
  ach_file_id: string;
  company_id: string;
  transmission_method: TransmissionMethod;
  status: TransmissionStatus;
  response_code?: string;
  response_message?: string;
  response_data?: Record<string, any>;
  transmission_time: string;
  retry_count: number;
  next_retry_at?: string;
  performed_by?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface ACHAuditLog {
  id: string;
  company_id?: string;
  ach_file_id?: string;
  action_type: string;
  resource_type: string;
  resource_id?: string;
  action_details?: Record<string, any>;
  performed_by?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// NACHA File Structure Types
export interface NACHAFileHeader {
  recordTypeCode: '1';
  priorityCode: '01';
  immediateDestination: string; // Bank routing number
  immediateOrigin: string; // Company identification
  fileCreationDate: string; // YYMMDD
  fileCreationTime: string; // HHMM
  fileIdModifier: string; // A-Z
  recordSize: '094';
  blockingFactor: '10';
  formatCode: '1';
  immediateDestinationName: string;
  immediateOriginName: string;
  referenceCode: string;
}

export interface NACHABatchHeader {
  recordTypeCode: '5';
  serviceClassCode: string; // 200=Mixed, 220=Credits, 225=Debits
  companyName: string;
  companyDiscretionaryData: string;
  companyIdentification: string;
  standardEntryClassCode: 'PPD'; // Prearranged Payment and Deposit
  companyEntryDescription: string;
  companyDescriptiveDate: string;
  effectiveEntryDate: string; // YYMMDD
  settlementDate: string;
  originatorStatusCode: '1';
  originatingDFIIdentification: string;
  batchNumber: string;
}

export interface NACHAEntryDetail {
  recordTypeCode: '6';
  transactionCode: string; // 22=Checking Credit, 32=Savings Credit, etc.
  receivingDFIIdentification: string;
  checkDigit: string;
  dfiAccountNumber: string;
  amount: string; // 10 digits, no decimal
  individualIdentificationNumber: string;
  individualName: string;
  discretionaryData: string;
  addendaRecordIndicator: '0' | '1';
  traceNumber: string;
}

export interface NACHABatchControl {
  recordTypeCode: '8';
  serviceClassCode: string;
  entryAddendaCount: string;
  entryHash: string;
  totalDebitEntryDollarAmount: string;
  totalCreditEntryDollarAmount: string;
  companyIdentification: string;
  messageAuthenticationCode: string;
  reserved: string;
  originatingDFIIdentification: string;
  batchNumber: string;
}

export interface NACHAFileControl {
  recordTypeCode: '9';
  batchCount: string;
  blockCount: string;
  entryAddendaCount: string;
  entryHash: string;
  totalDebitEntryDollarAmountInFile: string;
  totalCreditEntryDollarAmountInFile: string;
  reserved: string;
}

// API Request/Response Types
export interface CreateACHFileRequest {
  batch_id: string;
  effective_date: string;
  transmission_method?: TransmissionMethod;
}

export interface CreateACHFileResponse {
  file_id: string;
  file_name: string;
  total_entries: number;
  total_amount: number;
  status: ACHFileStatus;
}

export interface TransmitACHFileRequest {
  file_id: string;
  force_retry?: boolean;
}

export interface TransmitACHFileResponse {
  transmission_id: string;
  status: TransmissionStatus;
  transmission_reference?: string;
  message?: string;
}

export interface BankingProfileRequest {
  company_name: string;
  company_identification: string;
  originating_dfi_id: string;
  company_account_number: string;
  company_account_type: AccountType;
  transmission_method: TransmissionMethod;
  processing_schedule: ProcessingSchedule;
  cutoff_time?: string;
  sftp_config?: {
    host: string;
    username: string;
    port?: number;
    directory?: string;
  };
  api_config?: {
    endpoint: string;
    api_key: string;
  };
  is_test_mode?: boolean;
}

export interface ACHValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalEntries: number;
    totalAmount: number;
    creditAmount: number;
    debitAmount: number;
  };
}

// Dashboard and UI Types
export interface ACHDashboardStats {
  totalFiles: number;
  pendingFiles: number;
  transmittedFiles: number;
  failedFiles: number;
  totalAmount: number;
  lastTransmission?: string;
}

export interface ACHFileListItem {
  id: string;
  file_name: string;
  status: ACHFileStatus;
  total_entries: number;
  total_amount: number;
  effective_date: string;
  created_at: string;
  transmitted_at?: string;
}

export interface TransmissionQueueItem {
  file_id: string;
  file_name: string;
  status: ACHFileStatus;
  retry_count: number;
  next_retry_at?: string;
  last_error?: string;
}