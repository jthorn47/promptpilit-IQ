import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PropGENWorkflow {
  id: string;
  company_id: string;
  workflow_status: string;
  risk_assessment_id?: string;
  spin_content_status: string;
  spin_content: any;
  investment_analysis_data: any;
  investment_analysis_status: string;
  proposal_data: any;
  proposal_status: string;
  proposal_approval_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PropGENTriggerData {
  triggerType: string;
  companyId: string;
  triggerData: any;
  userId?: string;
}

export const usePropGENWorkflow = (companyId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch PropGEN workflow for company
  const { data: workflow, isLoading, error } = useQuery({
    queryKey: ['propgen-workflow', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('propgen_workflows')
        .select('*')
        .eq('company_id', companyId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Not found is ok
        throw error;
      }
      
      return data;
    },
    enabled: !!companyId,
  });

  // Fetch PropGEN audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ['propgen-audit-logs', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('propgen_audit_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Trigger PropGEN workflow action
  const triggerWorkflow = useMutation({
    mutationFn: async (triggerData: PropGENTriggerData) => {
      const { data, error } = await supabase.functions.invoke('propgen-integration-handler', {
        body: triggerData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Workflow Updated',
        description: `Successfully processed ${variables.triggerType}`,
      });
      
      // Invalidate and refetch workflow data
      queryClient.invalidateQueries({ queryKey: ['propgen-workflow', companyId] });
      queryClient.invalidateQueries({ queryKey: ['propgen-audit-logs', companyId] });
      queryClient.invalidateQueries({ queryKey: ['company-settings', companyId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Workflow Error',
        description: error.message || 'Failed to process workflow trigger',
        variant: 'destructive',
      });
    },
  });

  // Generate SPIN content
  const generateSpinContent = useMutation({
    mutationFn: async (riskData: any) => {
      const { data, error } = await supabase.functions.invoke('generate-spin-content', {
        body: {
          companyId,
          riskData
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'SPIN Content Generated',
        description: 'AI-powered SPIN selling content has been generated for this company.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['propgen-workflow', companyId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate SPIN content',
        variant: 'destructive',
      });
    },
  });

  // Save investment analysis
  const saveInvestmentAnalysis = useMutation({
    mutationFn: async (analysisData: any) => {
      // First update the workflow
      const { error: workflowError } = await supabase
        .from('propgen_workflows')
        .upsert({
          company_id: companyId,
          investment_analysis_data: analysisData,
          investment_analysis_status: 'completed',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'company_id'
        });

      if (workflowError) throw workflowError;

      // Trigger workflow handler
      return triggerWorkflow.mutateAsync({
        triggerType: 'investment_analysis_saved',
        companyId,
        triggerData: analysisData
      });
    },
    onSuccess: () => {
      toast({
        title: 'Investment Analysis Saved',
        description: 'Investment analysis has been saved and proposal draft is now unlocked.',
      });
    },
  });

  // Save SPIN content as final
  const finalizeSPINContent = useMutation({
    mutationFn: async (finalContent: any) => {
      const { error } = await supabase
        .from('propgen_workflows')
        .update({
          spin_content: finalContent,
          spin_content_status: 'final',
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId);

      if (error) throw error;
      return finalContent;
    },
    onSuccess: () => {
      toast({
        title: 'SPIN Content Finalized',
        description: 'SPIN selling content has been marked as final.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['propgen-workflow', companyId] });
    },
  });

  // Request proposal approval
  const requestProposalApproval = useMutation({
    mutationFn: async (proposalData: any) => {
      return triggerWorkflow.mutateAsync({
        triggerType: 'proposal_generated',
        companyId,
        triggerData: proposalData,
        userId: (await supabase.auth.getUser()).data.user?.id
      });
    },
    onSuccess: () => {
      toast({
        title: 'Proposal Submitted for Approval',
        description: 'Your proposal has been submitted for admin approval.',
      });
    },
  });

  // Mark proposal as sent
  const markProposalSent = useMutation({
    mutationFn: async (sentData: any) => {
      return triggerWorkflow.mutateAsync({
        triggerType: 'proposal_sent',
        companyId,
        triggerData: sentData,
        userId: (await supabase.auth.getUser()).data.user?.id
      });
    },
    onSuccess: () => {
      toast({
        title: 'Proposal Marked as Sent',
        description: 'Proposal status has been updated to sent.',
      });
    },
  });

  return {
    workflow,
    auditLogs,
    isLoading,
    error,
    triggerWorkflow: triggerWorkflow.mutateAsync,
    generateSpinContent: generateSpinContent.mutateAsync,
    saveInvestmentAnalysis: saveInvestmentAnalysis.mutateAsync,
    finalizeSPINContent: finalizeSPINContent.mutateAsync,
    requestProposalApproval: requestProposalApproval.mutateAsync,
    markProposalSent: markProposalSent.mutateAsync,
    isProcessing: triggerWorkflow.isPending || generateSpinContent.isPending || 
                  saveInvestmentAnalysis.isPending || finalizeSPINContent.isPending ||
                  requestProposalApproval.isPending || markProposalSent.isPending,
  };
};