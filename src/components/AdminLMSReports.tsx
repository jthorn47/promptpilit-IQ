import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Clock, 
  BookOpen,
  Download,
  Calendar,
  Filter,
  FileText,
  AlertTriangle,
  CheckCircle,
  Mail,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReportExporter } from "./reports/ReportExporter";
import { ComplianceTracker } from "./reports/ComplianceTracker";
import { ScheduledReports } from "./reports/ScheduledReports";
import { CertificateManager } from "./reports/CertificateManager";

interface CompletionStats {
  totalEmployees: number;
  totalModules: number;
  totalCompletions: number;
  totalCertificates: number;
  averageCompletionRate: number;
  averageScore: number;
}

interface ModuleReport {
  id: string;
  title: string;
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number;
  averageTimeSpent: number;
  completionRate: number;
}

interface EmployeeReport {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  assignedModules: number;
  completedModules: number;
  averageScore: number;
  totalTimeSpent: number;
  lastActivity: string;
}

export function AdminLMSReports() {
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [moduleReports, setModuleReports] = useState<ModuleReport[]>([]);
  const [employeeReports, setEmployeeReports] = useState<EmployeeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("30");
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Fetch overall statistics
      const [employeesResult, modulesResult, completionsResult, certificatesResult] = await Promise.all([
        supabase.from('employees').select('id').eq('status', 'active'),
        supabase.from('training_modules').select('id').eq('status', 'published'),
        supabase.from('training_completions').select('*'),
        supabase.from('certificates').select('id').eq('status', 'active')
      ]);

      if (employeesResult.error) throw employeesResult.error;
      if (modulesResult.error) throw modulesResult.error;
      if (completionsResult.error) throw completionsResult.error;
      if (certificatesResult.error) throw certificatesResult.error;

      const completions = completionsResult.data || [];
      const completedCount = completions.filter(c => c.status === 'completed').length;
      const averageScore = completions.length > 0 
        ? completions.reduce((sum, c) => sum + (c.quiz_score || 0), 0) / completions.length 
        : 0;

      setStats({
        totalEmployees: employeesResult.data?.length || 0,
        totalModules: modulesResult.data?.length || 0,
        totalCompletions: completedCount,
        totalCertificates: certificatesResult.data?.length || 0,
        averageCompletionRate: employeesResult.data?.length > 0 
          ? (completedCount / employeesResult.data.length) * 100 
          : 0,
        averageScore
      });

      // Fetch module reports
      const moduleReportsQuery = await supabase
        .from('training_modules')
        .select(`
          id,
          title,
          training_assignments(
            id,
            training_completions(
              status,
              quiz_score,
              video_watched_seconds
            )
          )
        `)
        .eq('status', 'published');

      if (moduleReportsQuery.error) throw moduleReportsQuery.error;

      const moduleReportsData = moduleReportsQuery.data?.map(module => {
        const assignments = module.training_assignments || [];
        const completions = assignments.flatMap(a => a.training_completions || []);
        const completedCount = completions.filter(c => c.status === 'completed').length;
        
        return {
          id: module.id,
          title: module.title,
          totalAssignments: assignments.length,
          completedAssignments: completedCount,
          averageScore: completions.length > 0 
            ? completions.reduce((sum, c) => sum + (c.quiz_score || 0), 0) / completions.length 
            : 0,
          averageTimeSpent: completions.length > 0 
            ? completions.reduce((sum, c) => sum + (c.video_watched_seconds || 0), 0) / completions.length 
            : 0,
          completionRate: assignments.length > 0 ? (completedCount / assignments.length) * 100 : 0
        };
      }) || [];

      setModuleReports(moduleReportsData);

      // Fetch employee reports
      const employeeReportsQuery = await supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          email,
          department,
          training_assignments(
            id,
            training_completions(
              status,
              quiz_score,
              video_watched_seconds,
              completed_at
            )
          )
        `)
        .eq('status', 'active');

      if (employeeReportsQuery.error) throw employeeReportsQuery.error;

      const employeeReportsData = employeeReportsQuery.data?.map(employee => {
        const assignments = employee.training_assignments || [];
        const completions = assignments.flatMap(a => a.training_completions || []);
        const completedCount = completions.filter(c => c.status === 'completed').length;
        const lastCompletion = completions
          .filter(c => c.completed_at)
          .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0];

        return {
          id: employee.id,
          firstName: employee.first_name,
          lastName: employee.last_name,
          email: employee.email,
          department: employee.department || 'Not Set',
          assignedModules: assignments.length,
          completedModules: completedCount,
          averageScore: completions.length > 0 
            ? completions.reduce((sum, c) => sum + (c.quiz_score || 0), 0) / completions.length 
            : 0,
          totalTimeSpent: completions.reduce((sum, c) => sum + (c.video_watched_seconds || 0), 0),
          lastActivity: lastCompletion?.completed_at || 'Never'
        };
      }) || [];

      setEmployeeReports(employeeReportsData);

    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployeeReports = employeeReports.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employeeReports.map(e => e.department))];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const exportReports = () => {
    toast({
      title: "Export Started",
      description: "Your reports are being prepared for download.",
    });
    // TODO: Implement actual export functionality
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LMS Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and performance insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReports} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalModules || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCompletions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCertificates || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageCompletionRate.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageScore.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modules">Module Performance</TabsTrigger>
          <TabsTrigger value="employees">Employee Progress</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Tracker</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="exports">Export Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Module Performance</CardTitle>
              <CardDescription>
                Completion rates and performance metrics for each training module
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module Title</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead>Completions</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Avg Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moduleReports.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">{module.title}</TableCell>
                      <TableCell>{module.totalAssignments}</TableCell>
                      <TableCell>{module.completedAssignments}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={module.completionRate} className="w-16" />
                          <span className="text-sm">{module.completionRate.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{module.averageScore.toFixed(1)}%</TableCell>
                      <TableCell>{formatTime(module.averageTimeSpent)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Progress</CardTitle>
              <CardDescription>
                Individual employee training progress and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployeeReports.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                          <div className="text-sm text-muted-foreground">{employee.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.department}</Badge>
                      </TableCell>
                      <TableCell>{employee.assignedModules}</TableCell>
                      <TableCell>{employee.completedModules}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={employee.assignedModules > 0 ? (employee.completedModules / employee.assignedModules) * 100 : 0} 
                            className="w-16" 
                          />
                          <span className="text-sm">
                            {employee.assignedModules > 0 ? 
                              ((employee.completedModules / employee.assignedModules) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{employee.averageScore.toFixed(1)}%</TableCell>
                      <TableCell>{formatTime(employee.totalTimeSpent)}</TableCell>
                      <TableCell>
                        {employee.lastActivity !== 'Never' ? 
                          new Date(employee.lastActivity).toLocaleDateString() : 
                          'Never'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <ComplianceTracker timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <CertificateManager />
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <ReportExporter 
            data={filteredEmployeeReports}
            reportType="Employee Progress"
            columns={[
              { key: 'firstName', label: 'First Name' },
              { key: 'lastName', label: 'Last Name' },
              { key: 'email', label: 'Email' },
              { key: 'department', label: 'Department' },
              { key: 'assignedModules', label: 'Assigned Modules' },
              { key: 'completedModules', label: 'Completed Modules' },
              { key: 'averageScore', label: 'Average Score' },
              { key: 'totalTimeSpent', label: 'Time Spent (seconds)' },
              { key: 'lastActivity', label: 'Last Activity' }
            ]}
            companyName="EaseLearn"
          />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <ScheduledReports />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion Trends</CardTitle>
                <CardDescription>Training completion trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Chart visualization coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Performance breakdown by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map((dept) => {
                    const deptEmployees = employeeReports.filter(e => e.department === dept);
                    const totalAssigned = deptEmployees.reduce((sum, e) => sum + e.assignedModules, 0);
                    const totalCompleted = deptEmployees.reduce((sum, e) => sum + e.completedModules, 0);
                    const completionRate = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;

                    return (
                      <div key={dept} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{dept}</span>
                          <span className="text-sm text-muted-foreground">
                            {completionRate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}