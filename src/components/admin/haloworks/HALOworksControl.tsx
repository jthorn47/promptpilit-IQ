import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  AlertTriangle, 
  PlayCircle, 
  CreditCard, 
  FileText, 
  Users, 
  Bot,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  Database
} from 'lucide-react';
import { ClientDirectory } from './ClientDirectory';
import { HALOAlertFeed } from './HALOAlertFeed';
import { PayRunMonitor } from './PayRunMonitor';
import { FundingCenter } from './FundingCenter';
import { TaxFilingCenter } from './TaxFilingCenter';
import { UserPermissions } from './UserPermissions';
import { SarahControls } from './SarahControls';
import { AdminClientView } from './AdminClientView';

interface HALOworksControlProps {
  className?: string;
}

export const HALOworksControl = ({ className }: HALOworksControlProps) => {
  const [activeTab, setActiveTab] = useState('directory');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  console.log('🔍 HALOworksControl - selectedClient:', selectedClient);
  console.log('🔍 HALOworksControl - activeTab:', activeTab);

  // Mock stats for dashboard overview
  const stats = {
    totalClients: 247,
    activePayRuns: 18,
    pendingAlerts: 12,
    fundingIssues: 3
  };

  if (selectedClient) {
    return (
      <div className={`p-6 space-y-6 ${className}`}>
        <AdminClientView 
          clientId={selectedClient} 
          onBack={() => setSelectedClient(null)} 
        />
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">HALOworksControl</h1>
          <p className="text-muted-foreground">Internal Admin Console - Payroll Operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            System Operator
          </Badge>
          <Button size="sm" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Pay Runs</p>
                <p className="text-2xl font-bold">{stats.activePayRuns}</p>
              </div>
              <PlayCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Alerts</p>
                <p className="text-2xl font-bold">{stats.pendingAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Funding Issues</p>
                <p className="text-2xl font-bold">{stats.fundingIssues}</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Console */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Operations Console
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="directory" className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                Directory
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="payruns" className="flex items-center gap-1">
                <PlayCircle className="h-4 w-4" />
                Pay Runs
              </TabsTrigger>
              <TabsTrigger value="funding" className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                Funding
              </TabsTrigger>
              <TabsTrigger value="tax" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Tax Filing
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="sarah" className="flex items-center gap-1">
                <Bot className="h-4 w-4" />
                Sarah
              </TabsTrigger>
            </TabsList>

            <TabsContent value="directory" className="mt-6">
              <ClientDirectory onClientSelect={setSelectedClient} />
            </TabsContent>

            <TabsContent value="alerts" className="mt-6">
              <HALOAlertFeed />
            </TabsContent>

            <TabsContent value="payruns" className="mt-6">
              <PayRunMonitor />
            </TabsContent>

            <TabsContent value="funding" className="mt-6">
              <FundingCenter />
            </TabsContent>

            <TabsContent value="tax" className="mt-6">
              <TaxFilingCenter />
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <UserPermissions />
            </TabsContent>

            <TabsContent value="sarah" className="mt-6">
              <SarahControls />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};