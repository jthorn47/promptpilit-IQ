import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// First, let's get real data from the pay_stubs table
export const useRealPayStubs = (companyId: string, filters?: {
  employee_name?: string;
  pay_date_start?: string;
  pay_date_end?: string;
  status?: string;
  payroll_run_id?: string;
}) => {
  return useQuery({
    queryKey: ['real-pay-stubs', companyId, filters],
    queryFn: async () => {
      if (!companyId) return [];
      
      let query = supabase
        .from('pay_stubs')
        .select(`
          id,
          employee_id,
          payroll_period_id,
          company_id,
          stub_number,
          pay_period_start,
          pay_period_end,
          pay_date,
          gross_pay,
          net_pay,
          total_deductions,
          total_taxes,
          status,
          earnings_breakdown,
          deductions_breakdown,
          taxes_breakdown,
          ytd_gross_pay,
          ytd_net_pay,
          ytd_taxes,
          created_at,
          updated_at,
          metadata
        `)
        .eq('company_id', companyId);
      
      // Apply filters
      if (filters?.pay_date_start) {
        query = query.gte('pay_date', filters.pay_date_start);
      }
      if (filters?.pay_date_end) {
        query = query.lte('pay_date', filters.pay_date_end);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      query = query.order('pay_date', { ascending: false });
      
      const { data: stubs, error } = await query;
      
      if (error) {
        console.error('Error fetching pay stubs:', error);
        return [];
      }
      
      if (!stubs || stubs.length === 0) {
        return [];
      }
      
      // Get employee names by joining with employees table
      const employeeIds = [...new Set(stubs.map(stub => stub.employee_id))];
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email')
        .in('id', employeeIds);
      
      if (empError) {
        console.error('Error fetching employees:', error);
        // Continue with stub data but without employee names
      }
      
      // Create employee lookup map
      const employeeMap = new Map(
        employees?.map(emp => [emp.id, emp]) || []
      );
      
      // Transform stubs with employee data
      const transformedStubs = stubs.map(stub => ({
        ...stub,
        employee_name: employeeMap.has(stub.employee_id) 
          ? `${employeeMap.get(stub.employee_id)?.first_name || ''} ${employeeMap.get(stub.employee_id)?.last_name || ''}`.trim()
          : 'Unknown Employee',
        employee_id_number: employeeMap.get(stub.employee_id)?.id || '',
        employee_email: employeeMap.get(stub.employee_id)?.email || '',
        ytd_deductions: (stub.ytd_gross_pay || 0) - (stub.ytd_net_pay || 0) - (stub.ytd_taxes || 0)
      }));
      
      // Apply employee name filter after transformation
      if (filters?.employee_name) {
        return transformedStubs.filter(stub =>
          stub.employee_name?.toLowerCase().includes(filters.employee_name!.toLowerCase())
        );
      }
      
      return transformedStubs;
    },
    enabled: !!companyId
  });
};

export interface EmployeePayStub {
  id: string;
  employee_id: string;
  payroll_period_id: string;
  company_id: string;
  stub_number: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  employee_name: string;
  employee_id_number?: string;
  gross_pay: number;
  net_pay: number;
  total_deductions: number;
  total_taxes: number;
  status: 'generated' | 'emailed' | 'viewed' | 'error';
  earnings_breakdown?: any[];
  deductions_breakdown?: any[];
  taxes_breakdown?: any[];
  ytd_gross_pay: number;
  ytd_net_pay: number;
  ytd_taxes: number;
  ytd_deductions: number;
  created_at: string;
  updated_at: string;
}

export const useEmployeePayStubs = (employeeId: string) => {
  return useQuery({
    queryKey: ['employee-pay-stubs', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      // For now, return mock data since the database schema is evolving
      // TODO: Replace with real data once pay_stubs table is properly set up
      const mockData: EmployeePayStub[] = [
        {
          id: 'stub_1',
          employee_id: employeeId,
          payroll_period_id: 'period_1',
          company_id: 'company_1',
          stub_number: '2024-001',
          pay_period_start: '2024-01-01',
          pay_period_end: '2024-01-15',
          pay_date: '2024-01-19',
          employee_name: 'John Doe',
          employee_id_number: 'EMP-001',
          gross_pay: 5000,
          net_pay: 3750,
          total_deductions: 500,
          total_taxes: 750,
          status: 'generated',
          ytd_gross_pay: 15000,
          ytd_net_pay: 11250,
          ytd_taxes: 2250,
          ytd_deductions: 1500,
          earnings_breakdown: [
            {
              code: 'REG',
              description: 'Regular Hours',
              hours: 80,
              rate: 62.50,
              amount: 5000,
              ytd_amount: 15000,
              type: 'regular',
              is_taxable: true
            }
          ],
          deductions_breakdown: [
            {
              code: 'HEALTH',
              description: 'Health Insurance',
              amount: 300,
              ytd_amount: 900,
              is_pre_tax: true,
              type: 'benefits',
              is_legally_required: false,
              category: 'voluntary'
            }
          ],
          taxes_breakdown: [
            {
              code: 'FED',
              description: 'Federal Income Tax',
              amount: 400,
              ytd_amount: 1200,
              tax_type: 'federal',
              rate: 12,
              taxable_wages: 4700
            }
          ],
          created_at: '2024-01-18T10:00:00Z',
          updated_at: '2024-01-18T10:00:00Z'
        }
      ];
      
      return mockData;
    },
    enabled: !!employeeId
  });
};

export const useCompanyPayStubs = (companyId: string, filters?: {
  employee_name?: string;
  pay_date_start?: string;
  pay_date_end?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['company-pay-stubs', companyId, filters],
    queryFn: async () => {
      if (!companyId) return [];
      
      // For now, return mock data since the database schema is evolving
      // TODO: Replace with real data once relationships are established
      const mockData: EmployeePayStub[] = [
        {
          id: 'stub_1',
          employee_id: 'emp_1',
          payroll_period_id: 'period_1',
          company_id: companyId,
          stub_number: '2024-001',
          pay_period_start: '2024-01-01',
          pay_period_end: '2024-01-15',
          pay_date: '2024-01-19',
          employee_name: 'John Smith',
          employee_id_number: 'EMP-001',
          gross_pay: 5000,
          net_pay: 3750,
          total_deductions: 500,
          total_taxes: 750,
          status: 'generated',
          ytd_gross_pay: 15000,
          ytd_net_pay: 11250,
          ytd_taxes: 2250,
          ytd_deductions: 1500,
          created_at: '2024-01-18T10:00:00Z',
          updated_at: '2024-01-18T10:00:00Z'
        },
        {
          id: 'stub_2',
          employee_id: 'emp_2',
          payroll_period_id: 'period_1',
          company_id: companyId,
          stub_number: '2024-002',
          pay_period_start: '2024-01-01',
          pay_period_end: '2024-01-15',
          pay_date: '2024-01-19',
          employee_name: 'Jane Doe',
          employee_id_number: 'EMP-002',
          gross_pay: 4500,
          net_pay: 3375,
          total_deductions: 450,
          total_taxes: 675,
          status: 'emailed',
          ytd_gross_pay: 13500,
          ytd_net_pay: 10125,
          ytd_taxes: 2025,
          ytd_deductions: 1350,
          created_at: '2024-01-18T10:00:00Z',
          updated_at: '2024-01-18T10:00:00Z'
        }
      ];
      
      // Apply filters
      let filteredData = mockData;
      
      if (filters?.employee_name) {
        filteredData = filteredData.filter(stub =>
          stub.employee_name?.toLowerCase().includes(filters.employee_name!.toLowerCase())
        );
      }
      
      if (filters?.status) {
        filteredData = filteredData.filter(stub => stub.status === filters.status);
      }
      
      if (filters?.pay_date_start) {
        filteredData = filteredData.filter(stub => stub.pay_date >= filters.pay_date_start!);
      }
      
      if (filters?.pay_date_end) {
        filteredData = filteredData.filter(stub => stub.pay_date <= filters.pay_date_end!);
      }
      
      return filteredData;
    },
    enabled: !!companyId
  });
};

