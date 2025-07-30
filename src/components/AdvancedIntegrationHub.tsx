import React, { useState, useEffect } from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plug, 
  Activity, 
  Shield, 
  Key, 
  Webhook, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  RefreshCw,
  Globe,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Mail,
  MessageSquare,
  CreditCard,
  BarChart3,
  Calendar,
  MapPin,
  Cloud,
  Brain,
  Users,
  Share2,
  Camera,
  FileText,
  Briefcase,
  Package,
  Filter,
  ArrowLeftRight,
  Database,
  Play
} from 'lucide-react';
import { FieldMapper } from '@/components/integrations/FieldMapper';
import { JobLogs } from '@/components/integrations/JobLogs';
import { IntegrationTemplates } from '@/components/integrations/IntegrationTemplates';

interface Integration {
  id: string;
  name: string;
  provider_id: string;
  status: string;
  configuration: any;
  credentials: any;
  webhook_url: string;
  last_sync_at: string;
  error_count: number;
  provider: {
    display_name: string;
    category: string;
    icon_url: string;
  };
}

interface WebhookLog {
  id: string;
  integration_id: string;
  event_type: string;
  status: string;
  created_at: string;
  processed_at: string;
  error_message: string;
  attempt_number: number;
  payload: any;
  headers: any;
  webhook_url: string;
  max_attempts: number;
  scheduled_for: string;
  http_method: string;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  created_at: string;
  is_resolved: boolean;
  source_ip: unknown;
  user_agent: string;
  details: any;
  resolved_at: string;
  resolved_by: string;
  user_id: string;
}

interface IntegrationProvider {
  id: string;
  name: string;
  display_name: string;
  category: string;
  description: string;
  auth_type: string;
  config_schema: any;
  webhook_events: string[];
  icon_url: string;
  is_active: boolean;
}

const categoryIcons = {
  crm: TrendingUp,
  email: Mail,
  communication: MessageSquare,
  payment: CreditCard,
  analytics: BarChart3,
  automation: Zap,
  storage: Upload,
  ai_video_generation: Activity,
  calendar: Calendar,
  maps: MapPin,
  cloud_storage: Cloud,
  ai_ml: Brain,
  social_media: Share2,
  security: Shield,
  business_intelligence: BarChart3,
  design_media: Camera,
  project_management: Briefcase,
  inventory: Package,
  tax: FileText
};

