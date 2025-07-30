import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CreditCard, 
  Phone, 
  ShieldCheck, 
  FileText, 
  Clock,
  TrendingUp,
  UserPlus,
  MessageSquare,
  Zap,
  Download,
  AlertCircle,
  CheckCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for client admin dashboard
const mockClientData = {
  company: {
    name: 'Acme Corporation',
    employees: 248,
    credits: 1240,
    creditsUsed: 890,
    repContact: 'Sarah Johnson',
    repPhone: '+1 (555) 123-4567'
  },
  compliance: {
    sb553Progress: 82,
    trainingCompletion: 94,
    planDownloads: 15,
    nextDeadline: '2024-08-15'
  },
  serviceCases: [
    { id: 'SC-001', title: 'Policy Update Request', status: 'open', sla: '2 hours', priority: 'high' },
    { id: 'SC-002', title: 'Training Material Update', status: 'in-progress', sla: '6 hours', priority: 'medium' },
    { id: 'SC-003', title: 'Compliance Audit Prep', status: 'completed', sla: 'Complete', priority: 'low' }
  ],
  insights: {
    trainingHours: 2847,
    monthlyTrend: '+12%',
    topDepartments: ['HR', 'Operations', 'Sales'],
    riskAreas: ['Safety Training', 'Diversity Training']
  },
  aiRecommendations: [
    {
      type: 'renewal',
      title: 'Contract Renewal Due',
      description: 'Your annual contract is up for renewal in 30 days',
      action: 'Schedule meeting'
    },
    {
      type: 'gap',
      title: 'Training Gap Identified',
      description: '15 employees missing required safety certifications',
      action: 'Assign training'
    }
  ]
};

export const ClientAdminDashboard: React.FC = () => {
  const [supportChatOpen, setSupportChatOpen] = useState(false);

  const CompanySnapshot = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Company Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Company</span>
            <span className="font-medium">{mockClientData.company.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Employees</span>
            <span className="font-medium">{mockClientData.company.employees}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Credits</span>
              <span className="font-medium">
                {mockClientData.company.creditsUsed} / {mockClientData.company.credits}
              </span>
            </div>
            <Progress 
              value={(mockClientData.company.creditsUsed / mockClientData.company.credits) * 100} 
              className="h-2" 
            />
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{mockClientData.company.repContact}</p>
                <p className="text-xs text-muted-foreground">{mockClientData.company.repPhone}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ComplianceHQ = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Compliance HQ
        </CardTitle>
        <CardDescription>SB 553 & Training Status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">SB 553 Progress</span>
              <span className="text-sm font-medium">{mockClientData.compliance.sb553Progress}%</span>
            </div>
            <Progress value={mockClientData.compliance.sb553Progress} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Training Completion</span>
              <span className="text-sm font-medium">{mockClientData.compliance.trainingCompletion}%</span>
            </div>
            <Progress value={mockClientData.compliance.trainingCompletion} className="h-2" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">Plan Downloads</span>
            <Badge variant="outline">{mockClientData.compliance.planDownloads}</Badge>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Next Deadline: {new Date(mockClientData.compliance.nextDeadline).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ServiceCases = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Service Cases
        </CardTitle>
        <CardDescription>Open cases and SLA tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockClientData.serviceCases.map((serviceCase) => (
            <div key={serviceCase.id} className="p-3 rounded-lg border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-sm">{serviceCase.title}</h4>
                  <p className="text-xs text-muted-foreground">{serviceCase.id}</p>
                </div>
                <Badge variant={
                  serviceCase.status === 'completed' ? 'default' :
                  serviceCase.status === 'in-progress' ? 'secondary' : 'destructive'
                }>
                  {serviceCase.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>SLA: {serviceCase.sla}</span>
                <Badge variant="outline">
                  {serviceCase.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const InsightsEngine = () => (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Insights Engine
        </CardTitle>
        <CardDescription>Training analytics and trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
              <p className="text-2xl font-bold">{mockClientData.insights.trainingHours.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Training Hours</p>
              <p className="text-xs text-green-600">{mockClientData.insights.monthlyTrend} this month</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Top Departments</h4>
              {mockClientData.insights.topDepartments.map((dept, index) => (
                <div key={dept} className="flex items-center justify-between py-1">
                  <span className="text-sm">{dept}</span>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Risk Areas</h4>
            {mockClientData.insights.riskAreas.map((area) => (
              <div key={area} className="flex items-center gap-2 py-1">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuickActionsPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          <Button className="justify-start">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
          <Button variant="outline" className="justify-start">
            <MessageSquare className="h-4 w-4 mr-2" />
            Submit Case
          </Button>
          <Button variant="outline" className="justify-start">
            <Zap className="h-4 w-4 mr-2" />
            Launch Campaign
          </Button>
          <Button variant="outline" className="justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const SmartAIPanel = () => (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Smart AI Panel
        </CardTitle>
        <CardDescription>Personalized action recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockClientData.aiRecommendations.map((rec, index) => (
            <div key={index} className="p-3 rounded-lg border-l-4" style={{
              borderLeftColor: rec.type === 'renewal' ? 'hsl(var(--primary))' : 'hsl(var(--warning))',
              backgroundColor: 'hsl(var(--muted) / 0.3)'
            }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                </div>
                <Button size="sm" variant="outline">
                  {rec.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const StickySupportBubble = () => (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => setSupportChatOpen(!supportChatOpen)}
        className="rounded-full h-12 w-12 shadow-lg"
        style={{ backgroundColor: '#655DC6' }}
      >
        <MessageSquare className="h-5 w-5 text-white" />
      </Button>
      {supportChatOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-background border rounded-lg shadow-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Easeworks Support</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSupportChatOpen(false)}
            >
              ×
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Hi! How can we help you today?</p>
            <div className="mt-4 space-y-2">
              <Button variant="outline" size="sm" className="w-full text-left justify-start">
                Schedule training session
              </Button>
              <Button variant="outline" size="sm" className="w-full text-left justify-start">
                Policy questions
              </Button>
              <Button variant="outline" size="sm" className="w-full text-left justify-start">
                Technical support
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with branded color */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: '#655DC6' }}>
        <h1 className="text-3xl font-bold text-white">My Admin Dashboard</h1>
        <p className="text-white/90">Client Admin Command Deck</p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <CompanySnapshot />
        <ComplianceHQ />
        <ServiceCases />
        <QuickActionsPanel />
        <InsightsEngine />
        <SmartAIPanel />
      </div>

      {/* Sticky Support Bubble */}
      <StickySupportBubble />
    </div>
  );
};

export default ClientAdminDashboard;