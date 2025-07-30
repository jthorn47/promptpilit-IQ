import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Client = Database['public']['Tables']['clients']['Row'];

export const useClients = () => {
  const [companies, setCompanies] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      setCompanies(clientsData || []);
      setHasMore(false); // No pagination for now
    } catch (error: any) {
      console.error("Error fetching clients:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createCompany = async (formData: any) => {
    try {
      // Check for duplicates first
      const { data: duplicateCheck, error: dupError } = await supabase
        .rpc('check_duplicate_company_client', {
          p_company_name: formData.company_name,
          p_email: formData.email || null
        });

      if (dupError) {
        console.error("Error checking duplicates:", dupError);
      } else if (duplicateCheck && typeof duplicateCheck === 'object' && 'has_duplicates' in duplicateCheck && duplicateCheck.has_duplicates) {
        const recommendation = 'recommendation' in duplicateCheck ? duplicateCheck.recommendation : 'Please review existing records';
        toast({
          title: "Duplicate Found",
          description: `This company already exists. ${recommendation}`,
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase
        .from('clients')
        .insert([{
          company_name: formData.company_name,
          source: 'Manual Deal', // Manual client creation
          contract_value: formData.contract_value || 50000,
          currency: formData.currency || 'USD',
          status: 'active',
          onboarding_status: 'pending',
          date_won: new Date().toISOString().split('T')[0],
          notes: formData.notes || `Client created manually`,
          account_manager: formData.account_manager || null,
          primary_contact_phone: formData.primary_contact_phone || null,
          plan_type: formData.plan_type || 'basic',
          services_purchased: formData.services_purchased || ['LMS'],
          key_contacts: formData.key_contacts || null,
          company_address_street: formData.address || null,
          company_address_city: formData.city || null,
          company_address_state: formData.state || null,
          company_address_zip: formData.postal_code || null
        }])
        .select()
        .single();

      if (error) throw error;

      setCompanies(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      return true;
    } catch (error: any) {
      console.error("Error creating client:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCompany = async (id: string, formData: any) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCompanies(prev => prev.map(c => c.id === id ? data : c));
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      return true;
    } catch (error: any) {
      console.error("Error updating client:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCompanies(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      return true;
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const loadMore = () => {
    // No pagination implemented yet
  };

  return {
    companies,
    loading,
    error,
    hasMore,
    createCompany,
    updateCompany,
    deleteCompany,
    loadMore,
    refetch: fetchClients
  };
};