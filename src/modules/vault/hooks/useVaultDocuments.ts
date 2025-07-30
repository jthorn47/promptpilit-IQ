import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VaultDocument {
  id: string;
  company_id: string;
  document_type: string;
  title: string;
  description?: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  document_date: string;
  tags?: string[];
  metadata: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
  preview_url?: string;
  thumbnail_url?: string;
}

export const useVaultDocuments = () => {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin, isSuperAdmin, isCompanyAdmin } = useAuth();

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('halovault_documents')
        .select('*')
        .order('created_at', { ascending: false });

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

      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('halovault_documents')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Refresh the documents list
      await loadDocuments();
      return true;
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      return false;
    }
  };

  useEffect(() => {
    if (user && (isAdmin || isSuperAdmin)) {
      loadDocuments();
    }
  }, [user, isAdmin, isSuperAdmin]);

  return {
    documents,
    loading,
    error,
    refetch: loadDocuments,
    deleteDocument,
    canManage: isAdmin || isSuperAdmin,
    canUpload: isAdmin || isSuperAdmin
  };
};