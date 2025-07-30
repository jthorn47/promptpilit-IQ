import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SavedReport {
  id: string;
  name: string;
  description: string | null;
  data_source: string;
  report_config: any;
  created_by: string | null;
  company_id: string | null;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportSchedule {
  id: string;
  saved_report_id: string;
  schedule_frequency: string;
  schedule_time: string;
  schedule_day_of_week: number | null;
  schedule_day_of_month: number | null;
  email_recipients: string[];
  email_subject: string | null;
  email_message: string | null;
  export_format: string;
  is_active: boolean;
  next_generation_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  saved_reports?: SavedReport;
}

export interface ReportExecution {
  id: string;
  saved_report_id: string;
  schedule_id: string | null;
  executed_by: string | null;
  execution_type: string;
  status: string;
  error_message: string | null;
  file_path: string | null;
  recipient_emails: string[] | null;
  execution_time_ms: number | null;
  record_count: number | null;
  created_at: string;
  completed_at: string | null;
}

export const useReporting = () => {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [reportSchedules, setReportSchedules] = useState<ReportSchedule[]>([]);
  const [reportExecutions, setReportExecutions] = useState<ReportExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSavedReports = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedReports(data || []);
    } catch (error) {
      console.error('Error fetching saved reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch saved reports",
        variant: "destructive",
      });
    }
  };

  const fetchReportSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('report_schedules')
        .select(`
          *,
          saved_reports (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReportSchedules(data || []);
    } catch (error) {
      console.error('Error fetching report schedules:', error);
    }
  };

  const fetchReportExecutions = async () => {
    try {
      const { data, error } = await supabase
        .from('report_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReportExecutions(data || []);
    } catch (error) {
      console.error('Error fetching report executions:', error);
    }
  };

  const saveReport = async (reportData: Omit<SavedReport, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'company_id'>) => {
    try {
      const { data: companyData } = await supabase
        .from('user_roles')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('saved_reports')
        .insert({
          ...reportData,
          created_by: user?.id,
          company_id: companyData?.company_id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchSavedReports();
      toast({
        title: "Success",
        description: "Report saved successfully",
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      await fetchSavedReports();
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const scheduleReport = async (scheduleData: Omit<ReportSchedule, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'next_generation_at'>) => {
    try {
      const { data, error } = await supabase
        .from('report_schedules')
        .insert({
          ...scheduleData,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchReportSchedules();
      toast({
        title: "Success",
        description: "Report scheduled successfully",
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error scheduling report:', error);
      toast({
        title: "Error",
        description: "Failed to schedule report",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const executeReport = async (reportId: string, options?: { sendEmail?: boolean; recipients?: string[] }) => {
    try {
      // Call edge function to execute report
      const { data, error } = await supabase.functions.invoke('execute-report', {
        body: {
          reportId,
          options,
        },
      });

      if (error) throw error;

      await fetchReportExecutions();
      toast({
        title: "Success",
        description: "Report executed successfully",
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error executing report:', error);
      toast({
        title: "Error",
        description: "Failed to execute report",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      await Promise.all([
        fetchSavedReports(),
        fetchReportSchedules(),
        fetchReportExecutions(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    savedReports,
    reportSchedules,
    reportExecutions,
    loading,
    saveReport,
    deleteReport,
    scheduleReport,
    executeReport,
    refetch: () => Promise.all([fetchSavedReports(), fetchReportSchedules(), fetchReportExecutions()]),
  };
};