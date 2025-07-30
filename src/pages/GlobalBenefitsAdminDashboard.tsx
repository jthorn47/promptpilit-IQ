// Global Benefits Administration Dashboard
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, FileText, Users, Settings, Shield, Database, GitBranch, Activity } from 'lucide-react';

export const GlobalBenefitsAdminDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Global Benefits Administration</h1>
          <p className="text-muted-foreground">Microservices | Stateless | Multi-Tenant | JWT Auth | OpenAPI-First</p>
        </div>
        <Button>
          <Activity className="h-4 w-4 mr-2" />
          View API Docs
        </Button>
      </div>

      {/* Service Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carrier Service</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Global carriers active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">Templates available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deduction Codes</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Global codes defined</p>
          </CardContent>
        </Card>
      </div>

      {/* Microservices Architecture */}
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="api">API Status</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Carrier Service', endpoint: '/carriers', status: 'healthy' },
              { name: 'Plan Type Service', endpoint: '/plan-types', status: 'healthy' },
              { name: 'Plan Template Service', endpoint: '/plans', status: 'healthy' },
              { name: 'Eligibility Rule Service', endpoint: '/eligibility-rules', status: 'healthy' },
              { name: 'Deduction Code Service', endpoint: '/deduction-codes', status: 'healthy' },
              { name: 'Document Service', endpoint: '/documents', status: 'healthy' },
              { name: 'Plan Assignment Service', endpoint: '/plan-assignments', status: 'healthy' },
              { name: 'Audit Log Service', endpoint: '/audit-logs', status: 'healthy' }
            ].map((service) => (
              <Card key={service.name}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{service.name}</span>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{service.endpoint}</p>
                  <p className="text-xs text-green-600">Status: {service.status}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Benefits Administration Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">1</div>
                <div>
                  <p className="font-medium">Create Global Carriers & Plan Templates</p>
                  <p className="text-sm text-muted-foreground">Define reusable benefit structures</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">2</div>
                <div>
                  <p className="font-medium">Assign Plans to Clients</p>
                  <p className="text-sm text-muted-foreground">Enforce locked fields and client-specific settings</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">3</div>
                <div>
                  <p className="font-medium">Monitor & Audit</p>
                  <p className="text-sm text-muted-foreground">Track all changes and maintain compliance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Plan template "Medical PPO Premium" created</span>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Carrier "Blue Cross Blue Shield" updated</span>
                  <span className="text-xs text-muted-foreground">5 min ago</span>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Plan assigned to client "Acme Corp"</span>
                  <span className="text-xs text-muted-foreground">10 min ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span>POST /carriers</span>
                  <span className="text-green-600">✓ 200ms</span>
                </div>
                <div className="flex justify-between">
                  <span>GET /plans</span>
                  <span className="text-green-600">✓ 150ms</span>
                </div>
                <div className="flex justify-between">
                  <span>POST /assign-plan</span>
                  <span className="text-green-600">✓ 300ms</span>
                </div>
                <div className="flex justify-between">
                  <span>GET /audit-logs</span>
                  <span className="text-green-600">✓ 100ms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};