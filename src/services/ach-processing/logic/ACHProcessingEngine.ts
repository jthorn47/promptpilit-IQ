import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface ACHBatch {
  id: string;
  name: string;
  type: 'Payroll' | 'Benefits' | 'Tax' | 'Vendor';
  status: 'draft' | 'ready' | 'processing' | 'completed' | 'failed';
  entries: number;
  totalAmount: number;
  effectiveDate: string;
  createdAt: string;
  scheduledDate?: string;
}

export interface ACHEntry {
  id: string;
  batchId: string;
  employeeId?: string;
  vendorId?: string;
  amount: number;
  accountNumber: string;
  routingNumber: string;
  transactionType: 'debit' | 'credit';
  description: string;
}

export interface ACHValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Core ACH Processing Engine
 * Handles batch creation, validation, and processing logic
 */
export class ACHProcessingEngine {
  
  /**
   * Create a new ACH batch
   */
  async createBatch(batchData: {
    name: string;
    type: ACHBatch['type'];
    effectiveDate: string;
    companyId: string;
  }): Promise<ACHBatch> {
    logger.info('Creating ACH batch', batchData);

    try {
      // Create batch record in database
      const { data: batch, error } = await supabase
        .from('disbursement_batches')
        .insert({
          company_id: batchData.companyId,
          disbursement_type: batchData.type.toLowerCase(),
          method: 'ACH',
          scheduled_date: batchData.effectiveDate,
          status: 'draft'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create ACH batch: ${error.message}`);
      }

      const achBatch: ACHBatch = {
        id: batch.id,
        name: batchData.name,
        type: batchData.type,
        status: 'draft',
        entries: 0,
        totalAmount: 0,
        effectiveDate: batchData.effectiveDate,
        createdAt: batch.created_at
      };

      logger.info('ACH batch created successfully', { batchId: achBatch.id });
      return achBatch;

    } catch (error) {
      logger.error('Failed to create ACH batch', error);
      throw error;
    }
  }

  /**
   * Validate ACH batch before processing
   */
  async validateBatch(batchId: string): Promise<ACHValidationResult> {
    logger.info('Validating ACH batch', { batchId });

    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Get batch data
      const { data: batch, error: batchError } = await supabase
        .from('disbursement_batches')
        .select('*')
        .eq('id', batchId)
        .single();

      if (batchError || !batch) {
        errors.push('Batch not found');
        return { isValid: false, errors, warnings };
      }

      // Get batch entries
      const { data: entries, error: entriesError } = await supabase
        .from('disbursement_instructions')
        .select('*')
        .eq('batch_id', batchId);

      if (entriesError) {
        errors.push('Failed to load batch entries');
        return { isValid: false, errors, warnings };
      }

      // Validation rules
      if (!entries || entries.length === 0) {
        errors.push('Batch contains no entries');
      }

      if (entries && entries.length > 10000) {
        warnings.push('Batch contains more than 10,000 entries - consider splitting');
      }

      // Validate individual entries
      if (entries) {
        for (const entry of entries) {
          // Using actual disbursement_instructions schema
          if (!entry.reference_code || entry.reference_code.length === 0) {
            errors.push(`Missing reference code for entry ${entry.id}`);
          }

          if (!entry.amount || entry.amount <= 0) {
            errors.push(`Invalid amount for entry ${entry.id}`);
          }

          if (entry.amount && entry.amount > 1000000) {
            warnings.push(`Large amount (>${entry.amount.toLocaleString()}) for entry ${entry.id}`);
          }

          if (!entry.recipient_id || entry.recipient_id.length === 0) {
            errors.push(`Missing recipient ID for entry ${entry.id}`);
          }
        }
      }

      // Check effective date
      const effectiveDate = new Date(batch.scheduled_date);
      const today = new Date();
      const maxFutureDate = new Date();
      maxFutureDate.setDate(today.getDate() + 30);

      if (effectiveDate < today) {
        errors.push('Effective date cannot be in the past');
      }

      if (effectiveDate > maxFutureDate) {
        warnings.push('Effective date is more than 30 days in the future');
      }

      const isValid = errors.length === 0;

      logger.info('ACH batch validation completed', {
        batchId,
        isValid,
        errorCount: errors.length,
        warningCount: warnings.length
      });

      return { isValid, errors, warnings };

    } catch (error) {
      logger.error('ACH batch validation failed', error);
      errors.push('Validation process failed');
      return { isValid: false, errors, warnings };
    }
  }

  /**
   * Process ACH batch
   */
  async processBatch(batchId: string): Promise<void> {
    logger.info('Processing ACH batch', { batchId });

    try {
      // Validate batch first
      const validation = await this.validateBatch(batchId);
      if (!validation.isValid) {
        throw new Error(`Batch validation failed: ${validation.errors.join(', ')}`);
      }

      // Update batch status to processing
      const { error: updateError } = await supabase
        .from('disbursement_batches')
        .update({
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', batchId);

      if (updateError) {
        throw new Error(`Failed to update batch status: ${updateError.message}`);
      }

      // Generate NACHA file (placeholder for now)
      await this.generateNACHAFile(batchId);

      // Update batch status to completed
      const { error: completeError } = await supabase
        .from('disbursement_batches')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', batchId);

      if (completeError) {
        throw new Error(`Failed to complete batch: ${completeError.message}`);
      }

      logger.info('ACH batch processed successfully', { batchId });

    } catch (error) {
      logger.error('ACH batch processing failed', error, { batchId });
      
      // Update batch status to failed
      await supabase
        .from('disbursement_batches')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', batchId);

      throw error;
    }
  }

  /**
   * Generate NACHA file for batch
   */
  private async generateNACHAFile(batchId: string): Promise<string> {
    logger.info('Generating NACHA file', { batchId });

    // This is a placeholder - actual NACHA file generation would be more complex
    // and would involve formatting according to NACHA specifications
    
    try {
      // Get batch and entries data
      const { data: batch, error: batchError } = await supabase
        .from('disbursement_batches')
        .select('*')
        .eq('id', batchId)
        .single();

      if (batchError || !batch) {
        throw new Error('Failed to load batch data');
      }

      const { data: entries, error: entriesError } = await supabase
        .from('disbursement_instructions')
        .select('*')
        .eq('batch_id', batchId);

      if (entriesError) {
        throw new Error('Failed to load batch entries');
      }

      // Generate file content (simplified NACHA format)
      const fileContent = this.formatNACHAFile(batch, entries || []);
      
      // In a real implementation, you would save this file or transmit it to the bank
      logger.info('NACHA file generated successfully', { 
        batchId, 
        entryCount: entries?.length || 0,
        fileSize: fileContent.length 
      });

      return fileContent;

    } catch (error) {
      logger.error('NACHA file generation failed', error);
      throw error;
    }
  }

  /**
   * Format data into NACHA file format
   */
  private formatNACHAFile(batch: any, entries: any[]): string {
    // This is a simplified NACHA format - real implementation would be much more detailed
    const lines: string[] = [];
    
    // File Header Record (Type 1)
    lines.push('1011234567890123456789COMPANY NAME           BANK NAME              240115A094101');
    
    // Batch Header Record (Type 5)
    lines.push('5220COMPANY NAME                    1234567890PPDPAYROLL         240115   1234567890000001');
    
    // Entry Detail Records (Type 6)
    entries.forEach((entry, index) => {
      const line = `6${entry.transaction_type === 'credit' ? '22' : '27'}${entry.routing_number}${entry.account_number.padEnd(17)}${Math.abs(entry.amount * 100).toString().padStart(10, '0')}${entry.employee_id || ''}${entry.description.padEnd(10)}${(index + 1).toString().padStart(15, '0')}`;
      lines.push(line);
    });
    
    // Batch Control Record (Type 8)
    const totalAmount = entries.reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
    lines.push(`8220${entries.length.toString().padStart(6, '0')}000000000000${(totalAmount * 100).toString().padStart(12, '0')}000000000000000000001234567890000001`);
    
    // File Control Record (Type 9)
    lines.push(`9000001000001${entries.length.toString().padStart(8, '0')}000000000000${(totalAmount * 100).toString().padStart(12, '0')}000000000000000000${''.padEnd(39)}`);
    
    return lines.join('\n');
  }

  /**
   * Get batch status
   */
  async getBatchStatus(batchId: string): Promise<ACHBatch | null> {
    try {
      const { data: batch, error } = await supabase
        .from('disbursement_batches')
        .select(`
          *,
          disbursement_instructions(count)
        `)
        .eq('id', batchId)
        .single();

      if (error || !batch) {
        return null;
      }

      return {
        id: batch.id,
        name: batch.disbursement_type || 'Unknown',
        type: batch.disbursement_type as ACHBatch['type'],
        status: batch.status as ACHBatch['status'],
        entries: batch.disbursement_instructions?.[0]?.count || 0,
        totalAmount: batch.funding_required || 0,
        effectiveDate: batch.scheduled_date,
        createdAt: batch.created_at,
        scheduledDate: batch.scheduled_date
      };

    } catch (error) {
      logger.error('Failed to get batch status', error);
      return null;
    }
  }
}