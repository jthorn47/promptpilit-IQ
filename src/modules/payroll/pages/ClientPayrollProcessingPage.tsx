import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePayTypes } from '@/domains/payroll/hooks/usePayTypes';
import { 
  Plus, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Users,
  Calculator,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Brain,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock TaxIQ Service
const mockTaxIQService = {
  async calculateTaxEstimate(employeeId: string, grossPay: number): Promise<number> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock tax calculation (simplified)
    // Federal: ~22%, State: ~6%, FICA: 7.65%, State Disability: ~1%
    const federalRate = 0.22;
    const stateRate = 0.06;
    const ficaRate = 0.0765;
    const sdiRate = 0.01;
    
    const totalTaxRate = federalRate + stateRate + ficaRate + sdiRate;
    return grossPay * totalTaxRate;
  }
};

interface PayTypeEntry {
  type: string;
  units?: number;
  amount?: number;
  rate?: number;
}

interface ValidationIssue {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
}

interface EmployeePayData {
  employeeId: string;
  employeeName: string;
  payTypes: PayTypeEntry[];
  grossPay: number;
  netPay: number;
  taxEstimate: number;
  deductions: number;
  errors: string[];
  flags: string[];
  bankInfo?: boolean;
  lastCycleBonuses?: PayTypeEntry[];
  isCalculating?: boolean;
}

interface Client {
  id: string;
  name: string;
  payrollSchedule: string;
  nextPayDate: string;
}