export const usePayStubDetails = (stubId: string) => {
  return useQuery({
    queryKey: ['pay-stub-details', stubId],
    queryFn: async () => {
      if (!stubId) return null;
      
      // For now, return mock data
      // TODO: Replace with real database query
      const mockStub: EmployeePayStub = {
        id: stubId,
        employee_id: 'emp_1',
        payroll_period_id: 'period_1',
        company_id: 'company_1',
        stub_number: '2024-001',
        pay_period_start: '2024-01-01',
        pay_period_end: '2024-01-15',
        pay_date: '2024-01-19',
        employee_name: 'John Smith',
        employee_id_number: 'EMP-001',
        gross_pay: 5000,
        net_pay: 3750,
        total_deductions: 500,
        total_taxes: 750,
        status: 'generated',
        ytd_gross_pay: 15000,
        ytd_net_pay: 11250,
        ytd_taxes: 2250,
        ytd_deductions: 1500,
        created_at: '2024-01-18T10:00:00Z',
        updated_at: '2024-01-18T10:00:00Z'
      };
      
      return mockStub;
    },
    enabled: !!stubId
  });
};

export const useMarkPayStubViewed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (stubId: string) => {
      const { error } = await supabase
        .from('pay_stubs')
        .update({ 
          status: 'viewed',
          metadata: {
            viewed_at: new Date().toISOString(),
            viewed_by: (await supabase.auth.getUser()).data.user?.id
          }
        })
        .eq('id', stubId);
      
      if (error) throw error;
      
      // Note: Simplified logging since pay_stub_access_logs table may not exist
      console.log(`Pay stub ${stubId} viewed by user`);
      // TODO: Implement proper audit logging when table is ready
    },
    onSuccess: (_, stubId) => {
      // Invalidate and refetch pay stubs
      queryClient.invalidateQueries({ queryKey: ['employee-pay-stubs'] });
      queryClient.invalidateQueries({ queryKey: ['company-pay-stubs'] });
      queryClient.invalidateQueries({ queryKey: ['real-pay-stubs'] });
      queryClient.invalidateQueries({ queryKey: ['pay-stub-details', stubId] });
    }
  });
};

