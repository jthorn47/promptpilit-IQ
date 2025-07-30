import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  Users, 
  Award, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Calendar,
  MessageCircle,
  CreditCard,
  BookOpen,
  Shield,
  TrendingUp,
  Bell
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompanyData {
  id: string;
  company_name: string;
  subscription_status: string;
  max_employees: number;
  primary_color: string;
  company_logo_url?: string;
}

interface TrainingProgress {
  total_modules: number;
  completed_modules: number;
  in_progress_modules: number;
  completion_rate: number;
  recent_completions: Array<{
    module_name: string;
    completed_at: string;
    employee_name: string;
  }>;
}

interface ComplianceStatus {
  overall_score: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  assessments_completed: number;
  total_assessments: number;
  upcoming_renewals: Array<{
    item: string;
    due_date: string;
    status: string;
  }>;
}

export const ClientPortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [user]);

  const fetchClientData = async () => {
    if (!user) return;

    try {
      // Get user's company data
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) {
        toast({
          title: "No Company Found",
          description: "You don't appear to be associated with a company yet.",
          variant: "destructive",
        });
        return;
      }

      // Fetch company settings
      const { data: company } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      if (company) {
        setCompanyData(company);
      }

      // Mock data for now - you can replace with real queries
      setTrainingProgress({
        total_modules: 12,
        completed_modules: 8,
        in_progress_modules: 2,
        completion_rate: 67,
        recent_completions: [
          { module_name: "Sexual Harassment Prevention", completed_at: "2024-01-15", employee_name: "John Smith" },
          { module_name: "Workplace Safety", completed_at: "2024-01-14", employee_name: "Sarah Johnson" },
          { module_name: "Data Privacy Training", completed_at: "2024-01-12", employee_name: "Mike Wilson" }
        ]
      });

      setComplianceStatus({
        overall_score: 85,
        status: 'compliant',
        assessments_completed: 4,
        total_assessments: 5,
        upcoming_renewals: [
          { item: "OSHA Safety Training", due_date: "2024-03-15", status: "due_soon" },
          { item: "Sexual Harassment Training", due_date: "2024-04-01", status: "upcoming" }
        ]
      });

    } catch (error) {
      console.error('Error fetching client data:', error);
      toast({
        title: "Error",
        description: "Failed to load your company data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600';
      case 'at_risk': return 'text-yellow-600';
      case 'non_compliant': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'at_risk': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'non_compliant': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Company Not Found</h3>
          <p className="text-muted-foreground">Please contact your administrator to set up your company profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {companyData.company_logo_url ? (
            <img 
              src={companyData.company_logo_url} 
              alt={companyData.company_name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{companyData.company_name}</h1>
            <p className="text-muted-foreground">Client Portal</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={companyData.subscription_status === 'premium' ? 'default' : 'secondary'}
          >
            {companyData.subscription_status?.toUpperCase()}
          </Badge>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingProgress?.completion_rate}%</div>
            <p className="text-xs text-muted-foreground">
              {trainingProgress?.completed_modules} of {trainingProgress?.total_modules} modules completed
            </p>
            <Progress value={trainingProgress?.completion_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {complianceStatus && getStatusIcon(complianceStatus.status)}
              <div className="text-2xl font-bold">{complianceStatus?.overall_score}%</div>
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceStatus?.assessments_completed} of {complianceStatus?.total_assessments} assessments complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companyData.max_employees}</div>
            <p className="text-xs text-muted-foreground">
              Licensed employee count
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Training Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Training Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingProgress?.recent_completions.map((completion, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{completion.module_name}</p>
                        <p className="text-sm text-muted-foreground">{completion.employee_name}</p>
                      </div>
                      <Badge variant="outline">{completion.completed_at}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Renewals */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Renewals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceStatus?.upcoming_renewals.map((renewal, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{renewal.item}</p>
                        <p className="text-sm text-muted-foreground">Due: {renewal.due_date}</p>
                      </div>
                      <Badge 
                        variant={renewal.status === 'due_soon' ? 'destructive' : 'outline'}
                      >
                        {renewal.status === 'due_soon' ? 'Due Soon' : 'Upcoming'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Modules</CardTitle>
              <p className="text-muted-foreground">Track your team's learning progress</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Sexual Harassment Prevention", progress: 100, status: "completed" },
                  { name: "Workplace Safety Fundamentals", progress: 75, status: "in_progress" },
                  { name: "Data Privacy & GDPR", progress: 100, status: "completed" },
                  { name: "Diversity & Inclusion", progress: 0, status: "not_started" },
                  { name: "Leadership Development", progress: 50, status: "in_progress" }
                ].map((module, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{module.name}</h4>
                      <div className="flex items-center space-x-2 mt-2">
                        <Progress value={module.progress} className="flex-1" />
                        <span className="text-sm text-muted-foreground">{module.progress}%</span>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        module.status === 'completed' ? 'default' : 
                        module.status === 'in_progress' ? 'secondary' : 'outline'
                      }
                      className="ml-4"
                    >
                      {module.status === 'completed' ? 'Completed' : 
                       module.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
              <p className="text-muted-foreground">Stay compliant with regulations and requirements</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">85%</div>
                  <p className="text-muted-foreground">Overall Compliance Score</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { area: "OSHA Safety Compliance", score: 92, status: "compliant" },
                    { area: "Sexual Harassment Training", score: 88, status: "compliant" },
                    { area: "Data Privacy (GDPR)", score: 75, status: "at_risk" },
                    { area: "Workplace Violence Prevention", score: 90, status: "compliant" },
                    { area: "Anti-Discrimination Training", score: 65, status: "non_compliant" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <h4 className="font-medium">{item.area}</h4>
                          <p className="text-sm text-muted-foreground">Score: {item.score}%</p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          item.status === 'compliant' ? 'default' : 
                          item.status === 'at_risk' ? 'secondary' : 'destructive'
                        }
                      >
                        {item.status === 'compliant' ? 'Compliant' : 
                         item.status === 'at_risk' ? 'At Risk' : 'Non-Compliant'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <p className="text-muted-foreground">Access your policies, handbooks, and certificates</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Employee Handbook 2024", type: "handbook", date: "2024-01-01", size: "2.3 MB" },
                  { name: "Safety Policies", type: "policy", date: "2024-01-15", size: "1.8 MB" },
                  { name: "Code of Conduct", type: "policy", date: "2024-01-01", size: "856 KB" },
                  { name: "Training Certificates", type: "certificate", date: "2024-01-20", size: "3.2 MB" },
                  { name: "Compliance Report Q1", type: "report", date: "2024-01-31", size: "1.2 MB" }
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {doc.date} • {doc.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <p className="text-muted-foreground">Manage your subscription and billing information</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Current Plan</h4>
                    <p className="text-sm text-muted-foreground">
                      {companyData.subscription_status?.toUpperCase()} • {companyData.max_employees} employees
                    </p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Recent Invoices</h4>
                  {[
                    { invoice: "INV-2024-001", date: "2024-01-01", amount: "$299.00", status: "paid" },
                    { invoice: "INV-2023-012", date: "2023-12-01", amount: "$299.00", status: "paid" },
                    { invoice: "INV-2023-011", date: "2023-11-01", amount: "$299.00", status: "paid" }
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h5 className="font-medium">{invoice.invoice}</h5>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{invoice.amount}</p>
                        <Badge variant="outline">Paid</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Support & Help</CardTitle>
              <p className="text-muted-foreground">Get help from our HR consulting experts</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="h-auto p-6 flex flex-col items-start space-y-2">
                        <MessageCircle className="w-6 h-6" />
                        <h4 className="font-medium">Start New Conversation</h4>
                        <p className="text-sm text-muted-foreground">Chat with our support team</p>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Start New Conversation</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Input id="subject" placeholder="Brief description of your issue" />
                        </div>
                        <div>
                          <Label htmlFor="message">Message</Label>
                          <Textarea 
                            id="message" 
                            placeholder="Describe your question or issue in detail..."
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <select id="priority" className="w-full p-2 border rounded-md">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            toast({
                              title: "Conversation Started",
                              description: "Your support request has been submitted. We'll respond within 24 hours.",
                            });
                          }}
                        >
                          Send Message
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-auto p-6 flex flex-col items-start space-y-2">
                        <Calendar className="w-6 h-6" />
                        <h4 className="font-medium">Schedule Consultation</h4>
                        <p className="text-sm text-muted-foreground">Book time with an HR expert</p>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Schedule Consultation</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="consultation-type">Consultation Type</Label>
                          <select id="consultation-type" className="w-full p-2 border rounded-md">
                            <option value="general">General HR Consultation</option>
                            <option value="compliance">Compliance Review</option>
                            <option value="training">Training Strategy</option>
                            <option value="policy">Policy Development</option>
                            <option value="assessment">Risk Assessment</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="preferred-date">Preferred Date</Label>
                          <Input id="preferred-date" type="date" />
                        </div>
                        <div>
                          <Label htmlFor="preferred-time">Preferred Time</Label>
                          <select id="preferred-time" className="w-full p-2 border rounded-md">
                            <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                            <option value="afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
                            <option value="flexible">Flexible</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="consultation-notes">Additional Notes</Label>
                          <Textarea 
                            id="consultation-notes" 
                            placeholder="Let us know what you'd like to discuss..."
                            rows={3}
                          />
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            toast({
                              title: "Consultation Requested",
                              description: "We'll contact you within 24 hours to confirm your appointment.",
                            });
                          }}
                        >
                          Request Consultation
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Recent Support Tickets</h4>
                  {[
                    { id: "TICK-001", subject: "Question about OSHA compliance", status: "resolved", date: "2024-01-15" },
                    { id: "TICK-002", subject: "Employee handbook update request", status: "in_progress", date: "2024-01-20" },
                    { id: "TICK-003", subject: "Training module access issue", status: "resolved", date: "2024-01-18" }
                  ].map((ticket, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h5 className="font-medium">{ticket.subject}</h5>
                        <p className="text-sm text-muted-foreground">#{ticket.id} • {ticket.date}</p>
                      </div>
                      <Badge 
                        variant={ticket.status === 'resolved' ? 'default' : 'secondary'}
                      >
                        {ticket.status === 'resolved' ? 'Resolved' : 'In Progress'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};