import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  FileText,
  Upload,
  MoreHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export const HROIQEmployeeManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock employee data
  const employees = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      department: 'Engineering',
      position: 'Software Engineer',
      onboardingStatus: 'completed',
      startDate: '2024-01-15',
      documents: 5
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      department: 'Marketing',
      position: 'Marketing Manager',
      onboardingStatus: 'in_progress',
      startDate: '2024-02-01',
      documents: 3
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@company.com',
      department: 'Sales',
      position: 'Sales Representative',
      onboardingStatus: 'pending',
      startDate: '2024-02-15',
      documents: 1
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-muted-foreground">Manage employee records and onboarding status</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
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
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                    <p className="text-sm text-muted-foreground">{employee.position} • {employee.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge className={getStatusColor(employee.onboardingStatus)}>
                      {employee.onboardingStatus.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start: {employee.startDate}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      {employee.documents} docs
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{employees.length}</div>
            <p className="text-muted-foreground text-sm">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Onboarding Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {employees.filter(e => e.onboardingStatus === 'completed').length}
            </div>
            <p className="text-muted-foreground text-sm">Completed onboarding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {employees.filter(e => e.onboardingStatus !== 'completed').length}
            </div>
            <p className="text-muted-foreground text-sm">Need attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HROIQEmployeeManagement;