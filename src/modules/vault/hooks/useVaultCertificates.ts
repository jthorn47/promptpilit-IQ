import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VaultCertificate {
  id: string;
  certificate_number: string;
  employee_id: string;
  course_title?: string;
  learner_name?: string;
  instructor_name?: string;
  score?: number;
  completion_date?: string;
  issued_at: string;
  expires_at?: string;
  status?: string;
  pdf_url?: string;
  company_id?: string;
}

export const useVaultCertificates = () => {
  const [certificates, setCertificates] = useState<VaultCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin, isSuperAdmin, isCompanyAdmin } = useAuth();

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('certificates')
        .select('*')
        .order('completion_date', { ascending: false });

      // Apply role-based filtering
      if (!isSuperAdmin && isCompanyAdmin) {
        // Filter by company_id for company admins
        const userCompanyId = user.user_metadata?.company_id;
        if (userCompanyId) {
          query = query.eq('company_id', userCompanyId);
        }
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw supabaseError;
      }

      setCertificates(data || []);
    } catch (err) {
      console.error('Error loading certificates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (isAdmin || isSuperAdmin)) {
      loadCertificates();
    }
  }, [user, isAdmin, isSuperAdmin]);

  return {
    certificates,
    loading,
    error,
    refetch: loadCertificates,
    canManage: isAdmin || isSuperAdmin
  };
};