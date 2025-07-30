import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CaseDocument {
  id: string;
  case_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  uploaded_by: string;
  uploaded_at: string;
  status: string;
  is_confidential: boolean;
  description?: string;
  tags?: string[];
  metadata: any;
}

export const useCaseDocuments = () => {
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('case_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    file: File,
    caseId: string,
    documentType: string,
    isConfidential: boolean = false,
    description?: string
  ): Promise<CaseDocument | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${caseId}/${Date.now()}-${file.name}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('case-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create document record
      const documentData = {
        case_id: caseId,
        file_name: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        document_type: documentType,
        uploaded_by: user.id,
        is_confidential: isConfidential,
        description,
        status: 'verified'
      };

      const { data, error } = await supabase
        .from('case_documents')
        .insert(documentData)
        .select()
        .single();

      if (error) throw error;

      setDocuments(prev => [data, ...prev]);
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      return data;
    } catch (err: any) {
      console.error('Error uploading document:', err);
      toast({
        title: "Error",
        description: `Failed to upload document: ${err.message}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const downloadDocument = async (document: CaseDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('case-documents')
        .download(document.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = globalThis.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      globalThis.document.body.appendChild(a);
      a.click();
      globalThis.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (err: any) {
      console.error('Error downloading document:', err);
      toast({
        title: "Error",
        description: `Failed to download document: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const viewDocument = async (document: CaseDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('case-documents')
        .createSignedUrl(document.file_path, 3600); // 1 hour expiry

      if (error) throw error;

      // Open in new tab
      window.open(data.signedUrl, '_blank');
    } catch (err: any) {
      console.error('Error viewing document:', err);
      toast({
        title: "Error",
        description: `Failed to view document: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) throw new Error('Document not found');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('case-documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error } = await supabase
        .from('case_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(d => d.id !== documentId));
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (err: any) {
      console.error('Error deleting document:', err);
      toast({
        title: "Error",
        description: `Failed to delete document: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  return {
    documents,
    loading,
    error,
    uploadDocument,
    downloadDocument,
    viewDocument,
    deleteDocument,
    refresh: fetchDocuments
  };
};