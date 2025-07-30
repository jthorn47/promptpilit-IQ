import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientPayConfiguration {
  id?: string;
  client_id: string;
  pay_frequency: 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly';
  pay_group_ids: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface PayGroup {
  id: string;
  name: string;
  description?: string;
  company_id?: string;
  is_active: boolean;
  pay_frequency?: 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly';
  next_pay_date?: string;
  pay_calendar_config?: any;
  default_cost_center?: string;
  employee_count?: number;
}

interface PayGroupFormData {
  name: string;
  description?: string;
  pay_frequency: 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly';
  default_cost_center?: string;
  pay_calendar_config?: any;
}

// Legacy interface for backward compatibility
interface ClientPayrollSettings {
  id?: string;
  client_id: string;
  pay_frequency?: 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly';
  pay_group_id?: string;
  direct_deposit_required?: boolean;
  pay_stub_delivery_method?: 'email' | 'print' | 'portal' | 'both';
}

// Legacy hook for backward compatibility - maps to new structure
export const useClientPayrollSettings = (clientId: string) => {
  const { data: configurations, isLoading, error } = useClientPayConfigurations(clientId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Convert new structure to legacy format for compatibility
  const legacyData = configurations?.[0] ? {
    client_id: clientId,
    pay_frequency: configurations[0].pay_frequency,
    pay_group_id: configurations[0].pay_group_ids?.[0],
    direct_deposit_required: false,
    pay_stub_delivery_method: 'email' as const
  } : {
    client_id: clientId,
    pay_frequency: 'bi_weekly' as const,
    direct_deposit_required: false,
    pay_stub_delivery_method: 'email' as const
  };

  const updateSettings = async (updates: Partial<ClientPayrollSettings>) => {
    try {
      if (configurations?.[0]) {
        // Update existing configuration
        const currentConfig = configurations[0];
        const { data: user } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('client_pay_configurations')
          .update({
            pay_frequency: updates.pay_frequency || currentConfig.pay_frequency,
            pay_group_ids: updates.pay_group_id ? [updates.pay_group_id] : currentConfig.pay_group_ids,
            updated_by: user.user?.id
          })
          .eq('id', currentConfig.id);
        
        if (error) throw error;
      } else {
        // Create new configuration
        const { data: user } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('client_pay_configurations')
          .insert({
            client_id: clientId,
            pay_frequency: updates.pay_frequency || 'bi_weekly',
            pay_group_ids: updates.pay_group_id ? [updates.pay_group_id] : [],
            created_by: user.user?.id,
            updated_by: user.user?.id
          });
        
        if (error) throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ['client-pay-configurations', clientId] });
      toast({
        title: "Settings Updated",
        description: "Payroll settings have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update payroll settings.",
        variant: "destructive",
      });
    }
  };

  return {
    data: legacyData,
    isLoading,
    error,
    updateSettings,
    isUpdating: false
  };
};

// Hook for managing client pay configurations (multiple pay cycles)
export const useClientPayConfigurations = (clientId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching pay configurations
  const query = useQuery({
    queryKey: ['client-pay-configurations', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_pay_configurations')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('pay_frequency');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId
  });

  // Add new pay configuration
  const addConfiguration = useMutation({
    mutationFn: async (config: Omit<ClientPayConfiguration, 'id' | 'client_id'>) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('client_pay_configurations')
        .insert({
          ...config,
          client_id: clientId,
          created_by: user.user?.id,
          updated_by: user.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-pay-configurations', clientId] });
      toast({
        title: "Configuration Added",
        description: "Pay configuration has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add pay configuration.",
        variant: "destructive",
      });
    }
  });

  // Update pay configuration
  const updateConfiguration = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClientPayConfiguration> & { id: string }) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('client_pay_configurations')
        .update({
          ...updates,
          updated_by: user.user?.id
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-pay-configurations', clientId] });
      toast({
        title: "Configuration Updated",
        description: "Pay configuration has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pay configuration.",
        variant: "destructive",
      });
    }
  });

  // Delete pay configuration
  const deleteConfiguration = useMutation({
    mutationFn: async (configId: string) => {
      const { error } = await supabase
        .from('client_pay_configurations')
        .update({ is_active: false })
        .eq('id', configId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-pay-configurations', clientId] });
      toast({
        title: "Configuration Deleted",
        description: "Pay configuration has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pay configuration.",
        variant: "destructive",
      });
    }
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    addConfiguration: addConfiguration.mutate,
    updateConfiguration: updateConfiguration.mutate,
    deleteConfiguration: deleteConfiguration.mutate,
    isAdding: addConfiguration.isPending,
    isUpdating: updateConfiguration.isPending,
    isDeleting: deleteConfiguration.isPending
  };
};

// Enhanced Pay Groups hook with metadata and management capabilities
export const usePayGroups = (clientId?: string, payFrequency?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching pay groups with employee count - simplified to avoid dependency chains
  const query = useQuery({
    queryKey: ['pay-groups', clientId, payFrequency],
    queryFn: async () => {
      if (!clientId) return [];
      
      // Get company_settings_id from client first
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('company_settings_id')
        .eq('id', clientId)
        .single();
      
      if (clientError || !clientData?.company_settings_id) {
        console.log('No company settings found for client:', clientId);
        return [];
      }
      
      const companySettingsId = clientData.company_settings_id;
      console.log('Fetching pay groups for company_settings_id:', companySettingsId, 'with frequency filter:', payFrequency);
      
      let queryBuilder = supabase
        .from('pay_groups')
        .select('*')
        .eq('is_active', true)
        .eq('company_id', companySettingsId);
      
      if (payFrequency) {
        queryBuilder = queryBuilder.eq('pay_frequency', payFrequency);
      }
      
      const { data, error } = await queryBuilder.order('name');
      
      console.log('Pay groups query result:', { data, error });
      
      if (error) throw error;
      
      // Fetch employee counts separately for each pay group
      const payGroupsWithCounts = await Promise.all(
        (data || []).map(async (payGroup) => {
          const { data: countData, error: countError } = await supabase
            .rpc('get_pay_group_employee_count_v2', { p_pay_group_id: payGroup.id });
          
          return {
            ...payGroup,
            employee_count: countError ? 0 : (countData || 0)
          };
        })
      );
      
      return payGroupsWithCounts;
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get company settings ID for mutations
  const getCompanySettingsId = async () => {
    if (!clientId) throw new Error('Client ID is required');
    
    const { data, error } = await supabase
      .from('clients')
      .select('company_settings_id')
      .eq('id', clientId)
      .single();
    
    if (error || !data?.company_settings_id) {
      throw new Error('Company settings ID not found');
    }
    
    return data.company_settings_id;
  };

  // Create pay group
  const createPayGroup = useMutation({
    mutationFn: async (payGroupData: PayGroupFormData) => {
      const companySettingsId = await getCompanySettingsId();
      
      const { data: user } = await supabase.auth.getUser();
      console.log('Creating pay group with data:', payGroupData, 'for company_settings_id:', companySettingsId);
      
      const { data, error } = await supabase
        .from('pay_groups')
        .insert({
          ...payGroupData,
          company_id: companySettingsId,
          created_by: user.user?.id,
          next_pay_date: null
        })
        .select()
        .single();
      
      console.log('Create pay group result:', { data, error });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-groups', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-pay-configurations'] });
      toast({
        title: "Pay Group Created",
        description: "Pay group has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create pay group.",
        variant: "destructive",
      });
    }
  });

  // Update pay group
  const updatePayGroup = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PayGroupFormData> & { id: string }) => {
      const { data, error } = await supabase
        .from('pay_groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-groups', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-pay-configurations'] });
      toast({
        title: "Pay Group Updated",
        description: "Pay group has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pay group.",
        variant: "destructive",
      });
    }
  });

  // Delete pay group (soft delete)
  const deletePayGroup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pay_groups')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-groups', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-pay-configurations'] });
      toast({
        title: "Pay Group Deleted",
        description: "Pay group has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pay group.",
        variant: "destructive",
      });
    }
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createPayGroup: createPayGroup.mutate,
    updatePayGroup: updatePayGroup.mutate,
    deletePayGroup: deletePayGroup.mutate,
    isCreating: createPayGroup.isPending,
    isUpdating: updatePayGroup.isPending,
    isDeleting: deletePayGroup.isPending
  };
};

export const useEarningsTypes = () => {
  return useQuery({
    queryKey: ['earnings-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('earnings_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useDeductionTypes = () => {
  return useQuery({
    queryKey: ['deduction-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deduction_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useWorkersCompCodes = () => {
  return useQuery({
    queryKey: ['workers-comp-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workers_comp_codes')
        .select('*')
        .eq('is_active', true)
        .order('code');
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const usePtoPolicies = () => {
  return useQuery({
    queryKey: ['pto-policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pto_policies')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });
};