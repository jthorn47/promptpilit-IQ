/**
 * HaaLO Payroll Microservice React Hooks
 * React Query integration for payroll operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useClientPayrollSettings } from '@/hooks/useClientPayrollSettings';
import { payrollService } from '../services/PayrollMicroservice';
import { PayrollServiceConfig } from '../config/PayrollServiceConfig';
import type {
  PayrollDashboardData,
  PayrollPrecheck,
  PayrollWorkflow,
  PayrollPeriod,
  PayrollEmployee,
  TimeEntry,
  PayStub,
  GeneratePayStubsRequest,
  PayrollUserPermissions,
  PayrollPermission
} from '../types/PayrollMicroservice';

// Dashboard Hook
export const usePayrollDashboard = (companyId: string) => {
  return useQuery({
    queryKey: ['payroll-dashboard', companyId],
    queryFn: () => payrollService.getDashboardData(companyId),
    enabled: !!companyId,
    staleTime: PayrollServiceConfig.CACHE.DASHBOARD_TTL,
    refetchInterval: PayrollServiceConfig.CACHE.DASHBOARD_TTL
  });
};

// Payroll Periods
export const usePayrollPeriods = (companyId: string) => {
  return useQuery({
    queryKey: ['payroll-periods', companyId],
    queryFn: () => payrollService.getPayrollPeriods(companyId),
    enabled: !!companyId,
    staleTime: PayrollServiceConfig.CACHE.PERIODS_TTL
  });
};

// Employees
export const usePayrollEmployees = (companyId: string) => {
  return useQuery({
    queryKey: ['payroll-employees', companyId],
    queryFn: () => payrollService.getPayrollEmployees(companyId),
    enabled: !!companyId,
    staleTime: PayrollServiceConfig.CACHE.EMPLOYEES_TTL
  });
};

// Time Entries
export const useTimeEntries = (companyId: string, periodId?: string) => {
  return useQuery({
    queryKey: ['time-entries', companyId, periodId],
    queryFn: () => payrollService.getTimeEntries(companyId, periodId),
    enabled: !!companyId
  });
};

// Pay Stubs
export const usePayStubs = (companyId: string, payrollRunId?: string) => {
  return useQuery({
    queryKey: ['pay-stubs', companyId, payrollRunId],
    queryFn: () => payrollService.getPayStubs(companyId, payrollRunId),
    enabled: !!companyId
  });
};

// Payroll Run Operations
export const usePayrollPrecheck = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ companyId, periodId }: { companyId: string; periodId: string }) =>
      payrollService.runPayrollPrecheck(companyId, periodId),
    onError: (error: any) => {
      toast({
        title: "Precheck Failed",
        description: error.message || "Failed to run payroll precheck",
        variant: "destructive",
      });
    }
  });
};

export const useCreatePayrollRun = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ companyId, periodId }: { companyId: string; periodId: string }) =>
      payrollService.createPayrollRun(companyId, periodId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-dashboard', variables.companyId] });
      toast({
        title: "Payroll Run Created",
        description: "New payroll run has been initiated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Payroll Run",
        description: error.message || "An error occurred while creating the payroll run",
        variant: "destructive",
      });
    }
  });
};

export const usePayrollWorkflow = (payrollRunId: string) => {
  return useQuery({
    queryKey: ['payroll-workflow', payrollRunId],
    queryFn: () => payrollService.getPayrollWorkflow(payrollRunId),
    enabled: !!payrollRunId
  });
};

// Pay Stub Generation
export const useGeneratePayStubs = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (request: GeneratePayStubsRequest) =>
      payrollService.generatePayStubs(request),
    onSuccess: (data) => {
      toast({
        title: "Pay Stubs Generated",
        description: `Successfully generated ${data.generated_count} pay stubs`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Generate Pay Stubs",
        description: error.message || "An error occurred while generating pay stubs",
        variant: "destructive",
      });
    }
  });
};

// Permission Hook
export const usePayrollPermissions = () => {
  const { user, userRoles } = useAuth();
  
  const hasPermission = (permission: keyof typeof PayrollServiceConfig.PERMISSIONS): boolean => {
    return payrollService.validatePermission(userRoles || [], permission);
  };
  
  return {
    user_id: user?.id || '',
    permissions: ['payroll.view', 'payroll.run', 'payroll.edit_time'] as PayrollPermission[],
    can_approve_up_to: 50000,
    requires_dual_approval: false,
    hasPermission,
    canView: hasPermission('VIEW'),
    canRunPayroll: hasPermission('RUN_PAYROLL'),
    canApprove: hasPermission('APPROVE'),
    canEditTime: hasPermission('EDIT_TIME'),
    canManageSettings: hasPermission('MANAGE_SETTINGS'),
    canOverride: hasPermission('OVERRIDE')
  };
};

// Settings Integration Hook
export const usePayrollIntegratedSettings = (clientId: string) => {
  const clientSettings = useClientPayrollSettings(clientId);
  const permissions = usePayrollPermissions();
  
  return {
    ...clientSettings,
    permissions,
    isConfigured: !!clientSettings.data?.pay_frequency,
    canEditSettings: permissions.canManageSettings
  };
};

// Combined Payroll Context Hook
export const usePayrollContext = (companyId: string) => {
  const dashboard = usePayrollDashboard(companyId);
  const periods = usePayrollPeriods(companyId);
  const employees = usePayrollEmployees(companyId);
  const permissions = usePayrollPermissions();
  const settings = usePayrollIntegratedSettings(companyId);
  
  const currentPeriod = dashboard.data?.current_period;
  const canRunPayroll = permissions.canRunPayroll && currentPeriod && settings.isConfigured;
  
  return {
    // Data
    dashboard: dashboard.data,
    periods: periods.data || [],
    employees: employees.data || [],
    currentPeriod,
    
    // Loading states
    isLoading: dashboard.isLoading || periods.isLoading || employees.isLoading,
    
    // Settings
    settings: settings.data,
    
    // Permissions
    permissions,
    
    // Actions
    canRunPayroll,
    
    // Refresh
    refresh: () => {
      dashboard.refetch();
      periods.refetch();
      employees.refetch();
    }
  };
};