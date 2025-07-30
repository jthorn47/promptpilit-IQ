import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSelector } from "@/components/ClientSelector";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { 
  Users, 
  Briefcase, 
  Building2, 
  TrendingUp, 
  Plus, 
  Calendar,
  FileText,
  Star,
  Clock,
  CheckCircle,
  Globe,
  UserPlus,
  Eye,
  Settings
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const ATSDashboard = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const { userRole, isSuperAdmin, isCompanyAdmin } = useUserRole();

  // Mock data for demonstration
  const stats = {
    totalJobs: 24,
    totalApplications: 186,
    activeInterviews: 12,
    hiredThisMonth: 8,
    pendingApprovals: 5,
    averageTimeToHire: 14
  };

  const recentApplications = [
    { id: 1, name: "Sarah Johnson", position: "Software Engineer", stage: "Interview", score: 85, applied: "2024-03-10", source: "Internal Board" },
    { id: 2, name: "Mike Chen", position: "Product Manager", stage: "Screening", score: 92, applied: "2024-03-09", source: "Career Page" },
    { id: 3, name: "Emily Davis", position: "UX Designer", stage: "Offer", score: 88, applied: "2024-03-08", source: "Referral" },
    { id: 4, name: "David Wilson", position: "Data Analyst", stage: "Background Check", score: 90, applied: "2024-03-07", source: "LinkedIn" },
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Interview": return "secondary";
      case "Screening": return "outline";
      case "Offer": return "default";
      case "Background Check": return "secondary";
      case "Hired": return "default";
      case "Rejected": return "destructive";
      default: return "outline";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Applicant Tracking System</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applicant Tracking System</h1>
          <p className="text-muted-foreground">Manage hiring pipeline across staffing and internal HR workflows</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Client Selector for Super Admin */}
      {isSuperAdmin && (
        <ClientSelector
          selectedClientId={selectedClientId}
          onClientSelect={setSelectedClientId}
          className="max-w-md"
        />
      )}

      {/* ATS Mode Tabs */}
      <Tabs defaultValue="internal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Internal Hiring
          </TabsTrigger>
          <TabsTrigger value="staffing" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Staffing Operations
          </TabsTrigger>
          <TabsTrigger value="career" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Career Portal
          </TabsTrigger>
        </TabsList>

        {/* Internal HR Tab */}
        <TabsContent value="internal" className="space-y-6">
          {/* Stats Cards - Internal HR */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalJobs}</div>
                <p className="text-xs text-muted-foreground">+3 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">+24 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Interviews</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeInterviews}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hired</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.hiredThisMonth}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Hiring Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Internal Hiring Pipeline
              </CardTitle>
              <CardDescription>Track candidate progress through your internal hiring process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">45</div>
                  <div className="text-sm text-muted-foreground">Applied</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">32</div>
                  <div className="text-sm text-muted-foreground">Screening</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">23</div>
                  <div className="text-sm text-muted-foreground">Interview</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-sm text-muted-foreground">Offer</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">15</div>
                  <div className="text-sm text-muted-foreground">Hired</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Internal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Internal Job Board
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">View and manage internal job postings visible to employees</p>
                <Button size="sm" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Internal Board
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Employee Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Manage employee referral program and track referrals</p>
                <Button size="sm" variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  View Referrals
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Hiring Scorecards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Review candidate evaluations and hiring recommendations</p>
                <Button size="sm" variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  View Scorecards
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staffing Operations Tab */}
        <TabsContent value="staffing" className="space-y-6">
          {/* Stats Cards - Staffing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Job Orders</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">+8 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Candidate Pool</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">Active candidates</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Placements</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fill Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">+5% vs last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Staffing Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Staffing Pipeline
              </CardTitle>
              <CardDescription>Track candidate placements across all client job orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">89</div>
                  <div className="text-sm text-muted-foreground">Sourced</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">67</div>
                  <div className="text-sm text-muted-foreground">Qualified</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">34</div>
                  <div className="text-sm text-muted-foreground">Submitted</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">18</div>
                  <div className="text-sm text-muted-foreground">Interviewing</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">12</div>
                  <div className="text-sm text-muted-foreground">Placed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Portal Tab */}
        <TabsContent value="career" className="space-y-6">
          {/* Career Portal Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Public Jobs</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">Live on career page</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,543</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">From career page</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5.2%</div>
                <p className="text-xs text-muted-foreground">+0.8% this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Career Portal Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Career Page Settings
                </CardTitle>
                <CardDescription>Customize your public career page appearance and content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium">Current Status</h4>
                  <p className="text-sm text-muted-foreground mt-1">Career page is live and accepting applications</p>
                  <Badge className="mt-2">Active</Badge>
                </div>
                <Button className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Customize Career Page
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Embed Code
                </CardTitle>
                <CardDescription>Add your career page to your company website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <code className="text-xs text-muted-foreground">
                    {'<iframe src="https://careers.yourcompany.com" width="100%" height="600"></iframe>'}
                  </code>
                </div>
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Copy Embed Code
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recent Applications
          </CardTitle>
          <CardDescription>Latest candidate applications across all channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((application) => (
              <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="font-medium">{application.name}</div>
                  <div className="text-sm text-muted-foreground">{application.position}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Applied: {application.applied} • Source: {application.source}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge variant={getStageColor(application.stage)}>
                      {application.stage}
                    </Badge>
                    <div className={`text-sm font-medium mt-1 ${getScoreColor(application.score)}`}>
                      Score: {application.score}%
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ATSDashboard;