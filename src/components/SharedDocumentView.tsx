import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
// Remove the import since the page doesn't exist anymore

interface TokenValidationResult {
  valid: boolean;
  document_type: string;
  document_id: string;
  error_message: string;
}

export default function SharedDocumentView() {
  const { token } = useParams();
  const [isValidating, setIsValidating] = useState(true);
  const [validationResult, setValidationResult] = useState<TokenValidationResult | null>(null);
  const [hasUsedToken, setHasUsedToken] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValidationResult({
          valid: false,
          document_type: '',
          document_id: '',
          error_message: 'No token provided'
        });
        setIsValidating(false);
        return;
      }

      try {
        // Get user's IP for tracking
        const userIP = await fetch('https://api.ipify.org?format=json')
          .then(response => response.json())
          .then(data => data.ip)
          .catch(() => null);

        const { data, error } = await supabase.rpc('use_share_token', {
          token_value: token,
          user_ip: userIP
        });

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const result = data[0] as TokenValidationResult;
          setValidationResult(result);
          if (result.valid) {
            setHasUsedToken(true);
          }
        } else {
          setValidationResult({
            valid: false,
            document_type: '',
            document_id: '',
            error_message: 'Invalid token'
          });
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setValidationResult({
          valid: false,
          document_type: '',
          document_id: '',
          error_message: 'Failed to validate token'
        });
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Validating access token...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!validationResult?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {validationResult?.error_message || 'This share link is invalid, expired, or has already been used.'}
            </p>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Possible reasons:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Link has expired (24-hour limit)</li>
                <li>• Link has already been used (one-time access)</li>
                <li>• Invalid or malformed token</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.close()} 
              variant="outline" 
              className="w-full"
            >
              Close Window
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the appropriate document based on document_type
  const renderDocument = () => {
    switch (validationResult.document_type) {
      case 'easeworks_architecture':
        return <SharedEaseWorksArchitecture />;
      default:
        return (
          <div className="container mx-auto p-6">
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
                <p className="text-muted-foreground">Document type not supported</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Access Notice Header */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Secure Document Access</p>
                <p className="text-sm text-muted-foreground">
                  This is a one-time access link that has been validated and logged.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-green-200 text-green-700">
              Authenticated Access
            </Badge>
          </div>
        </div>
      </div>

      {/* Document Content */}
      {renderDocument()}

      {/* Footer Notice */}
      <div className="bg-muted/50 border-t mt-8">
        <div className="container mx-auto p-4 text-center">
          <p className="text-sm text-muted-foreground">
            This document was shared securely through EaseWorks Platform. 
            Access is logged for security purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

// Shared version of the architecture document (without editing capabilities)
function SharedEaseWorksArchitecture() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-12">
        {/* Header - simplified for shared view */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            EaseWorks System Architecture
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete technical documentation for the EaseWorks Management Platform
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="secondary" className="text-sm">Version 1.0</Badge>
            <Badge variant="outline" className="text-sm">Production Ready</Badge>
            <Badge variant="outline" className="text-sm">Scalable</Badge>
          </div>
          
          {/* Hero Image */}
          <div className="w-full max-w-4xl mx-auto h-48 md:h-64 overflow-hidden rounded-xl shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=600&fit=crop&crop=center" 
              alt="Modern workspace with laptops and technology"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            EaseWorks is a comprehensive workforce management platform designed to streamline 
            operations from client acquisition to payroll processing. Built with modern web 
            technologies and cloud-first architecture, it provides a complete solution for 
            agencies, employment services, and workforce management companies.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <h3 className="font-semibold">Multi-User System</h3>
              <p className="text-sm text-muted-foreground">Admins, Recruiters, POPs, Clients, Employees</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <h3 className="font-semibold">Cloud Native</h3>
              <p className="text-sm text-muted-foreground">Scalable, Reliable, Secure Infrastructure</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
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
            <ExternalLink className="h-5 w-5" />
            System Architecture Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <img 
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop&crop=center" 
              alt="Code on computer screen showing system architecture"
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="bg-muted p-6 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────────────┐
│                          EaseWorks Platform                            │
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
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <img 
              src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=400&fit=crop&crop=center" 
              alt="Colorful code on computer monitor"
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Frontend</h4>
                <ul className="text-sm space-y-1">
                  <li>• React 18</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• Vite</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Backend</h4>
                <ul className="text-sm space-y-1">
                  <li>• Supabase</li>
                  <li>• PostgreSQL</li>
                  <li>• Edge Functions</li>
                  <li>• Real-time API</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Infrastructure</h4>
                <ul className="text-sm space-y-1">
                  <li>• Cloud Hosting</li>
                  <li>• CDN</li>
                  <li>• Auto Scaling</li>
                  <li>• SSL/TLS</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Security</h4>
                <ul className="text-sm space-y-1">
                  <li>• Row Level Security</li>
                  <li>• JWT Authentication</li>
                  <li>• API Security</li>
                  <li>• Data Encryption</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Core System Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <img 
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop&crop=center" 
              alt="Modern laptop setup for development"
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Client Management
                </h4>
                <ul className="text-sm space-y-2">
                  <li>• Client onboarding & approval workflow</li>
                  <li>• Contract management & digital signatures</li>
                  <li>• Billing rates & payment terms</li>
                  <li>• Communication history tracking</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Employee Management
                </h4>
                <ul className="text-sm space-y-2">
                  <li>• Employee profiles & documentation</li>
                  <li>• Skills tracking & certifications</li>
                  <li>• Background checks & compliance</li>
                  <li>• Performance evaluations</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Scheduling System
                </h4>
                <ul className="text-sm space-y-2">
                  <li>• Shift planning & optimization</li>
                  <li>• Real-time schedule updates</li>
                  <li>• Employee availability tracking</li>
                  <li>• Automated notifications</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Time Tracking
                </h4>
                <ul className="text-sm space-y-2">
                  <li>• Digital time clock integration</li>
                  <li>• GPS location tracking</li>
                  <li>• Overtime calculations</li>
                  <li>• Break & lunch time tracking</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Payroll Processing
                </h4>
                <ul className="text-sm space-y-2">
                  <li>• Automated payroll calculations</li>
                  <li>• Tax compliance & reporting</li>
                  <li>• Direct deposit processing</li>
                  <li>• Pay stub generation</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Analytics & Reporting
                </h4>
                <ul className="text-sm space-y-2">
                  <li>• Real-time business intelligence</li>
                  <li>• Custom report generation</li>
                  <li>• Performance metrics tracking</li>
                  <li>• Financial analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <img 
              src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=400&fit=crop&crop=center" 
              alt="Secure laptop environment"
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Data Security</h4>
                <ul className="text-sm space-y-2">
                  <li>• End-to-end encryption</li>
                  <li>• Secure data transmission</li>
                  <li>• Regular security audits</li>
                  <li>• GDPR compliance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Access Control</h4>
                <ul className="text-sm space-y-2">
                  <li>• Role-based permissions</li>
                  <li>• Multi-factor authentication</li>
                  <li>• Session management</li>
                  <li>• Audit logging</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Ecosystem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-semibold mb-2">Payroll Systems</h4>
              <p className="text-sm text-muted-foreground">ADP, Paychex, QuickBooks</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-semibold mb-2">Time Clocks</h4>
              <p className="text-sm text-muted-foreground">Biometric, RFID, Mobile Apps</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-semibold mb-2">HR Systems</h4>
              <p className="text-sm text-muted-foreground">Workday, BambooHR, SAP</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment & Scalability */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment & Scalability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Cloud Infrastructure</h4>
                <ul className="text-sm space-y-2">
                  <li>• Auto-scaling architecture</li>
                  <li>• Global CDN distribution</li>
                  <li>• 99.9% uptime guarantee</li>
                  <li>• Disaster recovery</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Performance</h4>
                <ul className="text-sm space-y-2">
                  <li>• Sub-second response times</li>
                  <li>• Real-time synchronization</li>
                  <li>• Mobile-optimized interface</li>
                  <li>• Offline capability</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Ready to streamline your operations with EaseWorks?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">Contact Sales</h4>
                <p className="text-sm text-muted-foreground">Schedule a personalized demo</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">Technical Support</h4>
                <p className="text-sm text-muted-foreground">Get implementation assistance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
