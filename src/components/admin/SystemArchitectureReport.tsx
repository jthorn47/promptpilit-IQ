import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Shield, 
  BarChart3, 
  Users, 
  Cog, 
  Cloud,
  Network,
  Lock,
  Zap,
  FileText,
  Award,
  Calendar,
  Download
} from 'lucide-react';
import { ReportingEngineDoc } from '../knowledge-base/ReportingEngineDoc';

export function SystemArchitectureReport() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Network className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">EaseBase System Architecture</h1>
            <p className="text-muted-foreground">Comprehensive Enterprise Platform Overview</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge>Enterprise Architecture</Badge>
          <Badge variant="secondary">Microservices</Badge>
          <Badge variant="outline">Cloud-Native</Badge>
          <Badge>HIPAA Compliant</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Core Modules</TabsTrigger>
          <TabsTrigger value="reporting">Reporting Engine</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* System Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>EaseBase Enterprise Platform Architecture</CardTitle>
              <CardDescription>
                Unified platform serving workforce management, learning, compliance, and analytics needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Platform Components</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <h5 className="font-medium">EaseWorks CRM</h5>
                        <p className="text-sm text-muted-foreground">Customer relationship management and business solutions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      <div>
                        <h5 className="font-medium">EaseLearn LMS</h5>
                        <p className="text-sm text-muted-foreground">Learning management and compliance training</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Shield className="h-5 w-5 text-purple-500" />
                      <div>
                        <h5 className="font-medium">Security & Compliance</h5>
                        <p className="text-sm text-muted-foreground">HIPAA, ISO 27001, and regulatory compliance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <FileText className="h-5 w-5 text-orange-500" />
                      <div>
                        <h5 className="font-medium">Analytics & Reporting</h5>
                        <p className="text-sm text-muted-foreground">Enterprise reporting and business intelligence</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Technical Stack</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg border">
                      <h5 className="font-medium text-blue-800">Frontend</h5>
                      <div className="text-sm text-blue-600 space-y-1 mt-2">
                        <div>• React 18 + TypeScript</div>
                        <div>• Vite build system</div>
                        <div>• Tailwind CSS + Shadcn UI</div>
                        <div>• React Router DOM</div>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border">
                      <h5 className="font-medium text-green-800">Backend</h5>
                      <div className="text-sm text-green-600 space-y-1 mt-2">
                        <div>• Supabase PostgreSQL</div>
                        <div>• Edge Functions</div>
                        <div>• Real-time subscriptions</div>
                        <div>• Row-level security</div>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border">
                      <h5 className="font-medium text-purple-800">Security</h5>
                      <div className="text-sm text-purple-600 space-y-1 mt-2">
                        <div>• JWT authentication</div>
                        <div>• Role-based access</div>
                        <div>• Data encryption</div>
                        <div>• Audit logging</div>
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border">
                      <h5 className="font-medium text-orange-800">Infrastructure</h5>
                      <div className="text-sm text-orange-600 space-y-1 mt-2">
                        <div>• Cloud-native deployment</div>
                        <div>• CDN delivery</div>
                        <div>• Auto-scaling</div>
                        <div>• Backup & recovery</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Core Modules */}
        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  EaseWorks CRM Module
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div><strong>Core Features:</strong></div>
                  <ul className="ml-4 space-y-1">
                    <li>• Employee onboarding & management</li>
                    <li>• Client relationship management</li>
                    <li>• Shift scheduling & tracking</li>
                    <li>• Payroll calculation (CA compliance)</li>
                    <li>• Performance monitoring</li>
                    <li>• Territory management</li>
                  </ul>
                </div>
                <div className="text-sm space-y-2">
                  <div><strong>Key Components:</strong></div>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• CRMDashboard</li>
                    <li>• EmployeeManager</li>
                    <li>• ClientApprovalSystem</li>
                    <li>• PayrollCalculator</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  EaseLearn LMS Module
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div><strong>Core Features:</strong></div>
                  <ul className="ml-4 space-y-1">
                    <li>• Training module creation</li>
                    <li>• Progress tracking</li>
                    <li>• Compliance monitoring</li>
                    <li>• Certificate management</li>
                    <li>• SCORM support</li>
                    <li>• Multi-company support</li>
                  </ul>
                </div>
                <div className="text-sm space-y-2">
                  <div><strong>Key Components:</strong></div>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• TrainingModuleBuilder</li>
                    <li>• LearnerDashboard</li>
                    <li>• ComplianceTracker</li>
                    <li>• CertificateGenerator</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div><strong>Compliance Standards:</strong></div>
                  <ul className="ml-4 space-y-1">
                    <li>• HIPAA (Healthcare)</li>
                    <li>• SB 553 (Workplace Violence)</li>
                    <li>• ISO 27001 (Information Security)</li>
                    <li>• SOX (Financial Controls)</li>
                    <li>• GDPR (Data Protection)</li>
                  </ul>
                </div>
                <div className="text-sm space-y-2">
                  <div><strong>Security Features:</strong></div>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• End-to-end encryption</li>
                    <li>• Multi-factor authentication</li>
                    <li>• Audit trail logging</li>
                    <li>• Data classification</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Analytics & Reporting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div><strong>Reporting Capabilities:</strong></div>
                  <ul className="ml-4 space-y-1">
                    <li>• Real-time analytics</li>
                    <li>• Multi-format exports</li>
                    <li>• Scheduled reports</li>
                    <li>• Compliance dashboards</li>
                    <li>• Performance metrics</li>
                    <li>• Custom visualizations</li>
                  </ul>
                </div>
                <div className="text-sm space-y-2">
                  <div><strong>Export Formats:</strong></div>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• CSV, Excel, PDF</li>
                    <li>• Branded reports</li>
                    <li>• Email delivery</li>
                    <li>• API endpoints</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reporting Engine Details */}
        <TabsContent value="reporting" className="space-y-6">
          <ReportingEngineDoc />
        </TabsContent>

        {/* Security Architecture */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Architecture
              </CardTitle>
              <CardDescription>
                Multi-layered security approach for enterprise data protection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Authentication Layer</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      JWT-based authentication
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Multi-factor authentication
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Session management
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Password policies
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Authorization Layer</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Role-based access control
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Row-level security (RLS)
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Resource permissions
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Company data isolation
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Data Protection</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Encryption at rest
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Encryption in transit
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Data classification
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Audit logging
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-4">Security Components</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">SecurityContext</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      Application-wide security monitoring and threat detection
                    </p>
                    <div className="text-xs space-y-1">
                      <div>• Real-time security monitoring</div>
                      <div>• Threat detection algorithms</div>
                      <div>• Security banner notifications</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">SecureFormWrapper</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enhanced form security with encryption and validation
                    </p>
                    <div className="text-xs space-y-1">
                      <div>• Client-side encryption</div>
                      <div>• Input sanitization</div>
                      <div>• Secure transmission</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Infrastructure */}
        <TabsContent value="infrastructure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Cloud Infrastructure
              </CardTitle>
              <CardDescription>
                Scalable, reliable cloud-native architecture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Database Architecture</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">PostgreSQL Primary</h5>
                      <p className="text-sm text-muted-foreground">
                        Main application database with real-time capabilities
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Edge Functions</h5>
                      <p className="text-sm text-muted-foreground">
                        Serverless compute for business logic
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Storage Buckets</h5>
                      <p className="text-sm text-muted-foreground">
                        File storage for training materials and documents
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Performance Features</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>Real-time data synchronization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>Auto-scaling compute resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>CDN for global content delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>Optimized database queries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>Lazy loading and code splitting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>Automated backup and recovery</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Architecture */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog className="h-5 w-5" />
                Integration Architecture
              </CardTitle>
              <CardDescription>
                API-first design for seamless third-party integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Current Integrations</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <Cog className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-medium">Vimeo Integration</h5>
                        <p className="text-sm text-muted-foreground">Video hosting and streaming</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <Cog className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h5 className="font-medium">Stripe Payment</h5>
                        <p className="text-sm text-muted-foreground">Payment processing</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                        <Cog className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h5 className="font-medium">Resend Email</h5>
                        <p className="text-sm text-muted-foreground">Email delivery service</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                        <Cog className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h5 className="font-medium">HubSpot CRM</h5>
                        <p className="text-sm text-muted-foreground">Customer relationship management</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">API Architecture</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-blue-800">REST API Endpoints</h5>
                      <p className="text-sm text-blue-600">
                        RESTful APIs for data operations and integrations
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-medium text-green-800">Real-time Subscriptions</h5>
                      <p className="text-sm text-green-600">
                        WebSocket connections for live data updates
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h5 className="font-medium text-purple-800">Webhook Support</h5>
                      <p className="text-sm text-purple-600">
                        Event-driven integrations with external systems
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <h5 className="font-medium text-orange-800">Rate Limiting</h5>
                      <p className="text-sm text-orange-600">
                        API throttling and usage monitoring
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}