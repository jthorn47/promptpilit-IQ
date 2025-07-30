import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Users, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComplianceStatus {
  employeeId: string;
  employeeName: string;
  department: string;
  requiredModules: number;
  completedModules: number;
  overdueCourses: number;
  nextDueDate: string | null;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceMetrics {
  totalEmployees: number;
  compliantEmployees: number;
  partiallyCompliant: number;
  nonCompliant: number;
  overallComplianceRate: number;
  criticalOverdue: number;
}

interface ComplianceTrackerProps {
  companyId?: string;
  timeRange?: string;
}

export function ComplianceTracker({ companyId, timeRange = '30' }: ComplianceTrackerProps) {
  const [complianceData, setComplianceData] = useState<ComplianceStatus[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchComplianceData();
  }, [companyId, timeRange, selectedDepartment]);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);

      // Fetch employee compliance status
      let query = supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          department,
          training_assignments(
            id,
            due_date,
            status,
            training_modules(title, is_required),
            training_completions(status, completed_at)
          )
        `)
        .eq('status', 'active');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data: employees, error } = await query;

      if (error) throw error;

      // Process compliance data
      const processedData: ComplianceStatus[] = employees?.map(employee => {
        const assignments = employee.training_assignments || [];
        const requiredAssignments = assignments.filter(a => a.training_modules?.is_required);
        const completedAssignments = assignments.filter(a => 
          Array.isArray(a.training_completions) && a.training_completions.some(c => c.status === 'completed')
        );
        
        const now = new Date();
        const overdueCourses = assignments.filter(a => 
          a.due_date && new Date(a.due_date) < now && 
          !(Array.isArray(a.training_completions) && a.training_completions.some(c => c.status === 'completed'))
        ).length;

        const upcomingDueDates = assignments
          .filter(a => a.due_date && !(Array.isArray(a.training_completions) && a.training_completions.some(c => c.status === 'completed')))
          .map(a => new Date(a.due_date!))
          .sort((a, b) => a.getTime() - b.getTime());

        const nextDueDate = upcomingDueDates.length > 0 ? upcomingDueDates[0].toISOString() : null;

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (overdueCourses > 2) riskLevel = 'critical';
        else if (overdueCourses > 1) riskLevel = 'high';
        else if (overdueCourses > 0) riskLevel = 'medium';

        return {
          employeeId: employee.id,
          employeeName: `${employee.first_name} ${employee.last_name}`,
          department: employee.department || 'Not Set',
          requiredModules: requiredAssignments.length,
          completedModules: completedAssignments.length,
          overdueCourses,
          nextDueDate,
          riskLevel
        };
      }) || [];

      // Filter by department if selected
      const filteredData = selectedDepartment === 'all' 
        ? processedData 
        : processedData.filter(emp => emp.department === selectedDepartment);

      setComplianceData(filteredData);

      // Calculate metrics
      const totalEmployees = filteredData.length;
      const compliantEmployees = filteredData.filter(emp => 
        emp.completedModules === emp.requiredModules && emp.overdueCourses === 0
      ).length;
      const partiallyCompliant = filteredData.filter(emp => 
        emp.completedModules > 0 && emp.completedModules < emp.requiredModules
      ).length;
      const nonCompliant = filteredData.filter(emp => 
        emp.completedModules === 0 || emp.overdueCourses > 0
      ).length;
      const criticalOverdue = filteredData.filter(emp => emp.riskLevel === 'critical').length;

      setMetrics({
        totalEmployees,
        compliantEmployees,
        partiallyCompliant,
        nonCompliant,
        overallComplianceRate: totalEmployees > 0 ? (compliantEmployees / totalEmployees) * 100 : 0,
        criticalOverdue
      });

    } catch (error) {
      console.error('Error fetching compliance data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch compliance data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Critical
        </Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-500">High Risk</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Medium Risk</Badge>;
      default:
        return <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Compliant
        </Badge>;
    }
  };

  const departments = [...new Set(complianceData.map(emp => emp.department))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compliance Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.overallComplianceRate.toFixed(1)}%
            </div>
            <Progress value={metrics?.overallComplianceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fully Compliant</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.compliantEmployees}</div>
            <p className="text-xs text-muted-foreground">
              of {metrics?.totalEmployees} employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.criticalOverdue}</div>
            <p className="text-xs text-muted-foreground">
              require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partially Compliant</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics?.partiallyCompliant}</div>
            <p className="text-xs text-muted-foreground">
              in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Compliance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Compliance Status
          </CardTitle>
          <CardDescription>
            Detailed compliance tracking for all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Compliance Table */}
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3">Employee</th>
                    <th className="text-left p-3">Department</th>
                    <th className="text-left p-3">Progress</th>
                    <th className="text-left p-3">Overdue</th>
                    <th className="text-left p-3">Next Due</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceData.map((employee) => (
                    <tr key={employee.employeeId} className="border-b">
                      <td className="p-3 font-medium">{employee.employeeName}</td>
                      <td className="p-3">
                        <Badge variant="outline">{employee.department}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={employee.requiredModules > 0 ? (employee.completedModules / employee.requiredModules) * 100 : 0}
                            className="w-20"
                          />
                          <span className="text-sm">
                            {employee.completedModules}/{employee.requiredModules}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        {employee.overdueCourses > 0 ? (
                          <Badge variant="destructive">{employee.overdueCourses}</Badge>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </td>
                      <td className="p-3">
                        {employee.nextDueDate ? (
                          <span className="text-sm">
                            {new Date(employee.nextDueDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        {getRiskBadge(employee.riskLevel)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}