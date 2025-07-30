import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Policy {
  id: string;
  company_id: string;
  title: string;
  body: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  last_updated_by?: string;
  assigned_to: string[];
  acceptance_required: boolean;
  created_at: string;
  updated_at: string;
}

interface PolicyAssignment {
  id: string;
  policy_id: string;
  employee_id: string;
  company_id: string;
  assigned_at: string;
  accepted_at?: string;
  acceptance_status: 'pending' | 'accepted' | 'declined';
  acceptance_signature?: string;
  notes?: string;
}

interface CreatePolicyData {
  title: string;
  body: string;
  acceptance_required: boolean;
  status: 'draft' | 'published';
  company_id: string;
}

export const useHROIQPolicies = (companyId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: policies, isLoading } = useQuery({
    queryKey: ['hroiq-policies', companyId],
    queryFn: async () => {
      let query = supabase
        .from('hroiq_policies')
        .select('*')
        .order('updated_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Policy[];
    },
    enabled: !!companyId,
  });

  const { data: assignments } = useQuery({
    queryKey: ['hroiq-policy-assignments', companyId],
    queryFn: async () => {
      let query = supabase
        .from('hroiq_policy_assignments')
        .select(`
          *,
          employees!inner(first_name, last_name, email)
        `)
        .order('assigned_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as any[];
    },
    enabled: !!companyId,
  });

  const createPolicyMutation = useMutation({
    mutationFn: async (policyData: CreatePolicyData) => {
      const { data, error } = await supabase
        .from('hroiq_policies')
        .insert(policyData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hroiq-policies'] });
      toast({
        title: 'Success',
        description: 'Policy created successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to create policy',
        variant: 'destructive',
      });
    },
  });

  const updatePolicyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Policy> }) => {
      const { data, error } = await supabase
        .from('hroiq_policies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hroiq-policies'] });
      toast({
        title: 'Success',
        description: 'Policy updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to update policy',
        variant: 'destructive',
      });
    },
  });

  const assignPolicyMutation = useMutation({
    mutationFn: async ({ policyId, employeeIds, companyId }: { policyId: string; employeeIds: string[]; companyId: string }) => {
      const assignments = employeeIds.map(employeeId => ({
        policy_id: policyId,
        employee_id: employeeId,
        company_id: companyId,
      }));

      const { data, error } = await supabase
        .from('hroiq_policy_assignments')
        .insert(assignments)
        .select();

      if (error) throw error;

      // Update the policy's assigned_to array
      const policy = policies?.find(p => p.id === policyId);
      if (policy) {
        const updatedAssignedTo = [...new Set([...policy.assigned_to, ...employeeIds])];
        await supabase
          .from('hroiq_policies')
          .update({ assigned_to: updatedAssignedTo })
          .eq('id', policyId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hroiq-policies'] });
      queryClient.invalidateQueries({ queryKey: ['hroiq-policy-assignments'] });
      toast({
        title: 'Success',
        description: 'Policy assigned successfully',
      });
    },
    onError: (error) => {
      console.error('Error assigning policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign policy',
        variant: 'destructive',
      });
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ 
      assignmentId, 
      status, 
      signature 
    }: { 
      assignmentId: string; 
      status: 'accepted' | 'declined'; 
      signature?: string 
    }) => {
      const updates: any = {
        acceptance_status: status,
      };

      if (status === 'accepted') {
        updates.accepted_at = new Date().toISOString();
        if (signature) {
          updates.acceptance_signature = signature;
        }
      }

      const { data, error } = await supabase
        .from('hroiq_policy_assignments')
        .update(updates)
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hroiq-policy-assignments'] });
      toast({
        title: 'Success',
        description: 'Assignment status updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update assignment status',
        variant: 'destructive',
      });
    },
  });

  return {
    policies: policies || [],
    assignments: assignments || [],
    isLoading,
    createPolicy: createPolicyMutation.mutate,
    updatePolicy: updatePolicyMutation.mutate,
    assignPolicy: assignPolicyMutation.mutate,
    updateAssignment: updateAssignmentMutation.mutate,
    isCreating: createPolicyMutation.isPending,
    isUpdating: updatePolicyMutation.isPending,
    isAssigning: assignPolicyMutation.isPending,
  };
};