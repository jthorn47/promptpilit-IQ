import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  MapPin, 
  FileText, 
  Database, 
  RefreshCw, 
  Upload, 
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { RegulationManager } from './RegulationManager';
import { LocationService } from './LocationService';
import { useDocumentBuilder } from '@/hooks/useDocumentBuilder';

export const ContentManagementAdmin = () => {
  const { jurisdictions, regulationRules, loadJurisdictions, loadRegulationRules } = useDocumentBuilder();
  const [activeSync, setActiveSync] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Record<string, Date>>({});

  const mockDataSources = [
    {
      id: 'epa-regulations',
      name: 'EPA Septic Regulations',
      type: 'Federal',
      status: 'connected',
      lastSync: new Date(),
      recordCount: 245,
      description: 'Federal EPA guidelines for onsite wastewater systems'
    },
    {
      id: 'osha-standards',
      name: 'OSHA Safety Standards',
      type: 'Federal',
      status: 'connected',
      lastSync: new Date(Date.now() - 86400000), // 1 day ago
      recordCount: 1230,
      description: 'OSHA workplace safety and health standards'
    },
    {
      id: 'ca-env-health',
      name: 'California Environmental Health',
      type: 'State',
      status: 'error',
      lastSync: new Date(Date.now() - 172800000), // 2 days ago
      recordCount: 0,
      description: 'State-specific septic and environmental regulations'
    },
    {
      id: 'labor-standards',
      name: 'Department of Labor Standards',
      type: 'Federal',
      status: 'pending',
      lastSync: null,
      recordCount: 0,
      description: 'Federal labor law and employment standards'
    }
  ];

  const handleSync = async (sourceId: string) => {
    setActiveSync(sourceId);
    // Mock sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastSync(prev => ({ ...prev, [sourceId]: new Date() }));
    setActiveSync(null);
  };

  const handleBulkImport = () => {
    console.log('Triggering bulk import...');
  };

  const handleExportData = () => {
    console.log('Exporting regulation data...');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management Admin</h1>
        <p className="text-muted-foreground">
          Manage jurisdictional content, data sources, and regulatory updates
        </p>
      </div>

      <Tabs defaultValue="regulations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="regulations" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Regulations
          </TabsTrigger>
          <TabsTrigger value="jurisdictions" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Jurisdictions
          </TabsTrigger>
          <TabsTrigger value="datasources" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Sources
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regulations">
          <RegulationManager 
            jurisdictions={jurisdictions}
            onRegulationUpdate={() => loadRegulationRules()}
          />
        </TabsContent>

        <TabsContent value="jurisdictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Jurisdiction Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Jurisdictions</span>
                    <Badge variant="secondary">{jurisdictions.length}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>States:</span>
                      <span>{jurisdictions.filter(j => j.type === 'state').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Counties:</span>
                      <span>{jurisdictions.filter(j => j.type === 'county').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cities:</span>
                      <span>{jurisdictions.filter(j => j.type === 'city').length}</span>
                    </div>
                  </div>
                  
                  <Button onClick={() => loadJurisdictions()} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Jurisdictions
                  </Button>
                </div>
              </CardContent>
            </Card>

            <LocationService 
              jurisdictions={jurisdictions}
              onLocationDetected={(detected) => {
                console.log('Location detected:', detected);
              }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Jurisdiction List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {jurisdictions.map((jurisdiction) => (
                  <div 
                    key={jurisdiction.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{jurisdiction.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {jurisdiction.type} • {jurisdiction.abbreviation}
                      </div>
                    </div>
                    <Badge variant={jurisdiction.type === 'state' ? 'default' : 'secondary'}>
                      {jurisdiction.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasources" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">External Data Sources</h2>
              <p className="text-muted-foreground">
                Monitor and manage regulatory data integrations
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBulkImport}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockDataSources.map((source) => (
              <Card key={source.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(source.status)}
                      {source.name}
                    </span>
                    <Badge variant="outline">{source.type}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {source.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span className={`capitalize ${
                        source.status === 'connected' ? 'text-green-600' :
                        source.status === 'error' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {source.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Records:</span>
                      <span>{source.recordCount.toLocaleString()}</span>
                    </div>
                    
                    {source.lastSync && (
                      <div className="flex justify-between text-sm">
                        <span>Last Sync:</span>
                        <span>{source.lastSync.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => handleSync(source.id)}
                    disabled={activeSync === source.id}
                    className="w-full"
                    variant={source.status === 'connected' ? 'outline' : 'default'}
                  >
                    {activeSync === source.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {source.status === 'connected' ? 'Refresh' : 'Connect'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Update Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Frequency</label>
                  <select className="w-full p-2 border rounded">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="manual">Manual Only</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notification Email</label>
                  <Input placeholder="admin@company.com" />
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Automatic updates will notify users when handbook content needs review.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Content Database</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>API Connections</span>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    2 of 4 Active
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Active Users</span>
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    12 Online
                  </Badge>
                </div>
                
                <Button className="w-full">
                  View Detailed Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};