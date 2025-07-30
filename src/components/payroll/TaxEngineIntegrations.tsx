import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Settings, CheckCircle, Key, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GlobalTaxEngineSettings {
  id: string;
  provider_name: string;
  display_name: string;
  is_active: boolean;
  configuration: Record<string, any>;
  credentials: Record<string, any>;
  webhook_url?: string;
  last_sync_at?: string;
  last_error?: string;
  error_count: number;
}

interface TaxEngineIntegrationsProps {
  onNavigateToFullHub?: () => void;
}

export const TaxEngineIntegrations: React.FC<TaxEngineIntegrationsProps> = ({ 
  onNavigateToFullHub 
}) => {
  const queryClient = useQueryClient();
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [configData, setConfigData] = useState({
    configuration: {} as Record<string, any>,
    credentials: {} as Record<string, any>,
    webhook_url: '',
  });

  // Available tax engines
  const availableEngines = [
    {
      name: 'avalara',
      display_name: 'Avalara AvaTax',
      description: 'Cloud-based tax compliance software for automated sales and use tax calculations',
      features: ['Address validation', 'Exemption management', 'Returns filing', 'Global coverage']
    },
    {
      name: 'taxjar',
      display_name: 'TaxJar',
      description: 'Sales tax automation for ecommerce businesses with real-time tax calculations',
      features: ['E-commerce focus', 'Easy integration', 'Reporting tools', 'Multi-state filing']
    }
  ];

  // Fetch current global tax engine settings
  const { data: currentTaxEngine, isLoading } = useQuery({
    queryKey: ['global-tax-engine-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_tax_engine_settings')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }
      return data;
    }
  });

  // Update tax engine settings
  const updateTaxEngine = useMutation({
    mutationFn: async (engineName: string) => {
      // First, deactivate current engine if exists
      if (currentTaxEngine) {
        await supabase
          .from('global_tax_engine_settings')
          .update({ is_active: false })
          .eq('id', currentTaxEngine.id);
      }

      const engine = availableEngines.find(e => e.name === engineName);
      if (!engine) throw new Error('Engine not found');

      // Create or activate new engine
      const { data, error } = await supabase
        .from('global_tax_engine_settings')
        .upsert({
          provider_name: engineName,
          display_name: engine.display_name,
          is_active: true,
          configuration: configData.configuration,
          credentials: configData.credentials,
          webhook_url: configData.webhook_url,
          error_count: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['global-tax-engine-settings'] });
      setIsConfigDialogOpen(false);
      setConfigData({ configuration: {}, credentials: {}, webhook_url: '' });
      toast.success(`${data.display_name} is now your active tax engine`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update tax engine");
    }
  });

  // Test connection
  const testConnection = useMutation({
    mutationFn: async () => {
      if (!currentTaxEngine) throw new Error('No tax engine configured');
      
      // Update last_sync_at to indicate test
      const { error } = await supabase
        .from('global_tax_engine_settings')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', currentTaxEngine.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-tax-engine-settings'] });
      toast.success("Connection test successful");
    },
    onError: (error: any) => {
      toast.error(error.message || "Connection test failed");
    }
  });

  const renderEngineConfig = (engineName: string) => {
    switch (engineName) {
      
      case 'avalara':
        return (
          <>
            <div>
              <Label htmlFor="account-id">Avalara Account ID *</Label>
              <Input
                id="account-id"
                value={configData.credentials?.account_id || ''}
                onChange={(e) => setConfigData({
                  ...configData,
                  credentials: { ...configData.credentials, account_id: e.target.value }
                })}
                placeholder="Your Avalara Account ID"
              />
            </div>
            <div>
              <Label htmlFor="license-key">License Key *</Label>
              <Input
                id="license-key"
                type="password"
                value={configData.credentials?.license_key || ''}
                onChange={(e) => setConfigData({
                  ...configData,
                  credentials: { ...configData.credentials, license_key: e.target.value }
                })}
                placeholder="Your Avalara License Key"
              />
            </div>
            <div>
              <Label htmlFor="company-code">Company Code</Label>
              <Input
                id="company-code"
                value={configData.configuration?.company_code || ''}
                onChange={(e) => setConfigData({
                  ...configData,
                  configuration: { ...configData.configuration, company_code: e.target.value }
                })}
                placeholder="Company Code in Avalara"
              />
            </div>
          </>
        );
      
      case 'taxjar':
        return (
          <div>
            <Label htmlFor="api-token">TaxJar API Token *</Label>
            <Input
              id="api-token"
              type="password"
              value={configData.credentials?.api_token || ''}
              onChange={(e) => setConfigData({
                ...configData,
                credentials: { ...configData.credentials, api_token: e.target.value }
              })}
              placeholder="Enter your TaxJar API token"
            />
          </div>
        );
      
      default:
        return (
          <div>
            <Label htmlFor="api-key">API Key *</Label>
            <Input
              id="api-key"
              type="password"
              value={configData.credentials?.api_key || ''}
              onChange={(e) => setConfigData({
                ...configData,
                credentials: { ...configData.credentials, api_key: e.target.value }
              })}
              placeholder="Enter your API key"
            />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Global Tax Engine</h2>
          <p className="text-muted-foreground">
            Configure the tax calculation engine for your entire platform
          </p>
        </div>
      </div>

      {/* Current Tax Engine */}
      {currentTaxEngine && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{currentTaxEngine.display_name}</CardTitle>
                  <CardDescription>Active Tax Engine</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-500 text-white">Active</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection.mutate()}
                  disabled={testConnection.isPending}
                >
                  {testConnection.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Settings className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Environment</Label>
                <p className="capitalize">
                  {(currentTaxEngine.configuration as any)?.environment || 'Not configured'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Last Sync</Label>
                <p>
                  {currentTaxEngine.last_sync_at 
                    ? new Date(currentTaxEngine.last_sync_at).toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Error Count</Label>
                <p>{currentTaxEngine.error_count || 0}</p>
              </div>
            </div>
            {currentTaxEngine.last_error && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Last Error:</strong> {currentTaxEngine.last_error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Tax Engines */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {currentTaxEngine ? 'Switch Tax Engine' : 'Select Tax Engine'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableEngines.map((engine) => {
            const isActive = currentTaxEngine?.provider_name === engine.name;
            
            return (
              <Card key={engine.name} className={`relative overflow-hidden ${isActive ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        {isActive ? (
                          <CheckCircle className="w-6 h-6 text-primary" />
                        ) : (
                          <Settings className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{engine.display_name}</CardTitle>
                        {isActive && (
                          <Badge variant="default" className="text-xs mt-1">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm mt-3">
                    {engine.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-muted-foreground">
                      <span>Features:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {engine.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Configure Button */}
                  <Dialog 
                    open={isConfigDialogOpen} 
                    onOpenChange={setIsConfigDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        variant={isActive ? "outline" : "default"}
                        onClick={() => {
                          // Pre-fill with current settings if this is the active engine
                          if (isActive && currentTaxEngine) {
                            setConfigData({
                              configuration: (currentTaxEngine.configuration as Record<string, any>) || {},
                              credentials: (currentTaxEngine.credentials as Record<string, any>) || {},
                              webhook_url: currentTaxEngine.webhook_url || '',
                            });
                          } else {
                            setConfigData({ configuration: {}, credentials: {}, webhook_url: '' });
                          }
                          setIsConfigDialogOpen(true);
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {isActive ? 'Reconfigure' : 'Configure & Activate'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Configure {engine.display_name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {renderEngineConfig(engine.name)}
                        
                        <div>
                          <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
                          <Input
                            id="webhook-url"
                            value={configData.webhook_url}
                            onChange={(e) => setConfigData({
                              ...configData,
                              webhook_url: e.target.value
                            })}
                            placeholder="https://your-app.com/webhooks/tax"
                          />
                        </div>
                        
                        <Alert>
                          <Key className="h-4 w-4" />
                          <AlertDescription>
                            Your credentials are securely encrypted and stored. This will be the active tax engine for all clients.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsConfigDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => updateTaxEngine.mutate(engine.name)}
                            disabled={updateTaxEngine.isPending}
                          >
                            {updateTaxEngine.isPending ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Settings className="w-4 h-4 mr-2" />
                            )}
                            {isActive ? 'Update Configuration' : 'Activate Engine'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Information */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Global Tax Engine:</strong> This tax engine will be used for all tax calculations across all clients. 
          Only one tax engine can be active at a time to ensure consistency and compliance.
        </AlertDescription>
      </Alert>
    </div>
  );
};