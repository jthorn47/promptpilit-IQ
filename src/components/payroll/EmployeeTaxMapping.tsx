import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  User, 
  MapPin, 
  Edit, 
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmployeeTaxMapping {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  primaryLocation: {
    state: string;
    city: string;
    address: string;
  };
  workLocations: WorkLocation[];
  residenceState: string;
  taxSetup: {
    isComplete: boolean;
    hasMultiState: boolean;
    nexusTriggered: boolean;
    lastReview: string;
  };
  totalAllocation: number;
}

interface WorkLocation {
  id: string;
  state: string;
  city: string;
  percentage: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  taxRate: number;
}

// Mock data
const mockEmployeeMappings: EmployeeTaxMapping[] = [
  {
    id: '1',
    employeeId: 'EMP-001',
    employeeName: 'John Doe',
    department: 'Engineering',
    primaryLocation: {
      state: 'CA',
      city: 'San Francisco',
      address: '123 Market St'
    },
    workLocations: [
      {
        id: '1',
        state: 'CA',
        city: 'San Francisco',
        percentage: 70,
        startDate: '2024-01-01',
        isActive: true,
        taxRate: 13.3
      },
      {
        id: '2',
        state: 'NY',
        city: 'New York',
        percentage: 30,
        startDate: '2024-01-01',
        isActive: true,
        taxRate: 10.9
      }
    ],
    residenceState: 'CA',
    taxSetup: {
      isComplete: true,
      hasMultiState: true,
      nexusTriggered: false,
      lastReview: '2024-01-15'
    },
    totalAllocation: 100
  },
  {
    id: '2',
    employeeId: 'EMP-002',
    employeeName: 'Jane Smith',
    department: 'Sales',
    primaryLocation: {
      state: 'TX',
      city: 'Austin',
      address: '456 Congress Ave'
    },
    workLocations: [
      {
        id: '3',
        state: 'TX',
        city: 'Austin',
        percentage: 100,
        startDate: '2024-01-01',
        isActive: true,
        taxRate: 0
      }
    ],
    residenceState: 'TX',
    taxSetup: {
      isComplete: true,
      hasMultiState: false,
      nexusTriggered: false,
      lastReview: '2024-01-10'
    },
    totalAllocation: 100
  },
  {
    id: '3',
    employeeId: 'EMP-003',
    employeeName: 'Bob Johnson',
    department: 'Marketing',
    primaryLocation: {
      state: 'FL',
      city: 'Miami',
      address: '789 Ocean Dr'
    },
    workLocations: [
      {
        id: '4',
        state: 'FL',
        city: 'Miami',
        percentage: 60,
        startDate: '2024-01-01',
        isActive: true,
        taxRate: 0
      },
      {
        id: '5',
        state: 'NY',
        city: 'New York',
        percentage: 25,
        startDate: '2024-02-01',
        isActive: true,
        taxRate: 10.9
      }
    ],
    residenceState: 'FL',
    taxSetup: {
      isComplete: false,
      hasMultiState: true,
      nexusTriggered: true,
      lastReview: '2024-01-05'
    },
    totalAllocation: 85
  }
];

export const EmployeeTaxMapping: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeTaxMapping | null>(null);
  const [employees] = useState<EmployeeTaxMapping[]>(mockEmployeeMappings);

  const departments = ['all', ...new Set(employees.map(emp => emp.department))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getSetupStatusColor = (employee: EmployeeTaxMapping) => {
    if (!employee.taxSetup.isComplete) return 'destructive';
    if (employee.taxSetup.nexusTriggered) return 'default';
    if (employee.totalAllocation !== 100) return 'default';
    return 'default';
  };

  const getSetupStatusText = (employee: EmployeeTaxMapping) => {
    if (!employee.taxSetup.isComplete) return 'Incomplete Setup';
    if (employee.taxSetup.nexusTriggered) return 'Nexus Triggered';
    if (employee.totalAllocation !== 100) return 'Allocation Issue';
    return 'Complete';
  };

  const handleViewEmployee = (employee: EmployeeTaxMapping) => {
    setSelectedEmployee(employee);
  };

  const calculateTotalTaxRate = (workLocations: WorkLocation[]) => {
    return workLocations.reduce((total, location) => {
      return total + (location.taxRate * location.percentage / 100);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Tax Mapping</h2>
          <p className="text-muted-foreground">
            Manage tax jurisdiction assignments for all employees
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Employee Location
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee List */}
      <div className="grid gap-4">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {employee.employeeName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{employee.employeeName}</h3>
                      <Badge variant="outline">{employee.employeeId}</Badge>
                      <Badge variant="secondary">{employee.department}</Badge>
                    </div>
                    
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Primary: {employee.primaryLocation.city}, {employee.primaryLocation.state}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Residence: {employee.residenceState}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Settings className="h-4 w-4" />
                        <span>Last Review: {employee.taxSetup.lastReview}</span>
                      </div>
                    </div>
                    
                    {/* Work Locations */}
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Work Locations:</span>
                        {employee.taxSetup.hasMultiState && (
                          <Badge variant="outline" className="text-xs">Multi-State</Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {employee.workLocations.map((location) => (
                          <div key={location.id} className="flex items-center gap-1 text-xs bg-muted rounded-md px-2 py-1">
                            <span className="font-medium">{location.state}</span>
                            <span className="text-muted-foreground">({location.percentage}%)</span>
                            {location.taxRate > 0 && (
                              <span className="text-muted-foreground">• {location.taxRate}%</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Status Indicators */}
                  <div className="text-right">
                    <Badge variant={getSetupStatusColor(employee)}>
                      {getSetupStatusText(employee)}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Allocation: {employee.totalAllocation}%
                    </div>
                    {employee.totalAllocation !== 100 && (
                      <div className="flex items-center gap-1 text-orange-600 text-xs">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Needs Review</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewEmployee(employee)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Employee Detail Modal/Sidebar would go here */}
      {selectedEmployee && (
        <Card className="mt-6 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {selectedEmployee.employeeName} - Tax Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Effective Tax Rate</Label>
                <p className="text-2xl font-bold text-primary">
                  {calculateTotalTaxRate(selectedEmployee.workLocations).toFixed(2)}%
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Total Allocation</Label>
                <p className={`text-2xl font-bold ${
                  selectedEmployee.totalAllocation === 100 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {selectedEmployee.totalAllocation}%
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => setSelectedEmployee(null)}>Close</Button>
              <Button variant="outline">Edit Configuration</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-bold">{employees.length}</p>
            <p className="text-sm text-muted-foreground">Total Employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {employees.filter(e => !e.taxSetup.isComplete || e.totalAllocation !== 100).length}
            </p>
            <p className="text-sm text-muted-foreground">Need Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {employees.filter(e => e.taxSetup.hasMultiState).length}
            </p>
            <p className="text-sm text-muted-foreground">Multi-State</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-bold text-green-600">
              {employees.filter(e => e.taxSetup.nexusTriggered).length}
            </p>
            <p className="text-sm text-muted-foreground">Nexus Triggered</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};