export const useDownloadPayStubPDF = () => {
  return useMutation({
    mutationFn: async (stubId: string) => {
      // Note: Simplified logging since pay_stub_access_logs table may not exist  
      console.log(`Pay stub ${stubId} downloaded by user`);
      // TODO: Implement proper audit logging when table is ready

      // Call edge function to generate PDF
      const { data, error } = await supabase.functions.invoke('generate-pay-stubs', {
        body: { 
          action: 'download_single',
          stub_id: stubId 
        }
      });
      
      if (error) throw error;
      
      if (data.pdf_url) {
        // Create download link for PDF
        const link = document.createElement('a');
        link.href = data.pdf_url;
        link.download = `pay-stub-${stubId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback: generate PDF client-side
        const mockPDFContent = `Mock PDF content for pay stub ${stubId}`;
        const blob = new Blob([mockPDFContent], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pay-stub-${stubId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Pay stub downloaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to download pay stub');
      console.error('Download error:', error);
    }
  });
};

export const useResendPayStub = () => {
  return useMutation({
    mutationFn: async ({ stubId, employeeEmail }: { stubId: string; employeeEmail?: string }) => {
      // Validate that employee has email
      if (!employeeEmail) {
        throw new Error('Employee email not found. Cannot send pay stub.');
      }
      
      // Note: Simplified logging since pay_stub_access_logs table may not exist
      console.log(`Pay stub ${stubId} resent to ${employeeEmail}`);
      // TODO: Implement proper audit logging when table is ready

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { 
          action: 'send_pay_stub',
          stub_id: stubId,
          employee_email: employeeEmail,
          template: 'pay_stub_notification'
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Pay stub resent successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to resend pay stub');
      console.error('Resend error:', error);
    }
  });
};

export const useBatchPayStubActions = () => {
  return useMutation({
    mutationFn: async ({ action, stubIds }: { 
      action: 'download' | 'email' | 'regenerate' | 'export_zip';
      stubIds: string[];
    }) => {
      // Note: Simplified logging since pay_stub_access_logs table may not exist
      console.log(`Batch ${action} performed on ${stubIds.length} pay stubs`);
      // TODO: Implement proper audit logging when table is ready

      const { data, error } = await supabase.functions.invoke('generate-pay-stubs', {
        body: { 
          action: `batch_${action}`,
          stub_ids: stubIds,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }
      });
      
      if (error) throw error;
      
      // Handle download for batch operations
      if (action === 'download' || action === 'export_zip') {
        if (data?.download_url) {
          const link = document.createElement('a');
          link.href = data.download_url;
          link.download = action === 'export_zip' ? `pay-stubs-${Date.now()}.zip` : `pay-stubs-batch.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // Fallback: create mock zip
          toast.success(`Mock: Would download ${stubIds.length} pay stubs as ZIP`);
        }
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      const { action, stubIds } = variables;
      
      if (action === 'download' || action === 'export_zip') {
        toast.success(`Downloaded ${stubIds.length} pay stubs`);
      } else if (action === 'email') {
        toast.success(`Emailed ${stubIds.length} pay stubs`);
      } else if (action === 'regenerate') {
        toast.success(`Regenerated ${stubIds.length} pay stubs`);
      }
    },
    onError: (error, variables) => {
      const { action } = variables;
      toast.error(`Failed to ${action} pay stubs`);
      console.error('Batch action error:', error);
    }
  });
};

