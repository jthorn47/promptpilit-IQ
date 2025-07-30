import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

export default function SharedStaffingArchitecture() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [isValidShare, setIsValidShare] = useState<boolean | null>(null);

  useEffect(() => {
    const validateShareToken = async () => {
      if (!token) {
        setIsValidShare(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('shared_links')
          .select('*')
          .eq('token', token)
          .eq('page_type', 'staffing-architecture')
          .eq('is_active', true)
          .single();

        if (error || !data) {
          setIsValidShare(false);
          toast({
            title: "Invalid Link",
            description: "This shared link is invalid or has expired.",
            variant: "destructive",
          });
          return;
        }

        // Check if link has expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setIsValidShare(false);
          toast({
            title: "Link Expired",
            description: "This shared link has expired.",
            variant: "destructive",
          });
          return;
        }

        // Increment view count
        await supabase.rpc('increment_share_view_count', { share_token: token });
        setIsValidShare(true);
      } catch (error) {
        console.error('Error validating share token:', error);
        setIsValidShare(false);
      }
    };

    validateShareToken();
  }, [token, toast]);

  if (isValidShare === null) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (isValidShare === false) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This shared link is invalid, expired, or has been deactivated.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Shared Link Header */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-2 text-primary">
          <Share2 className="h-5 w-5" />
          <span className="font-medium">Shared Document</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          You are viewing a shared EaseWorks Staffing Architecture document
        </p>
      </div>
      
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
      </div>

      {/* Screenshots Section */}
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

      {/* Footer */}
      <div className="text-center py-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          EaseWorks Staffing System Architecture • Confidential Document
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          This document is shared via secure link and contains proprietary information
        </p>
      </div>
    </div>
  );
}