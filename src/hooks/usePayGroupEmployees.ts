import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PayGroupEmployeeAssignment {
  id: string;
  pay_group_id: string;
  employee_id: string;
  employee_name: string;
  employee_email?: string;
  assigned_at: string;
  assigned_by?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeAssignmentData {
  pay_group_id: string;
  employee_id: string;
  employee_name: string;
  employee_email?: string;
  notes?: string;
}

export const usePayGroupEmployeeAssignments = (payGroupId?: string) => {
  return useQuery({
    queryKey: ['pay-group-employee-assignments', payGroupId],
    queryFn: async () => {
      if (!payGroupId) return [];
      
      const { data, error } = await supabase
        .from('pay_group_employee_assignments')
        .select('*')
        .eq('pay_group_id', payGroupId)
        .eq('is_active', true)
        .order('employee_name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!payGroupId
  });
};

export const useCreateEmployeeAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assignmentData: CreateEmployeeAssignmentData) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('pay_group_employee_assignments')
        .insert({
          ...assignmentData,
          assigned_by: user.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pay-group-employee-assignments', data.pay_group_id] });
      queryClient.invalidateQueries({ queryKey: ['pay-groups'] });
    }
  });
};

export const useRemoveEmployeeAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('pay_group_employee_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);
      
      if (error) throw error;
    },
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: ['pay-group-employee-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['pay-groups'] });
    }
  });
};

// Hook to get available employees (mock data for now - replace with real employee query)
export const useAvailableEmployees = (companyId?: string) => {
  return useQuery({
    queryKey: ['available-employees', companyId],
    queryFn: async () => {
      // For now, return mock data - replace with real employees query
      return [
        { id: 'emp1', name: 'John Doe', email: 'john@example.com' },
        { id: 'emp2', name: 'Jane Smith', email: 'jane@example.com' },
        { id: 'emp3', name: 'Mike Johnson', email: 'mike@example.com' },
        { id: 'emp4', name: 'Sarah Wilson', email: 'sarah@example.com' },
        { id: 'emp5', name: 'David Brown', email: 'david@example.com' }
      ];
    },
    enabled: !!companyId
  });
};