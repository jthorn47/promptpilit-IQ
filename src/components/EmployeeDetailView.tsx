import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Briefcase,
  Award,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Building
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string | null;
  department: string | null;
  employee_id: string | null;
  status: string | null;
  preferred_language: string | null;
  created_at: string;
  updated_at: string;
  company_id: string | null;
}

interface Company {
  id: string;
  company_name: string;
}

interface TrainingAssignment {
  id: string;
  training_module_id: string;
  assigned_at: string;
  due_date: string | null;
  status: string | null;
  priority: string | null;
  training_modules: {
    title: string;
    credit_value: number;
  };
}

interface TrainingCompletion {
  id: string;
  training_module_id: string;
  completed_at: string | null;
  started_at: string | null;
  status: string | null;
  progress_percentage: number | null;
  quiz_score: number | null;
  quiz_passed: boolean | null;
  training_modules: {
    title: string;
    credit_value: number;
  };
}

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  expires_at: string | null;
  status: string | null;
  training_modules: {
    title: string;
  };
}

export const EmployeeDetailView = () => {
  const { companyId, employeeId } = useParams<{ companyId: string; employeeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [completions, setCompletions] = useState<TrainingCompletion[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeId && companyId) {
      fetchEmployeeDetails();
    }
  }, [employeeId, companyId]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);

      // Fetch employee details
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("*")
        .eq("id", employeeId)
        .single();

      if (employeeError) throw employeeError;
      setEmployee(employeeData);

      // Fetch company details
      const { data: companyData, error: companyError } = await supabase
        .from("company_settings")
        .select("id, company_name")
        .eq("id", companyId)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData);

      // Fetch training assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("training_assignments")
        .select(`
          *,
          training_modules(title, credit_value)
        `)
        .eq("employee_id", employeeId)
        .order("assigned_at", { ascending: false });

      if (assignmentsError) {
        console.error("Error fetching assignments:", assignmentsError);
      } else {
        setAssignments(assignmentsData || []);
      }

      // Fetch training completions
      const { data: completionsData, error: completionsError } = await supabase
        .from("training_completions")
        .select(`
          *,
          training_modules(title, credit_value)
        `)
        .eq("employee_id", employeeId)
        .order("completed_at", { ascending: false });

      if (completionsError) {
        console.error("Error fetching completions:", completionsError);
      } else {
        setCompletions(completionsData || []);
      }

      // Fetch certificates
      const { data: certificatesData, error: certificatesError } = await supabase
        .from("certificates")
        .select(`
          *,
          training_modules(title)
        `)
        .eq("employee_id", employeeId)
        .order("issued_at", { ascending: false });

      if (certificatesError) {
        console.error("Error fetching certificates:", certificatesError);
      } else {
        setCertificates(certificatesData || []);
      }

    } catch (error) {
      console.error("Error fetching employee details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employee details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'default';
      case 'assigned':
        return 'secondary';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'assigned':
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/admin/companies/${companyId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Company
          </Button>
        </div>
        <div className="text-center py-8">Loading employee details...</div>
      </div>
    );
  }

  if (!employee || !company) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/admin/companies/${companyId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Company
          </Button>
        </div>
        <div className="text-center py-8">Employee not found</div>
      </div>
    );
  }

  const totalCreditsEarned = completions
    .filter(completion => completion.status === 'completed')
    .reduce((total, completion) => total + (completion.training_modules?.credit_value || 0), 0);

  const completionRate = assignments.length > 0 
    ? Math.round((completions.filter(c => c.status === 'completed').length / assignments.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/admin/companies/${companyId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Company
        </Button>
      </div>

      {/* Employee Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
              </div>
              
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <User className="w-6 h-6" />
                  {employee.first_name} {employee.last_name}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span>{company.company_name}</span>
                  </div>
                  {employee.position && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{employee.position}</span>
                    </div>
                  )}
                  <Badge variant={getStatusBadgeVariant(employee.status)}>
                    {employee.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Credits Earned</span>
            </div>
            <div className="text-2xl font-bold mt-1">{totalCreditsEarned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {completions.filter(c => c.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Assigned</span>
            </div>
            <div className="text-2xl font-bold mt-1">{assignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Completion Rate</span>
            </div>
            <div className="text-2xl font-bold mt-1">{completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="assignments">Assignments ({assignments.length})</TabsTrigger>
          <TabsTrigger value="completions">Completions ({completions.length})</TabsTrigger>
          <TabsTrigger value="certificates">Certificates ({certificates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-lg">{employee.first_name} {employee.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p>{employee.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                    <p>{employee.employee_id || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div>
                      <Badge variant={getStatusBadgeVariant(employee.status)}>
                        {employee.status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Position</label>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <p>{employee.position || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                    <p>{employee.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preferred Language</label>
                    <p>{employee.preferred_language || 'English'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company</label>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <p>{company.company_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p>{format(new Date(employee.created_at), "PPP")}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p>{format(new Date(employee.updated_at), "PPP")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No training assignments found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Training Module</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Assigned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {assignment.training_modules?.title || 'Unknown Module'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            {assignment.training_modules?.credit_value || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(assignment.status)}
                            <Badge variant={getStatusBadgeVariant(assignment.status)}>
                              {assignment.status || 'Unknown'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadgeVariant(assignment.priority)}>
                            {assignment.priority || 'Normal'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignment.due_date 
                            ? format(new Date(assignment.due_date), "MMM dd, yyyy")
                            : 'No due date'
                          }
                        </TableCell>
                        <TableCell>
                          {format(new Date(assignment.assigned_at), "MMM dd, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Completions</CardTitle>
            </CardHeader>
            <CardContent>
              {completions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No training completions found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Training Module</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Quiz Score</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completions.map((completion) => (
                      <TableRow key={completion.id}>
                        <TableCell className="font-medium">
                          {completion.training_modules?.title || 'Unknown Module'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            {completion.training_modules?.credit_value || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(completion.status)}
                            <Badge variant={getStatusBadgeVariant(completion.status)}>
                              {completion.status || 'Unknown'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${completion.progress_percentage || 0}%` }}
                              />
                            </div>
                            <span className="text-sm">{completion.progress_percentage || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {completion.quiz_score !== null ? (
                            <div className="flex items-center gap-1">
                              <span>{completion.quiz_score}%</span>
                              {completion.quiz_passed && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {completion.started_at 
                            ? format(new Date(completion.started_at), "MMM dd, yyyy")
                            : 'Not started'
                          }
                        </TableCell>
                        <TableCell>
                          {completion.completed_at 
                            ? format(new Date(completion.completed_at), "MMM dd, yyyy")
                            : 'Not completed'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No certificates found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate Number</TableHead>
                      <TableHead>Training Module</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issued Date</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell className="font-mono">
                          {certificate.certificate_number}
                        </TableCell>
                        <TableCell>
                          {certificate.training_modules?.title || 'Unknown Module'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(certificate.status)}>
                            {certificate.status || 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(certificate.issued_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {certificate.expires_at 
                            ? format(new Date(certificate.expires_at), "MMM dd, yyyy")
                            : 'Never'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};