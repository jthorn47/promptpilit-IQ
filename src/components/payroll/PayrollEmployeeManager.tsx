import React, { useState } from 'react';
import { Plus, Search, Filter, Users, Download, Archive, UserCheck, Home, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';
import { PayrollEmployeeList } from './PayrollEmployeeList';
import { PayrollEmployeeProfile } from './PayrollEmployeeProfile';
import { AddPayrollEmployeeForm } from './AddPayrollEmployeeForm';
import { usePayrollEmployees, useGenerateTestEmployees } from '@/domains/payroll/hooks/usePayrollEmployeeManagement';
import { usePayGroups } from '@/domains/payroll/hooks/usePayGroups';

interface PayrollEmployeeManagerProps {
  companyId: string;
}

export const PayrollEmployeeManager: React.FC<PayrollEmployeeManagerProps> = ({ companyId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [payGroupFilter, setPayGroupFilter] = useState<string>('all');
  const [payFrequencyFilter, setPayFrequencyFilter] = useState<string>('all');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  const { data: employees = [], isLoading } = usePayrollEmployees(companyId);
  const { data: payGroups = [] } = usePayGroups(companyId);
  const generateTestEmployees = useGenerateTestEmployees();

  const handleGenerateTestData = async () => {
    try {
      await generateTestEmployees.mutateAsync(companyId);
      toast({
        title: "Success",
        description: "Generated 50 test employees successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate test employees",
        variant: "destructive",
      });
    }
  };

  const handleBulkExport = () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select employees to export",
        variant: "destructive",
      });
      return;
    }
    
    // TODO: Implement bulk export functionality
    toast({
      title: "Export Started",
      description: `Exporting ${selectedEmployees.length} employees...`,
    });
  };

  const handleBulkArchive = () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select employees to archive",
        variant: "destructive",
      });
      return;
    }
    
    // TODO: Implement bulk archive functionality
    toast({
      title: "Archive Started",
      description: `Archiving ${selectedEmployees.length} employees...`,
    });
  };

  const handleBulkAssignPayGroup = () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select employees to assign to pay group",
        variant: "destructive",
      });
      return;
    }
    
    // TODO: Implement bulk pay group assignment
    toast({
      title: "Assignment Started",
      description: `Assigning ${selectedEmployees.length} employees to pay group...`,
    });
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && employee.is_active) ||
      (statusFilter === 'inactive' && !employee.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.is_active).length;
  const testEmployees = 0; // This field doesn't exist in current table

  if (selectedEmployeeId) {
    return (
      <PayrollEmployeeProfile 
        employeeId={selectedEmployeeId}
        onBack={() => setSelectedEmployeeId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/payroll" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Payroll
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Employee Manager</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateTestData}
            disabled={generateTestEmployees.isPending}
          >
            <Users className="h-4 w-4 mr-2" />
            Generate Test Data
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <AddPayrollEmployeeForm 
                companyId={companyId}
                onSuccess={() => setShowAddDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Employees</CardTitle>
            <Badge variant="secondary" className="text-xs">TEST</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pay Groups</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payGroups.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search employees by name, email, or employee number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={payGroupFilter} onValueChange={setPayGroupFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Pay Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {payGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={payFrequencyFilter} onValueChange={setPayFrequencyFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequencies</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="semi_monthly">Semi-Monthly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedEmployees.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedEmployees.length} employee(s) selected
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={handleBulkExport}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkArchive}>
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkAssignPayGroup}>
                    <UserCheck className="h-4 w-4 mr-1" />
                    Assign Pay Group
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee List */}
      <PayrollEmployeeList
        employees={filteredEmployees}
        payGroups={payGroups}
        selectedEmployees={selectedEmployees}
        searchTerm={searchTerm}
        onSelectEmployee={(employeeId, selected) => {
          if (selected) {
            setSelectedEmployees([...selectedEmployees, employeeId]);
          } else {
            setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
          }
        }}
        onSelectAll={(selected) => {
          if (selected) {
            setSelectedEmployees(filteredEmployees.map(e => e.id));
          } else {
            setSelectedEmployees([]);
          }
        }}
        onViewEmployee={(employeeId) => setSelectedEmployeeId(employeeId)}
        onEmployeeClick={(employeeId) => setSelectedEmployeeId(employeeId)}
        isLoading={isLoading}
      />
    </div>
  );
};