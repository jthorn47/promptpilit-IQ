import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X } from 'lucide-react';

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

interface PayrollProcessingGridProps {
  employees: Employee[];
  onUpdateEmployee: (employeeId: string, field: keyof Employee, value: any) => void;
  readonly?: boolean;
}

export const PayrollProcessingGrid: React.FC<PayrollProcessingGridProps> = ({
  employees,
  onUpdateEmployee,
  readonly = false
}) => {
  const [editingEmployee, setEditingEmployee] = React.useState<string | null>(null);
  const [editValues, setEditValues] = React.useState<{ [key: string]: any }>({});

  const startEditing = (employeeId: string, employee: Employee) => {
    setEditingEmployee(employeeId);
    setEditValues({
      regularHours: employee.regularHours,
      overtimeHours: employee.overtimeHours,
      bonus: employee.bonus,
      deductions: { ...employee.deductions }
    });
  };

  const saveEdit = (employeeId: string) => {
    Object.entries(editValues).forEach(([field, value]) => {
      if (field !== 'deductions') {
        onUpdateEmployee(employeeId, field as keyof Employee, value);
      } else {
        onUpdateEmployee(employeeId, 'deductions', value);
      }
    });
    setEditingEmployee(null);
    setEditValues({});
  };

  const cancelEdit = () => {
    setEditingEmployee(null);
    setEditValues({});
  };

  const updateEditValue = (field: string, value: any) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalDeductions = (deductions: { [key: string]: number }) => {
    return Object.values(deductions).reduce((sum, amount) => sum + amount, 0);
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No employees found for the selected payroll period.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {readonly ? 'Review employee payroll data:' : 'Click the edit button to modify employee hours and pay:'}
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Regular Hours</TableHead>
              <TableHead>OT Hours</TableHead>
              <TableHead>Bonus</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Hourly Rate</TableHead>
              <TableHead>Gross Pay</TableHead>
              {!readonly && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => {
              const isEditing = editingEmployee === employee.id;
              const totalDeductions = getTotalDeductions(
                isEditing ? (editValues.deductions as { [key: string]: number }) || employee.deductions : employee.deductions
              );
              
              return (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  
                  {/* Regular Hours */}
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editValues.regularHours ?? employee.regularHours}
                        onChange={(e) => updateEditValue('regularHours', Number(e.target.value))}
                        className="w-20"
                        min="0"
                        step="0.25"
                      />
                    ) : (
                      employee.regularHours
                    )}
                  </TableCell>
                  
                  {/* Overtime Hours */}
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editValues.overtimeHours ?? employee.overtimeHours}
                        onChange={(e) => updateEditValue('overtimeHours', Number(e.target.value))}
                        className="w-20"
                        min="0"
                        step="0.25"
                      />
                    ) : (
                      employee.overtimeHours
                    )}
                  </TableCell>
                  
                  {/* Bonus */}
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editValues.bonus ?? employee.bonus}
                        onChange={(e) => updateEditValue('bonus', Number(e.target.value))}
                        className="w-24"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      formatCurrency(employee.bonus)
                    )}
                  </TableCell>
                  
                  {/* Deductions */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{formatCurrency(totalDeductions)}</div>
                      <div className="text-xs text-muted-foreground">
                        {Object.entries(isEditing ? (editValues.deductions as { [key: string]: number }) || employee.deductions : employee.deductions)
                          .map(([type, amount]) => (
                            <Badge key={type} variant="outline" className="mr-1 text-xs">
                              {type}: {formatCurrency(amount as number)}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Hourly Rate */}
                  <TableCell>{formatCurrency(employee.hourlyRate)}</TableCell>
                  
                  {/* Gross Pay */}
                  <TableCell className="font-medium">
                    {formatCurrency(employee.grossPay || 0)}
                  </TableCell>
                  
                  {/* Actions */}
                  {!readonly && (
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => saveEdit(employee.id)}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(employee.id, employee)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* Summary Row */}
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Total Employees:</span>
            <p className="text-lg font-bold">{employees.length}</p>
          </div>
          <div>
            <span className="font-medium">Total Regular Hours:</span>
            <p className="text-lg font-bold">
              {employees.reduce((sum, emp) => sum + emp.regularHours, 0)}
            </p>
          </div>
          <div>
            <span className="font-medium">Total OT Hours:</span>
            <p className="text-lg font-bold">
              {employees.reduce((sum, emp) => sum + emp.overtimeHours, 0)}
            </p>
          </div>
          <div>
            <span className="font-medium">Total Gross Pay:</span>
            <p className="text-lg font-bold">
              {formatCurrency(employees.reduce((sum, emp) => sum + (emp.grossPay || 0), 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};