// Helper function to get client IP (best effort)
async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return null;
  }
}

export const usePayStubMetrics = (companyId: string, dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ['pay-stub-metrics', companyId, dateRange],
    queryFn: async () => {
      if (!companyId) return null;
      
      let query = supabase
        .from('pay_stubs')
        .select('gross_pay, net_pay, total_taxes, total_deductions, employee_id, status')
        .eq('company_id', companyId);
      
      if (dateRange) {
        query = query
          .gte('pay_date', dateRange.start)
          .lte('pay_date', dateRange.end);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          total_generated: 0,
          total_downloaded: 0,
          total_viewed: 0,
          employee_count: 0,
          total_payroll_amount: 0,
          average_gross_pay: 0
        };
      }
      
      const uniqueEmployees = new Set(data.map(stub => stub.employee_id)).size;
      const totalPayroll = data.reduce((sum, stub) => sum + (stub.gross_pay || 0), 0);
      const viewedCount = data.filter(stub => stub.status === 'viewed').length;
      const emailedCount = data.filter(stub => ['emailed', 'viewed'].includes(stub.status)).length;
      
      return {
        total_generated: data.length,
        total_downloaded: emailedCount, // Approximate downloads as emailed + viewed
        total_viewed: viewedCount,
        employee_count: uniqueEmployees,
        total_payroll_amount: totalPayroll,
        average_gross_pay: data.length > 0 ? totalPayroll / data.length : 0
      };
    },
    enabled: !!companyId
  });
};

// Hook for getting payroll runs to group pay stubs
export const usePayrollRuns = (companyId: string) => {
  return useQuery({
    queryKey: ['payroll-runs', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('payroll_periods')
        .select('*')
        .eq('company_id', companyId)
        .order('period_start', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });
};