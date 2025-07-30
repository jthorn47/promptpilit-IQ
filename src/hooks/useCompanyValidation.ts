import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PotentialDuplicate {
  company_id: string;
  company_name: string;
  website: string | null;
  match_type: string;
  similarity_score: number;
  confidence: string;
}

export interface ValidationResult {
  isValid: boolean;
  duplicates: PotentialDuplicate[];
  normalizedName: string;
}

export const useCompanyValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [duplicates, setDuplicates] = useState<PotentialDuplicate[]>([]);
  const { toast } = useToast();

  const validateCompany = useCallback(async (
    companyName: string,
    website?: string
  ): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      const { data, error } = await supabase.rpc('find_potential_duplicate_companies', {
        p_company_name: companyName,
        p_domain: website || null,
        p_similarity_threshold: 0.85
      });

      if (error) {
        console.error('Error validating company:', error);
        toast({
          title: 'Validation Error',
          description: 'Unable to check for duplicate companies. Please try again.',
          variant: 'destructive',
        });
        return { isValid: true, duplicates: [], normalizedName: companyName };
      }

      const potentialDuplicates = data || [];
      setDuplicates(potentialDuplicates);

      // Normalize company name for display
      const { data: normalizedData, error: normalizeError } = await supabase.rpc('normalize_company_name', {
        company_name: companyName
      });

      const normalizedName = normalizeError ? companyName : normalizedData;

      return {
        isValid: potentialDuplicates.length === 0,
        duplicates: potentialDuplicates,
        normalizedName
      };
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Validation Error',
        description: 'An unexpected error occurred during validation.',
        variant: 'destructive',
      });
      return { isValid: true, duplicates: [], normalizedName: companyName };
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  const createCompanyWithAudit = useCallback(async (
    companyData: any,
    duplicateOverride: boolean = false
  ) => {
    try {
      // Get user info for audit
      const { data: { user } } = await supabase.auth.getUser();
      const userAgent = navigator.userAgent;
      
      // Create the company
      const { data: company, error: companyError } = await supabase
        .from('company_settings')
        .insert([companyData])
        .select()
        .single();

      if (companyError) throw companyError;

      // Get IP address (simplified - in production you'd use a service)
      const ipAddress = '127.0.0.1'; // This should be obtained from the client

      // Normalize the name for audit
      const { data: normalizedName } = await supabase.rpc('normalize_company_name', {
        company_name: companyData.company_name
      });

      // Log the creation
      const { error: auditError } = await supabase.rpc('log_company_creation', {
        p_company_id: company.id,
        p_created_by: user?.id,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_normalized_name: normalizedName || companyData.company_name,
        p_potential_duplicates: JSON.stringify(duplicates),
        p_duplicate_override: duplicateOverride,
        p_metadata: JSON.stringify({
          creation_method: 'manual',
          user_email: user?.email,
          timestamp: new Date().toISOString()
        })
      });

      if (auditError) {
        console.error('Audit logging error:', auditError);
        // Don't fail the creation, just log the error
      }

      return { data: company, error: null };
    } catch (error) {
      console.error('Company creation error:', error);
      return { data: null, error };
    }
  }, [duplicates]);

  const clearDuplicates = useCallback(() => {
    setDuplicates([]);
  }, []);

  return {
    validateCompany,
    createCompanyWithAudit,
    clearDuplicates,
    isValidating,
    duplicates
  };
};