export const ClientPayrollProcessingPage = () => {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [clients, setClients] = useState<Client[]>([]);
  const [employeePayData, setEmployeePayData] = useState<EmployeePayData[]>([]);
  const [activeAddPayType, setActiveAddPayType] = useState<string>('');
  const [newPayType, setNewPayType] = useState({ type: '', units: 0, amount: 0 });
  const [validationPanelOpen, setValidationPanelOpen] = useState(false); // Start closed by default
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);

  // Get available pay types with mock fallback
  const { data: fetchedPayTypes, isLoading: payTypesLoading, error: payTypesError } = usePayTypes(selectedClient || undefined);
  
  // Mock pay types as fallback if no data from database
  const mockPayTypes = [
    { id: 'regular', name: 'Regular Hours', code: 'REG' },
    { id: 'overtime', name: 'Overtime', code: 'OT' },
    { id: 'doubletime', name: 'Double Time', code: 'DT' },
    { id: 'bonus', name: 'Bonus', code: 'BON' },
    { id: 'commission', name: 'Commission', code: 'COM' },
    { id: 'holiday', name: 'Holiday Pay', code: 'HOL' },
    { id: 'sick', name: 'Sick Pay', code: 'SICK' },
    { id: 'vacation', name: 'Vacation Pay', code: 'VAC' }
  ];
  
  // Use fetched data if available, otherwise use mock data
  const payTypes = (fetchedPayTypes && fetchedPayTypes.length > 0) ? fetchedPayTypes : mockPayTypes;
  
  // Debug pay types
  console.log('🔍 Pay Types Debug:', { 
    selectedClient, 
    fetchedPayTypes, 
    payTypes, 
    payTypesLoading, 
    payTypesError,
    payTypesLength: payTypes?.length,
    usingMockData: !fetchedPayTypes || fetchedPayTypes.length === 0
  });

  // Initialize with mock clients and ensure one is selected for testing
  useEffect(() => {
    // Simulate loading clients
    setClients([
      { 
        id: 'bc172f1c-e102-4a76-945a-c1de29e9f34c', 
        name: 'Acme Corporation', 
        payrollSchedule: 'Bi-weekly', 
        nextPayDate: '2024-02-15' 
      },
      { 
        id: 'a8f7e6d5-c4b3-4a29-8e17-1f6e5d4c3b2a', 
        name: 'TechStart Inc', 
        payrollSchedule: 'Monthly', 
        nextPayDate: '2024-02-29' 
      },
      { 
        id: '7b8c9d1e-f2a3-4b56-9c7d-8e9f1a2b3c4d', 
        name: 'Global Industries', 
        payrollSchedule: 'Weekly', 
        nextPayDate: '2024-02-08' 
      }
    ]);
    
    // Auto-select first client for testing if none selected
    if (!selectedClient) {
      console.log('🔍 Auto-selecting first client for pay types testing');
      setSelectedClient('bc172f1c-e102-4a76-945a-c1de29e9f34c');
    }
  }, []);

  // Initialize employee data when client is selected
  useEffect(() => {
    if (selectedClient) {
      // Mock employee data - replace with actual API
      const mockData: EmployeePayData[] = [
        {
          employeeId: '1',
          employeeName: 'John Smith',
          payTypes: [
            { type: 'Regular', units: 40, rate: 25 },
            { type: 'Overtime', units: 5, rate: 37.5 }
          ],
          grossPay: 1187.5,
          netPay: 926.25,
          taxEstimate: 261.25,
          deductions: 0,
          errors: [],
          flags: [],
          bankInfo: true,
          lastCycleBonuses: [{ type: 'Performance Bonus', amount: 300 }],
          isCalculating: false
        },
        {
          employeeId: '2',
          employeeName: 'Sarah Johnson',
          payTypes: [
            { type: 'Regular', units: 40, rate: 30 },
            { type: 'Bonus', amount: 200 }
          ],
          grossPay: 1400,
          netPay: 1092,
          taxEstimate: 308,
          deductions: 0,
          errors: [],
          flags: [],
          bankInfo: false,
          lastCycleBonuses: [],
          isCalculating: false
        },
        {
          employeeId: '3',
          employeeName: 'Mike Chen',
          payTypes: [
            { type: 'Regular', units: 38, rate: 35 },
            { type: 'Overtime', units: 25, rate: 52.5 },
            { type: 'Commission', amount: 500 }
          ],
          grossPay: 2642.5,
          netPay: 2061.15,
          taxEstimate: 581.35,
          deductions: 0,
          errors: [],
          flags: ['High OT'],
          bankInfo: true,
          lastCycleBonuses: [{ type: 'Sales Bonus', amount: 250 }],
          isCalculating: false
        },
        {
          employeeId: '4',
          employeeName: 'Lisa Wang',
          payTypes: [],
          grossPay: 0,
          netPay: 0,
          taxEstimate: 0,
          deductions: 0,
          errors: [],
          flags: [],
          bankInfo: true,
          lastCycleBonuses: [],
          isCalculating: false
        }
      ];
      setEmployeePayData(mockData);
    }
  }, [selectedClient]);

  // Generate comprehensive validation issues
  const generateValidationIssues = (data: EmployeePayData[]): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];
    
    data.forEach(emp => {
      const totalHours = emp.payTypes
        .filter(pt => pt.units)
        .reduce((sum, pt) => sum + (pt.units || 0), 0);
        
      const otHours = emp.payTypes
        .filter(pt => pt.type.toLowerCase().includes('overtime'))
        .reduce((sum, pt) => sum + (pt.units || 0), 0);
        
      const bonusAmount = emp.payTypes
        .filter(pt => pt.type.toLowerCase().includes('bonus'))
        .reduce((sum, pt) => sum + (pt.amount || 0), 0);
      
      // 🚨 ERRORS (Must Fix)
      if (totalHours === 0 && emp.grossPay === 0) {
        issues.push({
          id: `${emp.employeeId}-no-hours`,
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          type: 'error',
          message: 'No hours or pay entered',
          category: 'Missing Data',
          severity: 'high'
        });
      }
      
      if (!emp.bankInfo) {
        issues.push({
          id: `${emp.employeeId}-no-bank`,
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          type: 'error',
          message: 'Missing bank information',
          category: 'Banking',
          severity: 'high'
        });
      }
      
      const totalDeductions = emp.grossPay - emp.netPay;
      if (totalDeductions > emp.grossPay && emp.grossPay > 0) {
        issues.push({
          id: `${emp.employeeId}-deductions`,
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          type: 'error',
          message: 'Deductions exceed gross pay',
          category: 'Calculation',
          severity: 'high'
        });
      }
      
      // ⚠ WARNINGS (Can Override)
      if (otHours > 20) {
        issues.push({
          id: `${emp.employeeId}-high-ot`,
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          type: 'warning',
          message: `${otHours} overtime hours (>20)`,
          category: 'Overtime',
          severity: 'medium'
        });
      }
      
      if (bonusAmount > 1000) {
        issues.push({
          id: `${emp.employeeId}-high-bonus`,
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          type: 'warning',
          message: `$${bonusAmount} bonus is unusually high`,
          category: 'Compensation',
          severity: 'medium'
        });
      }
      
      // 🧠 SUGGESTIONS (AI Recommendations)
      if (emp.lastCycleBonuses && emp.lastCycleBonuses.length > 0) {
        const lastBonus = emp.lastCycleBonuses[0];
        const hasCurrentBonus = emp.payTypes.some(pt => pt.type.toLowerCase().includes('bonus'));
        
        if (!hasCurrentBonus) {
          issues.push({
            id: `${emp.employeeId}-suggest-bonus`,
            employeeId: emp.employeeId,
            employeeName: emp.employeeName,
            type: 'suggestion',
            message: `Had $${lastBonus.amount} ${lastBonus.type} last cycle — add again?`,
            category: 'Historical Pattern',
            severity: 'low'
          });
        }
      }
      
      if (totalHours < 30 && totalHours > 0) {
        issues.push({
          id: `${emp.employeeId}-low-hours`,
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          type: 'suggestion',
          message: `Only ${totalHours} hours — part-time or missing time?`,
          category: 'Hours Analysis',
          severity: 'low'
        });
      }
    });
    
    // Department-level suggestions
    const avgGross = data.reduce((sum, emp) => sum + emp.grossPay, 0) / data.length;
    data.forEach(emp => {
      if (emp.grossPay < avgGross * 0.7 && emp.grossPay > 0) {
        issues.push({
          id: `${emp.employeeId}-low-pay`,
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          type: 'suggestion',
          message: `Pay is 30%+ below department average ($${avgGross.toFixed(0)})`,
          category: 'Comparative Analysis',
          severity: 'low'
        });
      }
    });
    
    return issues;
  };

  // Live calculation for individual employee
  const calculateEmployeePay = async (employee: EmployeePayData): Promise<EmployeePayData> => {
    // Calculate gross pay from all pay types
    const grossPay = employee.payTypes.reduce((sum, pt) => {
      if (pt.amount) return sum + pt.amount;
      if (pt.units && pt.rate) return sum + (pt.units * pt.rate);
      return sum;
    }, 0);

    // Mock deductions (could be from benefits, garnishments, etc.)
    const deductions = employee.deductions || 0;

    try {
      // Get tax estimate from TaxIQ service
      const taxEstimate = await mockTaxIQService.calculateTaxEstimate(employee.employeeId, grossPay);
      
      // Calculate net pay
      const netPay = grossPay - taxEstimate - deductions;

      return {
        ...employee,
        grossPay,
        taxEstimate,
        netPay: Math.max(0, netPay), // Ensure net pay doesn't go negative
        isCalculating: false
      };
    } catch (error) {
      console.error('Tax calculation error:', error);
      // Fallback calculation if TaxIQ fails
      const fallbackTaxRate = 0.25; // 25% fallback rate
      const taxEstimate = grossPay * fallbackTaxRate;
      const netPay = grossPay - taxEstimate - deductions;

      return {
        ...employee,
        grossPay,
        taxEstimate,
        netPay: Math.max(0, netPay),
        isCalculating: false
      };
    }
  };

  // Calculate totals and validate with live updates
  const runAIAudit = async (data: EmployeePayData[]) => {
    // First, recalculate all employee pay amounts
    const recalculatedData = await Promise.all(
      data.map(emp => calculateEmployeePay(emp))
    );
    
    // Update validation issues
    setValidationIssues(generateValidationIssues(recalculatedData));
    
    return recalculatedData;
  };

  // Update employee pay data with live calculation
  const updateEmployeePayType = async (employeeId: string, payTypeIndex: number, field: string, value: number) => {
    setEmployeePayData(prev => {
      const updated = prev.map(emp => {
        if (emp.employeeId === employeeId) {
          // Mark as calculating
          const updatedEmp = { ...emp, isCalculating: true };
          const newPayTypes = [...emp.payTypes];
          newPayTypes[payTypeIndex] = {
            ...newPayTypes[payTypeIndex],
            [field]: value
          };
          updatedEmp.payTypes = newPayTypes;
          return updatedEmp;
        }
        return emp;
      });
      
      // Trigger live recalculation
      runAIAudit(updated).then(setEmployeePayData);
      
      return updated;
    });
  };

  // Add new pay type to employee with live calculation
  const addPayTypeToEmployee = async (employeeId: string) => {
    if (!newPayType.type) return;
    
    setEmployeePayData(prev => {
      const updated = prev.map(emp => {
        if (emp.employeeId === employeeId) {
          return {
            ...emp,
            payTypes: [...emp.payTypes, { ...newPayType }],
            isCalculating: true
          };
        }
        return emp;
      });
      
      // Trigger live recalculation
      runAIAudit(updated).then(setEmployeePayData);
      
      return updated;
    });
    
    setNewPayType({ type: '', units: 0, amount: 0 });
    setActiveAddPayType('');
  };

  // Get all unique pay types from all employees
  const allPayTypeColumns = useMemo(() => {
    const types = new Set<string>();
    employeePayData.forEach(emp => {
      emp.payTypes.forEach(pt => types.add(pt.type));
    });
    return Array.from(types);
  }, [employeePayData]);

  // Define table columns
  const columns = useMemo<ColumnDef<EmployeePayData>[]>(() => [
    {
      id: 'employee',
      header: 'Employee',
      accessorKey: 'employeeName',
      size: 200,
      cell: ({ row }) => (
        <div className="font-medium sticky left-0 bg-background px-2 py-1">
          {row.original.employeeName}
        </div>
      ),
    },
    ...allPayTypeColumns.map((payType) => ({
      id: payType,
      header: payType,
      size: 100,
      cell: ({ row }) => {
        const employee = row.original;
        const payTypeEntry = employee.payTypes.find(pt => pt.type === payType);
        const payTypeIndex = employee.payTypes.findIndex(pt => pt.type === payType);
        
        if (!payTypeEntry) return <div className="w-20 h-8"></div>;
        
        return (
          <div className="flex gap-1">
            {payTypeEntry.units !== undefined && (
              <Input
                type="number"
                value={payTypeEntry.units}
                onChange={(e) => updateEmployeePayType(employee.employeeId, payTypeIndex, 'units', Number(e.target.value))}
                className="w-16 h-8 text-xs"
                placeholder="Hrs"
              />
            )}
            {payTypeEntry.amount !== undefined && (
              <Input
                type="number"
                value={payTypeEntry.amount}
                onChange={(e) => updateEmployeePayType(employee.employeeId, payTypeIndex, 'amount', Number(e.target.value))}
                className="w-20 h-8 text-xs"
                placeholder="Amt"
              />
            )}
          </div>
        );
      },
    })),
    {
      id: 'addPayType',
      header: () => (
        <div className="text-center">
          <Plus className="h-4 w-4 mx-auto" />
        </div>
      ),
      size: 60,
      cell: ({ row }) => (
        <Popover 
          open={activeAddPayType === row.original.employeeId}
          onOpenChange={(open) => {
            console.log('🔍 Popover state change:', { open, employeeId: row.original.employeeId, payTypesCount: payTypes.length });
            setActiveAddPayType(open ? row.original.employeeId : '');
          }}
        >
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" side="left">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Add Pay Type</h4>
              {payTypesLoading ? (
                <div className="text-sm text-muted-foreground">Loading pay types...</div>
              ) : payTypesError ? (
                <div className="text-sm text-destructive">Error loading pay types</div>
              ) : payTypes.length === 0 ? (
                <div className="text-sm text-muted-foreground">No pay types available. Please configure pay types first.</div>
              ) : (
                <>
                  <Select value={newPayType.type} onValueChange={(value) => {
                    console.log('🔍 Pay type selected:', value);
                    setNewPayType(prev => ({ ...prev, type: value }));
                  }}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select pay type" />
                    </SelectTrigger>
                    <SelectContent>
                      {payTypes.map((pt) => (
                        <SelectItem key={pt.id} value={pt.name}>
                          {pt.name} {pt.code && `(${pt.code})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Hours"
                      value={newPayType.units}
                      onChange={(e) => setNewPayType(prev => ({ ...prev, units: Number(e.target.value) }))}
                      className="h-8"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={newPayType.amount}
                      onChange={(e) => setNewPayType(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="h-8"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full h-8"
                    onClick={() => addPayTypeToEmployee(row.original.employeeId)}
                    disabled={!newPayType.type}
                  >
                    Add
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      ),
    },
    {
      id: 'grossPay',
      header: 'Gross Pay',
      size: 120,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.isCalculating && (
            <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full"></div>
          )}
          <div className="font-medium text-green-600">
            ${row.original.grossPay.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      id: 'taxEstimate',
      header: 'Tax Est.',
      size: 100,
      cell: ({ row }) => (
        <div className="text-orange-600">
          ${row.original.taxEstimate.toFixed(2)}
        </div>
      ),
    },
    {
      id: 'netPay',
      header: 'Net Pay',
      size: 120,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.isCalculating && (
            <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full"></div>
          )}
          <div className="font-medium text-blue-600">
            ${row.original.netPay.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      id: 'audit',
      header: 'AI Audit',
      size: 120,
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.errors.map((error, i) => (
            <Badge key={i} variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {error}
            </Badge>
          ))}
          {row.original.flags.map((flag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {flag}
            </Badge>
          ))}
          {row.original.errors.length === 0 && row.original.flags.length === 0 && (
            <Badge variant="outline" className="text-xs text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              OK
            </Badge>
          )}
        </div>
      ),
    },
  ], [allPayTypeColumns, employeePayData, payTypes, activeAddPayType, newPayType, payTypesLoading, payTypesError]);

  const table = useReactTable({
    data: employeePayData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 100,
    },
  });

  // Scroll to employee in grid
  const scrollToEmployee = (employeeId: string) => {
    const element = document.getElementById(`employee-row-${employeeId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-yellow-100');
      setTimeout(() => element.classList.remove('bg-yellow-100'), 2000);
    }
  };

  // Calculate summary stats with tax breakdown
  const totalGross = employeePayData.reduce((sum, emp) => sum + emp.grossPay, 0);
  const totalTaxes = employeePayData.reduce((sum, emp) => sum + emp.taxEstimate, 0);
  const totalDeductions = employeePayData.reduce((sum, emp) => sum + emp.deductions, 0);
  const totalNet = employeePayData.reduce((sum, emp) => sum + emp.netPay, 0);
  const errorIssues = validationIssues.filter(issue => issue.type === 'error');
  const warningIssues = validationIssues.filter(issue => issue.type === 'warning');
  const suggestionIssues = validationIssues.filter(issue => issue.type === 'suggestion');
  const selectedClientData = clients.find(c => c.id === selectedClient);

  // Initialize calculations on mount and close sidebar on navigation
  useEffect(() => {
    // Auto-close validation panel when navigating to this page
    setValidationPanelOpen(false);
    
    if (employeePayData.length > 0) {
      runAIAudit(employeePayData).then(setEmployeePayData);
    }
  }, [selectedClient]);

  // Auto-close validation panel on page load
  useEffect(() => {
    setValidationPanelOpen(false);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-full">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI-Optimized Payroll Processing</h1>
        <p className="text-muted-foreground">
          High-density grid with dynamic pay types and real-time AI audit
        </p>
      </div>

      {/* Client Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Client Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedClientData && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Schedule Info</label>
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Schedule:</span> {selectedClientData.payrollSchedule}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Pay Date:</span> {selectedClientData.nextPayDate}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content with Sidebar Layout */}
      {selectedClient && (
        <div className="flex gap-6">
          {/* Payroll Grid */}
          <div className={`transition-all duration-300 ${validationPanelOpen ? 'flex-1' : 'w-full'}`}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="h-5 w-5" />
                    Payroll Grid - {employeePayData.length} Employees
                  </CardTitle>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">${totalGross.toFixed(2)}</div>
                      <div className="text-muted-foreground">Gross</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-600">${totalTaxes.toFixed(2)}</div>
                      <div className="text-muted-foreground">Taxes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-600">${totalDeductions.toFixed(2)}</div>
                      <div className="text-muted-foreground">Deductions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">${totalNet.toFixed(2)}</div>
                      <div className="text-muted-foreground">Net</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${errorIssues.length > 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {errorIssues.length}
                      </div>
                      <div className="text-muted-foreground">Errors</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-auto max-h-[600px] border rounded-lg">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-muted z-10">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b">
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="border-r text-left px-2 py-2 font-medium text-sm bg-muted"
                              style={{ width: header.getSize() }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          id={`employee-row-${row.original.employeeId}`}
                          className="border-b hover:bg-muted/50 h-10 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="border-r px-2 py-1 text-sm"
                              style={{ width: cell.column.getSize() }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Validation Sidebar */}
          <div className={`transition-all duration-300 ${validationPanelOpen ? 'w-80' : 'w-12'}`}>
            <Card className="h-fit sticky top-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {validationPanelOpen && (
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5" />
                      AI Validation
                    </CardTitle>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setValidationPanelOpen(!validationPanelOpen)}
                    className="h-8 w-8 p-0"
                  >
                    {validationPanelOpen ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {validationPanelOpen && (
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                  {/* Errors Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      Errors ({errorIssues.length})
                    </div>
                    {errorIssues.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No errors found</p>
                    ) : (
                      <div className="space-y-2">
                        {errorIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg cursor-pointer hover:bg-destructive/20 transition-colors"
                            onClick={() => scrollToEmployee(issue.employeeId)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-xs font-medium">{issue.employeeName}</div>
                                <div className="text-xs text-muted-foreground">{issue.message}</div>
                                <div className="text-xs text-muted-foreground mt-1">{issue.category}</div>
                              </div>
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Warnings Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      Warnings ({warningIssues.length})
                    </div>
                    {warningIssues.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No warnings</p>
                    ) : (
                      <div className="space-y-2">
                        {warningIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className="p-2 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                            onClick={() => scrollToEmployee(issue.employeeId)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-xs font-medium">{issue.employeeName}</div>
                                <div className="text-xs text-muted-foreground">{issue.message}</div>
                                <div className="text-xs text-muted-foreground mt-1">{issue.category}</div>
                              </div>
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Suggestions Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                      <Brain className="h-4 w-4" />
                      AI Suggestions ({suggestionIssues.length})
                    </div>
                    {suggestionIssues.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No suggestions</p>
                    ) : (
                      <div className="space-y-2">
                        {suggestionIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className="p-2 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => scrollToEmployee(issue.employeeId)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-xs font-medium">{issue.employeeName}</div>
                                <div className="text-xs text-muted-foreground">{issue.message}</div>
                                <div className="text-xs text-muted-foreground mt-1">{issue.category}</div>
                              </div>
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Total Issues: {validationIssues.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Must Fix: {errorIssues.length} • Review: {warningIssues.length} • Consider: {suggestionIssues.length}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedClient && employeePayData.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                Preview Payroll
              </Button>
              <Button 
                className="flex items-center gap-2"
                disabled={errorIssues.length > 0}
              >
                <DollarSign className="h-4 w-4" />
                Process Payroll
              </Button>
            </div>
            {errorIssues.length > 0 && (
              <p className="text-sm text-destructive mt-2">
                Fix all {errorIssues.length} error(s) before processing payroll
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};