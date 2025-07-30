import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { supabase } from '@/integrations/supabase/client';

export type CompanyContactInput = {
  id?: string;
  company_id: string; // Required for inserts
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  is_primary?: boolean;
  status?: string;
  notes?: string;
};

export type CompanyContactUpdateInput = Omit<Partial<CompanyContactInput>, 'id'> & {
  id: string; // Required for updates
};

/**
 * Hook for creating or updating company contacts
 */
export function useCompanyContactMutation() {
  const createContact = useSupabaseMutation(async (contact: CompanyContactInput) => {
    // Ensure company_id is not undefined for inserts
    if (!contact.company_id) {
      throw new Error('Company ID is required for new contacts');
    }
    
    return supabase
      .from('company_contacts')
      .insert(contact)
      .select('*')
      .single();
  });

  const updateContact = useSupabaseMutation(async (contact: CompanyContactUpdateInput) => {
    const { id, ...updateData } = contact;

    return supabase
      .from('company_contacts')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
  });

  const setAsPrimary = useSupabaseMutation(async ({ 
    contactId, 
    companyId 
  }: { 
    contactId: string; 
    companyId: string 
  }) => {
    // First, set all contacts for this company as non-primary
    await supabase
      .from('company_contacts')
      .update({ is_primary: false })
      .eq('company_id', companyId);

    // Then set the selected contact as primary
    return supabase
      .from('company_contacts')
      .update({ is_primary: true })
      .eq('id', contactId)
      .select('*')
      .single();
  });

  const deleteContact = useSupabaseMutation(async (contactId: string) => {
    return supabase
      .from('company_contacts')
      .delete()
      .eq('id', contactId);
  });

  return {
    createContact,
    updateContact,
    setAsPrimary,
    deleteContact
  };
}