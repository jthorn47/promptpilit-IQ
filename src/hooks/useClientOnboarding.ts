import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type OnboardingProfile = Database['public']['Tables']['client_onboarding_profiles']['Row'];
type ClientDocument = Database['public']['Tables']['client_documents']['Row'];

interface OnboardingProfileWithDocuments extends OnboardingProfile {
  documents?: ClientDocument[];
}

export const useClientOnboarding = () => {
  const [profiles, setProfiles] = useState<OnboardingProfileWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOnboardingProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_onboarding_profiles')
        .select(`
          *,
          client_documents (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching onboarding profiles:', err);
      setError('Failed to load onboarding profiles');
      toast({
        title: "Error",
        description: "Failed to load onboarding profiles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getProfileById = async (id: string): Promise<OnboardingProfileWithDocuments | null> => {
    try {
      const { data, error } = await supabase
        .from('client_onboarding_profiles')
        .select(`
          *,
          client_documents (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching onboarding profile:', err);
      return null;
    }
  };

  const updateProfile = async (id: string, updates: Partial<OnboardingProfile>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('client_onboarding_profiles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Onboarding profile has been successfully updated."
      });

      // Refresh profiles
      fetchOnboardingProfiles();
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: "Error",
        description: "Failed to update onboarding profile",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteProfile = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('client_onboarding_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Profile Deleted",
        description: "Onboarding profile has been successfully deleted."
      });

      // Refresh profiles
      fetchOnboardingProfiles();
      return true;
    } catch (err) {
      console.error('Error deleting profile:', err);
      toast({
        title: "Error",
        description: "Failed to delete onboarding profile",
        variant: "destructive"
      });
      return false;
    }
  };

  const uploadDocument = async (
    clientId: string,
    onboardingProfileId: string,
    documentType: string,
    serviceType: string,
    file: File
  ): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${clientId}/${serviceType}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document reference to database
      const { error: dbError } = await supabase
        .from('client_documents')
        .insert({
          client_id: clientId,
          onboarding_profile_id: onboardingProfileId,
          document_type: documentType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          service_type: serviceType,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      return filePath;
    } catch (err) {
      console.error('Error uploading document:', err);
      throw err;
    }
  };

  const getDocumentUrl = async (filePath: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from('client-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      return data?.signedUrl || null;
    } catch (err) {
      console.error('Error getting document URL:', err);
      return null;
    }
  };

  const exportProfileToCSV = (profile: OnboardingProfileWithDocuments): string => {
    const csvData: string[] = [];
    
    // Add headers
    csvData.push('Field,Value');
    
    // Add universal fields
    csvData.push(`Company Name,"${profile.company_name}"`);
    csvData.push(`DBA Name,"${profile.dba_name || 'N/A'}"`);
    csvData.push(`FEIN,"${profile.fein || 'N/A'}"`);
    csvData.push(`Entity Type,"${profile.entity_type || 'N/A'}"`);
    csvData.push(`Industry Type,"${profile.industry_type || 'N/A'}"`);
    csvData.push(`Number of Employees,"${profile.number_of_employees || 'N/A'}"`);
    csvData.push(`Service Types,"${profile.service_types?.join(', ') || 'N/A'}"`);
    csvData.push(`Client Status,"${profile.client_status}"`);
    csvData.push(`Service Start Date,"${profile.service_start_date || 'N/A'}"`);
    
    // Add service-specific data
    if (profile.service_types?.includes('PEO') && profile.peo_data) {
      csvData.push('--- PEO Data ---,');
      Object.entries(profile.peo_data).forEach(([key, value]) => {
        csvData.push(`PEO ${key},"${JSON.stringify(value)}"`);
      });
    }
    
    if (profile.service_types?.includes('ASO') && profile.aso_data) {
      csvData.push('--- ASO Data ---,');
      Object.entries(profile.aso_data).forEach(([key, value]) => {
        csvData.push(`ASO ${key},"${JSON.stringify(value)}"`);
      });
    }
    
    // Add similar sections for other service types...
    
    return csvData.join('\n');
  };

  useEffect(() => {
    fetchOnboardingProfiles();
  }, []);

  return {
    profiles,
    loading,
    error,
    fetchOnboardingProfiles,
    getProfileById,
    updateProfile,
    deleteProfile,
    uploadDocument,
    getDocumentUrl,
    exportProfileToCSV
  };
};