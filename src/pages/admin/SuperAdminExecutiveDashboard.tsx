import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle,
  Activity,
  Download,
  Bell,
  Lock,
  Unlock,
  Eye,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data - replace with real Supabase queries later
const mockKPIData = {
  clientCount: 142,
  revenue: 2850000,
  complianceRate: 94,
  activeUsers: 3847,
  moduleUtilization: {
    pulse: 85,
    vault: 92,
    lms: 78,
    hroiq: 67,
    payroll: 89
  },
  clientRisk: [
    { name: 'Acme Corp', risk: 'high', engagement: 34, training: 45 },
    { name: 'Tech Solutions', risk: 'medium', engagement: 78, training: 82 },
    { name: 'Global Industries', risk: 'low', engagement: 94, training: 96 }
  ],
  trends: {
    retainerUsage: 78,
    caseLoad: 156,
    seatUtilization: 89
  }
};

const aiInsights = [
  {
    type: 'upsell',
    title: 'HRO IQ Expansion Opportunity',
    description: 'Acme Corp showing 40% increase in HR queries - prime for HRO IQ upgrade',
    priority: 'high'
  },
  {
    type: 'risk',
    title: 'Compliance Risk Alert',
    description: '3 clients have SB 553 training completion below 60%',
    priority: 'medium'
  }
];

export const SuperAdminExecutiveDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState(3);
  const [vaultLocked, setVaultLocked] = useState(false);

  const MissionPanel = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}>
              <Users className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
              <p className="text-2xl font-bold">{mockKPIData.clientCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}>
              <DollarSign className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">ARR</p>
              <p className="text-2xl font-bold">${(mockKPIData.revenue / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}>
              <ShieldCheck className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
              <p className="text-2xl font-bold">{mockKPIData.complianceRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}>
              <Activity className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users 24h</p>
              <p className="text-2xl font-bold">{mockKPIData.activeUsers.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ModuleUtilizationRadar = () => (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Module Utilization Radar
        </CardTitle>
        <CardDescription>Current module adoption across all clients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(mockKPIData.moduleUtilization).map(([module, percentage]) => (
            <div key={module} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium capitalize">{module.replace('hroiq', 'HRO IQ')}</span>
                <span>{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const ClientDNAScanner = () => (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Client DNA Scanner
        </CardTitle>
        <CardDescription>Engagement, risk assessment, and training completion</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockKPIData.clientRisk.map((client, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Badge variant={
                  client.risk === 'high' ? 'destructive' : 
                  client.risk === 'medium' ? 'secondary' : 'default'
                }>
                  {client.risk} risk
                </Badge>
                <span className="font-medium">{client.name}</span>
              </div>
              <div className="flex space-x-4 text-sm">
                <span>Engagement: {client.engagement}%</span>
                <span>Training: {client.training}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const AIStrategicInsights = () => (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI Strategic Insights
        </CardTitle>
        <CardDescription>AI-powered recommendations and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {aiInsights.map((insight, index) => (
            <div key={index} className="p-3 rounded-lg border-l-4" style={{
              borderLeftColor: insight.priority === 'high' ? 'hsl(var(--destructive))' : 'hsl(var(--warning))',
              backgroundColor: 'hsl(var(--muted) / 0.3)'
            }}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                </div>
                <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                  {insight.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const AdminControlsPanel = () => (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Admin Controls</CardTitle>
        <CardDescription>System-wide administrative actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="sm" onClick={() => setAlerts(0)}>
            <Bell className="h-4 w-4 mr-2" />
            Push Alerts ({alerts})
          </Button>
          <Button 
            variant={vaultLocked ? "destructive" : "default"} 
            size="sm"
            onClick={() => setVaultLocked(!vaultLocked)}
          >
            {vaultLocked ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
            Vault {vaultLocked ? 'Locked' : 'Unlocked'}
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Activity Logs
          </Button>
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            System Health
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const StickyFooter = () => (
    <div className="fixed bottom-0 left-0 right-0 border-t shadow-lg p-4" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Executive Command Center</span>
          <Badge variant="outline">Real-time</Badge>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6 pb-24">
      {/* Header with branded color */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: '#655DC6' }}>
        <h1 className="text-3xl font-bold text-white">Executive Command Center</h1>
        <p className="text-white/90">Super Admin Strategic Dashboard</p>
      </div>

      {/* Mission Panel KPIs */}
      <MissionPanel />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <ModuleUtilizationRadar />
        <ClientDNAScanner />
        <AIStrategicInsights />
        <AdminControlsPanel />
      </div>

      {/* Executive Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Executive Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Retainer Usage</p>
              <p className="text-2xl font-bold">{mockKPIData.trends.retainerUsage}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Case Load</p>
              <p className="text-2xl font-bold">{mockKPIData.trends.caseLoad}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Seat Utilization</p>
              <p className="text-2xl font-bold">{mockKPIData.trends.seatUtilization}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Footer */}
      <StickyFooter />
    </div>
  );
};

export default SuperAdminExecutiveDashboard;