export function AdvancedIntegrationHub() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newIntegration, setNewIntegration] = useState({
    name: '',
    configuration: {} as Record<string, any>,
    credentials: {} as Record<string, any>,
    webhook_url: '',
    webhook_secret: ''
  });

  useEffect(() => {
    loadData();
    
    // Set up real-time subscriptions
    const integrationsChannel = supabase
      .channel('integrations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'integrations' },
        () => loadIntegrations()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'webhook_logs' },
        () => loadWebhookLogs()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'security_events' },
        () => loadSecurityEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(integrationsChannel);
    };
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadProviders(),
      loadIntegrations(),
      loadWebhookLogs(),
      loadSecurityEvents()
    ]);
    setIsLoading(false);
  };

  const loadProviders = async () => {
    console.log('Loading providers...');
    const { data, error } = await supabase
      .from('integration_providers')
      .select('*')
      .eq('is_active', true)
      .order('display_name');

    if (error) {
      console.error('Error loading providers:', error);
      return;
    }

    console.log('Loaded providers:', data?.length, data);
    
    // Check if OpenAI is in the data
    const openaiProvider = data?.find(p => p.name === 'openai' || p.display_name.toLowerCase().includes('openai'));
    console.log('OpenAI provider found:', openaiProvider);
    
    setProviders(data || []);
  };

  const loadIntegrations = async () => {
    const { data, error } = await supabase
      .from('integrations')
      .select(`
        *,
        provider:integration_providers(display_name, category, icon_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading integrations:', error);
      return;
    }

    setIntegrations(data || []);
  };

  const loadWebhookLogs = async () => {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading webhook logs:', error);
      return;
    }

    setWebhookLogs(data || []);
  };

  const loadSecurityEvents = async () => {
    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading security events:', error);
      return;
    }

    setSecurityEvents(data || []);
  };

  const handleTestWebhook = async (integrationId: string) => {
    try {
      console.log('🧪 Testing integration:', integrationId);
      
      // Find the integration to determine its provider
      const integration = integrations.find(i => i.id === integrationId);
      const provider = providers.find(p => p.id === integration?.provider_id);
      
      console.log('🔧 Integration details:', { 
        integrationName: integration?.name,
        providerName: provider?.name,
        providerDisplayName: provider?.display_name 
      });

      // Handle Resend integration specifically
      if (provider?.name === 'resend') {
        console.log('📧 Testing Resend integration...');
        
        // Prompt for test email address
        const testEmail = prompt('Enter email address to send test email to:');
        if (!testEmail) {
          throw new Error('Test email address is required');
        }
        
        const { data, error } = await supabase.functions.invoke('test-resend-integration', {
          body: { 
            integration_id: integrationId,
            test_email: testEmail
          }
        });

        if (error) {
          console.error('❌ Resend test error:', error);
          throw error;
        }

        console.log('✅ Resend test result:', data);

        toast({
          title: "Resend Test Successful",
          description: `Test email sent successfully to ${data.sent_to}`,
        });
        return;
      }

      // Default webhook test for other providers
      console.log('🔗 Using default webhook test...');
      const testPayload = {
        integration_id: integrationId,
        provider: provider?.name || 'test',
        event_type: 'test_event',
        data: { test: true, timestamp: new Date().toISOString() },
        headers: { 'content-type': 'application/json' }
      };

      const { data, error } = await supabase.functions.invoke('process-webhook', {
        body: testPayload
      });

      if (error) throw error;

      toast({
        title: "Webhook Test Successful",
        description: "Test webhook was processed successfully",
      });
    } catch (error) {
      console.error('❌ Error testing integration:', error);
      toast({
        title: "Integration Test Failed",
        description: error.message || "Failed to test integration",
        variant: "destructive",
      });
    }
  };

  const handleToggleIntegration = async (integrationId: string, currentStatus: string) => {
    console.log('Toggling integration:', { integrationId, currentStatus });
    
    if (currentStatus === 'active') {
      // If currently active, deactivate by deleting the integration
      // This will make it available again in the marketplace
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integrationId);

      if (error) {
        console.error('Error removing integration:', error);
        toast({
          title: "Error",
          description: "Failed to remove integration",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Integration Removed",
        description: "Integration has been removed and is now available in the marketplace",
      });
    } else {
      // If currently inactive, activate it
      const { error } = await supabase
        .from('integrations')
        .update({ status: 'active' })
        .eq('id', integrationId);

      if (error) {
        console.error('Error activating integration:', error);
        toast({
          title: "Error",
          description: "Failed to activate integration",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Integration Activated",
        description: "Integration has been activated successfully",
      });
    }

    console.log('Integration status updated successfully, reloading...');
    // Reload integrations to refresh the UI
    await loadIntegrations();
  };

  const createIntegration = async () => {
    if (!selectedProvider) return;

    // Generate a default name if none provided
    const integrationName = newIntegration.name || `${selectedProvider.display_name} Integration`;

    try {
      const { data, error } = await supabase
        .from('integrations')
        .insert([{
          provider_id: selectedProvider.id,
          name: integrationName,
          configuration: newIntegration.configuration,
          credentials: newIntegration.credentials,
          webhook_url: newIntegration.webhook_url,
          webhook_secret: newIntegration.webhook_secret,
          status: 'active' // Set to active immediately
        }])
        .select()
        .single();

      if (error) throw error;

      await loadIntegrations();
      
      setIsConfigDialogOpen(false);
      setNewIntegration({
        name: '',
        configuration: {},
        credentials: {},
        webhook_url: '',
        webhook_secret: ''
      });

      // Show success message with instructions for edge functions
      if (selectedProvider.name === 'openai') {
        toast({
          title: "Success",
          description: `${selectedProvider.display_name} integration created! Note: For edge functions to work, you'll need to add the OPENAI_API_KEY to Supabase Edge Function Secrets.`,
        });
      } else {
        toast({
          title: "Success",
          description: `${selectedProvider.display_name} integration created successfully`,
        });
      }
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: "Error",
        description: "Failed to create integration",
        variant: "destructive",
      });
    }
  };

  const updateIntegration = async () => {
    if (!selectedIntegration) return;

    console.log('🔄 Updating integration:', {
      id: selectedIntegration.id,
      name: selectedIntegration.name,
      credentials: selectedIntegration.credentials,
      webhook_url: selectedIntegration.webhook_url,
      configuration: selectedIntegration.configuration,
    });

    try {
      const { error } = await supabase
        .from('integrations')
        .update({
          name: selectedIntegration.name,
          credentials: selectedIntegration.credentials,
          webhook_url: selectedIntegration.webhook_url,
          configuration: selectedIntegration.configuration,
        })
        .eq('id', selectedIntegration.id);

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      console.log('✅ Integration updated successfully');

      await loadIntegrations();
      setSelectedIntegration(null);

      toast({
        title: "Success",
        description: "Integration updated successfully",
      });
    } catch (error) {
      console.error('Error updating integration:', error);
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (integration: Integration) => {
    setSelectedIntegration(integration);
    const provider = providers.find(p => p.id === integration.provider_id);
    setSelectedProvider(provider || null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      crm: 'bg-blue-100 text-blue-800',
      email: 'bg-green-100 text-green-800',
      communication: 'bg-purple-100 text-purple-800',
      payment: 'bg-yellow-100 text-yellow-800',
      analytics: 'bg-orange-100 text-orange-800',
      automation: 'bg-pink-100 text-pink-800',
      storage: 'bg-gray-100 text-gray-800',
      ai_video_generation: 'bg-indigo-100 text-indigo-800',
      calendar: 'bg-cyan-100 text-cyan-800',
      maps: 'bg-emerald-100 text-emerald-800',
      cloud_storage: 'bg-sky-100 text-sky-800',
      ai_ml: 'bg-violet-100 text-violet-800',
      social_media: 'bg-rose-100 text-rose-800',
      security: 'bg-red-100 text-red-800',
      business_intelligence: 'bg-amber-100 text-amber-800',
      design_media: 'bg-fuchsia-100 text-fuchsia-800',
      project_management: 'bg-teal-100 text-teal-800',
      inventory: 'bg-lime-100 text-lime-800',
      tax: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUniqueCategories = () => {
    const categories = providers.map(p => p.category);
    return ['all', ...Array.from(new Set(categories))];
  };

  const filteredProviders = providers.filter(provider => {
    const matchesCategory = categoryFilter === 'all' || provider.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      provider.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter out providers that already have active integrations (they should be in Integrations tab)
    const hasActiveIntegration = integrations.some(integration => 
      integration.provider_id === provider.id && integration.status === 'active'
    );
    
    return matchesCategory && matchesSearch && !hasActiveIntegration;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <StandardPageLayout
      title="Integration Hub"
      subtitle="Manage integrations, monitor webhooks, and track security events"
      badge="System"
    >
      <div className="space-y-6 max-w-full overflow-x-hidden">
      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full h-auto">
          <TabsTrigger value="overview" className="text-xs lg:text-sm px-1 lg:px-3">Overview</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs lg:text-sm px-1 lg:px-3">Integrations</TabsTrigger>
          <TabsTrigger value="field-mapper" className="text-xs lg:text-sm px-1 lg:px-3">Mapper</TabsTrigger>
          <TabsTrigger value="job-logs" className="text-xs lg:text-sm px-1 lg:px-3">Logs</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs lg:text-sm px-1 lg:px-3">Templates</TabsTrigger>
          <TabsTrigger value="marketplace" className="text-xs lg:text-sm px-1 lg:px-3">Market</TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs lg:text-sm px-1 lg:px-3">Webhooks</TabsTrigger>
          <TabsTrigger value="security" className="text-xs lg:text-sm px-1 lg:px-3">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
                <Plug className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {integrations.filter(i => i.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {integrations.length} total integrations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Webhook Events</CardTitle>
                <Webhook className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{webhookLogs.length}</div>
                <p className="text-xs text-muted-foreground">
                  {webhookLogs.filter(w => w.status === 'success').length} successful
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {securityEvents.filter(e => !e.is_resolved).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {securityEvents.length} total events
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">98%</div>
                <p className="text-xs text-muted-foreground">
                  System operational
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="field-mapper" className="space-y-6">
          <FieldMapper integrationId={selectedIntegration?.id || ''} />
        </TabsContent>

        <TabsContent value="job-logs" className="space-y-6">
          <JobLogs integrationId={selectedIntegration?.id} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <IntegrationTemplates />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id} className="flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Plug className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">
                          {integration.provider?.display_name || integration.name}
                        </CardTitle>
                        <CardDescription className="text-xs truncate">
                          {integration.provider?.category?.replace('_', ' ')}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex flex-col flex-1 space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Status</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`text-xs ${getStatusColor(integration.status)}`}>
                        {integration.status}
                      </Badge>
                      <Switch
                        checked={integration.status === 'active'}
                        onCheckedChange={() => handleToggleIntegration(integration.id, integration.status)}
                        className="scale-75"
                      />
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Provider</Label>
                    <Badge variant="outline" className="text-xs">
                      {integration.provider?.category?.replace('_', ' ') || 'Unknown'}
                    </Badge>
                  </div>

                  {/* Webhook URL */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Webhook URL</Label>
                    <p className="text-xs text-muted-foreground break-words overflow-hidden">
                      {integration.webhook_url || 'Not configured'}
                    </p>
                  </div>

                  {/* Last Sync */}
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Last Sync</Label>
                    <span className="text-xs text-muted-foreground">
                      {integration.last_sync_at 
                        ? new Date(integration.last_sync_at).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>

                  {/* Error Count */}
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Error Count</Label>
                    <Badge 
                      variant={integration.error_count > 0 ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {integration.error_count || 0}
                    </Badge>
                  </div>

                  {/* HubSpot Webhook Settings */}
                  {integration.provider_id === providers.find(p => p.name === 'hubspot')?.id && (
                    <div className="p-2 bg-muted/50 rounded border">
                      <div className="text-xs">
                        <Label className="text-xs font-medium">Webhook Events:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {['contact', 'company', 'deal'].map(event => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestWebhook(integration.id)}
                      className="flex-1 text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openEditDialog(integration)}
                      className="flex-1 text-xs"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold">Integration Marketplace</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Showing {filteredProviders.length} of {providers.length} integrations
              </p>
              {/* Debug info */}
              <p className="text-xs text-muted-foreground mt-1">
                OpenAI present: {providers.find(p => p.name === 'openai' || p.display_name?.toLowerCase().includes('openai')) ? 'Yes' : 'No'}
                {providers.find(p => p.name === 'openai') && ` (Category: ${providers.find(p => p.name === 'openai')?.category})`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {getUniqueCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Integration Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProviders.map((provider) => {
              const IconComponent = categoryIcons[provider.category as keyof typeof categoryIcons] || Plug;
              const existingIntegration = integrations.find(integration => 
                integration.provider_id === provider.id
              );
              const isConnected = existingIntegration?.status === 'active';
              
              return (
                <Card key={provider.id} className="group relative overflow-hidden border border-border/50 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 bg-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold text-foreground truncate">
                            {provider.display_name}
                          </CardTitle>
                          <Badge variant="outline" className={`text-xs mt-1 ${getCategoryColor(provider.category)}`}>
                            {provider.category.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground mt-3 line-clamp-2 min-h-[2.5rem]">
                      {provider.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Auth and Webhook Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Key className="w-3 h-3" />
                          <span>{provider.auth_type.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        {provider.webhook_events && provider.webhook_events.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Webhook className="w-3 h-3" />
                            <span>{provider.webhook_events.length} webhook events</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connect Button */}
                    {isConnected ? (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Connected
                      </Button>
                    ) : existingIntegration ? (
                      <Button
                        onClick={() => handleToggleIntegration(existingIntegration.id, existingIntegration.status)}
                        className="w-full bg-primary hover:bg-primary/90"
                        size="sm"
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        Activate
                      </Button>
                    ) : (
                      <Dialog open={isConfigDialogOpen && selectedProvider?.id === provider.id} onOpenChange={setIsConfigDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => {
                              setSelectedProvider(provider);
                              setIsConfigDialogOpen(true);
                            }}
                            className="w-full bg-primary hover:bg-primary/90"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Connect
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Configure {provider.display_name} Integration</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="integration-name">Integration Name</Label>
                              <Input
                                id="integration-name"
                                value={newIntegration.name}
                                onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                                placeholder={`My ${provider.display_name} Integration`}
                              />
                            </div>
                            
                            {/* Provider-specific configuration fields */}
                            {selectedProvider?.name === 'hubspot' && (
                              <>
                                <div>
                                  <Label htmlFor="api-key">HubSpot API Key *</Label>
                                  <Input
                                    id="api-key"
                                    type="password"
                                    value={newIntegration.credentials?.api_key || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, api_key: e.target.value } 
                                    })}
                                    placeholder="Enter your HubSpot API key"
                                  />
                                </div>
                              </>
                            )}

                            {selectedProvider?.name === 'colossyan' && (
                              <>
                                <div>
                                  <Label htmlFor="api-key">Colossyan API Key *</Label>
                                  <Input
                                    id="api-key"
                                    type="password"
                                    value={newIntegration.credentials?.api_key || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, api_key: e.target.value } 
                                    })}
                                    placeholder="Enter your Colossyan Enterprise API key"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="workspace-id">Workspace ID *</Label>
                                  <Input
                                    id="workspace-id"
                                    value={newIntegration.credentials?.workspace_id || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, workspace_id: e.target.value } 
                                    })}
                                    placeholder="Enter your Colossyan workspace ID"
                                  />
                                </div>
                              </>
                            )}

                            {selectedProvider?.name === 'figma' && (
                              <>
                                <div>
                                  <Label htmlFor="personal-access-token">Figma Personal Access Token *</Label>
                                  <Input
                                    id="personal-access-token"
                                    type="password"
                                    value={newIntegration.credentials?.personal_access_token || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, personal_access_token: e.target.value } 
                                    })}
                                    placeholder="Enter your Figma Personal Access Token"
                                  />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <p>Get your Figma Personal Access Token:</p>
                                  <ul className="list-disc ml-4 mt-1">
                                    <li>Go to <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Figma Settings → Account → Personal Access Tokens</a></li>
                                    <li>Click "Create new token"</li>
                                    <li>Enter a description and generate the token</li>
                                    <li>Copy the generated token</li>
                                  </ul>
                                </div>
                              </>
                            )}

                            {selectedProvider?.name === 'resend' && (
                              <>
                                <div>
                                  <Label htmlFor="api-key">Resend API Key *</Label>
                                  <Input
                                    id="api-key"
                                    type="password"
                                    value={newIntegration.credentials?.api_key || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, api_key: e.target.value } 
                                    })}
                                    placeholder="Enter your Resend API key"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="from-email">From Email *</Label>
                                  <Input
                                    id="from-email"
                                    type="email"
                                    value={newIntegration.credentials?.from_email || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, from_email: e.target.value } 
                                    })}
                                    placeholder="your-email@yourdomain.com"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="from-name">From Name</Label>
                                  <Input
                                    id="from-name"
                                    value={newIntegration.credentials?.from_name || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, from_name: e.target.value } 
                                    })}
                                    placeholder="Your Company Name"
                                  />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <p>Get your Resend API key:</p>
                                  <ul className="list-disc ml-4 mt-1">
                                    <li>Go to <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Resend Dashboard → API Keys</a></li>
                                    <li>Click "Create API Key"</li>
                                    <li>Give it a name and select permissions</li>
                                    <li>Copy the generated API key</li>
                                  </ul>
                                </div>
                              </>
                            )}

                            {selectedProvider?.name === 'openai' && (
                              <>
                                <div>
                                  <Label htmlFor="api-key">OpenAI API Key *</Label>
                                  <Input
                                    id="api-key"
                                    type="password"
                                    value={newIntegration.credentials?.api_key || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, api_key: e.target.value } 
                                    })}
                                    placeholder="Enter your OpenAI API key"
                                  />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <p>Get your OpenAI API key:</p>
                                  <ul className="list-disc ml-4 mt-1">
                                    <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI API Keys page</a></li>
                                    <li>Click "Create new secret key"</li>
                                    <li>Copy the generated key</li>
                                  </ul>
                                </div>
                              </>
                            )}

                            {provider.name === 'mailchimp' && (
                              <>
                                <div>
                                  <Label htmlFor="api-key">Mailchimp API Key *</Label>
                                  <Input
                                    id="api-key"
                                    type="password"
                                    value={newIntegration.credentials?.api_key || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, api_key: e.target.value } 
                                    })}
                                    placeholder="Enter your Mailchimp API key"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="server-prefix">Server Prefix *</Label>
                                  <Input
                                    id="server-prefix"
                                    value={newIntegration.credentials?.server_prefix || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, server_prefix: e.target.value } 
                                    })}
                                    placeholder="e.g., us1, us2, eu1, etc."
                                  />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <p>Get your Mailchimp API credentials:</p>
                                  <ul className="list-disc ml-4 mt-1">
                                    <li>Go to <a href="https://admin.mailchimp.com/account/api/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mailchimp API Keys</a></li>
                                    <li>Click "Create A Key" under "Your API keys"</li>
                                    <li>Copy the generated API key</li>
                                    <li>The server prefix is at the end of your API key (after the dash)</li>
                                  </ul>
                                </div>
                              </>
                             )}

                            {provider.name === 'twilio' && (
                              <>
                                <div>
                                  <Label htmlFor="account-sid">Twilio Account SID *</Label>
                                  <Input
                                    id="account-sid"
                                    value={newIntegration.credentials?.account_sid || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, account_sid: e.target.value } 
                                    })}
                                    placeholder="Enter your Twilio Account SID"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="auth-token">Twilio Auth Token *</Label>
                                  <Input
                                    id="auth-token"
                                    type="password"
                                    value={newIntegration.credentials?.auth_token || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, auth_token: e.target.value } 
                                    })}
                                    placeholder="Enter your Twilio Auth Token"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="messaging-sid">Messaging Service SID</Label>
                                  <Input
                                    id="messaging-sid"
                                    value={newIntegration.credentials?.messaging_service_sid || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, messaging_service_sid: e.target.value } 
                                    })}
                                    placeholder="Enter your Twilio Messaging Service SID (optional)"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="phone-number">Phone Number</Label>
                                  <Input
                                    id="phone-number"
                                    value={newIntegration.credentials?.phone_number || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, phone_number: e.target.value } 
                                    })}
                                    placeholder="+1234567890 (optional if using Messaging Service)"
                                  />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <p>Get your Twilio credentials:</p>
                                  <ul className="list-disc ml-4 mt-1">
                                    <li>Go to <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Twilio Console</a></li>
                                    <li>Find your Account SID and Auth Token on the dashboard</li>
                                    <li>For Messaging Service SID, go to Messaging → Services</li>
                                    <li>For Phone Number, go to Phone Numbers → Manage → Active numbers</li>
                                  </ul>
                                </div>
                              </>
                            )}

                            {provider.name === 'microsoft' && (
                              <>
                                <div>
                                  <Label htmlFor="client-id">Microsoft Client ID *</Label>
                                  <Input
                                    id="client-id"
                                    value={newIntegration.credentials?.client_id || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, client_id: e.target.value } 
                                    })}
                                    placeholder="Enter your Microsoft Client ID"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="client-secret">Microsoft Client Secret *</Label>
                                  <Input
                                    id="client-secret"
                                    type="password"
                                    value={newIntegration.credentials?.client_secret || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, client_secret: e.target.value } 
                                    })}
                                    placeholder="Enter your Microsoft Client Secret"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="tenant-id">Microsoft Tenant ID *</Label>
                                  <Input
                                    id="tenant-id"
                                    value={newIntegration.credentials?.tenant_id || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, tenant_id: e.target.value } 
                                    })}
                                    placeholder="Enter your Microsoft Tenant ID"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="redirect-uri">Redirect URI *</Label>
                                  <Input
                                    id="redirect-uri"
                                    value={newIntegration.credentials?.redirect_uri || ''}
                                    onChange={(e) => setNewIntegration({ 
                                      ...newIntegration, 
                                      credentials: { ...newIntegration.credentials, redirect_uri: e.target.value } 
                                    })}
                                    placeholder="https://your-app.com/auth/microsoft/callback"
                                  />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <p>Configure Microsoft 365 Integration:</p>
                                  <ul className="list-disc ml-4 mt-1">
                                    <li>Go to <a href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Azure App Registrations</a></li>
                                    <li>Create a new app registration or select existing one</li>
                                    <li>Copy the Application (client) ID and Directory (tenant) ID</li>
                                    <li>Generate a new client secret in Certificates & secrets</li>
                                    <li>Configure redirect URI in Authentication settings</li>
                                  </ul>
                                </div>
                   </>
                 )}

                {/* Twilio configuration - ALWAYS SHOW FOR TESTING */}
                {selectedIntegration && (selectedIntegration?.provider?.display_name === 'Twilio' || 
                  selectedIntegration?.name?.includes('HALI') || true) && (
                  <>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Twilio Configuration</h4>
                      <p className="text-sm text-blue-700 mb-4">
                        Configure your Twilio credentials for SMS services and HALI integration.
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="twilio-account-sid-edit">Twilio Account SID *</Label>
                          <Input
                            id="twilio-account-sid-edit"
                            value={selectedIntegration.credentials?.account_sid || ''}
                            onChange={(e) => setSelectedIntegration({ 
                              ...selectedIntegration, 
                              credentials: { 
                                ...selectedIntegration.credentials, 
                                account_sid: e.target.value 
                              } 
                            })}
                            placeholder="Enter your Twilio Account SID"
                          />
                        </div>
                        <div>
                          <Label htmlFor="twilio-auth-token-edit">Twilio Auth Token *</Label>
                          <Input
                            id="twilio-auth-token-edit"
                            type="password"
                            value={selectedIntegration.credentials?.auth_token || ''}
                            onChange={(e) => setSelectedIntegration({ 
                              ...selectedIntegration, 
                              credentials: { 
                                ...selectedIntegration.credentials, 
                                auth_token: e.target.value 
                              } 
                            })}
                            placeholder="Enter your Twilio Auth Token"
                          />
                        </div>
                        <div>
                          <Label htmlFor="twilio-messaging-sid-edit">Messaging Service SID</Label>
                          <Input
                            id="twilio-messaging-sid-edit"
                            value={selectedIntegration.credentials?.messaging_service_sid || ''}
                            onChange={(e) => setSelectedIntegration({ 
                              ...selectedIntegration, 
                              credentials: { 
                                ...selectedIntegration.credentials, 
                                messaging_service_sid: e.target.value 
                              } 
                            })}
                            placeholder="Enter your Twilio Messaging Service SID (optional)"
                          />
                        </div>
                        <div>
                          <Label htmlFor="twilio-phone-number-edit">Phone Number</Label>
                          <Input
                            id="twilio-phone-number-edit"
                            value={selectedIntegration.credentials?.phone_number || ''}
                            onChange={(e) => setSelectedIntegration({ 
                              ...selectedIntegration, 
                              credentials: { 
                                ...selectedIntegration.credentials, 
                                phone_number: e.target.value 
                              } 
                            })}
                            placeholder="+1234567890 (optional if using Messaging Service)"
                          />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium mb-1">Get your Twilio credentials:</p>
                          <ul className="list-disc ml-4 space-y-1">
                            <li>Go to <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Twilio Console</a></li>
                            <li>Find your Account SID and Auth Token on the dashboard</li>
                            <li>For Messaging Service SID, go to Messaging → Services</li>
                            <li>For Phone Number, go to Phone Numbers → Manage → Active numbers</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Debug info for Twilio */}
                {selectedIntegration && (
                  <div className="text-xs text-muted-foreground p-2 bg-gray-50 rounded">
                    <p>Debug: Provider ID: {selectedIntegration.provider_id}</p>
                    <p>Debug: Provider Name: {providers.find(p => p.id === selectedIntegration.provider_id)?.name}</p>
                    <p>Debug: Is Twilio: {providers.find(p => p.name === 'twilio')?.id === selectedIntegration.provider_id ? 'YES' : 'NO'}</p>
                  </div>
                )}

              <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                                Cancel
                              </Button>
                               <Button 
                                 onClick={createIntegration}
                                  disabled={
                                    (provider.name === 'colossyan' && (!newIntegration.credentials?.api_key || !newIntegration.credentials?.workspace_id)) ||
                                    (provider.name === 'hubspot' && !newIntegration.credentials?.api_key) ||
                                    (provider.name === 'openai' && !newIntegration.credentials?.api_key) ||
                                    (provider.name === 'mailchimp' && (!newIntegration.credentials?.api_key || !newIntegration.credentials?.server_prefix)) ||
                                    (provider.name === 'twilio' && (!newIntegration.credentials?.account_sid || !newIntegration.credentials?.auth_token)) ||
                                    (provider.name === 'microsoft' && (!newIntegration.credentials?.client_id || !newIntegration.credentials?.client_secret || !newIntegration.credentials?.tenant_id || !newIntegration.credentials?.redirect_uri))
                                  }
                               >
                                Create Integration
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredProviders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No integrations found</h3>
              <p className="text-muted-foreground">
                {searchQuery || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Check back later for new integrations.'
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Webhook Activity Log</CardTitle>
              <CardDescription>Monitor all incoming webhook events and their processing status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {webhookLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Webhook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No webhook logs found</p>
                  </div>
                ) : (
                  webhookLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                            {log.status}
                          </Badge>
                          <span className="font-medium text-sm">{log.event_type}</span>
                          <span className="text-xs text-muted-foreground">
                            Attempt {log.attempt_number}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                           {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                      {log.error_message && (
                        <div className="text-xs sm:text-sm text-destructive bg-destructive/10 p-2 rounded mt-2">
                          {log.error_message}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Security Events</CardTitle>
              <CardDescription>Monitor security-related events and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {securityEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No security events found</p>
                  </div>
                ) : (
                  securityEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <span className="font-medium text-sm">{event.event_type}</span>
                          {event.is_resolved && (
                            <Badge variant="outline" className="text-xs">Resolved</Badge>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 break-words">
                        {JSON.stringify(event.details)}
                      </p>
                      {!event.is_resolved && (
                        <Button size="sm" variant="outline" className="mt-2">
                          <CheckCircle className="h-3 w-3 mr-2" />
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog for Existing Integrations */}
      <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.provider?.display_name} Integration</DialogTitle>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="integration-name-edit">Integration Name</Label>
                <Input
                  id="integration-name-edit"
                  value={selectedIntegration.name}
                  onChange={(e) => setSelectedIntegration({ 
                    ...selectedIntegration, 
                    name: e.target.value 
                  })}
                  placeholder="Integration name"
                />
              </div>
              
              {/* HubSpot configuration */}
              {selectedIntegration?.provider_id === providers.find(p => p.name === 'hubspot')?.id && (
                <>
                  <div>
                    <Label htmlFor="hubspot-api-key-edit">HubSpot API Key *</Label>
                    <Input
                      id="hubspot-api-key-edit"
                      type="password"
                      value={selectedIntegration.credentials?.api_key || ''}
                      onChange={(e) => setSelectedIntegration({ 
                        ...selectedIntegration, 
                        credentials: { 
                          ...selectedIntegration.credentials, 
                          api_key: e.target.value 
                        } 
                      })}
                      placeholder="Enter your HubSpot API key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hubspot-webhook-url-edit">Webhook URL (Optional)</Label>
                    <Input
                      id="hubspot-webhook-url-edit"
                      value={selectedIntegration.webhook_url || ''}
                      onChange={(e) => setSelectedIntegration({ 
                        ...selectedIntegration, 
                        webhook_url: e.target.value 
                      })}
                      placeholder="https://your-domain.com/webhooks/hubspot"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Get your HubSpot API key from your account settings → Integrations → Private Apps</p>
                  </div>
                </>
               )}

               {/* Twilio configuration */}
               {selectedIntegration?.provider_id === providers.find(p => p.name === 'twilio')?.id && (
                 <>
                   <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                     <h4 className="font-medium text-blue-900 mb-2">Twilio Configuration</h4>
                     <p className="text-sm text-blue-700 mb-4">
                       Configure your Twilio credentials for SMS services and HALI integration.
                     </p>
                     
                     <div className="space-y-4">
                       <div>
                         <Label htmlFor="twilio-account-sid-edit">Twilio Account SID *</Label>
                         <Input
                           id="twilio-account-sid-edit"
                           value={selectedIntegration.credentials?.account_sid || ''}
                           onChange={(e) => setSelectedIntegration({ 
                             ...selectedIntegration, 
                             credentials: { 
                               ...selectedIntegration.credentials, 
                               account_sid: e.target.value 
                             } 
                           })}
                           placeholder="Enter your Twilio Account SID"
                         />
                       </div>
                       <div>
                         <Label htmlFor="twilio-auth-token-edit">Twilio Auth Token *</Label>
                         <Input
                           id="twilio-auth-token-edit"
                           type="password"
                           value={selectedIntegration.credentials?.auth_token || ''}
                           onChange={(e) => setSelectedIntegration({ 
                             ...selectedIntegration, 
                             credentials: { 
                               ...selectedIntegration.credentials, 
                               auth_token: e.target.value 
                             } 
                           })}
                           placeholder="Enter your Twilio Auth Token"
                         />
                       </div>
                       <div>
                         <Label htmlFor="twilio-messaging-sid-edit">Messaging Service SID</Label>
                         <Input
                           id="twilio-messaging-sid-edit"
                           value={selectedIntegration.credentials?.messaging_service_sid || ''}
                           onChange={(e) => setSelectedIntegration({ 
                             ...selectedIntegration, 
                             credentials: { 
                               ...selectedIntegration.credentials, 
                               messaging_service_sid: e.target.value 
                             } 
                           })}
                           placeholder="Enter your Twilio Messaging Service SID (optional)"
                         />
                       </div>
                       <div>
                         <Label htmlFor="twilio-phone-number-edit">Phone Number</Label>
                         <Input
                           id="twilio-phone-number-edit"
                           value={selectedIntegration.credentials?.phone_number || ''}
                           onChange={(e) => setSelectedIntegration({ 
                             ...selectedIntegration, 
                             credentials: { 
                               ...selectedIntegration.credentials, 
                               phone_number: e.target.value 
                             } 
                           })}
                           placeholder="+1234567890 (optional if using Messaging Service)"
                         />
                       </div>
                       <div className="text-sm text-muted-foreground">
                         <p className="font-medium mb-1">Get your Twilio credentials:</p>
                         <ul className="list-disc ml-4 space-y-1">
                           <li>Go to <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Twilio Console</a></li>
                           <li>Find your Account SID and Auth Token on the dashboard</li>
                           <li>For Messaging Service SID, go to Messaging → Services</li>
                           <li>For Phone Number, go to Phone Numbers → Manage → Active numbers</li>
                         </ul>
                       </div>
                     </div>
                   </div>
                 </>
               )}

               {/* Figma configuration */}
               {selectedIntegration?.provider_id === providers.find(p => p.name === 'figma')?.id && (
                 <>
                   <div>
                     <Label htmlFor="figma-token-edit">Figma Personal Access Token *</Label>
                     <Input
                       id="figma-token-edit"
                       type="password"
                       value={selectedIntegration.credentials?.personal_access_token || ''}
                       onChange={(e) => setSelectedIntegration({ 
                         ...selectedIntegration, 
                         credentials: { 
                           ...selectedIntegration.credentials, 
                           personal_access_token: e.target.value 
                         } 
                       })}
                       placeholder="Enter your Figma Personal Access Token"
                     />
                   </div>
                   <div className="text-sm text-muted-foreground">
                     <p>Get your Figma Personal Access Token:</p>
                     <ul className="list-disc ml-4 mt-1">
                       <li>Go to <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Figma Settings → Account → Personal Access Tokens</a></li>
                       <li>Click "Create new token"</li>
                       <li>Enter a description and generate the token</li>
                       <li>Copy the generated token</li>
                     </ul>
                   </div>
                  </>
                )}

                {/* Resend configuration */}
                {selectedIntegration?.provider_id === providers.find(p => p.name === 'resend')?.id && (
                  <>
                    <div>
                      <Label htmlFor="resend-api-key-edit">Resend API Key *</Label>
                      <Input
                        id="resend-api-key-edit"
                        type="password"
                        value={selectedIntegration.credentials?.api_key || ''}
                        onChange={(e) => setSelectedIntegration({ 
                          ...selectedIntegration, 
                          credentials: { 
                            ...selectedIntegration.credentials, 
                            api_key: e.target.value 
                          } 
                        })}
                        placeholder="Enter your Resend API key"
                      />
                    </div>
                    <div>
                      <Label htmlFor="resend-from-email-edit">From Email *</Label>
                      <Input
                        id="resend-from-email-edit"
                        type="email"
                        value={selectedIntegration.credentials?.from_email || ''}
                        onChange={(e) => setSelectedIntegration({ 
                          ...selectedIntegration, 
                          credentials: { 
                            ...selectedIntegration.credentials, 
                            from_email: e.target.value 
                          } 
                        })}
                        placeholder="your-email@yourdomain.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="resend-from-name-edit">From Name</Label>
                      <Input
                        id="resend-from-name-edit"
                        value={selectedIntegration.credentials?.from_name || ''}
                        onChange={(e) => setSelectedIntegration({ 
                          ...selectedIntegration, 
                          credentials: { 
                            ...selectedIntegration.credentials, 
                            from_name: e.target.value 
                          } 
                        })}
                        placeholder="Your Company Name"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Get your Resend API key:</p>
                      <ul className="list-disc ml-4 mt-1">
                        <li>Go to <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Resend Dashboard → API Keys</a></li>
                        <li>Click "Create API Key"</li>
                        <li>Give it a name and select permissions</li>
                        <li>Copy the generated API key</li>
                      </ul>
                    </div>
                  </>
                )}

               {/* Mailchimp configuration */}
               {selectedIntegration?.provider_id === providers.find(p => p.name === 'mailchimp')?.id && (
                 <>
                   <div>
                     <Label htmlFor="mailchimp-api-key-edit">Mailchimp API Key *</Label>
                     <Input
                       id="mailchimp-api-key-edit"
                       type="password"
                       value={selectedIntegration.credentials?.api_key || ''}
                       onChange={(e) => setSelectedIntegration({ 
                         ...selectedIntegration, 
                         credentials: { 
                           ...selectedIntegration.credentials, 
                           api_key: e.target.value 
                         } 
                       })}
                       placeholder="Enter your Mailchimp API key"
                     />
                   </div>
                   <div>
                     <Label htmlFor="mailchimp-server-prefix-edit">Server Prefix *</Label>
                     <Input
                       id="mailchimp-server-prefix-edit"
                       value={selectedIntegration.credentials?.server_prefix || ''}
                       onChange={(e) => setSelectedIntegration({ 
                         ...selectedIntegration, 
                         credentials: { 
                           ...selectedIntegration.credentials, 
                           server_prefix: e.target.value 
                         } 
                       })}
                       placeholder="e.g., us1, us2, eu1, etc."
                     />
                   </div>
                   <div className="text-sm text-muted-foreground">
                     <p>Update your Mailchimp API credentials:</p>
                     <ul className="list-disc ml-4 mt-1">
                       <li>Get your API key from <a href="https://admin.mailchimp.com/account/api/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mailchimp API Keys</a></li>
                       <li>The server prefix is at the end of your API key (after the dash)</li>
                     </ul>
                   </div>
                 </>
               )}

              {/* Microsoft configuration */}
               {selectedIntegration?.provider_id === providers.find(p => p.name === 'microsoft')?.id && (
                 <>
                   <div>
                     <Label htmlFor="microsoft-client-id-edit">Microsoft Client ID *</Label>
                     <Input
                       id="microsoft-client-id-edit"
                       value={selectedIntegration.credentials?.client_id || ''}
                       onChange={(e) => setSelectedIntegration({ 
                         ...selectedIntegration, 
                         credentials: { 
                           ...selectedIntegration.credentials, 
                           client_id: e.target.value 
                         } 
                       })}
                       placeholder="Enter your Microsoft Client ID"
                     />
                   </div>
                   <div>
                     <Label htmlFor="microsoft-client-secret-edit">Microsoft Client Secret *</Label>
                     <Input
                       id="microsoft-client-secret-edit"
                       type="password"
                       value={selectedIntegration.credentials?.client_secret || ''}
                       onChange={(e) => setSelectedIntegration({ 
                         ...selectedIntegration, 
                         credentials: { 
                           ...selectedIntegration.credentials, 
                           client_secret: e.target.value 
                         } 
                       })}
                       placeholder="Enter your Microsoft Client Secret"
                     />
                   </div>
                   <div>
                     <Label htmlFor="microsoft-tenant-id-edit">Microsoft Tenant ID *</Label>
                     <Input
                       id="microsoft-tenant-id-edit"
                       value={selectedIntegration.credentials?.tenant_id || ''}
                       onChange={(e) => setSelectedIntegration({ 
                         ...selectedIntegration, 
                         credentials: { 
                           ...selectedIntegration.credentials, 
                           tenant_id: e.target.value 
                         } 
                       })}
                       placeholder="Enter your Microsoft Tenant ID"
                     />
                   </div>
                   <div>
                     <Label htmlFor="microsoft-redirect-uri-edit">Redirect URI *</Label>
                     <Input
                       id="microsoft-redirect-uri-edit"
                       value={selectedIntegration.credentials?.redirect_uri || ''}
                       onChange={(e) => setSelectedIntegration({ 
                         ...selectedIntegration, 
                         credentials: { 
                           ...selectedIntegration.credentials, 
                           redirect_uri: e.target.value 
                         } 
                       })}
                       placeholder="https://your-app.com/auth/microsoft/callback"
                     />
                   </div>
                   <div className="text-sm text-muted-foreground">
                     <p>Manage your Microsoft 365 integration settings:</p>
                     <ul className="list-disc ml-4 mt-1">
                       <li>Update these credentials in your <a href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Azure App Registration</a></li>
                       <li>Ensure redirect URI matches your application settings</li>
                       <li>Verify permissions are correctly configured for Graph API access</li>
                     </ul>
                   </div>
                 </>
               )}

               {/* Colossyan configuration */}
               {selectedIntegration?.provider_id === providers.find(p => p.name === 'colossyan')?.id && (
                 <>
                   <div>
                     <Label htmlFor="colossyan-api-key-edit">Colossyan API Key *</Label>
                     <Input
                       id="colossyan-api-key-edit"
                       type="password"
                       value={selectedIntegration.credentials?.api_key || ''}
                       onChange={(e) => setSelectedIntegration({ 
                         ...selectedIntegration, 
                         credentials: { 
                           ...selectedIntegration.credentials, 
                           api_key: e.target.value 
                         } 
                       })}
                       placeholder="Enter your Colossyan API key"
                     />
                   </div>
                   <div>
                     <Label htmlFor="colossyan-workspace-edit">Workspace ID *</Label>
                     <Input
                       id="colossyan-workspace-edit"
                       value={selectedIntegration.credentials?.workspace_id || ''}
                       onChange={(e) => setSelectedIntegration({ 
                         ...selectedIntegration, 
                         credentials: { 
                           ...selectedIntegration.credentials, 
                           workspace_id: e.target.value 
                         } 
                       })}
                       placeholder="Enter your workspace ID"
                     />
                   </div>
                 </>
               )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                  Cancel
                </Button>
                <Button onClick={updateIntegration}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </StandardPageLayout>
  );
}