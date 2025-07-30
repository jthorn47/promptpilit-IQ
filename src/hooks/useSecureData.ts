import { useState, useCallback } from 'react';
import { useSecurity } from '@/contexts/SecurityContext';
import { supabase } from '@/integrations/supabase/client';

interface SecureDataOptions {
  tableName: string;
  sensitiveFields?: string[];
  requiresAuditLog?: boolean;
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
}

export const useSecureData = (options: SecureDataOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { encryptSensitiveField, logSecurityEvent, checkDataAccess } = useSecurity();

  const secureInsert = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check data access permissions
      const canInsert = await checkDataAccess(options.tableName, 'insert');
      if (!canInsert) {
        throw new Error('Insufficient permissions to insert data');
      }

      // Encrypt sensitive fields
      const encryptedData = { ...data };
      if (options.sensitiveFields) {
        for (const field of options.sensitiveFields) {
          if (encryptedData[field]) {
            encryptedData[field] = await encryptSensitiveField(field, encryptedData[field]);
          }
        }
      }

      // Insert data
      const { data: result, error: insertError } = await (supabase as any)
        .from(options.tableName)
        .insert(encryptedData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Log audit trail if required
      if (options.requiresAuditLog) {
        await logSecurityEvent({
          event_type: 'data_insert',
          resource_type: options.tableName,
          description: `New record created in ${options.tableName}`,
          risk_level: options.dataClassification === 'restricted' ? 'high' : 'low',
          metadata: {
            record_id: result.id,
            data_classification: options.dataClassification,
            sensitive_fields: options.sensitiveFields
          }
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      await logSecurityEvent({
        event_type: 'data_insert_failed',
        resource_type: options.tableName,
        description: `Failed to insert data: ${errorMessage}`,
        risk_level: 'medium',
        metadata: { error: errorMessage }
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options, encryptSensitiveField, logSecurityEvent, checkDataAccess]);

  const secureUpdate = useCallback(async (id: string, data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check data access permissions
      const canUpdate = await checkDataAccess(options.tableName, 'update');
      if (!canUpdate) {
        throw new Error('Insufficient permissions to update data');
      }

      // Get original data for audit trail
      const { data: originalData } = await (supabase as any)
        .from(options.tableName)
        .select('*')
        .eq('id', id)
        .single();

      // Encrypt sensitive fields
      const encryptedData = { ...data };
      if (options.sensitiveFields) {
        for (const field of options.sensitiveFields) {
          if (encryptedData[field]) {
            encryptedData[field] = await encryptSensitiveField(field, encryptedData[field]);
          }
        }
      }

      // Update data
      const { data: result, error: updateError } = await (supabase as any)
        .from(options.tableName)
        .update(encryptedData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Log audit trail if required
      if (options.requiresAuditLog) {
        await logSecurityEvent({
          event_type: 'data_update',
          resource_type: options.tableName,
          description: `Record updated in ${options.tableName}`,
          risk_level: options.dataClassification === 'restricted' ? 'high' : 'low',
          metadata: {
            record_id: id,
            data_classification: options.dataClassification,
            sensitive_fields: options.sensitiveFields,
            changes: Object.keys(data)
          }
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      await logSecurityEvent({
        event_type: 'data_update_failed',
        resource_type: options.tableName,
        description: `Failed to update data: ${errorMessage}`,
        risk_level: 'medium',
        metadata: { error: errorMessage, record_id: id }
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options, encryptSensitiveField, logSecurityEvent, checkDataAccess]);

  const secureDelete = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check data access permissions
      const canDelete = await checkDataAccess(options.tableName, 'delete');
      if (!canDelete) {
        throw new Error('Insufficient permissions to delete data');
      }

      // Get original data for audit trail
      const { data: originalData } = await (supabase as any)
        .from(options.tableName)
        .select('*')
        .eq('id', id)
        .single();

      // Delete data
      const { error: deleteError } = await (supabase as any)
        .from(options.tableName)
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Log audit trail if required
      if (options.requiresAuditLog) {
        await logSecurityEvent({
          event_type: 'data_delete',
          resource_type: options.tableName,
          description: `Record deleted from ${options.tableName}`,
          risk_level: options.dataClassification === 'restricted' ? 'high' : 'medium',
          metadata: {
            record_id: id,
            data_classification: options.dataClassification,
            deleted_data: originalData
          }
        });
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      await logSecurityEvent({
        event_type: 'data_delete_failed',
        resource_type: options.tableName,
        description: `Failed to delete data: ${errorMessage}`,
        risk_level: 'medium',
        metadata: { error: errorMessage, record_id: id }
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options, logSecurityEvent, checkDataAccess]);

  return {
    secureInsert,
    secureUpdate,
    secureDelete,
    isLoading,
    error
  };
};