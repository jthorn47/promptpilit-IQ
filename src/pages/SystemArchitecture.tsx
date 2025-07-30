import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  Globe, 
  Shield, 
  Users, 
  Settings, 
  FileText,
  Server,
  Code,
  Lock,
  Zap,
  BarChart3,
  Plug,
  Clock,
  Activity,
  AlertTriangle,
  TrendingUp,
  Link,
  Monitor,
  Puzzle,
  MessageCircle,
  RotateCcw,
  Calendar,
  Eye,
  Building,
  GraduationCap,
  Brain,
  Archive,
  DollarSign,
  Briefcase,
  CheckCircle,
  Share
} from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import staffingDashboardImage from "@/assets/staffing-dashboard-screenshot.jpg";
import clientManagementImage from "@/assets/client-management-screenshot.jpg";
import candidateManagementImage from "@/assets/candidate-management-screenshot.jpg";
import staffingSystemImage from "@/assets/staffing-system-overview.jpg";

export default function SystemArchitecture() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;
    
    // Try native Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EaseBase System Architecture',
          text: 'Complete technical documentation for the EaseBase platform modules',
          url: url,
        });
        toast({
          title: "Shared Successfully",
          description: "System architecture page shared successfully",
        });
        return;
      } catch (error) {
        // User cancelled sharing or error occurred, fall back to clipboard
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "System architecture page link copied to clipboard",
      });
    } catch (error) {
      // Final fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Link Copied",
        description: "System architecture page link copied to clipboard",
      });
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl">
      <BreadcrumbNav items={[
        { label: "Admin", href: "/admin" },
        { label: "System Architecture" }
      ]} />
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">System Architecture</h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Complete technical documentation for the EaseBase microservices platform
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Version 2.0</Badge>
            <Badge variant="outline">Production Ready</Badge>
            <Badge variant="outline">Microservices</Badge>
            <Badge variant="outline">Mobile Optimized</Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShare}
            className="mt-2 sm:mt-0 sm:ml-4 w-full sm:w-auto"
          >
            <Share className="h-4 w-4 mr-2" />
            Share Page
          </Button>
        </div>
      </div>

      <Separator />

      {/* Module Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex h-12 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max min-w-full">
            <TabsTrigger value="overview" className="px-3 py-2 text-sm whitespace-nowrap">Overview</TabsTrigger>
            <TabsTrigger value="crm" className="px-3 py-2 text-sm whitespace-nowrap">CRM</TabsTrigger>
            <TabsTrigger value="lms" className="px-3 py-2 text-sm whitespace-nowrap">LMS</TabsTrigger>
            <TabsTrigger value="payroll" className="px-3 py-2 text-sm whitespace-nowrap">Payroll</TabsTrigger>
            <TabsTrigger value="tags" className="px-3 py-2 text-sm whitespace-nowrap">Tags</TabsTrigger>
            <TabsTrigger value="auth" className="px-3 py-2 text-sm whitespace-nowrap">Security</TabsTrigger>
            <TabsTrigger value="integrations" className="px-3 py-2 text-sm whitespace-nowrap">Integrations</TabsTrigger>
            <TabsTrigger value="bi" className="px-3 py-2 text-sm whitespace-nowrap">Analytics</TabsTrigger>
            <TabsTrigger value="notifications" className="px-3 py-2 text-sm whitespace-nowrap">Notifications</TabsTrigger>
            <TabsTrigger value="files" className="px-3 py-2 text-sm whitespace-nowrap">Files</TabsTrigger>
            <TabsTrigger value="api" className="px-3 py-2 text-sm whitespace-nowrap">API</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Platform Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            Production-ready enterprise platform with comprehensive CRM, Learning Management System, Payroll Processing, 
            and Universal Tagging System. Features role-based access control, real-time analytics, mobile-responsive design, 
            and enterprise-grade security with Row Level Security (RLS) across all modules.
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Database Tables</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">8+</div>
              <div className="text-sm text-muted-foreground">User Roles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">25+</div>
              <div className="text-sm text-muted-foreground">Edge Functions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">Production</div>
              <div className="text-sm text-muted-foreground">Ready</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Code className="h-5 w-5" />
              Frontend Microservices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Framework:</span>
              <Badge>React 18 + TypeScript</Badge>
            </div>
            <div className="flex justify-between">
              <span>Build Tool:</span>
              <Badge>Vite</Badge>
            </div>
            <div className="flex justify-between">
              <span>Styling:</span>
              <Badge>Tailwind CSS</Badge>
            </div>
            <div className="flex justify-between">
              <span>UI Components:</span>
              <Badge>Shadcn UI</Badge>
            </div>
            <div className="flex justify-between">
              <span>Routing:</span>
              <Badge>React Router</Badge>
            </div>
            <div className="flex justify-between">
              <span>Data Fetching:</span>
              <Badge>TanStack Query</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Server className="h-5 w-5" />
              Backend Microservices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Database:</span>
              <Badge>Supabase PostgreSQL</Badge>
            </div>
            <div className="flex justify-between">
              <span>Authentication:</span>
              <Badge>Supabase Auth</Badge>
            </div>
            <div className="flex justify-between">
              <span>API:</span>
              <Badge>Auto-generated REST</Badge>
            </div>
            <div className="flex justify-between">
              <span>Security:</span>
              <Badge>Row Level Security</Badge>
            </div>
            <div className="flex justify-between">
              <span>Functions:</span>
              <Badge>Edge Functions</Badge>
            </div>
            <div className="flex justify-between">
              <span>Real-time:</span>
              <Badge>WebSocket Subscriptions</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Microservices Architecture Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Globe className="h-5 w-5" />
            Microservices Architecture Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 sm:p-6 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto">
            <pre className="whitespace-pre-wrap">{`┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │───▶│   API Gateway    │───▶│   Auth Service  │
│   (Frontend)    │    │   (Load Balancer)│    │   (Microservice)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐            │
         └──────────────▶│  Edge Functions  │────────────┘
                         │  (Server Logic)  │
                         └──────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
           ┌─────────▼──┐ ┌───────▼──┐ ┌───────▼──┐
           │ CRM Service│ │LMS Service│ │Pay Service│
           │(Microservice)│(Microservice)│(Microservice)│
           └────────────┘ └──────────┘ └──────────┘
                    │             │             │
                    └─────────────┼─────────────┘
                                  │
                         ┌────────▼────────┐
                         │   PostgreSQL    │
                         │   (Database)    │
                         └─────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* User Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Roles & Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Badge variant="default" className="w-full justify-center py-2">Super Admin</Badge>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Full system access</li>
                <li>• Manage all companies</li>
                <li>• Configure settings</li>
                <li>• All CRM & LMS features</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="w-full justify-center py-2">Company Admin</Badge>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Company-specific data</li>
                <li>• Manage employees</li>
                <li>• View reports</li>
                <li>• Limited CRM access</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="w-full justify-center py-2">Internal Staff</Badge>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Full CRM functionality</li>
                <li>• Email campaigns</li>
                <li>• Sales analytics</li>
                <li>• Lead conversion</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Badge variant="destructive" className="w-full justify-center py-2">Learner</Badge>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Training modules</li>
                <li>• Personal certificates</li>
                <li>• Learning progress</li>
                <li>• Course assignments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Completed Application Modules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <Badge variant="secondary" className="ml-2">✓ Live</Badge>
                CRM System
              </h4>
              <ul className="text-sm space-y-1 ml-6">
                <li>• Leads Management (/admin/crm/leads)</li>
                <li>• Deals Pipeline (/admin/crm/deals)</li>
                <li>• Activities Tracking (/admin/crm/activities)</li>
                <li>• Email Campaigns (/admin/crm/email-campaigns)</li>
                <li>• Analytics Dashboard (/admin/crm/analytics)</li>
                <li>• Automation Workflows (/admin/crm/automation)</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <Badge variant="secondary" className="ml-2">✓ Live</Badge>
                Learning Management System
              </h4>
              <ul className="text-sm space-y-1 ml-6">
                <li>• Training Modules (/admin/training-modules)</li>
                <li>• Employee Management (/admin/employees)</li>
                <li>• Certificates (/admin/certificates)</li>
                <li>• Renewals (/admin/renewals)</li>
                <li>• BI Dashboard (/admin/bi-dashboard)</li>
                <li>• Personal Learning (/admin/my-learning)</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <Badge variant="secondary" className="ml-2">✓ Live</Badge>
                Halo Payroll System
              </h4>
              <ul className="text-sm space-y-1 ml-6">
                <li>• Payroll Processing (/admin/payroll)</li>
                <li>• Employee Pay Stubs (/admin/pay-stubs)</li>
                <li>• Tax Calculations & Reporting</li>
                <li>• Direct Deposit & ACH</li>
                <li>• Payroll Analytics</li>
                <li>• Compliance Management</li>
              </ul>
            </div>
          </div>
          
          {/* Completed Features Row */}
          <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Archive className="h-4 w-4" />
                <Badge variant="secondary" className="ml-2">✓ Live</Badge>
                Universal Tag System
              </h4>
              <ul className="text-sm space-y-1 ml-6">
                <li>• Tag Management (/superadmin/tags)</li>
                <li>• Multi-entity Tagging</li>
                <li>• Advanced Search & Filtering</li>
                <li>• Tag Analytics & Usage</li>
                <li>• Bulk Tag Operations</li>
                <li>• Permission-based Access</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <Badge variant="secondary" className="ml-2">✓ Live</Badge>
                Applicant Tracking System
              </h4>
              <ul className="text-sm space-y-1 ml-6">
                <li>• Job Posting Management</li>
                <li>• Application Processing</li>
                <li>• Interview Scheduling</li>
                <li>• Candidate Evaluation</li>
                <li>• Career Page Builder</li>
                <li>• ATS Analytics</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <Badge variant="secondary" className="ml-2">✓ Live</Badge>
                Assessment & Risk Tools
              </h4>
              <ul className="text-sm space-y-1 ml-6">
                <li>• Risk Assessment Forms</li>
                <li>• Automated Scoring</li>
                <li>• AI-powered Reports</li>
                <li>• Compliance Tracking</li>
                <li>• Assessment Analytics</li>
                <li>• Custom Questionnaires</li>
              </ul>
            </div>
          </div>

          {/* Production Features Row */}
          <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <Badge variant="secondary" className="ml-2">✓ Live</Badge>
                Security & Authentication
              </h4>
              <ul className="text-sm space-y-1 ml-6">
                <li>• Row Level Security (RLS)</li>
                <li>• Role-based Access Control</li>
                <li>• JWT Authentication</li>
                <li>• Audit Logging</li>
                <li>• Session Management</li>
                <li>• Security Monitoring</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <Badge variant="secondary" className="ml-2">✓ Live</Badge>
                Analytics & Reporting
              </h4>
              <ul className="text-sm space-y-1 ml-6">
                <li>• Real-time Dashboards</li>
                <li>• Custom Reports</li>
                <li>• Performance Metrics</li>
                <li>• Data Visualization</li>
                <li>• Export Capabilities</li>
                <li>• Automated Insights</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <Badge variant="secondary" className="ml-2">✓ Live</Badge>
                AI & Automation
              </h4>
              <ul className="text-sm space-y-1 ml-6">
                <li>• AI-powered Insights</li>
                <li>• Automated Workflows</li>
                <li>• Smart Recommendations</li>
                <li>• Predictive Analytics</li>
                <li>• Natural Language Processing</li>
                <li>• Machine Learning Models</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase 2 Optional Enhancements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-5 w-5" />
            🧩 Optional Enhancements (Phase 2 Modules)
          </CardTitle>
          <CardDescription>
            Advanced payroll features available as optional plug-and-play modules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Smart Payroll Assistant
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                AI-powered natural language interface for payroll questions and guidance
              </p>
              <div className="text-xs text-muted-foreground ml-6">
                Route: /payroll/assistant
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Retro Pay Manager
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Create off-cycle runs for bonuses, corrections, and missed hours
              </p>
              <div className="text-xs text-muted-foreground ml-6">
                Route: /payroll/retro-pay
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Pay Calendar Management
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Configure pay schedules, holiday rules, and cutoff settings
              </p>
              <div className="text-xs text-muted-foreground ml-6">
                Route: /payroll/calendar
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Audit Trail Explorer
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Visual history tracking of payroll changes with impact analysis
              </p>
              <div className="text-xs text-muted-foreground ml-6">
                Route: /payroll/audit-trail
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Multi-State Tax Engine
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Handle complex multi-state and international tax scenarios
              </p>
              <div className="text-xs text-muted-foreground ml-6">
                Route: /payroll/multi-state-tax
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Schema Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">User Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• profiles</li>
                <li>• user_roles</li>
                <li>• company_settings</li>
                <li>• user_sessions</li>
                <li>• sso_configurations</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">CRM Tables</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• leads</li>
                <li>• deals</li>
                <li>• deal_stages</li>
                <li>• activities</li>
                <li>• email_campaigns</li>
                <li>• email_templates</li>
                <li>• automation_workflows</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">LMS Tables</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• training_modules</li>
                <li>• employees</li>
                <li>• certificates</li>
                <li>• training_completions</li>
                <li>• training_assignments</li>
                <li>• renewal_schedules</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Analytics & Reporting</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• analytics_metrics</li>
                <li>• analytics_dashboards</li>
                <li>• analytics_alerts</li>
                <li>• report_templates</li>
                <li>• scheduled_reports</li>
                <li>• report_instances</li>
                <li>• kpi_definitions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Security & Compliance</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• compliance_policies</li>
                <li>• compliance_assessments</li>
                <li>• compliance_audit_trail</li>
                <li>• audit_logs</li>
                <li>• api_keys</li>
                <li>• security_events</li>
                <li>• chat_sessions</li>
                <li>• blog_posts</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">User Engagement</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• notifications</li>
                <li>• assessment_notifications</li>
                <li>• achievement_definitions</li>
                <li>• user_achievements</li>
                <li>• user_points</li>
                <li>• bulk_operations</li>
                <li>• integration_webhooks</li>
                <li>• email_automations</li>
                <li>• webhook_logs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase 3: Advanced Integration & Real-time Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Fortune 500 Integration Roadmap
          </CardTitle>
          <CardDescription>
            Enterprise-grade integrations for seamless Fortune 500 company workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Phase 1 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Phase 1: Core Enterprise Integrations</h4>
                <Badge variant="outline">In Development</Badge>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Salesforce Integration
                  </h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Bidirectional contact sync</li>
                    <li>• Lead conversion pipeline</li>
                    <li>• Opportunity tracking</li>
                    <li>• Activity logging</li>
                    <li>• Custom field mapping</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Microsoft Teams Integration
                  </h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Channel notifications</li>
                    <li>• Meeting scheduling</li>
                    <li>• File sharing</li>
                    <li>• Bot commands</li>
                    <li>• Workflow triggers</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Azure AD Integration
                  </h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Single Sign-On (SSO)</li>
                    <li>• User provisioning</li>
                    <li>• Group-based access</li>
                    <li>• Conditional access</li>
                    <li>• Multi-factor auth</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Phase 2: ERP & Data Platforms</h4>
                <Badge variant="secondary">Planned</Badge>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium">SAP Integration</h5>
                  <p className="text-sm text-muted-foreground">Employee data, financials, procurement</p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">Oracle ERP</h5>
                  <p className="text-sm text-muted-foreground">HR modules, payroll, reporting</p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">Workday</h5>
                  <p className="text-sm text-muted-foreground">HR management, talent acquisition</p>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Phase 3: Business Intelligence & Analytics</h4>
                <Badge variant="secondary">Planned</Badge>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium">Tableau</h5>
                  <p className="text-sm text-muted-foreground">Advanced data visualization</p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">Power BI</h5>
                  <p className="text-sm text-muted-foreground">Microsoft ecosystem integration</p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">Snowflake</h5>
                  <p className="text-sm text-muted-foreground">Data warehouse connectivity</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase 3: Advanced Integration & Real-time Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Advanced Integration Hub & Real-time Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Integration Marketplace
                </h4>
                <p className="text-sm text-muted-foreground">
                  Pre-configured integrations for HubSpot, Stripe, Slack, Zapier, Mailchimp, Google Analytics, and Twilio with OAuth2 and API key authentication.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Real-time Webhook Processing
                </h4>
                <p className="text-sm text-muted-foreground">
                  Edge function for processing webhooks from all major providers with automatic data synchronization and real-time updates.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Advanced Security Audit
                </h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive security monitoring with audit logs, API key management, and threat detection with real-time alerts.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Rate Limiting & Circuit Breakers
                </h4>
                <p className="text-sm text-muted-foreground">
                  Advanced rate limiting with token bucket algorithm, circuit breaker patterns, and automatic recovery mechanisms.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Live Integration Monitoring
                </h4>
                <p className="text-sm text-muted-foreground">
                  Real-time dashboard for monitoring integration health, webhook delivery, and API usage with live metrics and alerts.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analytics & Reporting
                </h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive analytics on integration performance, error rates, response times, and usage patterns with exportable reports.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Automated Error Recovery
                </h4>
                <p className="text-sm text-muted-foreground">
                  Intelligent retry logic with exponential backoff, dead letter queues, and automatic error resolution workflows.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Enterprise Security
                </h4>
                <p className="text-sm text-muted-foreground">
                  SSO configuration, compliance management, security event tracking, and automated threat response systems.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Badge variant="default" className="mr-2">✅ Completed</Badge>
            <span className="text-sm text-muted-foreground">
              Phase 3 includes webhook processing edge function, advanced integration hub, security audit panel, and real-time monitoring.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Key Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Global Search</h4>
                <p className="text-sm text-muted-foreground">
                  Full-text search across leads, deals, activities, emails, and tasks with highlighting.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Role-Based Navigation</h4>
                <p className="text-sm text-muted-foreground">
                  Dynamic sidebar menu that adapts based on user permissions and role.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Data Import/Export</h4>
                <p className="text-sm text-muted-foreground">
                  Bulk operations supporting CSV and Excel formats with error handling.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Mobile-First Responsive Design</h4>
                <p className="text-sm text-muted-foreground">
                  Hamburger menu navigation, touch-friendly interfaces, and adaptive layouts for all device sizes.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Email Automation</h4>
                <p className="text-sm text-muted-foreground">
                  Template-based campaigns with workflow automation and performance tracking.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Advanced Analytics Dashboard</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time KPIs, custom reports, scheduled reporting, and interactive data visualizations.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Training Management</h4>
                <p className="text-sm text-muted-foreground">
                  SCORM-compliant training with progress tracking and certificate generation.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Enterprise Security & Compliance</h4>
                <p className="text-sm text-muted-foreground">
                  SSO integration, security audits, compliance management, and comprehensive audit trails.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Implementation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Implementation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Row Level Security (RLS)</h4>
            <p className="text-sm text-muted-foreground mb-2">
              All database tables are protected with RLS policies that automatically filter data based on user roles and company associations.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Authentication Flow</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>User authenticates via Supabase Auth</li>
              <li>Profile created automatically on first login</li>
              <li>Role assignment determines access permissions</li>
              <li>RLS policies enforce data access rules</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Development Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Badge variant="default" className="mb-2">Production Ready</Badge>
              <p className="text-sm text-muted-foreground">
                Fully functional for internal use with all core features implemented.
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant="secondary" className="mb-2">Scalable Architecture</Badge>
              <p className="text-sm text-muted-foreground">
                Built with modern stack that supports future growth and feature additions.
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant="outline" className="mb-2">Secure by Design</Badge>
              <p className="text-sm text-muted-foreground">
                Comprehensive security with RLS policies and JWT-based authentication.
              </p>
            </div>
          </div>
          
        {/* Test section removed for cleaner architecture docs */}
        </CardContent>
      </Card>

  {/* Real Software Module Screenshots */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Monitor className="h-5 w-5" />
        EaseWorks Staffing Software Modules
      </CardTitle>
      <CardDescription>
        Real screenshots from our production staffing management system
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="font-semibold">Staffing Dashboard</h4>
          <img 
            src={staffingDashboardImage} 
            alt="EaseWorks Staffing Dashboard showing key metrics and recent placements"
            className="w-full rounded-lg border shadow-sm"
          />
          <p className="text-sm text-muted-foreground">
            Main dashboard with placement metrics, revenue tracking, and priority tasks
          </p>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold">Client Management</h4>
          <img 
            src={clientManagementImage} 
            alt="Client Management interface showing client directory and contact information"
            className="w-full rounded-lg border shadow-sm"
          />
          <p className="text-sm text-muted-foreground">
            Complete client lifecycle management with contact tracking and placement history
          </p>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold">Candidate Management</h4>
          <img 
            src={candidateManagementImage} 
            alt="Candidate Management system showing talent pool with skills and availability"
            className="w-full rounded-lg border shadow-sm"
          />
          <p className="text-sm text-muted-foreground">
            Comprehensive talent pool management with skills tracking and availability status
          </p>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold">System Overview</h4>
          <img 
            src={staffingSystemImage} 
            alt="Complete staffing system overview showing all integrated modules"
            className="w-full rounded-lg border shadow-sm"
          />
          <p className="text-sm text-muted-foreground">
            Integrated module view showing scheduling, payroll, billing, and reporting systems
          </p>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Developer Handoff & UI Integration */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Code className="h-5 w-5" />
        🛠️ Developer Handoff & UI Integration
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Purpose Section */}
      <div>
        <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
          🔹 Purpose
        </h4>
        <p className="text-muted-foreground leading-relaxed">
          This module provides the front-end and full-stack engineering teams with a complete implementation guide for finalizing the HaaLO Payroll user experience. It includes product tour scripts, tooltip mapping, permission matrices, route access, edge function UI integration, and UI polish QA.
        </p>
      </div>

      <Separator />

      {/* Contents Section */}
      <div>
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          🔹 Contents
        </h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Badge variant="outline" className="w-full justify-center py-2">Route & Module Index</Badge>
            <p className="text-sm text-muted-foreground text-center px-2">
              Complete mapping of all routes and their corresponding modules
            </p>
          </div>
          <div className="space-y-2">
            <Badge variant="outline" className="w-full justify-center py-2">Tooltip & Help Component Map</Badge>
            <p className="text-sm text-muted-foreground text-center px-2">
              Contextual help system and tooltip placement guide
            </p>
          </div>
          <div className="space-y-2">
            <Badge variant="outline" className="w-full justify-center py-2">Product Tour Script Map</Badge>
            <p className="text-sm text-muted-foreground text-center px-2">
              Interactive onboarding flows and guided tours
            </p>
          </div>
          <div className="space-y-2">
            <Badge variant="outline" className="w-full justify-center py-2">Role & Permission Matrix</Badge>
            <p className="text-sm text-muted-foreground text-center px-2">
              Comprehensive access control documentation
            </p>
          </div>
          <div className="space-y-2">
            <Badge variant="outline" className="w-full justify-center py-2">Edge Function UI Triggers</Badge>
            <p className="text-sm text-muted-foreground text-center px-2">
              Frontend integration points for backend functions
            </p>
          </div>
          <div className="space-y-2">
            <Badge variant="outline" className="w-full justify-center py-2">UI/UX Polish Checklist</Badge>
            <p className="text-sm text-muted-foreground text-center px-2">
              Quality assurance guidelines and testing protocols
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Support File Locations</span>
          </div>
          <p className="text-sm text-muted-foreground">
            All implementation guides, checklists, and reference materials are centrally located for easy access by development teams.
          </p>
        </div>
      </div>

      <Separator />

      {/* Link Section */}
      <div className="text-center">
        <h4 className="font-semibold text-lg mb-4 flex items-center justify-center gap-2">
          🔗 Link
        </h4>
        <Button 
          variant="default" 
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
          onClick={() => {
            // TODO: Update this link once the Developer Handoff Guide is created
            console.log("Navigate to Developer Handoff Guide");
          }}
        >
          <FileText className="h-4 w-4 mr-2" />
          View Developer Handoff Guide
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Central hub for all UI integration and development handoff documentation
        </p>
      </div>
        </CardContent>
      </Card>

        </TabsContent>

        {/* CRM Tab */}
        <TabsContent value="crm" className="space-y-8">
          {/* 1. Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                CRM Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                Company-centric CRM system designed for B2B sales workflows with comprehensive proposal generation (PropGEN), 
                risk assessment integration, and multi-stage client lifecycle management.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Key Modules</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Companies (Primary Entity)</li>
                    <li>• Contacts (Tied to Companies)</li>
                    <li>• Proposals (PropGEN Integration)</li>
                    <li>• Notes & Tasks</li>
                    <li>• Risk Assessments</li>
                    <li>• Universal Tags</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Stage Flow</h4>
                  <div className="space-y-2">
                    <Badge variant="outline">Pre-client</Badge>
                    <div className="text-sm text-muted-foreground">↓</div>
                    <Badge variant="secondary">Active client</Badge>
                    <div className="text-sm text-muted-foreground">↓</div>
                    <Badge variant="default">Managed client</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Core Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• SPIN Methodology Integration</li>
                    <li>• Risk Score Calculation</li>
                    <li>• Automated Proposal Generation</li>
                    <li>• Investment Analysis</li>
                    <li>• Approval Workflows</li>
                    <li>• Audit Trail Logging</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Data Model (DB Schema) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                CRM Data Model & Entity Relationships
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ERD Diagram */}
              <div className="bg-muted p-6 rounded-lg font-mono text-sm">
                <pre>{`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│    Companies    │────│     Contacts     │    │    Proposals    │
│  (Primary)      │    │  (Many-to-One)   │    │  (One-to-One)   │
│                 │    │                  │    │                 │
│ • id            │    │ • id             │    │ • id            │
│ • company_name  │◄───┤ • company_id     │    │ • company_id    │
│ • lifecycle_stage│   │ • first_name     │    │ • spin_data     │
│ • risk_score    │    │ • last_name      │    │ • risk_data     │
│ • status        │    │ • email          │    │ • proposal_data │
└─────────────────┘    │ • is_primary     │    └─────────────────┘
         │              └──────────────────┘             │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│      Notes      │    │      Tasks       │    │ Risk Assessments│
│                 │    │                  │    │                 │
│ • id            │    │ • id             │    │ • id            │
│ • company_id    │    │ • company_id     │    │ • company_id    │
│ • contact_id    │    │ • contact_id     │    │ • risk_score    │
│ • content       │    │ • title          │    │ • assessment_date│
│ • created_by    │    │ • status         │    │ • risk_level    │
└─────────────────┘    │ • due_date       │    └─────────────────┘
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Universal Tags │
                       │  (Many-to-Many)  │
                       │                  │
                       │ • tag_id         │
                       │ • entity_type    │
                       │ • entity_id      │
                       │ • tagged_by      │
                       └──────────────────┘`}</pre>
              </div>

              {/* Core Entity Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Companies (Primary Entity)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium">Field</span>
                      <span className="font-medium">Type</span>
                      <span className="font-medium">Notes</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>id</span><span>UUID</span><span>Primary Key</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>company_name</span><span>TEXT</span><span>Required, Unique</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>lifecycle_stage</span><span>ENUM</span><span>prospect/client</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>risk_score</span><span>INTEGER</span><span>0-100 scale</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>status</span><span>TEXT</span><span>Config-driven</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>created_at</span><span>TIMESTAMP</span><span>Auto</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Contacts (Tied to Companies)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium">Field</span>
                      <span className="font-medium">Type</span>
                      <span className="font-medium">Notes</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>id</span><span>UUID</span><span>Primary Key</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>company_id</span><span>UUID</span><span>Foreign Key</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>first_name</span><span>TEXT</span><span>Required</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>last_name</span><span>TEXT</span><span>Required</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>email</span><span>TEXT</span><span>Unique</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>is_primary</span><span>BOOLEAN</span><span>One per company</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Permissions + Role Logic */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                CRM Permissions & Role Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Role</th>
                      <th className="text-left p-2 font-medium">Companies</th>
                      <th className="text-left p-2 font-medium">Contacts</th>
                      <th className="text-left p-2 font-medium">Proposals</th>
                      <th className="text-left p-2 font-medium">Notes/Tasks</th>
                      <th className="text-left p-2 font-medium">Risk Assessments</th>
                      <th className="text-left p-2 font-medium">Tags</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="p-2 font-medium">Super Admin</td>
                      <td className="p-2">Full CRUD</td>
                      <td className="p-2">Full CRUD</td>
                      <td className="p-2">Full CRUD</td>
                      <td className="p-2">Full CRUD</td>
                      <td className="p-2">Full CRUD</td>
                      <td className="p-2">Full CRUD</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Manager</td>
                      <td className="p-2">Full CRUD</td>
                      <td className="p-2">Full CRUD</td>
                      <td className="p-2">Create, Read, Update</td>
                      <td className="p-2">Full CRUD</td>
                      <td className="p-2">Read Only</td>
                      <td className="p-2">Create, Read</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Sales</td>
                      <td className="p-2">Create, Read, Update</td>
                      <td className="p-2">Full CRUD</td>
                      <td className="p-2">Create, Read</td>
                      <td className="p-2">Full CRUD</td>
                      <td className="p-2">Read Only</td>
                      <td className="p-2">Create, Read</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Support</td>
                      <td className="p-2">Read Only</td>
                      <td className="p-2">Read, Update</td>
                      <td className="p-2">Read Only</td>
                      <td className="p-2">Create, Read</td>
                      <td className="p-2">Read Only</td>
                      <td className="p-2">Read Only</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">POP</td>
                      <td className="p-2">Read (Assigned)</td>
                      <td className="p-2">Read (Assigned)</td>
                      <td className="p-2">Read Only</td>
                      <td className="p-2">Create, Read</td>
                      <td className="p-2">No Access</td>
                      <td className="p-2">Read Only</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Recruiter</td>
                      <td className="p-2">Read (Assigned)</td>
                      <td className="p-2">Read (Assigned)</td>
                      <td className="p-2">No Access</td>
                      <td className="p-2">Create, Read</td>
                      <td className="p-2">No Access</td>
                      <td className="p-2">Read Only</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Access Control Rules</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Tag-based visibility: Records can be restricted by specific tags</li>
                  <li>• Status-based overrides: Certain statuses may grant additional access</li>
                  <li>• Shared access: Contacts can be shared across team members</li>
                  <li>• Company-level restrictions: Some companies may be marked as confidential</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 4. Navigation + UI Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                CRM Navigation & UI Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Sidebar Routes</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <code>/admin/crm/dashboard</code> - CRM Overview</li>
                    <li>• <code>/admin/crm/companies</code> - Company Directory</li>
                    <li>• <code>/admin/crm/leads</code> - Lead Management</li>
                    <li>• <code>/admin/crm/deals</code> - Deal Pipeline</li>
                    <li>• <code>/admin/crm/activities</code> - Activity Log</li>
                    <li>• <code>/admin/crm/email-templates</code> - Email Templates</li>
                    <li>• <code>/admin/crm/email-campaigns</code> - Email Campaigns</li>
                    <li>• <code>/admin/crm/email-client</code> - Halo Mail</li>
                    <li>• <code>/admin/crm/hubspot-import</code> - HubSpot Import</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Company Record Layout</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">Overview Tab</div>
                      <div className="text-sm text-muted-foreground">Basic info, contacts, recent activity</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">SPIN Tab</div>
                      <div className="text-sm text-muted-foreground">Situation, Problem, Implication, Need-payoff</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">Proposal Tab</div>
                      <div className="text-sm text-muted-foreground">PropGEN integration, proposal history</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">Risk Score</div>
                      <div className="text-sm text-muted-foreground">Risk assessment data, scoring history</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Global Search & Filtering</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium mb-1">Quick Search</div>
                    <div className="text-sm text-muted-foreground">Company name, contact name, email</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium mb-1">Tag Filters</div>
                    <div className="text-sm text-muted-foreground">Filter by assigned tags</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium mb-1">Status Filters</div>
                    <div className="text-sm text-muted-foreground">Lifecycle stage, risk level</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Automations + Triggers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                CRM Automations & Triggers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Trigger Events</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Company status change</li>
                    <li>• Contact added/updated</li>
                    <li>• Tag assigned/removed</li>
                    <li>• Risk score updated</li>
                    <li>• Proposal generated</li>
                    <li>• Task completed</li>
                    <li>• Note added</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Automation Actions</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Create follow-up task</li>
                    <li>• Send email notification</li>
                    <li>• Update field values</li>
                    <li>• Assign tags automatically</li>
                    <li>• Trigger webhook</li>
                    <li>• Generate proposal</li>
                    <li>• Schedule risk reassessment</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Integration Points</h5>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Zapier</div>
                    <div className="text-muted-foreground">External workflow automation</div>
                  </div>
                  <div>
                    <div className="font-medium">Webhooks</div>
                    <div className="text-muted-foreground">Real-time data sync</div>
                  </div>
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-muted-foreground">Automated communications</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. Tags & Status Systems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Universal Tags & Status Systems
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Tag System Schema</h4>
                  <div className="p-3 border rounded-lg font-mono text-sm">
                    <pre>{`tags
├── id (UUID)
├── tag_name (TEXT)
├── tag_color (TEXT)
├── tag_type (TEXT)
├── scope (global/company)
└── company_id (UUID)

taggable_entities
├── tag_id (UUID)
├── entity_type (TEXT)
├── entity_id (UUID)
└── tagged_by (UUID)`}</pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Status Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 border rounded">
                      <div className="font-medium">Company Status</div>
                      <div className="text-muted-foreground">Prospect, Qualified, Client, Inactive</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium">Risk Level</div>
                      <div className="text-muted-foreground">Low, Medium, High, Critical</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium">Task Status</div>
                      <div className="text-muted-foreground">Pending, In Progress, Complete</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Tag Visibility Rules</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Global tags: Visible to all users across all companies</li>
                  <li>• Company tags: Visible only to users with access to that company</li>
                  <li>• Role-based restrictions: Certain tags may be admin-only</li>
                  <li>• Auto-tagging: System can assign tags based on criteria</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 7. Proposal Flow (PropGEN) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                PropGEN Integration & Proposal Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">SPIN Data Integration</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>Situation:</strong> Current company setup and challenges</li>
                    <li>• <strong>Problem:</strong> Specific pain points identified</li>
                    <li>• <strong>Implication:</strong> Cost and impact of problems</li>
                    <li>• <strong>Need-payoff:</strong> Benefits of solving problems</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Risk Score Influence</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• High-risk clients get premium pricing</li>
                    <li>• Risk factors influence service recommendations</li>
                    <li>• Compliance requirements based on risk level</li>
                    <li>• Custom terms and conditions</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Proposal Workflow</h4>
                <div className="flex items-center space-x-4 overflow-x-auto">
                  <Badge variant="outline">SPIN Collection</Badge>
                  <span>→</span>
                  <Badge variant="outline">Risk Assessment</Badge>
                  <span>→</span>
                  <Badge variant="outline">Proposal Generation</Badge>
                  <span>→</span>
                  <Badge variant="outline">Investment Analysis</Badge>
                  <span>→</span>
                  <Badge variant="outline">Approval Review</Badge>
                  <span>→</span>
                  <Badge variant="default">Final Proposal</Badge>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Versioning & State Management</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Auto-save draft proposals during creation</li>
                  <li>• Version history with change tracking</li>
                  <li>• Approval workflow with comments</li>
                  <li>• Final proposal lock-down and PDF generation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 8. Audit Trail + Logging */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Audit Trail & Activity Logging
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Logged Activities</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Company record creation/updates</li>
                    <li>• Contact additions and modifications</li>
                    <li>• Status and tag changes</li>
                    <li>• Proposal generation and edits</li>
                    <li>• Risk assessment updates</li>
                    <li>• Task creation and completion</li>
                    <li>• Note additions</li>
                    <li>• User login/logout events</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Access Control</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>Super Admin:</strong> View all audit logs</li>
                    <li>• <strong>Manager:</strong> View team and assigned records</li>
                    <li>• <strong>Sales:</strong> View own activities only</li>
                    <li>• <strong>Support:</strong> View support-related activities</li>
                    <li>• <strong>Others:</strong> No audit log access</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Retention Policy</h5>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Standard Logs</div>
                    <div className="text-muted-foreground">Retained for 2 years</div>
                  </div>
                  <div>
                    <div className="font-medium">Compliance Logs</div>
                    <div className="text-muted-foreground">Retained for 7 years</div>
                  </div>
                  <div>
                    <div className="font-medium">Security Events</div>
                    <div className="text-muted-foreground">Retained indefinitely</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 9. Future Considerations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Future CRM Enhancements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Custom Fields Framework</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Client-specific custom fields</li>
                    <li>• Dynamic form generation</li>
                    <li>• Field validation rules</li>
                    <li>• Conditional field visibility</li>
                    <li>• Custom field reporting</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Advanced Segmentation</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Tag-based list segmentation</li>
                    <li>• Smart lists with dynamic criteria</li>
                    <li>• Behavioral segmentation</li>
                    <li>• Industry-specific grouping</li>
                    <li>• Geo-location filtering</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Modular Plugin Architecture</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">Vendors</div>
                    <div className="text-sm text-muted-foreground">Supplier management</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">Events</div>
                    <div className="text-sm text-muted-foreground">Conference tracking</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">Projects</div>
                    <div className="text-sm text-muted-foreground">Project management</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">Invoicing</div>
                    <div className="text-sm text-muted-foreground">Billing integration</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">AI/ML Enhancements</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Predictive lead scoring</li>
                  <li>• Automated risk assessment</li>
                  <li>• Intelligent proposal suggestions</li>
                  <li>• Sentiment analysis on communications</li>
                  <li>• Churn prediction and prevention</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LMS Tab */}
        <TabsContent value="lms" className="space-y-8">
          {/* 1. Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Learning Management System Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                Comprehensive LMS platform with core learning management capabilities plus Halo Learn bolt-on for 
                enhanced micro-learning, adaptive assessments, and gamification features.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Core LMS Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Training Module Management</li>
                    <li>• Employee Enrollment</li>
                    <li>• Progress Tracking</li>
                    <li>• Certification Management</li>
                    <li>• Compliance Reporting</li>
                    <li>• Document Library</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Halo Learn Bolt-on</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Micro-learning Modules</li>
                    <li>• Adaptive Learning Paths</li>
                    <li>• AI-Powered Assessments</li>
                    <li>• Gamification & Badges</li>
                    <li>• Social Learning Features</li>
                    <li>• Mobile-First Design</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Integration Points</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• HR Management System</li>
                    <li>• Performance Management</li>
                    <li>• Compliance Tracking</li>
                    <li>• Risk Assessment Tools</li>
                    <li>• External SCORM Content</li>
                    <li>• Third-party LMS Systems</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Data Model */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                LMS Data Model & Schema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Core LMS Schema */}
              <div className="bg-muted p-6 rounded-lg font-mono text-sm">
                <pre>{`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Training       │────│   Assignments    │────│   Employees     │
│  Modules        │    │  (Many-to-Many)  │    │  (Learners)     │
│                 │    │                  │    │                 │
│ • id            │    │ • id             │    │ • id            │
│ • title         │◄───┤ • module_id      │◄───┤ • user_id       │
│ • content_type  │    │ • employee_id    │    │ • company_id    │
│ • duration      │    │ • assigned_at    │    │ • role          │
│ • is_mandatory  │    │ • due_date       │    │ • department    │
└─────────────────┘    │ • status         │    └─────────────────┘
         │              └──────────────────┘             │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Certificates   │    │   Progress       │    │  Assessments    │
│                 │    │   Tracking       │    │                 │
│ • id            │    │                  │    │ • id            │
│ • employee_id   │    │ • assignment_id  │    │ • module_id     │
│ • module_id     │    │ • progress_pct   │    │ • question_pool │
│ • issued_date   │    │ • time_spent     │    │ • passing_score │
│ • expires_date  │    │ • last_accessed  │    │ • attempts_allowed│
└─────────────────┘    │ • completion_date│    └─────────────────┘
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Halo Learn     │
                       │   Extensions     │
                       │                  │
                       │ • learning_paths │
                       │ • badges_earned  │
                       │ • social_activity│
                       │ • adaptive_data  │
                       └──────────────────┘`}</pre>
              </div>

              {/* Entity Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Training Modules</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium">Field</span>
                      <span className="font-medium">Type</span>
                      <span className="font-medium">Notes</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>id</span><span>UUID</span><span>Primary Key</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>title</span><span>TEXT</span><span>Required</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>content_type</span><span>ENUM</span><span>video/document/quiz</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>duration_minutes</span><span>INTEGER</span><span>Estimated time</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>is_mandatory</span><span>BOOLEAN</span><span>Compliance flag</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Halo Learn Extensions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium">Feature</span>
                      <span className="font-medium">Type</span>
                      <span className="font-medium">Purpose</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>learning_paths</span><span>JSONB</span><span>Adaptive routing</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>badges_earned</span><span>ARRAY</span><span>Gamification</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>social_activity</span><span>JSONB</span><span>Peer learning</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>adaptive_data</span><span>JSONB</span><span>AI recommendations</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. User Roles & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                LMS User Roles & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Role</th>
                      <th className="text-left p-2 font-medium">Content Management</th>
                      <th className="text-left p-2 font-medium">User Management</th>
                      <th className="text-left p-2 font-medium">Reporting</th>
                      <th className="text-left p-2 font-medium">Halo Learn</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="p-2 font-medium">Super Admin</td>
                      <td className="p-2">Full CRUD, Global Settings</td>
                      <td className="p-2">All Users, Role Assignment</td>
                      <td className="p-2">All Reports, Analytics</td>
                      <td className="p-2">Full Configuration</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">LMS Admin</td>
                      <td className="p-2">Create, Edit, Publish</td>
                      <td className="p-2">Company Users Only</td>
                      <td className="p-2">Company Reports</td>
                      <td className="p-2">Basic Configuration</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Instructor</td>
                      <td className="p-2">Create, Edit (Assigned)</td>
                      <td className="p-2">View Assigned Learners</td>
                      <td className="p-2">Progress Reports</td>
                      <td className="p-2">Badge Assignment</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Manager</td>
                      <td className="p-2">View Only</td>
                      <td className="p-2">Team Members Only</td>
                      <td className="p-2">Team Reports</td>
                      <td className="p-2">View Team Progress</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Learner</td>
                      <td className="p-2">View Assigned Content</td>
                      <td className="p-2">Own Profile Only</td>
                      <td className="p-2">Personal Progress</td>
                      <td className="p-2">Full Access</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 4. Navigation & UI Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                LMS Navigation & Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Admin Routes</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <code>/admin/training-modules</code> - Content Management</li>
                    <li>• <code>/admin/employees</code> - User Management</li>
                    <li>• <code>/admin/assignments</code> - Assignment Hub</li>
                    <li>• <code>/admin/certificates</code> - Certification Tracking</li>
                    <li>• <code>/admin/renewals</code> - Renewal Management</li>
                    <li>• <code>/admin/bi-dashboard</code> - Analytics Dashboard</li>
                    <li>• <code>/admin/gamification</code> - Halo Learn Config</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Learner Experience</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <code>/admin/my-learning</code> - Personal Dashboard</li>
                    <li>• <code>/learning-path/[id]</code> - Adaptive Paths</li>
                    <li>• <code>/module/[id]/content</code> - Content Viewer</li>
                    <li>• <code>/assessment/[id]</code> - Quiz Interface</li>
                    <li>• <code>/certificates</code> - Achievement Gallery</li>
                    <li>• <code>/leaderboard</code> - Social Features</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Halo Learn Enhanced UI</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium mb-1">Micro-Learning Cards</div>
                    <div className="text-sm text-muted-foreground">Bite-sized content delivery</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium mb-1">Progress Visualization</div>
                    <div className="text-sm text-muted-foreground">Interactive progress tracking</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium mb-1">Social Learning Feed</div>
                    <div className="text-sm text-muted-foreground">Peer interaction & collaboration</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Learning Paths & Adaptive Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Adaptive Learning & Personalization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Learning Path Engine</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• AI-driven content recommendations</li>
                    <li>• Skill gap analysis and remediation</li>
                    <li>• Prerequisite dependency mapping</li>
                    <li>• Industry-specific learning tracks</li>
                    <li>• Role-based curriculum design</li>
                    <li>• Compliance requirement tracking</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Personalization Factors</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Learning style preferences</li>
                    <li>• Performance history analysis</li>
                    <li>• Time availability patterns</li>
                    <li>• Device usage preferences</li>
                    <li>• Content engagement metrics</li>
                    <li>• Peer comparison insights</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Adaptive Assessment System</h5>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Dynamic Difficulty</div>
                    <div className="text-muted-foreground">Questions adapt to learner performance</div>
                  </div>
                  <div>
                    <div className="font-medium">Knowledge Gaps</div>
                    <div className="text-muted-foreground">Identifies areas needing focus</div>
                  </div>
                  <div>
                    <div className="font-medium">Mastery Tracking</div>
                    <div className="text-muted-foreground">Competency-based progression</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. Gamification & Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Gamification & Engagement Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Achievement System</h4>
                  <div className="space-y-2">
                    <div className="p-2 border rounded flex items-center gap-2">
                      <Badge variant="outline">Badges</Badge>
                      <span className="text-sm text-muted-foreground">Skill-based achievements</span>
                    </div>
                    <div className="p-2 border rounded flex items-center gap-2">
                      <Badge variant="outline">Points</Badge>
                      <span className="text-sm text-muted-foreground">Activity-based scoring</span>
                    </div>
                    <div className="p-2 border rounded flex items-center gap-2">
                      <Badge variant="outline">Streaks</Badge>
                      <span className="text-sm text-muted-foreground">Consistency rewards</span>
                    </div>
                    <div className="p-2 border rounded flex items-center gap-2">
                      <Badge variant="outline">Levels</Badge>
                      <span className="text-sm text-muted-foreground">Progressive advancement</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Social Learning</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Team-based challenges</li>
                    <li>• Peer-to-peer mentoring</li>
                    <li>• Discussion forums</li>
                    <li>• Knowledge sharing rewards</li>
                    <li>• Collaborative projects</li>
                    <li>• Expert Q&A sessions</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Leaderboards & Competition</h5>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Individual</div>
                    <div className="text-muted-foreground">Personal achievements</div>
                  </div>
                  <div>
                    <div className="font-medium">Team</div>
                    <div className="text-muted-foreground">Department rankings</div>
                  </div>
                  <div>
                    <div className="font-medium">Company</div>
                    <div className="text-muted-foreground">Organization-wide</div>
                  </div>
                  <div>
                    <div className="font-medium">Global</div>
                    <div className="text-muted-foreground">Cross-company competition</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. Assessment & Certification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Assessment & Certification System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Assessment Types</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 border rounded">
                      <div className="font-medium">Knowledge Checks</div>
                      <div className="text-muted-foreground">Quick comprehension validation</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium">Scenario-Based</div>
                      <div className="text-muted-foreground">Real-world application testing</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium">Practical Assessments</div>
                      <div className="text-muted-foreground">Hands-on skill evaluation</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium">Peer Reviews</div>
                      <div className="text-muted-foreground">Collaborative evaluation</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Certification Management</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Automated certificate generation</li>
                    <li>• Digital badge issuance</li>
                    <li>• Expiration date tracking</li>
                    <li>• Renewal notifications</li>
                    <li>• Compliance reporting</li>
                    <li>• Third-party verification</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Advanced Assessment Features</h5>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Proctoring</div>
                    <div className="text-muted-foreground">AI-powered monitoring</div>
                  </div>
                  <div>
                    <div className="font-medium">Analytics</div>
                    <div className="text-muted-foreground">Performance insights</div>
                  </div>
                  <div>
                    <div className="font-medium">Remediation</div>
                    <div className="text-muted-foreground">Targeted improvement</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 8. Analytics & Reporting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                LMS Analytics & Business Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Learning Analytics</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Individual learning progress tracking</li>
                    <li>• Completion rate analysis</li>
                    <li>• Time-to-completion metrics</li>
                    <li>• Knowledge retention measurement</li>
                    <li>• Engagement pattern analysis</li>
                    <li>• Performance trend identification</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Business Intelligence</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• ROI calculation for training programs</li>
                    <li>• Skill gap analysis across departments</li>
                    <li>• Compliance status reporting</li>
                    <li>• Training cost optimization</li>
                    <li>• Predictive analytics for training needs</li>
                    <li>• Benchmarking against industry standards</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Real-time Dashboards</h5>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Executive</div>
                    <div className="text-muted-foreground">High-level KPIs</div>
                  </div>
                  <div>
                    <div className="font-medium">Manager</div>
                    <div className="text-muted-foreground">Team performance</div>
                  </div>
                  <div>
                    <div className="font-medium">Instructor</div>
                    <div className="text-muted-foreground">Content effectiveness</div>
                  </div>
                  <div>
                    <div className="font-medium">Learner</div>
                    <div className="text-muted-foreground">Personal progress</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 9. Future Enhancements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Future LMS Enhancements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">AI-Powered Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Intelligent content curation</li>
                    <li>• Automated learning path optimization</li>
                    <li>• Natural language assessment generation</li>
                    <li>• Predictive learner success modeling</li>
                    <li>• Smart content recommendations</li>
                    <li>• Automated skill gap identification</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Extended Reality (XR)</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Virtual Reality training simulations</li>
                    <li>• Augmented Reality job aids</li>
                    <li>• 3D interactive learning environments</li>
                    <li>• Immersive safety training scenarios</li>
                    <li>• Virtual collaboration spaces</li>
                    <li>• Mixed reality assessment tools</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Integration Ecosystem</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">HRIS</div>
                    <div className="text-sm text-muted-foreground">Employee data sync</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">Performance</div>
                    <div className="text-sm text-muted-foreground">Goal alignment</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">Content Libraries</div>
                    <div className="text-sm text-muted-foreground">External courseware</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">Video Platforms</div>
                    <div className="text-sm text-muted-foreground">Streaming integration</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Mobile-First Innovations</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Offline content synchronization</li>
                  <li>• Push notification learning reminders</li>
                  <li>• Voice-activated learning interactions</li>
                  <li>• Progressive Web App capabilities</li>
                  <li>• Biometric progress tracking</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-8">
          {/* 1. Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Halo Payroll Engine Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                Enterprise-grade payroll processing engine with multi-state tax calculations, automated ACH processing, 
                NACHA file generation, and AI-powered payroll copilot for streamlined payroll operations.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Core Engine Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Multi-state Tax Calculations</li>
                    <li>• Automated Payroll Processing</li>
                    <li>• ACH & Direct Deposit</li>
                    <li>• NACHA File Generation</li>
                    <li>• Pay Stub Generation</li>
                    <li>• Tax Jurisdiction Validation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Advanced Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• AI Payroll Copilot</li>
                    <li>• Pay Calendar Management</li>
                    <li>• Compliance Reporting</li>
                    <li>• Multi-company Support</li>
                    <li>• Real-time Calculations</li>
                    <li>• Audit Trail & Logging</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Integration & APIs</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Banking System Integration</li>
                    <li>• Tax Authority APIs</li>
                    <li>• HRIS Data Sync</li>
                    <li>• Time & Attendance</li>
                    <li>• Benefits Administration</li>
                    <li>• Third-party Integrations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Payroll Engine Architecture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Payroll Engine Architecture & Data Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Engine Architecture Diagram */}
              <div className="bg-muted p-6 rounded-lg font-mono text-sm">
                <pre>{`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Employee      │────│   Payroll        │────│   ACH Batches   │
│   Management    │    │   Calculations   │    │   & Payments    │
│                 │    │                  │    │                 │
│ • employees     │    │ • pay_periods    │    │ • ach_batches   │
│ • time_entries  │◄───┤ • payroll_runs   │◄───┤ • batch_entries │
│ • benefits      │    │ • pay_stubs      │    │ • nacha_files   │
│ • deductions    │    │ • tax_calcs      │    │ • bank_accounts │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐            │
         └──────────────▶│  Tax Engine      │────────────┘
                        │  & Compliance    │
                        │                  │
                        │ • tax_rates      │
                        │ • jurisdictions  │
                        │ • compliance     │
                        │ • reporting      │
                        └──────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │   AI Copilot     │
                        │   & Analytics    │
                        │                  │
                        │ • intent_parser  │
                        │ • recommendations│
                        │ • error_detection│
                        │ • optimization   │
                        └──────────────────┘`}</pre>
              </div>

              {/* Core Components */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Payroll Processing Pipeline</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">1</Badge>
                      <span className="text-sm">Data Collection & Validation</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">2</Badge>
                      <span className="text-sm">Multi-state Tax Calculation</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">3</Badge>
                      <span className="text-sm">Gross-to-Net Processing</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">4</Badge>
                      <span className="text-sm">Pay Stub Generation</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">5</Badge>
                      <span className="text-sm">ACH Batch Creation</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">6</Badge>
                      <span className="text-sm">NACHA File Export</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Edge Functions</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>• <code>calculate-multi-state-tax</code> - Tax calculations</div>
                    <div>• <code>calculate-payroll-for-period</code> - Payroll processing</div>
                    <div>• <code>generate-pay-stubs</code> - Pay stub creation</div>
                    <div>• <code>generate-nacha-file</code> - Banking file export</div>
                    <div>• <code>generate-pay-calendar</code> - Schedule management</div>
                    <div>• <code>validate-tax-jurisdiction</code> - Location validation</div>
                    <div>• <code>payroll-copilot-intent-parser</code> - AI assistance</div>
                    <div>• <code>export-payroll-report</code> - Report generation</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Tax Engine & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Multi-State Tax Engine & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Tax Calculation Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Federal income tax withholding</li>
                    <li>• State income tax (all 50 states)</li>
                    <li>• Local municipality taxes</li>
                    <li>• FICA (Social Security & Medicare)</li>
                    <li>• FUTA & SUTA calculations</li>
                    <li>• SDI/TDI where applicable</li>
                    <li>• Workers compensation calculations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Compliance Management</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Automatic tax rate updates</li>
                    <li>• Jurisdiction validation & geocoding</li>
                    <li>• Quarterly tax reporting</li>
                    <li>• Year-end W-2/1099 generation</li>
                    <li>• State new hire reporting</li>
                    <li>• Garnishment processing</li>
                    <li>• ACA compliance tracking</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Tax Jurisdiction Validation</h5>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Address Geocoding</div>
                    <div className="text-muted-foreground">Precise location-based tax mapping</div>
                  </div>
                  <div>
                    <div className="font-medium">Multi-state Workers</div>
                    <div className="text-muted-foreground">Cross-border tax allocation</div>
                  </div>
                  <div>
                    <div className="font-medium">Real-time Updates</div>
                    <div className="text-muted-foreground">Live tax rate synchronization</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. ACH & Payment Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                ACH Processing & Direct Deposit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">ACH Batch Management</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Automated batch creation</li>
                    <li>• Employee bank account validation</li>
                    <li>• Pre-notification (prenote) handling</li>
                    <li>• Return processing & reconciliation</li>
                    <li>• Same-day ACH support</li>
                    <li>• Batch balancing & controls</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">NACHA File Generation</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Standard NACHA format compliance</li>
                    <li>• Multiple file formats (ACH, CSV, Excel)</li>
                    <li>• Bank-specific formatting</li>
                    <li>• Encryption & secure transmission</li>
                    <li>• File validation & error checking</li>
                    <li>• Transmission tracking & confirmation</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Payment Security & Audit</h5>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Encryption</div>
                    <div className="text-muted-foreground">End-to-end data protection</div>
                  </div>
                  <div>
                    <div className="font-medium">Audit Trail</div>
                    <div className="text-muted-foreground">Complete transaction logging</div>
                  </div>
                  <div>
                    <div className="font-medium">Compliance</div>
                    <div className="text-muted-foreground">SOX & PCI DSS standards</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. AI Payroll Copilot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Payroll Copilot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Intent Recognition & Parsing</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Natural language payroll queries</li>
                    <li>• Automated task interpretation</li>
                    <li>• Context-aware responses</li>
                    <li>• Multi-turn conversation support</li>
                    <li>• Error detection & suggestions</li>
                    <li>• Workflow optimization recommendations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Smart Assistance Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Payroll run validation checks</li>
                    <li>• Anomaly detection & alerts</li>
                    <li>• Compliance reminder notifications</li>
                    <li>• Tax deadline management</li>
                    <li>• Cost analysis & budgeting</li>
                    <li>• Predictive payroll forecasting</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Copilot Capabilities</h5>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Questions</div>
                    <div className="text-muted-foreground">"How much overtime this period?"</div>
                  </div>
                  <div>
                    <div className="font-medium">Actions</div>
                    <div className="text-muted-foreground">"Run payroll for December"</div>
                  </div>
                  <div>
                    <div className="font-medium">Analysis</div>
                    <div className="text-muted-foreground">"Compare to last quarter"</div>
                  </div>
                  <div>
                    <div className="font-medium">Alerts</div>
                    <div className="text-muted-foreground">"Tax deadline reminder"</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. Pay Calendar & Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pay Calendar & Schedule Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Calendar Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Flexible pay period configurations</li>
                    <li>• Multi-company calendar support</li>
                    <li>• Holiday and blackout management</li>
                    <li>• Automated deadline calculations</li>
                    <li>• Off-cycle payroll scheduling</li>
                    <li>• Payroll cutoff date management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Automation & Notifications</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Automated payroll run triggers</li>
                    <li>• Pre-payroll reminder notifications</li>
                    <li>• Deadline tracking & alerts</li>
                    <li>• Approval workflow automation</li>
                    <li>• Time entry cutoff enforcement</li>
                    <li>• Post-payroll confirmation alerts</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Pay Period Types</h5>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Weekly</div>
                    <div className="text-muted-foreground">52 periods/year</div>
                  </div>
                  <div>
                    <div className="font-medium">Bi-weekly</div>
                    <div className="text-muted-foreground">26 periods/year</div>
                  </div>
                  <div>
                    <div className="font-medium">Semi-monthly</div>
                    <div className="text-muted-foreground">24 periods/year</div>
                  </div>
                  <div>
                    <div className="font-medium">Monthly</div>
                    <div className="text-muted-foreground">12 periods/year</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. Reporting & Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Payroll Reporting & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Standard Reports</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Payroll register & summary</li>
                    <li>• Tax liability reports</li>
                    <li>• Employee earnings statements</li>
                    <li>• Department cost center reports</li>
                    <li>• Workers compensation reports</li>
                    <li>• General ledger export files</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Advanced Analytics</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Labor cost analysis & trends</li>
                    <li>• Overtime pattern identification</li>
                    <li>• Payroll variance reporting</li>
                    <li>• Budget vs. actual comparisons</li>
                    <li>• Turnover cost analysis</li>
                    <li>• Predictive cost modeling</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Real-time Dashboards</h5>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Executive</div>
                    <div className="text-muted-foreground">High-level cost metrics</div>
                  </div>
                  <div>
                    <div className="font-medium">HR</div>
                    <div className="text-muted-foreground">Employee-focused analytics</div>
                  </div>
                  <div>
                    <div className="font-medium">Finance</div>
                    <div className="text-muted-foreground">Accounting & compliance</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 8. Security & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Framework & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Data Security</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• End-to-end encryption</li>
                    <li>• Role-based access control</li>
                    <li>• Multi-factor authentication</li>
                    <li>• Secure API endpoints</li>
                    <li>• Data masking & anonymization</li>
                    <li>• Audit logging & monitoring</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Regulatory Compliance</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• SOX compliance controls</li>
                    <li>• PCI DSS payment standards</li>
                    <li>• GDPR data protection</li>
                    <li>• FLSA wage & hour compliance</li>
                    <li>• State labor law adherence</li>
                    <li>• IRS payroll tax compliance</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Audit & Control Framework</h5>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Change Tracking</div>
                    <div className="text-muted-foreground">Complete modification history</div>
                  </div>
                  <div>
                    <div className="font-medium">Approval Workflows</div>
                    <div className="text-muted-foreground">Multi-level authorization</div>
                  </div>
                  <div>
                    <div className="font-medium">Segregation of Duties</div>
                    <div className="text-muted-foreground">Role separation controls</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 9. Future Enhancements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Future Payroll Enhancements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">AI & Machine Learning</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Predictive payroll cost modeling</li>
                    <li>• Automated error detection & correction</li>
                    <li>• Smart tax optimization suggestions</li>
                    <li>• Fraud detection algorithms</li>
                    <li>• Intelligent workflow automation</li>
                    <li>• Natural language report generation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Blockchain & Digital Payments</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Cryptocurrency payroll options</li>
                    <li>• Smart contract automation</li>
                    <li>• Decentralized payment verification</li>
                    <li>• Digital wallet integrations</li>
                    <li>• Instant payment capabilities</li>
                    <li>• Cross-border payment solutions</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Global Expansion Features</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">Multi-currency</div>
                    <div className="text-sm text-muted-foreground">Global payroll support</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">International Tax</div>
                    <div className="text-sm text-muted-foreground">Country-specific rules</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">Localization</div>
                    <div className="text-sm text-muted-foreground">Regional compliance</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">API Ecosystem</div>
                    <div className="text-sm text-muted-foreground">Third-party integrations</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Advanced Integration Capabilities</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time HRIS synchronization</li>
                  <li>• Bi-directional time & attendance integration</li>
                  <li>• Benefits administration automation</li>
                  <li>• Performance management correlation</li>
                  <li>• Expense management workflow integration</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-8">
          {/* 1. Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Universal Tags System Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                Comprehensive universal tagging system enabling consistent metadata management across all platform modules 
                with role-based access control, entity-agnostic relationships, and centralized tag administration.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Core Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Entity-agnostic tagging</li>
                    <li>• Multi-tenant tag management</li>
                    <li>• Color-coded categorization</li>
                    <li>• Hierarchical tag types</li>
                    <li>• Global & company-scoped tags</li>
                    <li>• Real-time tag search</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Access Control</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Role-based tag visibility</li>
                    <li>• Permission-controlled creation</li>
                    <li>• Company-specific isolation</li>
                    <li>• Admin-only tag management</li>
                    <li>• Audit trail logging</li>
                    <li>• Tag usage analytics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Supported Entities</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• CRM Companies & Contacts</li>
                    <li>• Training Modules & Employees</li>
                    <li>• Payroll Records & Batches</li>
                    <li>• Documents & Files</li>
                    <li>• Tasks & Activities</li>
                    <li>• Extensible to any entity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Database Schema & Architecture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Tag System Database Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Schema Diagram */}
              <div className="bg-muted p-6 rounded-lg font-mono text-sm">
                <pre>{`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│      Tags       │    │  Taggable        │    │    Entities     │
│   (Master)      │────│  Entities        │────│   (Any Type)    │
│                 │    │ (Bridge Table)   │    │                 │
│ • id (UUID)     │    │ • tag_id         │    │ • companies     │
│ • tag_name      │◄───┤ • entity_type    │◄───┤ • contacts      │
│ • tag_color     │    │ • entity_id      │    │ • employees     │
│ • tag_type      │    │ • tagged_by      │    │ • modules       │
│ • scope         │    │ • tagged_at      │    │ • documents     │
│ • company_id    │    │ • metadata       │    │ • activities    │
│ • is_active     │    └──────────────────┘    │ • [extensible]  │
│ • created_at    │                            └─────────────────┘
│ • usage_count   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Tag Types     │
│ (Configuration) │
│                 │
│ • category      │
│ • priority      │
│ • status        │
│ • custom        │
│ • system        │
└─────────────────┘`}</pre>
              </div>

              {/* Entity Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Tags Table Structure</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium">Field</span>
                      <span className="font-medium">Type</span>
                      <span className="font-medium">Purpose</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>id</span><span>UUID</span><span>Primary Key</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>tag_name</span><span>TEXT</span><span>Display name</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>tag_color</span><span>TEXT</span><span>Hex color code</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>tag_type</span><span>TEXT</span><span>Category classification</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>scope</span><span>ENUM</span><span>global/company</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>company_id</span><span>UUID</span><span>Scope restriction</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Taggable Entities Bridge</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium">Field</span>
                      <span className="font-medium">Type</span>
                      <span className="font-medium">Purpose</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>tag_id</span><span>UUID</span><span>Foreign Key</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>entity_type</span><span>TEXT</span><span>Table name</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>entity_id</span><span>UUID</span><span>Record ID</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>tagged_by</span><span>UUID</span><span>User who tagged</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>tagged_at</span><span>TIMESTAMP</span><span>When applied</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Tag Management Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Centralized Tag Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Admin Interface Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Create & edit tags with color picker</li>
                    <li>• Bulk tag operations & management</li>
                    <li>• Tag type categorization</li>
                    <li>• Usage analytics & reporting</li>
                    <li>• Duplicate tag detection</li>
                    <li>• Tag merge & rename operations</li>
                    <li>• Inactive tag archival</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">User Interface Components</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• TagSelector with search & create</li>
                    <li>• TagList for display & removal</li>
                    <li>• Tag badges with color coding</li>
                    <li>• Filter dropdowns by tag type</li>
                    <li>• Real-time search suggestions</li>
                    <li>• Tag assignment history</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Tag Manager Routes</h5>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">/superadmin/tags</div>
                    <div className="text-muted-foreground">Central management interface</div>
                  </div>
                  <div>
                    <div className="font-medium">API Endpoints</div>
                    <div className="text-muted-foreground">/api/tags/* CRUD operations</div>
                  </div>
                  <div>
                    <div className="font-medium">Component Library</div>
                    <div className="text-muted-foreground">Reusable tag UI components</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Permission System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Tag Permissions & Access Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Role</th>
                      <th className="text-left p-2 font-medium">Create Tags</th>
                      <th className="text-left p-2 font-medium">View Tags</th>
                      <th className="text-left p-2 font-medium">Apply/Remove</th>
                      <th className="text-left p-2 font-medium">Delete Tags</th>
                      <th className="text-left p-2 font-medium">Scope Access</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="p-2 font-medium">Super Admin</td>
                      <td className="p-2">Global + Company</td>
                      <td className="p-2">All tags</td>
                      <td className="p-2">Full access</td>
                      <td className="p-2">Yes</td>
                      <td className="p-2">Global + All companies</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Company Admin</td>
                      <td className="p-2">Company only</td>
                      <td className="p-2">Global + Company</td>
                      <td className="p-2">Company entities only</td>
                      <td className="p-2">Company tags only</td>
                      <td className="p-2">Own company only</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Manager</td>
                      <td className="p-2">No</td>
                      <td className="p-2">Global + Company</td>
                      <td className="p-2">Assigned entities</td>
                      <td className="p-2">No</td>
                      <td className="p-2">Team entities</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">User</td>
                      <td className="p-2">No</td>
                      <td className="p-2">Visible tags only</td>
                      <td className="p-2">Own entities only</td>
                      <td className="p-2">No</td>
                      <td className="p-2">Personal scope</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Tag Visibility Rules</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Global tags:</strong> Visible to all users across all companies</li>
                  <li>• <strong>Company tags:</strong> Visible only to users within that company</li>
                  <li>• <strong>System tags:</strong> Read-only tags managed by the platform</li>
                  <li>• <strong>Custom tags:</strong> User-created tags with full edit permissions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 5. Implementation & Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Technical Implementation & Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Service Layer</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 border rounded">
                      <div className="font-medium">TagService</div>
                      <div className="text-muted-foreground">Core CRUD operations & validation</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium">Entity Tagging</div>
                      <div className="text-muted-foreground">Apply/remove tags from entities</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium">Search & Filter</div>
                      <div className="text-muted-foreground">Real-time tag search functionality</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium">Bulk Operations</div>
                      <div className="text-muted-foreground">Mass tag assignment & removal</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">UI Components</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 border rounded">
                      <div className="font-medium">Tag Component</div>
                      <div className="text-muted-foreground">Individual tag display with actions</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium">TagSelector</div>
                      <div className="text-muted-foreground">Multi-select with search & create</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium">TagList</div>
                      <div className="text-muted-foreground">Display collection of tags</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium">TagManager</div>
                      <div className="text-muted-foreground">Admin interface for tag management</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Integration Points</h5>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">CRM Module</div>
                    <div className="text-muted-foreground">Companies, contacts, activities</div>
                  </div>
                  <div>
                    <div className="font-medium">LMS Module</div>
                    <div className="text-muted-foreground">Training modules, employees</div>
                  </div>
                  <div>
                    <div className="font-medium">Payroll Module</div>
                    <div className="text-muted-foreground">Pay runs, batches, employees</div>
                  </div>
                  <div>
                    <div className="font-medium">Future Modules</div>
                    <div className="text-muted-foreground">Extensible architecture</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. Search & Filtering */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Tag-Based Search & Filtering
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Search Capabilities</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Real-time tag name search</li>
                    <li>• Fuzzy matching for typo tolerance</li>
                    <li>• Tag type filtering</li>
                    <li>• Color-based filtering</li>
                    <li>• Usage frequency sorting</li>
                    <li>• Recently used tags prioritization</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Entity Filtering</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Multi-tag AND/OR logic filtering</li>
                    <li>• Tag exclusion filters (NOT logic)</li>
                    <li>• Saved filter combinations</li>
                    <li>• Quick filter shortcuts</li>
                    <li>• Filter history & bookmarks</li>
                    <li>• Export filtered results</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Advanced Filtering Examples</h5>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">CRM Example</div>
                    <div className="text-muted-foreground">Companies with "high-priority" AND "west-coast"</div>
                  </div>
                  <div>
                    <div className="font-medium">LMS Example</div>
                    <div className="text-muted-foreground">Employees with "safety-training" OR "compliance"</div>
                  </div>
                  <div>
                    <div className="font-medium">Complex Filter</div>
                    <div className="text-muted-foreground">NOT "inactive" AND ("vip" OR "enterprise")</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. Analytics & Reporting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tag Analytics & Usage Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Usage Analytics</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Tag usage frequency tracking</li>
                    <li>• Most/least used tags reporting</li>
                    <li>• Tag application trends over time</li>
                    <li>• User adoption metrics</li>
                    <li>• Tag effectiveness scoring</li>
                    <li>• Orphaned tags identification</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Business Intelligence</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Entity categorization insights</li>
                    <li>• Tag-based performance correlation</li>
                    <li>• Data quality improvement suggestions</li>
                    <li>• Tag taxonomy optimization</li>
                    <li>• Cross-module tag relationships</li>
                    <li>• ROI impact of tagging</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Reporting Dashboard</h5>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Tag Cloud</div>
                    <div className="text-muted-foreground">Visual usage representation</div>
                  </div>
                  <div>
                    <div className="font-medium">Usage Trends</div>
                    <div className="text-muted-foreground">Time-series analytics</div>
                  </div>
                  <div>
                    <div className="font-medium">Entity Coverage</div>
                    <div className="text-muted-foreground">Tagging completeness metrics</div>
                  </div>
                  <div>
                    <div className="font-medium">Performance Impact</div>
                    <div className="text-muted-foreground">Tag correlation analysis</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 8. Migration & Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Tag Migration & Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Migration Tools</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Legacy tag system import</li>
                    <li>• Bulk tag creation from CSV</li>
                    <li>• Tag mapping & transformation</li>
                    <li>• Duplicate detection & merging</li>
                    <li>• Data validation & cleanup</li>
                    <li>• Migration progress tracking</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Data Maintenance</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Automated tag cleanup jobs</li>
                    <li>• Usage count synchronization</li>
                    <li>• Orphaned tag removal</li>
                    <li>• Tag normalization processes</li>
                    <li>• Backup & restore procedures</li>
                    <li>• Performance optimization</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Quality Assurance</h5>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Validation Rules</div>
                    <div className="text-muted-foreground">Tag name format & length</div>
                  </div>
                  <div>
                    <div className="font-medium">Duplicate Prevention</div>
                    <div className="text-muted-foreground">Real-time similarity checking</div>
                  </div>
                  <div>
                    <div className="font-medium">Data Integrity</div>
                    <div className="text-muted-foreground">Relationship consistency checks</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 9. Future Enhancements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Future Tag System Enhancements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">AI-Powered Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Automatic tag suggestions based on content</li>
                    <li>• ML-driven tag recommendations</li>
                    <li>• Natural language tag creation</li>
                    <li>• Smart tag clustering & grouping</li>
                    <li>• Predictive tagging for new entities</li>
                    <li>• Tag sentiment analysis</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Advanced Functionality</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Hierarchical tag relationships</li>
                    <li>• Tag versioning & history</li>
                    <li>• Conditional tag rules & automation</li>
                    <li>• Tag-based workflow triggers</li>
                    <li>• Custom tag property extensions</li>
                    <li>• Tag-based notification systems</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Integration Expansions</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">API Ecosystem</div>
                    <div className="text-sm text-muted-foreground">Third-party integrations</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">Sync Services</div>
                    <div className="text-sm text-muted-foreground">External system sync</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">Mobile Apps</div>
                    <div className="text-sm text-muted-foreground">Native mobile tagging</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium">Browser Extensions</div>
                    <div className="text-sm text-muted-foreground">External content tagging</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Advanced Use Cases</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Multi-dimensional tag faceting for complex queries</li>
                  <li>• Tag-based recommendation engines</li>
                  <li>• Collaborative tag curation workflows</li>
                  <li>• Tag-driven content organization & discovery</li>
                  <li>• Real-time collaborative tagging sessions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication & Security Tab */}
        <TabsContent value="auth" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication & Security Overview
              </CardTitle>
              <CardDescription>
                Enterprise-grade security architecture with multi-layer authentication, authorization, and compliance frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Security Layers</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Row Level Security (RLS) on all tables
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      JWT-based authentication with refresh tokens
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Role-based access control (RBAC)
                    </li>
                    <li className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary" />
                      Comprehensive audit logging
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Authentication Methods</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Email/Password</Badge>
                      Traditional authentication
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">OAuth 2.0</Badge>
                      Google, Microsoft, GitHub
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">SSO/SAML</Badge>
                      Enterprise integration
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">MFA</Badge>
                      Multi-factor authentication
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Roles & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Core Roles</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Super Admin</span>
                        <Badge variant="destructive">Full Access</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Company Admin</span>
                        <Badge variant="secondary">Company Scope</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Internal Staff</span>
                        <Badge variant="outline">CRM Access</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Learner</span>
                        <Badge variant="outline">LMS Access</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2">Specialized Roles</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Halo Admin</span>
                        <Badge variant="secondary">Payroll Module</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Staffing Admin</span>
                        <Badge variant="secondary">ATS Module</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  RLS Implementation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Security Functions</h5>
                    <div className="bg-muted p-3 rounded text-xs font-mono">
                      <code>has_role(user_id, role)</code><br/>
                      <code>has_company_role(user_id, role, company_id)</code><br/>
                      <code>get_user_company_id(user_id)</code><br/>
                      <code>user_owns_employee(user_id, employee_id)</code>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2">Policy Examples</h5>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Company admins can only access their company data</li>
                      <li>• Learners can only view their own training records</li>
                      <li>• Super admins have unrestricted access</li>
                      <li>• Audit logs are read-only for non-admins</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Security Monitoring & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium mb-3">Audit Trails</h5>
                  <ul className="text-sm space-y-1">
                    <li>• All user actions logged</li>
                    <li>• IP address tracking</li>
                    <li>• Session management</li>
                    <li>• Failed login attempts</li>
                    <li>• Data access patterns</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-3">Compliance Features</h5>
                  <ul className="text-sm space-y-1">
                    <li>• GDPR data protection</li>
                    <li>• SOC 2 compliance</li>
                    <li>• Data retention policies</li>
                    <li>• Right to deletion</li>
                    <li>• Privacy controls</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-3">Security Monitoring</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Real-time threat detection</li>
                    <li>• Anomaly detection</li>
                    <li>• Security alerts</li>
                    <li>• Intrusion monitoring</li>
                    <li>• Vulnerability scanning</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Hub Tab */}
        <TabsContent value="integrations" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Integration Hub Overview
              </CardTitle>
              <CardDescription>
                Comprehensive integration platform supporting 50+ external services with real-time sync and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Supported Integrations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime SLA</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">Real-time</div>
                  <div className="text-sm text-muted-foreground">Sync Capability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Monitoring</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Integration Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">HR & Payroll</h5>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">ADP</Badge>
                      <Badge variant="secondary" className="text-xs">Workday</Badge>
                      <Badge variant="secondary" className="text-xs">BambooHR</Badge>
                      <Badge variant="secondary" className="text-xs">Gusto</Badge>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">CRM & Sales</h5>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Salesforce</Badge>
                      <Badge variant="secondary" className="text-xs">HubSpot</Badge>
                      <Badge variant="secondary" className="text-xs">Pipedrive</Badge>
                      <Badge variant="secondary" className="text-xs">Zoho</Badge>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Communication</h5>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Slack</Badge>
                      <Badge variant="secondary" className="text-xs">Teams</Badge>
                      <Badge variant="secondary" className="text-xs">Discord</Badge>
                      <Badge variant="secondary" className="text-xs">Zapier</Badge>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Learning Management</h5>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Canvas</Badge>
                      <Badge variant="secondary" className="text-xs">Moodle</Badge>
                      <Badge variant="secondary" className="text-xs">Blackboard</Badge>
                      <Badge variant="secondary" className="text-xs">Cornerstone</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Integration Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Data Synchronization</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Real-time bidirectional sync</li>
                      <li>• Batch processing for large datasets</li>
                      <li>• Conflict resolution algorithms</li>
                      <li>• Data validation and cleansing</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Workflow Automation</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Trigger-based automation</li>
                      <li>• Custom workflow builder</li>
                      <li>• Event-driven processing</li>
                      <li>• Conditional logic support</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Monitoring & Analytics</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Real-time status monitoring</li>
                      <li>• Performance metrics</li>
                      <li>• Error tracking & alerts</li>
                      <li>• Usage analytics</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Integration Management Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium mb-3">Health Monitoring</h5>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Active integrations: 23
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Warning state: 2
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Failed connections: 0
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-3">Recent Activity</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 1,234 records synced today</li>
                    <li>• 98.7% success rate</li>
                    <li>• 0.3s average response time</li>
                    <li>• 15 webhooks processed</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-3">Configuration</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Rate limiting: 1000/hour</li>
                    <li>• Retry attempts: 3</li>
                    <li>• Timeout: 30 seconds</li>
                    <li>• Batch size: 100 records</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Intelligence Tab */}
        <TabsContent value="bi" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Business Intelligence Overview
              </CardTitle>
              <CardDescription>
                Advanced analytics, reporting, and data visualization platform with real-time insights and predictive analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">15+</div>
                  <div className="text-sm text-muted-foreground">Dashboard Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">KPI Metrics</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">Real-time</div>
                  <div className="text-sm text-muted-foreground">Data Updates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">ML</div>
                  <div className="text-sm text-muted-foreground">Powered Insights</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Analytics Modules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Learning Analytics</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Completion rates by module</li>
                      <li>• Learning path effectiveness</li>
                      <li>• Skill gap analysis</li>
                      <li>• Engagement metrics</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Sales Analytics</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Pipeline velocity tracking</li>
                      <li>• Conversion rate analysis</li>
                      <li>• Revenue forecasting</li>
                      <li>• Lead source attribution</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">HR Analytics</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Employee performance metrics</li>
                      <li>• Retention analysis</li>
                      <li>• Training ROI calculation</li>
                      <li>• Compliance tracking</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Dashboard Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Interactive Visualizations</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Real-time chart updates</li>
                      <li>• Drill-down capabilities</li>
                      <li>• Custom date ranges</li>
                      <li>• Multi-dimensional filtering</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Report Generation</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Automated report scheduling</li>
                      <li>• PDF/Excel export options</li>
                      <li>• Custom report builder</li>
                      <li>• Email delivery system</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Predictive Analytics</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Machine learning models</li>
                      <li>• Trend prediction</li>
                      <li>• Risk assessment</li>
                      <li>• Performance forecasting</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                KPI Monitoring & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium mb-3">Performance KPIs</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Training Completion</span>
                      <Badge variant="secondary">89%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sales Conversion</span>
                      <Badge variant="secondary">12.4%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Employee Engagement</span>
                      <Badge variant="secondary">94%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">System Uptime</span>
                      <Badge variant="secondary">99.9%</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-3">Alert Configuration</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Threshold-based alerts</li>
                    <li>• Anomaly detection</li>
                    <li>• Multi-channel notifications</li>
                    <li>• Escalation procedures</li>
                    <li>• Custom alert rules</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-3">Data Sources</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Internal database metrics</li>
                    <li>• External API integrations</li>
                    <li>• Real-time event streams</li>
                    <li>• User interaction tracking</li>
                    <li>• System performance logs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Notification Engine Overview
              </CardTitle>
              <CardDescription>
                Multi-channel notification system supporting email, SMS, push notifications, and real-time in-app messaging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">6</div>
                  <div className="text-sm text-muted-foreground">Notification Channels</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">99.8%</div>
                  <div className="text-sm text-muted-foreground">Delivery Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Template Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">Real-time</div>
                  <div className="text-sm text-muted-foreground">Processing</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Notification Channels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Email Notifications</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• HTML/Plain text templates</li>
                      <li>• Personalization & variables</li>
                      <li>• Automated campaigns</li>
                      <li>• Delivery tracking</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">In-App Notifications</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Real-time WebSocket delivery</li>
                      <li>• Toast notifications</li>
                      <li>• Notification center</li>
                      <li>• Read/unread status</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Push Notifications</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Browser push notifications</li>
                      <li>• Mobile app notifications</li>
                      <li>• Scheduled delivery</li>
                      <li>• Click tracking</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Notification Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Template System</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Dynamic content injection</li>
                      <li>• Multi-language support</li>
                      <li>• A/B testing capabilities</li>
                      <li>• Version control</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">User Preferences</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Channel-specific settings</li>
                      <li>• Frequency controls</li>
                      <li>• Quiet hours</li>
                      <li>• Category subscriptions</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Automation Rules</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Event-triggered notifications</li>
                      <li>• Conditional logic</li>
                      <li>• Retry mechanisms</li>
                      <li>• Escalation workflows</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Notification Analytics & Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium mb-3">Delivery Metrics</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Email Open Rate</span>
                      <Badge variant="secondary">24.3%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Click-through Rate</span>
                      <Badge variant="secondary">8.7%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Push Delivery Rate</span>
                      <Badge variant="secondary">99.2%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bounce Rate</span>
                      <Badge variant="secondary">2.1%</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-3">Performance Monitoring</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Queue processing times</li>
                    <li>• Delivery success rates</li>
                    <li>• Error rate tracking</li>
                    <li>• Provider performance</li>
                    <li>• Capacity utilization</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-3">User Engagement</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Notification interaction rates</li>
                    <li>• User preference analysis</li>
                    <li>• Opt-out tracking</li>
                    <li>• Channel effectiveness</li>
                    <li>• Response time metrics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Management Tab */}
        <TabsContent value="files" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                File Management System Overview
              </CardTitle>
              <CardDescription>
                Enterprise-grade file storage, processing, and management with advanced security and version control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1TB+</div>
                  <div className="text-sm text-muted-foreground">Storage Capacity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">File Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">256-bit</div>
                  <div className="text-sm text-muted-foreground">Encryption</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-sm text-muted-foreground">Availability</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Storage & Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Supported File Types</h5>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">PDF</Badge>
                      <Badge variant="secondary" className="text-xs">DOC/DOCX</Badge>
                      <Badge variant="secondary" className="text-xs">XLS/XLSX</Badge>
                      <Badge variant="secondary" className="text-xs">PPT/PPTX</Badge>
                      <Badge variant="secondary" className="text-xs">MP4</Badge>
                      <Badge variant="secondary" className="text-xs">MP3</Badge>
                      <Badge variant="secondary" className="text-xs">JPG/PNG</Badge>
                      <Badge variant="secondary" className="text-xs">SCORM</Badge>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Processing Features</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Automatic virus scanning</li>
                      <li>• Image/video compression</li>
                      <li>• OCR text extraction</li>
                      <li>• Metadata extraction</li>
                      <li>• Format conversion</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Upload Methods</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Drag & drop interface</li>
                      <li>• Bulk upload support</li>
                      <li>• Resumable uploads</li>
                      <li>• URL import</li>
                      <li>• API integration</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security & Access Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Encryption & Security</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• AES-256 encryption at rest</li>
                      <li>• TLS 1.3 in transit</li>
                      <li>• Digital signatures</li>
                      <li>• Watermarking support</li>
                      <li>• Access logging</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Access Control</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Role-based permissions</li>
                      <li>• Time-limited access</li>
                      <li>• IP restrictions</li>
                      <li>• Download controls</li>
                      <li>• Sharing tokens</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Compliance</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• GDPR compliance</li>
                      <li>• Data retention policies</li>
                      <li>• Audit trails</li>
                      <li>• Legal hold support</li>
                      <li>• Right to deletion</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Version Control & Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium mb-3">Version Management</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Automatic versioning</li>
                    <li>• Version comparison</li>
                    <li>• Rollback capabilities</li>
                    <li>• Change tracking</li>
                    <li>• Version comments</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-3">Collaboration Features</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Real-time collaboration</li>
                    <li>• Comment system</li>
                    <li>• Review workflows</li>
                    <li>• Approval processes</li>
                    <li>• Team sharing</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-3">Organization</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Folder hierarchies</li>
                    <li>• Tag-based organization</li>
                    <li>• Smart collections</li>
                    <li>• Advanced search</li>
                    <li>• Favorites system</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Platform Tab */}
        <TabsContent value="api" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                API & Developer Platform Overview
              </CardTitle>
              <CardDescription>
                Comprehensive API platform with REST/GraphQL endpoints, webhooks, and developer tools for seamless integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">200+</div>
                  <div className="text-sm text-muted-foreground">API Endpoints</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-sm text-muted-foreground">API Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">50ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">OAuth 2.0</div>
                  <div className="text-sm text-muted-foreground">Security Standard</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  API Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">REST API</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• RESTful design principles</li>
                      <li>• JSON request/response</li>
                      <li>• HTTP status codes</li>
                      <li>• Pagination support</li>
                      <li>• Filtering & sorting</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">GraphQL API</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Single endpoint design</li>
                      <li>• Query optimization</li>
                      <li>• Real-time subscriptions</li>
                      <li>• Schema introspection</li>
                      <li>• Type safety</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Webhooks</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Event-driven notifications</li>
                      <li>• Retry mechanisms</li>
                      <li>• Signature verification</li>
                      <li>• Custom payloads</li>
                      <li>• Delivery tracking</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Authentication Methods</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• OAuth 2.0 / OpenID Connect</li>
                      <li>• API key authentication</li>
                      <li>• JWT token validation</li>
                      <li>• Service account auth</li>
                      <li>• Webhook signatures</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Rate Limiting</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Configurable rate limits</li>
                      <li>• Burst handling</li>
                      <li>• Per-endpoint limits</li>
                      <li>• User-based quotas</li>
                      <li>• Rate limit headers</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Security Features</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Request validation</li>
                      <li>• CORS configuration</li>
                      <li>• IP whitelisting</li>
                      <li>• Encryption in transit</li>
                      <li>• Audit logging</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Puzzle className="h-5 w-5" />
                Developer Tools & Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium mb-3">Documentation</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Interactive API explorer</li>
                    <li>• Code examples (multiple languages)</li>
                    <li>• OpenAPI 3.0 specification</li>
                    <li>• Tutorials & guides</li>
                    <li>• SDK documentation</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-3">Development Tools</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Postman collections</li>
                    <li>• CLI tools</li>
                    <li>• Testing sandbox</li>
                    <li>• Mock servers</li>
                    <li>• Schema validation</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-3">Monitoring & Analytics</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• API usage analytics</li>
                    <li>• Performance metrics</li>
                    <li>• Error tracking</li>
                    <li>• Latency monitoring</li>
                    <li>• Custom dashboards</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Footer */}
      <div className="text-center text-xs sm:text-sm text-muted-foreground pt-8 border-t">
        <p>Last Updated: January 2025 | Microservices Architecture | Mobile Optimized</p>
        <p className="mt-2 text-xs text-muted-foreground">Built with React + TypeScript • Supabase Backend • Responsive Design</p>
      </div>
    </div>
  );
}