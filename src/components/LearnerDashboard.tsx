import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Clock, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Target,
  TrendingUp,
  Play,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VimeoPlayer } from "@/components/VimeoPlayer";
import { TrainingModal } from "@/components/TrainingModal";

interface Assignment {
  id: string;
  due_date: string | null;
  status: string;
  priority: string;
  assigned_at: string;
  training_modules: {
    id: string;
    title: string;
    description: string;
    estimated_duration: number;
    video_type: string;
    vimeo_video_id: string | null;
    vimeo_embed_url: string | null;
    completion_threshold_percentage: number;
  };
  training_completions?: {
    id: string;
    status: string;
    progress_percentage: number;
    completed_at: string | null;
    quiz_score: number | null;
    video_watched_seconds: number;
    video_total_seconds: number;
  };
}

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  expires_at: string | null;
  status: string;
  pdf_url: string | null;
  training_modules: {
    title: string;
  };
}

interface LearnerStats {
  totalAssignments: number;
  completedTraining: number;
  inProgress: number;
  certificates: number;
  overdue: number;
  upcomingDue: number;
}

export const LearnerDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<LearnerStats>({
    totalAssignments: 0,
    completedTraining: 0,
    inProgress: 0,
    certificates: 0,
    overdue: 0,
    upcomingDue: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTraining, setSelectedTraining] = useState<Assignment | null>(null);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLearnerData();
    }
  }, [user]);

  const fetchLearnerData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get the employee record for this user
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!employeeData) {
        console.log('No employee record found for user');
        setLoading(false);
        return;
      }

      const employeeId = employeeData.id;

      // Fetch assignments with training modules and completions
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('training_assignments')
        .select(`
          *,
          training_modules (
            id,
            title,
            description,
            estimated_duration,
            video_type,
            vimeo_video_id,
            vimeo_embed_url,
            completion_threshold_percentage
          ),
          training_completions (
            id,
            status,
            progress_percentage,
            completed_at,
            quiz_score,
            video_watched_seconds,
            video_total_seconds
          )
        `)
        .eq('employee_id', employeeId)
        .order('assigned_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Fetch certificates
      const { data: certificatesData, error: certificatesError } = await supabase
        .from('certificates')
        .select(`
          *,
          training_modules (title)
        `)
        .eq('employee_id', employeeId)
        .order('issued_at', { ascending: false });

      if (certificatesError) throw certificatesError;

      const assignmentsList = assignmentsData || [];
      const certificatesList = certificatesData || [];

      setAssignments(assignmentsList as Assignment[]);
      setCertificates(certificatesList);

      // Calculate stats
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const completedCount = assignmentsList.filter(a => 
        a.training_completions?.status === 'completed'
      ).length;

      const inProgressCount = assignmentsList.filter(a => 
        a.training_completions?.status === 'in_progress' ||
        (a.training_completions?.progress_percentage || 0) > 0
      ).length;

      const overdueCount = assignmentsList.filter(a => 
        a.due_date && 
        new Date(a.due_date) < now && 
        a.training_completions?.status !== 'completed'
      ).length;

      const upcomingDueCount = assignmentsList.filter(a => 
        a.due_date && 
        new Date(a.due_date) >= now && 
        new Date(a.due_date) <= oneWeekFromNow &&
        a.training_completions?.status !== 'completed'
      ).length;

      setStats({
        totalAssignments: assignmentsList.length,
        completedTraining: completedCount,
        inProgress: inProgressCount,
        certificates: certificatesList.length,
        overdue: overdueCount,
        upcomingDue: upcomingDueCount
      });

    } catch (error) {
      console.error('Error fetching learner data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your training data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startTraining = (assignment: Assignment) => {
    setSelectedTraining(assignment);
    setIsTrainingModalOpen(true);
  };

  const downloadCertificate = (certificate: Certificate) => {
    if (certificate.pdf_url) {
      window.open(certificate.pdf_url, '_blank');
    } else {
      toast({
        title: "Not Available",
        description: "Certificate PDF is not available for download",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    const completion = assignment.training_completions;
    const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();
    
    if (completion?.status === 'completed') {
      return <Badge variant="default" className="bg-green-600">Completed</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (completion?.progress_percentage && completion.progress_percentage > 0) {
      return <Badge variant="secondary">In Progress</Badge>;
    }
    return <Badge variant="outline">Not Started</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      high: { variant: "destructive" as const, label: "High Priority" },
      normal: { variant: "secondary" as const, label: "Normal" },
      low: { variant: "outline" as const, label: "Low Priority" }
    };
    const { variant, label } = config[priority as keyof typeof config] || config.normal;
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Learning Dashboard</h1>
          <p className="text-muted-foreground">Track your training progress and access your certificates</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Training</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedTraining}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAssignments > 0 
                ? Math.round((stats.completedTraining / stats.totalAssignments) * 100)
                : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.certificates}</div>
            <p className="text-xs text-muted-foreground">earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.upcomingDue}</div>
            <p className="text-xs text-muted-foreground">within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="training" className="space-y-6">
        <TabsList>
          <TabsTrigger value="training">My Training</TabsTrigger>
          <TabsTrigger value="certificates">My Certificates</TabsTrigger>
          <TabsTrigger value="progress">Progress Report</TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Assignments</CardTitle>
              <CardDescription>
                Your assigned training modules and their completion status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No training assigned</h3>
                  <p className="text-muted-foreground">
                    You don't have any training assignments yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => {
                    const completion = assignment.training_completions;
                    const progress = completion?.progress_percentage || 0;
                    const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();
                    
                    return (
                      <Card key={assignment.id} className={isOverdue ? "border-red-200 bg-red-50" : ""}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {assignment.training_modules.title}
                                </h3>
                                {getStatusBadge(assignment)}
                                {getPriorityBadge(assignment.priority)}
                              </div>
                              
                              <p className="text-muted-foreground mb-4">
                                {assignment.training_modules.description}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                {assignment.due_date && (
                                  <div className="flex items-center gap-2">
                                    <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`} />
                                    <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    Duration: {assignment.training_modules.estimated_duration || 'N/A'} min
                                  </span>
                                </div>
                              </div>

                              {progress > 0 && (
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">Progress</span>
                                    <span className="text-sm font-medium">{progress}%</span>
                                  </div>
                                  <Progress value={progress} className="h-2" />
                                </div>
                              )}

                              {completion?.completed_at && (
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>Completed: {new Date(completion.completed_at).toLocaleDateString()}</span>
                                  {completion.quiz_score && (
                                    <span>Score: {completion.quiz_score}%</span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="ml-4">
                              {completion?.status !== 'completed' ? (
                                <Button 
                                  onClick={() => startTraining(assignment)}
                                  className={isOverdue ? "bg-red-600 hover:bg-red-700" : ""}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  {progress > 0 ? 'Continue' : 'Start'} Training
                                </Button>
                              ) : (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="w-4 w-4 mr-2" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Certificates</CardTitle>
              <CardDescription>
                Certificates earned from completed training
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No certificates yet</h3>
                  <p className="text-muted-foreground">
                    Complete training modules to earn certificates
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((certificate) => (
                    <Card key={certificate.id} className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <Award className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                          <h3 className="font-semibold text-lg mb-2">
                            {certificate.training_modules.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Certificate #{certificate.certificate_number}
                          </p>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Issued:</span> {new Date(certificate.issued_at).toLocaleDateString()}
                            </div>
                            {certificate.expires_at && (
                              <div>
                                <span className="font-medium">Expires:</span> {new Date(certificate.expires_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {certificate.pdf_url && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-4"
                              onClick={() => downloadCertificate(certificate)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
                <CardDescription>Your training completion statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Completion</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.totalAssignments > 0 
                          ? Math.round((stats.completedTraining / stats.totalAssignments) * 100)
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={stats.totalAssignments > 0 
                        ? (stats.completedTraining / stats.totalAssignments) * 100
                        : 0
                      } 
                      className="h-3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.completedTraining}</div>
                      <div className="text-sm text-green-700">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                      <div className="text-sm text-blue-700">In Progress</div>
                    </div>
                  </div>

                  {stats.overdue > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">
                          {stats.overdue} training module{stats.overdue > 1 ? 's' : ''} overdue
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest training activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments
                    .filter(a => a.training_completions?.completed_at)
                    .slice(0, 5)
                    .map((assignment) => (
                      <div key={assignment.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{assignment.training_modules.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Completed {new Date(assignment.training_completions!.completed_at!).toLocaleDateString()}
                          </p>
                        </div>
                        {assignment.training_completions?.quiz_score && (
                          <Badge variant="outline">
                            {assignment.training_completions.quiz_score}%
                          </Badge>
                        )}
                      </div>
                    ))}
                  
                  {assignments.filter(a => a.training_completions?.completed_at).length === 0 && (
                    <div className="text-center py-8">
                      <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No completed training yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Training Modal */}
      <TrainingModal
        isOpen={isTrainingModalOpen}
        onClose={() => {
          setIsTrainingModalOpen(false);
          setSelectedTraining(null);
        }}
        assignment={selectedTraining}
        employeeId={user?.id || ''}
        onTrainingComplete={() => {
          // Refresh data after training completion
          fetchLearnerData();
        }}
      />
    </div>
  );
};