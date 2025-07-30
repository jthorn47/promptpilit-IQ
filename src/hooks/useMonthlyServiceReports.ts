import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MonthlyServiceReport {
  id: string;
  company_id: string;
  retainer_id?: string;
  report_month: string;
  total_hours_used: number;
  total_cases_resolved: number;
  total_cases_opened: number;
  overage_hours: number;
  overage_amount: number;
  service_summary: any;
  case_breakdown: any[];
  deliverables_completed: any[];
  risk_score_changes: any;
  generated_at: string;
  generated_by?: string;
  status: 'draft' | 'final' | 'sent';
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export const useMonthlyServiceReports = (companyId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['monthly-service-reports', companyId],
    queryFn: async () => {
      let query = supabase
        .from('monthly_service_reports')
        .select('*')
        .order('report_month', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MonthlyServiceReport[];
    },
    enabled: !!companyId,
  });

  const generateReportMutation = useMutation({
    mutationFn: async ({ companyId, reportMonth }: { companyId: string; reportMonth: string }) => {
      const { data, error } = await supabase.functions.invoke('generate-monthly-service-report', {
        body: { companyId, reportMonth }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-service-reports'] });
      toast({
        title: 'Success',
        description: 'Monthly service report generated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate report',
        variant: 'destructive',
      });
    },
  });

  const updateReportStatusMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: 'draft' | 'final' | 'sent' }) => {
      const { data, error } = await supabase
        .from('monthly_service_reports')
        .update({ status })
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-service-reports'] });
      toast({
        title: 'Success',
        description: 'Report status updated successfully',
      });
    },
  });

  const getCurrentMonthReport = () => {
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    return reports?.find(report => report.report_month === currentMonth);
  };

  const getReportByMonth = (month: string) => {
    return reports?.find(report => report.report_month === month);
  };

  return {
    reports,
    isLoading,
    generateReport: generateReportMutation.mutate,
    updateReportStatus: updateReportStatusMutation.mutate,
    getCurrentMonthReport,
    getReportByMonth,
  };
};