import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccessibleFormField, AccessibleSelectField } from '@/components/AccessibleForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Mail, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  pay_type: string;
  job_category: string;
  department: string;
  invite_sent: boolean;
}

interface EmployeeSetupProps {
  sessionId: string;
  sectionId: string;
  sectionData: any;
  userRole: 'client_admin' | 'onboarding_manager';
  onProgressUpdate: (progress: number, data?: any) => void;
}

export const EmployeeSetup: React.FC<EmployeeSetupProps> = ({
  sessionId,
  sectionId,
  sectionData,
  userRole,
  onProgressUpdate
}) => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState<Employee>({
    first_name: '',
    last_name: '',
    email: '',
    pay_type: '',
    job_category: '',
    department: '',
    invite_sent: false
  });

  const payTypes = [
    { value: 'salary', label: 'Salary' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'commission', label: 'Commission' },
    { value: 'contract', label: 'Contract' }
  ];

  const jobCategories = [
    { value: 'executive', label: 'Executive' },
    { value: 'management', label: 'Management' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'sales', label: 'Sales' },
    { value: 'technical', label: 'Technical' },
    { value: 'operations', label: 'Operations' }
  ];

  const departments = [
    { value: 'executive', label: 'Executive' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'operations', label: 'Operations' },
    { value: 'it', label: 'Information Technology' }
  ];

  useEffect(() => {
    loadEmployees();
  }, [sessionId]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('peo_onboarding_employees')
        .select('*')
        .eq('session_id', sessionId);

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error('Error loading employees:', error);
    }
  };

  const addEmployee = async () => {
    if (!newEmployee.first_name || !newEmployee.last_name || !newEmployee.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required employee fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('peo_onboarding_employees')
        .insert({
          session_id: sessionId,
          ...newEmployee
        })
        .select()
        .single();

      if (error) throw error;

      setEmployees([...employees, data]);
      setNewEmployee({
        first_name: '',
        last_name: '',
        email: '',
        pay_type: '',
        job_category: '',
        department: '',
        invite_sent: false
      });

      updateProgress();

      toast({
        title: "Employee Added",
        description: `${newEmployee.first_name} ${newEmployee.last_name} has been added.`
      });
    } catch (error: any) {
      toast({
        title: "Error Adding Employee",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('peo_onboarding_employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      setEmployees(employees.filter(emp => emp.id !== employeeId));
      updateProgress();

      toast({
        title: "Employee Removed",
        description: "Employee has been removed from the onboarding list."
      });
    } catch (error: any) {
      toast({
        title: "Error Removing Employee",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const sendInvite = async (employeeId: string) => {
    try {
      // Update invite status
      const { error } = await supabase
        .from('peo_onboarding_employees')
        .update({
          invite_sent: true,
          invite_sent_at: new Date().toISOString()
        })
        .eq('id', employeeId);

      if (error) throw error;

      // Reload employees
      loadEmployees();

      toast({
        title: "Invite Sent",
        description: "Onboarding invitation has been sent to the employee."
      });
    } catch (error: any) {
      toast({
        title: "Error Sending Invite",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateProgress = () => {
    const totalEmployees = employees.length;
    const employeesWithAllInfo = employees.filter(emp => 
      emp.pay_type && emp.job_category && emp.department
    ).length;

    const progress = totalEmployees === 0 ? 0 : Math.round((employeesWithAllInfo / totalEmployees) * 100);
    onProgressUpdate(progress, { employees: employees.length });
  };

  return (
    <div className="space-y-6">
      {/* Add New Employee */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <AccessibleFormField
              label="First Name"
              name="first_name"
              value={newEmployee.first_name}
              onChange={(value) => setNewEmployee({ ...newEmployee, first_name: value })}
              required
            />
            <AccessibleFormField
              label="Last Name"
              name="last_name"
              value={newEmployee.last_name}
              onChange={(value) => setNewEmployee({ ...newEmployee, last_name: value })}
              required
            />
            <AccessibleFormField
              label="Email"
              name="email"
              type="email"
              value={newEmployee.email}
              onChange={(value) => setNewEmployee({ ...newEmployee, email: value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <AccessibleSelectField
              label="Pay Type"
              name="pay_type"
              value={newEmployee.pay_type}
              onChange={(value) => setNewEmployee({ ...newEmployee, pay_type: value })}
              options={payTypes}
              placeholder="Select pay type"
            />
            <AccessibleSelectField
              label="Job Category"
              name="job_category"
              value={newEmployee.job_category}
              onChange={(value) => setNewEmployee({ ...newEmployee, job_category: value })}
              options={jobCategories}
              placeholder="Select job category"
            />
            <AccessibleSelectField
              label="Department"
              name="department"
              value={newEmployee.department}
              onChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
              options={departments}
              placeholder="Select department"
            />
          </div>

          <Button onClick={addEmployee} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Roster ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No employees added yet. Add employees above to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Pay Type</TableHead>
                  <TableHead>Job Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.first_name} {employee.last_name}
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.pay_type || '-'}</TableCell>
                    <TableCell>{employee.job_category || '-'}</TableCell>
                    <TableCell>{employee.department || '-'}</TableCell>
                    <TableCell>
                      {employee.invite_sent ? (
                        <Badge variant="default">
                          <Check className="h-3 w-3 mr-1" />
                          Invited
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {!employee.invite_sent && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendInvite(employee.id!)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeEmployee(employee.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Request New Pay Types */}
      <Card>
        <CardHeader>
          <CardTitle>Request New Pay Types or Job Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            If you need pay types or job categories that aren't listed above, please contact your onboarding manager.
          </p>
          <Button variant="outline">
            Contact Onboarding Manager
          </Button>
        </CardContent>
      </Card>

      {/* Approval Notice */}
      {userRole === 'client_admin' && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This section requires onboarding manager approval before you can proceed to the next step.
          </p>
        </div>
      )}
    </div>
  );
};