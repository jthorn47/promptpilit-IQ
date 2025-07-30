import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Server,
  Database,
  Users,
  Shield,
  Code,
  Globe,
  Zap,
  FileText,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Clock,
  UserCheck,
  Building2,
  MapPin,
  Phone,
  Mail,
  Network,
  Cloud,
  Lock,
  CheckCircle,
  AlertTriangle,
  Layers,
  GitBranch,
  Monitor,
  Smartphone,
  Laptop,
  Activity,
  Share2,
  Copy,
  ExternalLink
} from "lucide-react";
import staffingDashboardImage from "@/assets/staffing-dashboard-screenshot.jpg";
import clientManagementImage from "@/assets/client-management-screenshot.jpg";
import candidateManagementImage from "@/assets/candidate-management-screenshot.jpg";
import staffingSystemImage from "@/assets/staffing-system-overview.jpg";

export default function EaseWorksStaffingArchitecture() {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);

  const generateShareableLink = async () => {
    setIsGeneratingShare(true);
    try {
      // Generate a unique token
      const token = Array.from({ length: 32 }, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
          .charAt(Math.floor(Math.random() * 62))
      ).join('');

      const { data, error } = await supabase
        .from('shared_links')
        .insert({
          token,
          page_type: 'staffing-architecture',
          expires_at: null // No expiration for now
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const shareableUrl = `${window.location.origin}/shared/staffing-architecture/${token}`;
      setShareUrl(shareableUrl);
      

      // Try to copy to clipboard, but don't fail the whole operation if it doesn't work
      try {
        await navigator.clipboard.writeText(shareableUrl);
        toast({
          title: "Shareable Link Generated",
          description: "Link has been generated and copied to your clipboard.",
        });
      } catch (clipboardError) {
        // Clipboard failed, but link was still generated successfully
        toast({
          title: "Shareable Link Generated",
          description: "Link has been generated. Use the Copy button to copy it.",
        });
      }
    } catch (error) {
      console.error('Error generating shareable link:', error);
      toast({
        title: "Error",
        description: "Failed to generate shareable link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const copyShareUrl = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Shareable link copied to clipboard.",
        });
      } catch (error) {
        // Fallback: Create a temporary input element to copy
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
          document.execCommand('copy');
          toast({
            title: "Link Copied",
            description: "Shareable link copied to clipboard (fallback method).",
          });
        } catch (fallbackError) {
          toast({
            title: "Copy Failed",
            description: "Please manually copy the link above.",
            variant: "destructive",
          });
        } finally {
          document.body.removeChild(textArea);
        }
      }
    }
  };
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      <BreadcrumbNav items={[
        { label: "Admin", href: "/admin" },
        { label: "EaseWorks Staffing Architecture" }
      ]} />
      
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">EaseWorks Staffing System Architecture</h1>
            <p className="text-base md:text-xl text-muted-foreground">
              Complete technical documentation for the EaseWorks Staffing Management Platform
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Version 1.0</Badge>
              <Badge variant="outline">Production Ready</Badge>
              <Badge variant="outline">Scalable</Badge>
            </div>
          </div>
          
          {/* Share Section */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/50 rounded-lg border">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Share this architecture document</h3>
              <p className="text-xs text-muted-foreground">Generate a public link that can be accessed without login</p>
              {shareUrl && (
                <div className="mt-2 p-2 bg-background rounded border text-xs font-mono break-all">
                  {shareUrl}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={generateShareableLink}
                disabled={isGeneratingShare}
                size="sm"
              >
                {isGeneratingShare ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Generate Link
                  </>
                )}
              </Button>
              {shareUrl && (
                <Button 
                  onClick={copyShareUrl}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            EaseWorks Staffing is a comprehensive workforce management platform designed to streamline 
            staffing operations from client acquisition to payroll processing. Built with modern web 
            technologies and cloud-first architecture, it provides a complete solution for staffing 
            agencies, temporary employment services, and workforce management companies.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Multi-User System</h3>
              <p className="text-sm text-muted-foreground">Admins, Recruiters, POPs, Clients, Employees</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Cloud className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Cloud Native</h3>
              <p className="text-sm text-muted-foreground">Scalable, Reliable, Secure Infrastructure</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Real-time Analytics</h3>
              <p className="text-sm text-muted-foreground">Business Intelligence & Reporting</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            System Architecture Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 md:p-6 rounded-lg">
            <pre className="text-xs md:text-sm overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────────────┐
│                          EaseWorks Staffing Platform                    │
├─────────────────────────────────────────────────────────────────────────┤
│  Frontend Layer (React + TypeScript + Tailwind CSS)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   Admin     │ │  Recruiter  │ │     POP     │ │   Client    │      │
│  │ Dashboard   │ │   Portal    │ │   Portal    │ │   Portal    │      │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │
├─────────────────────────────────────────────────────────────────────────┤
│  Business Logic Layer (React Hooks + Context)                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Client Mgmt │ Employee Mgmt │ Job Matching │ Scheduling │ Payroll ││
│  └─────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│  API Layer (Supabase Edge Functions + REST + Real-time)                │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Authentication │  Authorization │  Business Rules │  Integrations ││
│  └─────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│  Data Layer (PostgreSQL + Row Level Security)                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Clients │ Employees │ Jobs │ Placements │ Time │ Billing │ Reports ││
│  └─────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│  Infrastructure (Supabase + CDN + Storage)                             │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │   Database   │    Storage    │   Real-time   │   Analytics        ││
│  │   Hosting    │   Monitoring  │   Backups     │   Security         ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Core Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Client Management
            </CardTitle>
            <CardDescription>Complete client lifecycle management</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Client onboarding & approval workflow
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Contract management & digital signatures
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Billing rates & payment terms
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Communication history tracking
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Management
            </CardTitle>
            <CardDescription>Workforce administration & tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Employee profiles & documentation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Skills tracking & certifications
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Background checks & compliance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Performance evaluations
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduling System
            </CardTitle>
            <CardDescription>Advanced workforce scheduling</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Shift planning & optimization
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Real-time schedule updates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Employee availability tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Automated notifications
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Tracking
            </CardTitle>
            <CardDescription>Accurate time & attendance management</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Digital time clock integration
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                GPS location tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Overtime calculations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Break & lunch time tracking
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payroll Processing
            </CardTitle>
            <CardDescription>Automated payroll & billing</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Multi-rate payroll calculations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Tax calculations & deductions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Direct deposit & pay stubs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Client billing automation
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics & Reporting
            </CardTitle>
            <CardDescription>Business intelligence & insights</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Real-time performance dashboards
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Custom report generation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Predictive analytics
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Export capabilities (PDF, Excel)
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Technical Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Technical Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Frontend
              </h3>
              <ul className="space-y-1 text-sm">
                <li>• React 18 with TypeScript</li>
                <li>• Tailwind CSS + shadcn/ui</li>
                <li>• React Router for navigation</li>
                <li>• React Query for state management</li>
                <li>• React Hook Form for forms</li>
                <li>• Recharts for data visualization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Server className="h-4 w-4" />
                Backend
              </h3>
              <ul className="space-y-1 text-sm">
                <li>• Supabase (PostgreSQL)</li>
                <li>• Edge Functions (Deno)</li>
                <li>• Row Level Security (RLS)</li>
                <li>• Real-time subscriptions</li>
                <li>• REST APIs</li>
                <li>• WebSocket connections</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </h3>
              <ul className="space-y-1 text-sm">
                <li>• PostgreSQL 15+</li>
                <li>• JSONB for flexible data</li>
                <li>• Full-text search</li>
                <li>• Triggers & functions</li>
                <li>• Automated backups</li>
                <li>• Point-in-time recovery</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </h3>
              <ul className="space-y-1 text-sm">
                <li>• JWT authentication</li>
                <li>• Role-based access control</li>
                <li>• Row-level security</li>
                <li>• HTTPS encryption</li>
                <li>• Audit logging</li>
                <li>• GDPR compliance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Roles & Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            User Roles & Access Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold">System Admin</h3>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Full system access</li>
                <li>• User management</li>
                <li>• System configuration</li>
                <li>• Analytics & reporting</li>
                <li>• Audit logs</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Recruiter</h3>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Client management</li>
                <li>• Employee recruitment</li>
                <li>• Job placements</li>
                <li>• Territory management</li>
                <li>• Performance tracking</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">POP (Partner)</h3>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Local client acquisition</li>
                <li>• Candidate sourcing</li>
                <li>• Territory operations</li>
                <li>• Commission tracking</li>
                <li>• Performance metrics</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Client Admin</h3>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• View assignments</li>
                <li>• Approve timesheets</li>
                <li>• Request staff</li>
                <li>• Review invoices</li>
                <li>• Access reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Schema Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 md:p-6 rounded-lg">
            <pre className="text-xs md:text-sm overflow-x-auto">
{`Core Tables:
├── staffing_clients              (Client companies & contracts)
├── staffing_employees           (Workforce & qualifications)
├── staffing_job_positions       (Available positions)
├── staffing_placements         (Employee-client assignments)
├── work_shifts                 (Shift schedules)
├── attendance_records          (Time & attendance)
├── staffing_invoices           (Client billing)
├── staffing_payroll_periods    (Payroll cycles)
├── staffing_billing_rates      (Client rates)
├── staffing_employee_rates     (Employee wages)
├── staffing_territories        (Geographic regions)
├── staffing_user_roles         (Access control)

Supporting Tables:
├── compliance_policies         (Regulatory compliance)
├── document_templates         (Contract templates)
├── training_modules          (Safety & skill training)
├── performance_metrics       (KPI tracking)
├── audit_logs               (System activity)
└── integration_configs      (Third-party APIs)`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Integration Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Integration Ecosystem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div>
              <h3 className="font-semibold mb-3">Payroll Systems</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• ADP Integration</li>
                <li>• Paychex Connect</li>
                <li>• QuickBooks Payroll</li>
                <li>• Custom API endpoints</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Time Clock Systems</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Kronos Workforce</li>
                <li>• TimeClock Plus</li>
                <li>• When I Work</li>
                <li>• Mobile time tracking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Background Checks</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Sterling Background</li>
                <li>• HireRight API</li>
                <li>• Checkr Integration</li>
                <li>• GoodHire Connect</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance & Scalability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance & Scalability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">99.9% Uptime</h3>
              <p className="text-sm text-muted-foreground">Enterprise-grade reliability</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">&lt; 200ms Response</h3>
              <p className="text-sm text-muted-foreground">Lightning-fast performance</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">10,000+ Users</h3>
              <p className="text-sm text-muted-foreground">Concurrent user capacity</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-semibold">Auto-scaling</h3>
              <p className="text-sm text-muted-foreground">Dynamic resource allocation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <h3 className="font-semibold mb-3">Data Protection</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">End-to-end encryption (AES-256)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Encrypted data at rest</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">TLS 1.3 for data in transit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Regular security audits</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Compliance Standards</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">GDPR compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">SOC 2 Type II</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">CCPA compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">OSHA record keeping</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile & Responsive Design */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Multi-Platform Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center p-4 border rounded-lg">
              <Laptop className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Desktop Web App</h3>
              <p className="text-sm text-muted-foreground">
                Full-featured administrative interface for managers and recruiters
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Mobile Responsive</h3>
              <p className="text-sm text-muted-foreground">
                Optimized mobile experience for field workers and on-the-go management
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Monitor className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Progressive Web App</h3>
              <p className="text-sm text-muted-foreground">
                Offline capabilities and native app-like experience
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development & Deployment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Development & Deployment Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Development Workflow</h3>
              <div className="text-sm text-muted-foreground">
                Git-based version control → Feature branches → Code review → Automated testing → 
                Staging deployment → User acceptance testing → Production deployment
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <h4 className="font-semibold text-blue-800">Development</h4>
                <p className="text-sm text-blue-600">Feature development & testing</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <h4 className="font-semibold text-yellow-800">Staging</h4>
                <p className="text-sm text-yellow-600">User acceptance & integration testing</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <h4 className="font-semibold text-green-800">Production</h4>
                <p className="text-sm text-green-600">Live environment with monitoring</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Roadmap */}
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

      {/* Future Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Future Development Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div>
              <h3 className="font-semibold mb-3">Q1 2025 - AI Enhancement</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• AI-powered candidate matching</li>
                <li>• Predictive scheduling optimization</li>
                <li>• Automated compliance monitoring</li>
                <li>• Intelligent report generation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Q2 2025 - Mobile App</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Native iOS/Android applications</li>
                <li>• Offline time tracking</li>
                <li>• Push notifications</li>
                <li>• Biometric authentication</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Q3 2025 - Advanced Analytics</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Machine learning insights</li>
                <li>• Performance prediction models</li>
                <li>• Cost optimization algorithms</li>
                <li>• Market trend analysis</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Q4 2025 - Enterprise Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Multi-company management</li>
                <li>• Advanced workflow automation</li>
                <li>• Custom integrations marketplace</li>
                <li>• White-label solutions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Technical Support & Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center">
              <Phone className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Technical Support</h3>
              <p className="text-sm text-muted-foreground">1-800-EASEWORK</p>
              <p className="text-sm text-muted-foreground">24/7 Support Available</p>
            </div>
            <div className="text-center">
              <Mail className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-sm text-muted-foreground">support@easeworks.com</p>
              <p className="text-sm text-muted-foreground">Response within 2 hours</p>
            </div>
            <div className="text-center">
              <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Documentation</h3>
              <p className="text-sm text-muted-foreground">docs.easeworks.com</p>
              <p className="text-sm text-muted-foreground">Comprehensive guides & APIs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}