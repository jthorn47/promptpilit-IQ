import { useState, useCallback } from 'react';
import { payrollService } from '../api/payroll.service';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  name: string;
  regularHours: number;
  overtimeHours: number;
  bonus: number;
  deductions: { [key: string]: number };
  hourlyRate: number;
  grossPay?: number;
}

interface PayrollPreview {
  grossWages: number;
  totalDeductions: number;
  estimatedTaxes: number;
  netPay: number;
  warnings: string[];
  errors: string[];
}

export const usePayrollProcessing = () => {
  const { toast } = useToast();
  
  // State management
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [clients, setClients] = useState<any[]>([]);
  const [payrollSchedule, setPayrollSchedule] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollPreview, setPayrollPreview] = useState<PayrollPreview | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Loading states
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Load clients
  const loadClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const clientData = await payrollService.getClients();
      setClients(clientData);
    } catch (error) {
      toast({
        title: "Error Loading Clients",
        description: "Failed to load client list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingClients(false);
    }
  }, [toast]);

  // Load payroll schedule when client is selected
  const loadPayrollSchedule = useCallback(async (clientId: string) => {
    if (!clientId) return;
    
    setLoadingSchedule(true);
    try {
      const schedule = await payrollService.getPayrollSchedule(clientId);
      setPayrollSchedule(schedule);
      setSelectedPeriod(schedule.currentPeriod.id);
      setCurrentStep(2);
    } catch (error) {
      toast({
        title: "Error Loading Schedule",
        description: "Failed to load payroll schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingSchedule(false);
    }
  }, [toast]);

  // Load employees for selected client and period
  const loadEmployees = useCallback(async (clientId: string, periodId: string) => {
    if (!clientId || !periodId) return;
    
    setLoadingEmployees(true);
    try {
      const employeeData = await payrollService.getEmployees(clientId, periodId);
      // Calculate gross pay for each employee
      const employeesWithGross = employeeData.map(emp => ({
        ...emp,
        grossPay: (emp.regularHours * emp.hourlyRate) + (emp.overtimeHours * emp.hourlyRate * 1.5) + emp.bonus
      }));
      setEmployees(employeesWithGross);
      setCurrentStep(3);
    } catch (error) {
      toast({
        title: "Error Loading Employees",
        description: "Failed to load employee data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingEmployees(false);
    }
  }, [toast]);

  // Update employee data
  const updateEmployee = useCallback((employeeId: string, field: keyof Employee, value: any) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const updated = { ...emp, [field]: value };
        // Recalculate gross pay when hours or bonus change
        if (['regularHours', 'overtimeHours', 'bonus'].includes(field)) {
          updated.grossPay = (updated.regularHours * updated.hourlyRate) + 
                           (updated.overtimeHours * updated.hourlyRate * 1.5) + 
                           updated.bonus;
        }
        return updated;
      }
      return emp;
    }));
  }, []);

  // Preview payroll
  const previewPayroll = useCallback(async () => {
    if (!selectedClient || !selectedPeriod || employees.length === 0) {
      toast({
        title: "Missing Data",
        description: "Please ensure client, period, and employees are selected.",
        variant: "destructive"
      });
      return;
    }

    setPreviewing(true);
    try {
      const preview = await payrollService.previewPayroll(selectedClient, selectedPeriod, employees);
      setPayrollPreview(preview);
      setCurrentStep(4);
      
      if (preview.errors.length > 0) {
        toast({
          title: "Validation Errors",
          description: `Found ${preview.errors.length} errors that must be fixed before processing.`,
          variant: "destructive"
        });
      } else if (preview.warnings.length > 0) {
        toast({
          title: "Validation Warnings",
          description: `Found ${preview.warnings.length} warnings. Review before processing.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Preview Complete",
          description: "Payroll preview generated successfully. Ready for processing.",
        });
      }
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: "Failed to generate payroll preview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPreviewing(false);
    }
  }, [selectedClient, selectedPeriod, employees, toast]);

  // Process payroll
  const processPayroll = useCallback(async () => {
    if (!payrollPreview || payrollPreview.errors.length > 0) {
      toast({
        title: "Cannot Process",
        description: "Please fix all errors before processing payroll.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const result = await payrollService.processPayroll(selectedClient, selectedPeriod, employees, payrollPreview);
      
      if (result.success) {
        toast({
          title: "Payroll Processed Successfully",
          description: `Batch ${result.batchId} created with total amount ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result.totalAmount)}.`,
        });
        
        // Reset state for new payroll run
        setCurrentStep(1);
        setSelectedClient('');
        setSelectedPeriod('');
        setPayrollSchedule(null);
        setEmployees([]);
        setPayrollPreview(null);
      }
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to process payroll. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  }, [selectedClient, selectedPeriod, employees, payrollPreview, toast]);

  // Validation helper
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return selectedClient !== '';
      case 2:
        return selectedClient !== '' && selectedPeriod !== '';
      case 3:
        return employees.length > 0;
      case 4:
        return payrollPreview !== null;
      default:
        return false;
    }
  }, [selectedClient, selectedPeriod, employees, payrollPreview]);

  return {
    // State
    selectedClient,
    selectedPeriod,
    clients,
    payrollSchedule,
    employees,
    payrollPreview,
    currentStep,
    
    // Loading states
    loadingClients,
    loadingSchedule,
    loadingEmployees,
    previewing,
    processing,
    
    // Actions
    setSelectedClient,
    setSelectedPeriod,
    loadClients,
    loadPayrollSchedule,
    loadEmployees,
    updateEmployee,
    previewPayroll,
    processPayroll,
    validateStep,
    setCurrentStep
  };
};