import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  Calendar,
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
  company_id: string;
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
    description: string | null;
    credit_value: number;
  } | null;
}

interface TrainingCompletion {
  id: string;
  training_module_id: string;
  completed_at: string | null;
  progress_percentage: number | null;
  status: string | null;
}

export const LearnerPortal = () => {
  const { learnerId } = useParams<{ learnerId: string }>();
  
  const [learner, setLearner] = useState<Employee | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [completions, setCompletions] = useState<TrainingCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (learnerId) {
      fetchLearnerData();
    }
  }, [learnerId]);

  const fetchLearnerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch learner details
      const { data: learnerData, error: learnerError } = await supabase
        .from("employees")
        .select("*")
        .eq("id", learnerId)
        .single();

      if (learnerError) {
        if (learnerError.code === 'PGRST116') {
          setError("Learner not found");
        } else {
          throw learnerError;
        }
        return;
      }
      
      setLearner(learnerData);

      // Fetch company details
      const { data: companyData, error: companyError } = await supabase
        .from("company_settings")
        .select("id, company_name")
        .eq("id", learnerData.company_id)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData);

      // Fetch training assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("training_assignments")
        .select(`
          *,
          training_modules(title, description, credit_value)
        `)
        .eq("employee_id", learnerId)
        .order("assigned_at", { ascending: false });

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);

      // Fetch training completions
      const { data: completionsData, error: completionsError } = await supabase
        .from("training_completions")
        .select("*")
        .eq("employee_id", learnerId);

      if (completionsError) throw completionsError;
      setCompletions(completionsData || []);

    } catch (error) {
      console.error("Error fetching learner data:", error);
      setError("Failed to load learner information");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'assigned':
      case 'in_progress':
        return 'secondary';
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
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getCompletionForModule = (moduleId: string) => {
    return completions.find(c => c.training_module_id === moduleId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your training dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !learner || !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Error</h2>
              <p className="text-muted-foreground">{error || "Unable to access training dashboard"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalCreditsEarned = completions
    .filter(completion => completion.status === 'completed')
    .reduce((total, completion) => {
      const assignment = assignments.find(a => a.training_module_id === completion.training_module_id);
      return total + (assignment?.training_modules?.credit_value || 0);
    }, 0);

  const completionRate = assignments.length > 0 
    ? Math.round((completions.filter(c => c.status === 'completed').length / assignments.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">
              {learner.first_name.charAt(0)}{learner.last_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <GraduationCap className="w-8 h-8" />
                Training Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
                Welcome, {learner.first_name} {learner.last_name}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {company.company_name}
                </div>
                {learner.position && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {learner.position}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Credits Earned</p>
                  <p className="text-3xl font-bold">{totalCreditsEarned}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Trainings</p>
                  <p className="text-3xl font-bold">
                    {completions.filter(c => c.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold">{completionRate}%</p>
                  <Progress value={completionRate} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Trainings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Your Assigned Trainings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Trainings Assigned</h3>
                <p className="text-muted-foreground">
                  You don't have any training assignments yet. Check back later or contact your administrator.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Training Module</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => {
                    const completion = getCompletionForModule(assignment.training_module_id);
                    const isCompleted = completion?.status === 'completed';
                    
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {assignment.training_modules?.title || 'Unknown Module'}
                            </p>
                            {assignment.training_modules?.description && (
                              <p className="text-sm text-muted-foreground">
                                {assignment.training_modules.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            {assignment.training_modules?.credit_value || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(completion?.status || assignment.status)}
                            <Badge variant={getStatusBadgeVariant(completion?.status || assignment.status)}>
                              {completion?.status || assignment.status || 'Assigned'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadgeVariant(assignment.priority)}>
                            {assignment.priority || 'Normal'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={completion?.progress_percentage || 0} 
                              className="w-16"
                            />
                            <span className="text-sm text-muted-foreground">
                              {completion?.progress_percentage || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {assignment.due_date ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {format(new Date(assignment.due_date), "MMM d, yyyy")}
                            </div>
                          ) : (
                            'No due date'
                          )}
                        </TableCell>
                        <TableCell>
                          {isCompleted ? (
                            <Badge variant="default">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => window.location.href = `/training/${assignment.id}`}
                            >
                              Start Training
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};