import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Download,
  Building,
  UserCircle,
  MapPin,
  DollarSign,
  Mail
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { EmployeeDetailView } from '@/components/employee/EmployeeDetailView';

type Employee = Database['public']['Tables']['employees']['Row'];

interface EmployeesTabProps {
  clientId: string;
}

export const EmployeesTab = ({ clientId }: EmployeesTabProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [jobTitleFilter, setJobTitleFilter] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, [clientId]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', clientId)
        .order('first_name', { ascending: true });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedEmployee(null);
    setViewMode('list');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'terminated':
        return <Badge className="bg-red-100 text-red-800">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get unique values for filters
  const departments = Array.from(new Set(employees.map(emp => emp.department).filter(Boolean)));
  const locations = Array.from(new Set(employees.map(emp => emp.location).filter(Boolean)));
  const jobTitles = Array.from(new Set(employees.map(emp => emp.job_title || emp.position).filter(Boolean)));

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.employee_id && employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || employee.location === locationFilter;
    const matchesJobTitle = jobTitleFilter === 'all' || 
      (employee.job_title === jobTitleFilter || employee.position === jobTitleFilter);
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesLocation && matchesJobTitle;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading employees...</div>
      </div>
    );
  }

  const handleExportCSV = () => {
    // Implementation for CSV export
    const csvContent = [
      ['Name', 'Email', 'Position', 'Department', 'Location', 'Status'],
      ...filteredEmployees.map(emp => [
        `${emp.first_name} ${emp.last_name}`,
        emp.email,
        emp.position || emp.job_title || '',
        emp.department || '',
        emp.location || '',
        emp.status || 'active'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (viewMode === 'detail' && selectedEmployee) {
    return (
      <EmployeeDetailView 
        employee={selectedEmployee}
        onBack={handleBackToList}
        onSave={(updatedEmployee) => {
          // Handle saving updated employee data
          setSelectedEmployee(null);
          setViewMode('list');
          fetchEmployees();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Management
          </h3>
          <p className="text-muted-foreground">
            Manage employees and their information for this client
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {employees.filter(emp => emp.status === 'active').length}
                </p>
              </div>
              <UserCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">+0</p>
                <p className="text-xs text-muted-foreground">New hires</p>
              </div>
              <Plus className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept || ''}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employees ({filteredEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div 
                      className="font-medium cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      {employee.first_name} {employee.last_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.employee_id || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>{employee.department || 'N/A'}</TableCell>
                  <TableCell>{employee.position || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {employee.email}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(employee.status || 'active')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEmployeeClick(employee)}>
                        View
                      </Button>
                      <Button size="sm" variant="ghost">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all' 
                  ? 'No employees match your filters' 
                  : 'No employees found'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};