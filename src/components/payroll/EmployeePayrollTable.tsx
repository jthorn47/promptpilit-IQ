import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { 
  useEmployeePayrollData, 
  useEmployeePayRates,
  useEmployeeDeductions,
  useEmployeeAdjustments,
  useEmployeeTimeEntries,
  useUpdateTimecardEntry 
} from '@/hooks/usePayGroups';
import { useToast } from '@/components/ui/use-toast';

interface Employee {
  employee_id: string;
  employee_name: string;
  employee_email?: string;
  pay_group_id: string;
  assigned_at: string;
  is_active: boolean;
}

interface EmployeePayrollTableProps {
  employees: Employee[];
  payPeriodId: string;
}

interface EmployeePayrollRow {
  employee: Employee;
  payType: 'hourly' | 'salary';
  hourlyRate: number;
  regularHours: number;
  overtimeHours: number;
  bonuses: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  isLoading: boolean;
}

// Individual Employee Row Component
const EmployeePayrollRow: React.FC<{
  employee: Employee;
  payPeriodId: string;
  editingEmployee: string | null;
  editValues: { [key: string]: any };
  setEditingEmployee: (id: string | null) => void;
  setEditValues: (values: { [key: string]: any }) => void;
  onSave: (employeeId: string) => void;
  onCancel: () => void;
}> = ({
  employee,
  payPeriodId,
  editingEmployee,
  editValues,
  setEditingEmployee,
  setEditValues,
  onSave,
  onCancel
}) => {
  // Fetch employee data
  const { data: payRates, isLoading: loadingRates } = useEmployeePayRates(employee.employee_id);
  const { data: deductions = [], isLoading: loadingDeductions } = useEmployeeDeductions(employee.employee_id);
  const { data: adjustments = [], isLoading: loadingAdjustments } = useEmployeeAdjustments(employee.employee_id);
  const { data: timeEntries = [], isLoading: loadingTimeEntries } = useEmployeeTimeEntries(employee.employee_id, payPeriodId);

  const isLoading = loadingRates || loadingDeductions || loadingAdjustments || loadingTimeEntries;
  const isEditing = editingEmployee === employee.employee_id;

  // Calculate values
  const hourlyRate = payRates?.rate_amount || 25.00;
  const payType = payRates?.rate_type || 'hourly';
  
  // Calculate hours from time entries or use edited values
  const totalRegularHours = isEditing 
    ? (editValues.regular_hours || 0)
    : timeEntries.reduce((sum, entry) => sum + (entry.regular_hours || 0), 0) || 40;
  
  const totalOvertimeHours = isEditing
    ? (editValues.overtime_hours || 0) 
    : timeEntries.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0);

  // Calculate bonuses and deductions
  const totalBonuses = isEditing
    ? (editValues.bonuses || 0)
    : adjustments.reduce((sum, adj) => sum + adj.amount, 0);

  const totalDeductions = isEditing
    ? (editValues.deductions || 0)
    : deductions.reduce((sum, ded) => {
        if (ded.is_percentage) {
          return sum + ((hourlyRate * totalRegularHours) * (ded.amount / 100));
        }
        return sum + ded.amount;
      }, 0);

  // Auto-calculate gross and net pay
  const grossPay = (totalRegularHours * hourlyRate) + (totalOvertimeHours * hourlyRate * 1.5) + totalBonuses;
  const netPay = grossPay - totalDeductions;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const startEditing = () => {
    setEditingEmployee(employee.employee_id);
    setEditValues({
      regular_hours: totalRegularHours,
      overtime_hours: totalOvertimeHours,
      bonuses: totalBonuses,
      deductions: totalDeductions
    });
  };

  if (isLoading) {
    return (
      <TableRow>
        <TableCell className="font-medium">{employee.employee_name}</TableCell>
        <TableCell colSpan={8} className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading payroll data...</span>
          </div>
        </TableCell>
        <TableCell></TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{employee.employee_name}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">{payType}</Badge>
      </TableCell>
      <TableCell>{formatCurrency(hourlyRate)}/hr</TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            step="0.25"
            value={editValues.regular_hours || 0}
            onChange={(e) => setEditValues({...editValues, regular_hours: parseFloat(e.target.value) || 0})}
            className="w-20"
          />
        ) : (
          totalRegularHours.toFixed(2)
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            step="0.25"
            value={editValues.overtime_hours || 0}
            onChange={(e) => setEditValues({...editValues, overtime_hours: parseFloat(e.target.value) || 0})}
            className="w-20"
          />
        ) : (
          totalOvertimeHours.toFixed(2)
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            step="0.01"
            value={editValues.bonuses || 0}
            onChange={(e) => setEditValues({...editValues, bonuses: parseFloat(e.target.value) || 0})}
            className="w-24"
          />
        ) : (
          formatCurrency(totalBonuses)
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            step="0.01"
            value={editValues.deductions || 0}
            onChange={(e) => setEditValues({...editValues, deductions: parseFloat(e.target.value) || 0})}
            className="w-24"
          />
        ) : (
          formatCurrency(totalDeductions)
        )}
      </TableCell>
      <TableCell className="font-semibold">{formatCurrency(grossPay)}</TableCell>
      <TableCell className="font-semibold text-primary">{formatCurrency(netPay)}</TableCell>
      <TableCell>
        {isEditing ? (
          <div className="flex gap-1">
            <Button size="sm" onClick={() => onSave(employee.employee_id)}>
              <CheckCircle className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              ×
            </Button>
          </div>
        ) : (
          <Button 
            size="sm" 
            variant="ghost"
            onClick={startEditing}
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export const EmployeePayrollTable: React.FC<EmployeePayrollTableProps> = ({
  employees,
  payPeriodId
}) => {
  const { toast } = useToast();
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: any }>({});
  const updateTimecardMutation = useUpdateTimecardEntry();

  const saveEdits = async (employeeId: string) => {
    try {
      // In a real app, this would update the appropriate payroll records
      // For now, we'll simulate saving the timecard entries
      await updateTimecardMutation.mutateAsync({
        id: `timecard-${employeeId}`,
        updates: editValues
      });
      
      toast({
        title: "Changes Saved",
        description: "Employee payroll data has been updated.",
      });
      
      setEditingEmployee(null);
      setEditValues({});
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditingEmployee(null);
    setEditValues({});
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>No employees found in this pay group.</p>
        <p className="text-sm">Add employees to the pay group to continue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Employee Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Pay Type</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Regular Hours</TableHead>
              <TableHead>Overtime Hours</TableHead>
              <TableHead>Bonuses</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Gross Pay</TableHead>
              <TableHead>Net Pay</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <EmployeePayrollRow
                key={employee.employee_id}
                employee={employee}
                payPeriodId={payPeriodId}
                editingEmployee={editingEmployee}
                editValues={editValues}
                setEditingEmployee={setEditingEmployee}
                setEditValues={setEditValues}
                onSave={saveEdits}
                onCancel={cancelEdit}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};