import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  FileText, 
  Shield, 
  Award, 
  Calendar, 
  Download,
  Database,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export function ReportingEngineDoc() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">EaseLearn Reporting Engine</h1>
            <p className="text-muted-foreground">Comprehensive LMS Analytics & Compliance System</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge>Enterprise-Grade</Badge>
          <Badge variant="secondary">Real-Time Analytics</Badge>
          <Badge variant="outline">HIPAA Compliant</Badge>
        </div>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>
            The EaseLearn Reporting Engine provides comprehensive training analytics, compliance tracking, 
            and automated reporting capabilities for enterprise learning management.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Core Capabilities</h4>
              <ul className="space-y-1 text-sm">
                <li>• Real-time training analytics</li>
                <li>• Compliance status monitoring</li>
                <li>• Certificate lifecycle management</li>
                <li>• Automated report scheduling</li>
                <li>• Multi-format export system</li>
                <li>• Department-level insights</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Compliance Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• SB 553 workplace violence prevention</li>
                <li>• HIPAA security audit trails</li>
                <li>• ISO 27001 data classification</li>
                <li>• Automated violation detection</li>
                <li>• Risk assessment scoring</li>
                <li>• Renewal tracking systems</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architecture Components */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Technical Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Core Components</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium">ReportExporter</h5>
                    <p className="text-sm text-muted-foreground">
                      Multi-format export system (CSV, Excel, PDF) with EaseLearn branding
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium">ComplianceTracker</h5>
                    <p className="text-sm text-muted-foreground">
                      Real-time compliance monitoring with risk assessment
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Award className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium">CertificateManager</h5>
                    <p className="text-sm text-muted-foreground">
                      Certificate lifecycle tracking and download management
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium">ScheduledReports</h5>
                    <p className="text-sm text-muted-foreground">
                      Automated report generation and email delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Data Flow Architecture</h4>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-800">Data Collection Layer</h5>
                  <p className="text-sm text-blue-600">
                    Supabase PostgreSQL with real-time subscriptions
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-800">Processing Layer</h5>
                  <p className="text-sm text-green-600">
                    React hooks with custom analytics calculations
                  </p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h5 className="font-medium text-purple-800">Export Layer</h5>
                  <p className="text-sm text-purple-600">
                    Client-side generation with XLSX, jsPDF libraries
                  </p>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h5 className="font-medium text-orange-800">Delivery Layer</h5>
                  <p className="text-sm text-orange-600">
                    Automated scheduling with email notifications
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <Card>
        <CardHeader>
          <CardTitle>Available Report Types</CardTitle>
          <CardDescription>
            Comprehensive reporting capabilities for different organizational needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Training Completion Report",
                description: "Detailed completion status by employee and module",
                features: ["Progress tracking", "Score analysis", "Time metrics", "Department breakdowns"]
              },
              {
                title: "Compliance Status Report", 
                description: "Real-time compliance monitoring and risk assessment",
                features: ["Risk scoring", "Overdue tracking", "Violation detection", "Renewal alerts"]
              },
              {
                title: "Certificate Tracking Report",
                description: "Certificate lifecycle management and expiry monitoring",
                features: ["Download management", "Expiry tracking", "Renewal scheduling", "Verification tokens"]
              },
              {
                title: "Employee Progress Report",
                description: "Individual learner progress and performance metrics",
                features: ["Learning paths", "Skill assessments", "Achievement tracking", "Personalized insights"]
              },
              {
                title: "Department Performance Report",
                description: "Organizational-level training analytics and comparisons",
                features: ["Cross-department analysis", "Benchmark comparisons", "Resource allocation", "ROI metrics"]
              },
              {
                title: "Supervisor Compliance Report",
                description: "Management-focused compliance and oversight metrics",
                features: ["Team compliance rates", "Management training", "Leadership development", "Oversight requirements"]
              }
            ].map((report, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <h4 className="font-semibold">{report.title}</h4>
                <p className="text-sm text-muted-foreground">{report.description}</p>
                <ul className="space-y-1">
                  {report.features.map((feature, idx) => (
                    <li key={idx} className="text-xs flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Points */}
      <Card>
        <CardHeader>
          <CardTitle>System Integration</CardTitle>
          <CardDescription>
            How the reporting engine integrates with the broader EaseBase ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">EaseBase Module Integration</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>Employee Management System</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Security & Compliance Module</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span>Certification Management</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  <span>Analytics Dashboard</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">External Integrations</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span>Supabase Real-time Database</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span>Email Notification System</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4 text-purple-500" />
                  <span>Document Generation Services</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>Compliance Monitoring APIs</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Dependencies</h4>
              <div className="space-y-1 text-sm font-mono">
                <div>• xlsx ^0.18.5</div>
                <div>• jspdf ^3.0.1</div>
                <div>• jspdf-autotable</div>
                <div>• @supabase/supabase-js</div>
                <div>• react-hook-form</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Performance</h4>
              <div className="space-y-1 text-sm">
                <div>• Real-time data updates</div>
                <div>• Client-side export generation</div>
                <div>• Pagination for large datasets</div>
                <div>• Optimized database queries</div>
                <div>• Lazy loading components</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Security Features</h4>
              <div className="space-y-1 text-sm">
                <div>• Row-level security (RLS)</div>
                <div>• Role-based access control</div>
                <div>• Audit trail logging</div>
                <div>• Data encryption at rest</div>
                <div>• HIPAA compliance ready</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Best Practices</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Use scheduled reports for regular stakeholder updates</li>
              <li>• Export large datasets during off-peak hours</li>
              <li>• Configure compliance thresholds based on regulatory requirements</li>
              <li>• Regularly review and update certificate expiry settings</li>
              <li>• Implement proper role-based access for sensitive reports</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Performance Considerations</h4>
            <ul className="space-y-1 text-sm text-yellow-700">
              <li>• Large exports ({'>'}10,000 records) may impact browser performance</li>
              <li>• Use filters and date ranges to optimize query performance</li>
              <li>• Schedule automated reports during low-usage periods</li>
              <li>• Monitor database query performance for complex reports</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Separator />
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>EaseLearn Reporting Engine v1.0 - Part of EaseBase Enterprise Platform</p>
      </div>
    </div>
  );
}