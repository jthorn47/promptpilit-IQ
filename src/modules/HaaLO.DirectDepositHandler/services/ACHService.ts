/**
 * ACH Service for Direct Deposit Handler Module
 * Note: Using mock data until database tables are created
 */

import type {
  ACHFile,
  CreateACHFileRequest,
  CreateACHFileResponse,
  TransmitACHFileRequest,
  TransmitACHFileResponse,
  ACHValidationResult,
  BankingProfile
} from '../types';

export class ACHService {
  /**
   * Create ACH file from payroll batch
   */
  static async createACHFile(request: CreateACHFileRequest): Promise<CreateACHFileResponse> {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const fileId = `ach_${Date.now()}`;
      const fileName = `ACH_${new Date().toISOString().split('T')[0]}_${fileId.slice(-3)}.txt`;

      return {
        file_id: fileId,
        file_name: fileName,
        total_entries: 42,
        total_amount: 98250.00,
        status: 'generated'
      };

    } catch (error) {
      console.error('Error creating ACH file:', error);
      throw error;
    }
  }

  /**
   * Transmit ACH file to bank
   */
  static async transmitACHFile(request: TransmitACHFileRequest): Promise<TransmitACHFileResponse> {
    try {
      // Simulate transmission time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock transmission result (90% success rate)
      const success = Math.random() > 0.1;
      
      return {
        transmission_id: `trans_${Date.now()}`,
        status: success ? 'success' : 'failed',
        transmission_reference: success ? `REF${Date.now()}` : undefined,
        message: success ? 'File transmitted successfully' : 'Connection timeout to bank server'
      };

    } catch (error) {
      console.error('Error transmitting ACH file:', error);
      throw error;
    }
  }

  /**
   * Validate ACH file before transmission
   */
  static async validateACHFile(fileId: string): Promise<ACHValidationResult> {
    try {
      // Simulate validation time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock validation result
      return {
        isValid: true,
        errors: [],
        warnings: ['File amount is large: $98,250.00'],
        summary: {
          totalEntries: 42,
          totalAmount: 98250.00,
          creditAmount: 98250.00,
          debitAmount: 0
        }
      };

    } catch (error) {
      console.error('Error validating ACH file:', error);
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        warnings: [],
        summary: {
          totalEntries: 0,
          totalAmount: 0,
          creditAmount: 0,
          debitAmount: 0
        }
      };
    }
  }

  /**
   * Get banking profiles for company
   */
  static async getBankingProfiles(companyId: string): Promise<BankingProfile[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock banking profiles
    return [
      {
        id: '1',
        company_id: companyId,
        company_name: 'ACME Corporation',
        company_identification: '123456789',
        originating_dfi_id: '091000019',
        company_account_number: '****1234',
        company_account_type: 'checking' as any,
        transmission_method: 'sftp' as any,
        processing_schedule: 'weekly' as any,
        cutoff_time: '15:00:00',
        is_test_mode: true,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  }

  /**
   * Download ACH file content
   */
  static async downloadACHFile(fileId: string): Promise<Blob> {
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockNachaContent = `101 091000019 1234567890240122100001094101BANK NAME              ACME CORPORATION       
5220ACME CORPORATION    PAYROLL           1234567890PPD PAYROLL   240126   1091000190000001
622091000019123456789012345600009825000EMP001              JOHN SMITH        1091000190000001
822000000010910000190000000000000098250001234567890                         091000190000001
9000001000001000000010910000190000000000000098250                                       `;
    
    return new Blob([mockNachaContent], { type: 'text/plain' });
  }

  /**
   * Validate routing number using checksum algorithm
   */
  private static validateRoutingNumber(routingNumber: string): boolean {
    if (!/^\d{9}$/.test(routingNumber)) return false;
    
    const digits = routingNumber.split('').map(Number);
    const checksum = (3 * (digits[0] + digits[3] + digits[6]) +
                     7 * (digits[1] + digits[4] + digits[7]) +
                     1 * (digits[2] + digits[5] + digits[8])) % 10;
    
    return checksum === 0;
  }

  /**
   * Generate unique ACH file name
   */
  private static generateACHFileName(companyId: string, effectiveDate: string): string {
    const date = new Date(effectiveDate);
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = Math.floor(Math.random() * 999) + 1;
    
    return `ACH_${dateStr}_${sequence.toString().padStart(3, '0')}.txt`;
  }

  /**
   * Generate trace number for ACH entry
   */
  private static generateTraceNumber(originatingDFI: string, employeeId: string): string {
    const dfi = originatingDFI.slice(0, 8);
    const sequence = employeeId.slice(-7).padStart(7, '0');
    return dfi + sequence;
  }

  /**
   * Generate file hash for integrity verification
   */
  private static async generateFileHash(content: string): Promise<string> {
    // Simple hash simulation - in real implementation use crypto.subtle.digest
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}