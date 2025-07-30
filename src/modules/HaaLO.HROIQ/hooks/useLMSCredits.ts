import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LMSCredit, LMSCreditSummary, LMSCreditForm, TrainingType } from '../types/lms';
import { useToast } from '@/hooks/use-toast';

export const useLMSCredits = (companyId: string) => {
  const [credits, setCredits] = useState<LMSCredit[]>([]);
  const [summary, setSummary] = useState<LMSCreditSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCredits = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      
      // Fetch all credits for the company
      const { data: creditsData, error: creditsError } = await supabase
        .from('hroiq_lms_credits')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (creditsError) throw creditsError;

      // Fetch summary using the database function
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_lms_credit_summary', { p_company_id: companyId });

      if (summaryError) throw summaryError;

      setCredits(creditsData || []);
      setSummary((summaryData || []) as LMSCreditSummary[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch LMS credits';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const issueCredits = async (creditData: LMSCreditForm) => {
    if (!companyId) return false;

    try {
      const { error } = await supabase
        .from('hroiq_lms_credits')
        .insert({
          company_id: companyId,
          training_type: creditData.training_type,
          credits_issued: creditData.credits_issued,
          employee_id: creditData.employee_id || null,
          notes: creditData.notes || null
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${creditData.credits_issued} ${creditData.training_type} credits issued successfully`
      });

      await fetchCredits(); // Refresh data
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to issue credits';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    }
  };

  const useCredits = async (creditId: string, creditsToUse: number) => {
    try {
      const credit = credits.find(c => c.id === creditId);
      if (!credit) throw new Error('Credit record not found');

      const newUsedAmount = credit.credits_used + creditsToUse;
      if (newUsedAmount > credit.credits_issued) {
        throw new Error('Cannot use more credits than issued');
      }

      const { error } = await supabase
        .from('hroiq_lms_credits')
        .update({ 
          credits_used: newUsedAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', creditId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${creditsToUse} credits used successfully`
      });

      await fetchCredits(); // Refresh data
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to use credits';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteCredit = async (creditId: string) => {
    try {
      const { error } = await supabase
        .from('hroiq_lms_credits')
        .delete()
        .eq('id', creditId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Credit record deleted successfully'
      });

      await fetchCredits(); // Refresh data
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete credit record';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Calculate overall totals
  const totals = {
    totalIssued: summary.reduce((sum, s) => sum + s.total_issued, 0),
    totalUsed: summary.reduce((sum, s) => sum + s.total_used, 0),
    totalRemaining: summary.reduce((sum, s) => sum + s.total_remaining, 0)
  };

  useEffect(() => {
    fetchCredits();
  }, [companyId]);

  return {
    credits,
    summary,
    totals,
    loading,
    error,
    fetchCredits,
    issueCredits,
    useCredits,
    deleteCredit
  };
};