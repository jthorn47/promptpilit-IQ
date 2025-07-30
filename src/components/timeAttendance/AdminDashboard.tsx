import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { Employee, TimeEntry, ComplianceAlert } from '@/types/timeAttendance';

interface AdminDashboardProps {
  employees: Employee[];
  timeEntries: TimeEntry[];
  complianceAlerts: ComplianceAlert[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  employees,
  timeEntries,
  complianceAlerts,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const departments = Array.from(new Set(employees.map(emp => emp.department).filter(Boolean)));

  const filteredEmployees = employees.filter(emp => {
    const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const getEmployeeStats = (employeeId: string) => {
    const empEntries = timeEntries.filter(entry => entry.employee_id === employeeId);
    const totalHours = empEntries.reduce((sum, entry) => sum + entry.total_hours, 0);
    const overtimeHours = empEntries.reduce((sum, entry) => sum + entry.overtime_hours, 0);
    const pendingEntries = empEntries.filter(entry => entry.status === 'pending').length;
    
    return { totalHours, overtimeHours, pendingEntries };
  };

  const getCurrentlyWorking = () => {
    // Mock data for currently clocked in employees
    return Math.floor(Math.random() * 15) + 5; // 5-20 employees
  };

  const getMissingPunches = () => {
    return complianceAlerts.filter(alert => alert.alert_type === 'missing_punch').length;
  };

  const getPendingApprovals = () => {
    return timeEntries.filter(entry => entry.status === 'pending').length;
  };

  const getOvertimeEmployees = () => {
    return timeEntries.filter(entry => entry.overtime_hours > 0).length;
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Currently Working</p>
                <p className="text-2xl font-bold text-green-600">{getCurrentlyWorking()}</p>
              </div>
              <Users className="h-8 w-8 text-green-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Missing Punches</p>
                <p className="text-2xl font-bold text-red-600">{getMissingPunches()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600">{getPendingApprovals()}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overtime This Week</p>
                <p className="text-2xl font-bold text-blue-600">{getOvertimeEmployees()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alerts */}
      {complianceAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Compliance Alerts
            </CardTitle>
            <CardDescription>Issues requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 border rounded-lg ${
                    alert.severity === 'high' ? 'border-red-200 bg-red-50' :
                    alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{alert.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.date} • Employee ID: {alert.employee_id}
                      </div>
                    </div>
                    <Badge 
                      variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee List with Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Employee Timecards</CardTitle>
              <CardDescription>Manage and approve employee time entries</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept!}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEmployees.map((employee) => {
              const stats = getEmployeeStats(employee.id);
              return (
                <div
                  key={employee.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {employee.job_title} • {employee.department}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm font-medium">{stats.totalHours.toFixed(1)}h</div>
                      <div className="text-xs text-muted-foreground">This Week</div>
                    </div>
                    
                    {stats.overtimeHours > 0 && (
                      <div className="text-center">
                        <div className="text-sm font-medium text-orange-600">
                          +{stats.overtimeHours.toFixed(1)}h
                        </div>
                        <div className="text-xs text-muted-foreground">Overtime</div>
                      </div>
                    )}
                    
                    {stats.pendingEntries > 0 && (
                      <Badge variant="secondary">
                        {stats.pendingEntries} pending
                      </Badge>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      {stats.pendingEntries > 0 && (
                        <Button size="sm">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No employees found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};