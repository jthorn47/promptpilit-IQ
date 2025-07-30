import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  FileText,
  Upload,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';

interface Employee {
  id: string;
  user_id?: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_id?: string;
  position?: string;
  department?: string;
  location?: string;
  status?: string;
  job_title?: string;
  onboarding_status?: string;
  division?: string;
  created_at: string;
  updated_at: string;
}

interface NewEmployeeForm {
  first_name: string;
  last_name: string;
  email: string;
  employee_id?: string;
  position?: string;
  department?: string;
  location?: string;
  job_title?: string;
}

export const HROIQEmployeeManagementEnhanced: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<NewEmployeeForm>({
    first_name: '',
    last_name: '',
    email: '',
    employee_id: '',
    position: '',
    department: '',
    location: '',
    job_title: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Employee[];
    }
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: NewEmployeeForm) => {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          first_name: employeeData.first_name,
          last_name: employeeData.last_name,
          email: employeeData.email,
          job_title: employeeData.job_title || '',
          department: employeeData.department || '',
          location: employeeData.location || 'Default Location',
          company_id: 'seed-company-001' // TODO: Get from context
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Success',
        description: 'Employee created successfully'
      });
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create employee',
        variant: 'destructive'
      });
    }
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Employee> }) => {
      const { data: updated, error } = await supabase
        .from('employees')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Success',
        description: 'Employee updated successfully'
      });
      setEditingEmployee(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update employee',
        variant: 'destructive'
      });
    }
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Success',
        description: 'Employee deleted successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete employee',
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setNewEmployee({
      first_name: '',
      last_name: '',
      email: '',
      employee_id: '',
      position: '',
      department: '',
      location: '',
      job_title: ''
    });
  };

  const handleSubmit = () => {
    if (!newEmployee.first_name || !newEmployee.last_name || !newEmployee.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (editingEmployee) {
      updateEmployeeMutation.mutate({
        id: editingEmployee.id,
        data: newEmployee
      });
    } else {
      createEmployeeMutation.mutate(newEmployee);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      employee_id: employee.employee_id || '',
      position: employee.position || '',
      department: employee.department || '',
      location: employee.location || '',
      job_title: employee.job_title || ''
    });
    setShowAddDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteEmployeeMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEmployees = employees?.filter(employee =>
    `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-muted-foreground">Manage employee records and information</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingEmployee(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={newEmployee.first_name}
                    onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={newEmployee.last_name}
                    onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="john.doe@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    value={newEmployee.employee_id}
                    onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})}
                    placeholder="EMP001"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                    placeholder="Software Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                    placeholder="Engineering"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newEmployee.location}
                    onChange={(e) => setNewEmployee({...newEmployee, location: e.target.value})}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  value={newEmployee.job_title}
                  onChange={(e) => setNewEmployee({...newEmployee, job_title: e.target.value})}
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                >
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Directory
          </CardTitle>
          <CardDescription>
            View and manage all employee records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading employees...</div>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{employee.first_name} {employee.last_name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                       <p className="text-sm text-muted-foreground">
                         {employee.position || employee.job_title} {employee.department && `• ${employee.department}`}
                       </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                   <div className="text-right">
                     <Badge className={getStatusColor(employee.status || 'unknown')}>
                       {employee.status || 'Unknown'}
                     </Badge>
                     <p className="text-sm text-muted-foreground mt-1">
                       {employee.employee_id && `ID: ${employee.employee_id}`}
                     </p>
                   </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No employees found. Click "Add Employee" to create your first employee record.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{employees?.length || 0}</div>
            <p className="text-muted-foreground text-sm">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {employees?.filter(e => e.status?.toLowerCase() === 'active').length || 0}
            </div>
            <p className="text-muted-foreground text-sm">Currently employed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inactive/Terminated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {employees?.filter(e => e.status?.toLowerCase() !== 'active').length || 0}
            </div>
            <p className="text-muted-foreground text-sm">Need attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HROIQEmployeeManagementEnhanced;