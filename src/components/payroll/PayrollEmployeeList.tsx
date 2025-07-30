import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Eye, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PayrollEmployee {
  id: string;
  employee_id?: string;
  employee_id_display?: string;
  instructor_name: string;
  company_id: string;
  is_active: boolean;
  regular_hourly_rate?: number;
  standard_class_rate?: number;
  saturday_class_rate?: number;
  location_id?: string;
}

interface PayGroup {
  id: string;
  name: string;
  pay_frequency: string;
}

interface PayrollEmployeeListProps {
  employees: PayrollEmployee[];
  payGroups: PayGroup[];
  selectedEmployees: string[];
  onSelectEmployee: (employeeId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewEmployee: (employeeId: string) => void;
  onEmployeeClick?: (employeeId: string) => void;
  isLoading: boolean;
  searchTerm?: string;
}

export const PayrollEmployeeList: React.FC<PayrollEmployeeListProps> = ({
  employees,
  payGroups,
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  onViewEmployee,
  isLoading,
  searchTerm = '',
  onEmployeeClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    
    return employees.filter(employee => 
      employee.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id_display?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  // Calculate pagination
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);
  const getPayGroupName = (payGroupId?: string) => {
    if (!payGroupId) return 'Unassigned';
    const payGroup = payGroups.find(pg => pg.id === payGroupId);
    return payGroup?.name || 'Unknown';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge variant="default">Active</Badge> : 
      <Badge variant="secondary">Inactive</Badge>;
  };

  const getPayTypeBadge = (employee: PayrollEmployee) => {
    if (employee.regular_hourly_rate) {
      return <Badge variant="outline">Hourly</Badge>;
    } else if (employee.standard_class_rate) {
      return <Badge variant="secondary">Class Rate</Badge>;
    } else {
      return <Badge variant="outline">TBD</Badge>;
    }
  };

  const formatPayFrequency = (frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly';
      case 'bi_weekly':
        return 'Bi-Weekly';
      case 'semi_monthly':
        return 'Semi-Monthly';
      case 'monthly':
        return 'Monthly';
      default:
        return frequency;
    }
  };

  // Calculate next pay date (placeholder logic)
  const getNextPayDate = (frequency: string) => {
    const today = new Date();
    const daysToAdd = frequency === 'weekly' ? 7 : frequency === 'bi_weekly' ? 14 : 30;
    const nextDate = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return nextDate.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedEmployees.length === paginatedEmployees.length && paginatedEmployees.length > 0}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead>Instructor Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Pay Rates</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedEmployees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                {filteredEmployees.length === 0 && searchTerm 
                  ? `No employees found matching "${searchTerm}"`
                  : "No employees found. Create your first employee to get started."
                }
              </TableCell>
            </TableRow>
          ) : (
            paginatedEmployees.map((employee) => (
              <TableRow 
                key={employee.id} 
                className={onEmployeeClick ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={(e) => {
                  // Don't trigger row click if clicking on checkbox or action buttons
                  if (
                    e.target instanceof HTMLElement && 
                    (e.target.closest('button') || e.target.closest('[role="checkbox"]'))
                  ) {
                    return;
                  }
                  onEmployeeClick?.(employee.id);
                }}
              >
                <TableCell>
                  <Checkbox 
                    checked={selectedEmployees.includes(employee.id)}
                    onCheckedChange={(checked) => onSelectEmployee(employee.id, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{employee.instructor_name}</span>
                    {employee.employee_id_display && (
                      <span className="text-sm text-muted-foreground">ID: {employee.employee_id_display}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(employee.is_active)}
                </TableCell>
                <TableCell>
                  {employee.employee_id_display || 'Not set'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {employee.regular_hourly_rate && (
                      <div className="text-xs">Regular: ${employee.regular_hourly_rate}/hr</div>
                    )}
                    {employee.standard_class_rate && (
                      <div className="text-xs">Standard: ${employee.standard_class_rate}/class</div>
                    )}
                    {employee.saturday_class_rate && (
                      <div className="text-xs">Saturday: ${employee.saturday_class_rate}/class</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {employee.location_id || 'Not assigned'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewEmployee(employee.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewEmployee(employee.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Employee
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Employee
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} employees
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Rows per page:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium px-3">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};