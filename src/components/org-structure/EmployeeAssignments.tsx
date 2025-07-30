import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Division, Department, Location, EmployeeOrgAssignment } from '@/hooks/useOrgStructure';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_id: string;
}

interface EmployeeAssignmentsProps {
  assignments: EmployeeOrgAssignment[];
  divisions: Division[];
  departments: Department[];
  locations: Location[];
  loading: boolean;
  onAssign: (assignment: Omit<EmployeeOrgAssignment, 'id' | 'created_at' | 'updated_at'>) => Promise<EmployeeOrgAssignment>;
  onBulkAssign?: (assignments: Omit<EmployeeOrgAssignment, 'id' | 'created_at' | 'updated_at'>[]) => Promise<EmployeeOrgAssignment[]>;
  companyId: string;
}

export const EmployeeAssignments = ({ 
  assignments, 
  divisions, 
  departments, 
  locations, 
  loading, 
  onAssign,
  onBulkAssign,
  companyId 
}: EmployeeAssignmentsProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [unassignedEmployees, setUnassignedEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, [companyId]);

  useEffect(() => {
    // Filter employees who are not yet assigned
    const assignedEmployeeIds = new Set(assignments.map(a => a.employee_id));
    const unassigned = employees.filter(emp => !assignedEmployeeIds.has(emp.id));
    setUnassignedEmployees(unassigned);
  }, [employees, assignments]);

  // Auto-assign location if there's only one
  useEffect(() => {
    if (locations.length === 1 && !selectedLocation) {
      setSelectedLocation(locations[0].id);
    }
  }, [locations, selectedLocation]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email, company_id')
        .eq('company_id', companyId);

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'destructive',
      });
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
  };

  const getDivisionName = (divisionId: string) => {
    const division = divisions.find(d => d.id === divisionId);
    return division?.name || 'Unknown Division';
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department?.name || 'Unknown Department';
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const getFilteredDepartments = () => {
    return departments.filter(dept => dept.division_id === selectedDivision);
  };

  const getFilteredLocations = () => {
    // In the new hierarchy, we need to find divisions for the selected department
    // and then get locations for those divisions
    const selectedDept = departments.find(d => d.id === selectedDepartment);
    if (!selectedDept) return [];
    
    const divisionForDept = divisions.find(d => d.id === selectedDept.division_id);
    if (!divisionForDept) return [];
    
    return locations.filter(loc => loc.id === divisionForDept.location_id);
  };

  const handleAssignEmployee = async () => {
    if (!selectedEmployee || !selectedDivision || !selectedDepartment || !selectedLocation) {
      toast({
        title: 'Error',
        description: 'Please select all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onAssign({
        employee_id: selectedEmployee,
        division_id: selectedDivision,
        department_id: selectedDepartment,
        location_id: selectedLocation,
        effective_date: new Date().toISOString().split('T')[0],
      });

      // Reset form
      setSelectedEmployee('');
      setSelectedDivision('');
      setSelectedDepartment('');
      setSelectedLocation('');
    } catch (error) {
      console.error('Error assigning employee:', error);
    }
  };

  const handleBulkAssignToLocation = async () => {
    if (!onBulkAssign || locations.length === 0 || divisions.length === 0 || departments.length === 0) return;
    
    const primaryLocation = locations[0];
    const primaryDivision = divisions[0]; // Use first division as default
    const primaryDepartment = departments[0]; // Use first department as default
    
    const assignments = unassignedEmployees.map(employee => ({
      employee_id: employee.id,
      location_id: primaryLocation.id,
      division_id: primaryDivision.id,
      department_id: primaryDepartment.id,
      effective_date: new Date().toISOString().split('T')[0],
    }));

    try {
      await onBulkAssign(assignments);
      toast({
        title: 'Success',
        description: `Assigned ${unassignedEmployees.length} employees to ${primaryLocation.name}`,
      });
    } catch (error) {
      console.error('Error bulk assigning employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign employees',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading employee assignments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Employee
          </CardTitle>
          <CardDescription>
            Assign employees to their organizational structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {unassignedEmployees.length > 0 && onBulkAssign && (
            <div className="flex justify-end">
              <Button 
                onClick={handleBulkAssignToLocation}
                variant="outline"
                size="sm"
              >
                Auto-assign all {unassignedEmployees.length} employees to {locations[0]?.name || 'location'}
              </Button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Division</label>
              <Select 
                value={selectedDivision} 
                onValueChange={(value) => {
                  setSelectedDivision(value);
                  setSelectedDepartment('');
                  setSelectedLocation('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select 
                value={selectedDepartment} 
                onValueChange={(value) => {
                  setSelectedDepartment(value);
                  setSelectedLocation('');
                }}
                disabled={!selectedDivision}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredDepartments().map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select 
                value={selectedLocation} 
                onValueChange={setSelectedLocation}
                disabled={locations.length <= 1} // Auto-selected when only one location
              >
                <SelectTrigger>
                  <SelectValue placeholder={locations.length === 1 ? `Auto-selected: ${locations[0]?.name}` : "Select location"} />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredLocations().map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleAssignEmployee}
            disabled={!selectedEmployee || !selectedDivision || !selectedDepartment || !selectedLocation}
          >
            Assign Employee
          </Button>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">No assignments yet</h3>
              <p className="text-muted-foreground">Assign employees to divisions, departments, and locations.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Effective Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {getEmployeeName(assignment.employee_id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getDivisionName(assignment.division_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getDepartmentName(assignment.department_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getLocationName(assignment.location_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.effective_date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};