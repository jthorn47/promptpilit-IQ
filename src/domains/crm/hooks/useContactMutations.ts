import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  title?: string;
  department?: string;
  company_id: string;
  is_primary_contact?: boolean;
  notes?: string;
}

export function useContactMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createContact = useSupabaseMutation(
    async (contactData: ContactFormData) => {
      return await supabase
        .from('crm_contacts')
        .insert([contactData])
        .select()
        .single();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['global-contacts'] });
        queryClient.invalidateQueries({ queryKey: ['contact-filter-options'] });
        toast({
          title: "Success",
          description: "Contact created successfully",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create contact",
          variant: "destructive",
        });
      }
    }
  );

  const updateContact = useSupabaseMutation(
    async ({ id, data }: { id: string; data: Partial<ContactFormData> }) => {
      return await supabase
        .from('crm_contacts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['global-contacts'] });
        queryClient.invalidateQueries({ queryKey: ['contact-profile'] });
        toast({
          title: "Success",
          description: "Contact updated successfully",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update contact",
          variant: "destructive",
        });
      }
    }
  );

  const deleteContact = useSupabaseMutation(
    async (contactId: string) => {
      return await supabase
        .from('crm_contacts')
        .delete()
        .eq('id', contactId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['global-contacts'] });
        queryClient.invalidateQueries({ queryKey: ['contact-filter-options'] });
        toast({
          title: "Success",
          description: "Contact deleted successfully",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to delete contact",
          variant: "destructive",
        });
      }
    }
  );

  return {
    createContact,
    updateContact,
    deleteContact
  };
}