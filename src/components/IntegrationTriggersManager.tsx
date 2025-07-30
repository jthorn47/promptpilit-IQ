import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Webhook, 
  Slack, 
  Mail, 
  Zap, 
  MessageSquare, 
  Settings, 
  Play, 
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SystemTriggersManager } from './SystemTriggersManager';
import { PropGENWorkflowTester } from './PropGENWorkflowTester';

interface IntegrationWebhook {
  id: string;
  name: string;
  webhook_url: string;
  integration_type: 'slack' | 'teams' | 'zapier' | 'webhook' | 'email';
  trigger_events: string[];
  is_active: boolean;
  last_triggered_at?: string;
  success_count: number;
  failure_count: number;
  created_at: string;
}

interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  response_status?: number;
  error_message?: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  created_at: string;
}

export const IntegrationTriggersManager = () => {
  const [webhooks, setWebhooks] = useState<IntegrationWebhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState<Partial<IntegrationWebhook>>({
    name: '',
    webhook_url: '',
    integration_type: 'webhook',
    trigger_events: [],
    is_active: true
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchWebhooks();
    fetchLogs();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks((data || []) as IntegrationWebhook[]);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      toast({
        title: "Error",
        description: "Failed to load integration webhooks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs([]);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    }
  };

  const createWebhook = async () => {
    try {
      if (!newWebhook.name || !newWebhook.webhook_url) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('integration_webhooks')
        .insert([{
          name: newWebhook.name!,
          webhook_url: newWebhook.webhook_url!,
          integration_type: newWebhook.integration_type!,
          trigger_events: newWebhook.trigger_events || [],
          is_active: newWebhook.is_active || true,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setWebhooks([data as IntegrationWebhook, ...webhooks]);
      setShowCreateForm(false);
      setNewWebhook({
        name: '',
        webhook_url: '',
        integration_type: 'webhook',
        trigger_events: [],
        is_active: true
      });

      toast({
        title: "Success",
        description: "Integration webhook created successfully",
      });
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast({
        title: "Error",
        description: "Failed to create integration webhook",
        variant: "destructive",
      });
    }
  };

  const toggleWebhook = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('integration_webhooks')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setWebhooks(webhooks.map(webhook => 
        webhook.id === id ? { ...webhook, is_active: isActive } : webhook
      ));

      toast({
        title: "Success",
        description: `Integration ${isActive ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling webhook:', error);
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive",
      });
    }
  };

  const testWebhook = async (webhook: IntegrationWebhook) => {
    try {
      const testPayload = {
        event_type: 'test',
        timestamp: new Date().toISOString(),
        message: 'This is a test from EaseLearn integration system'
      };

      const response = await fetch(webhook.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(testPayload),
      });

      toast({
        title: "Test Sent",
        description: "Test webhook sent. Check your integration to confirm receipt.",
      });
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast({
        title: "Error",
        description: "Failed to send test webhook",
        variant: "destructive",
      });
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'slack': return <Slack className="w-4 h-4" />;
      case 'teams': return <MessageSquare className="w-4 h-4" />;
      case 'zapier': return <Zap className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      default: return <Webhook className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing': return <Play className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const integrationTypes = [
    { value: 'slack', label: 'Slack', description: 'Send messages to Slack channels' },
    { value: 'teams', label: 'Microsoft Teams', description: 'Send messages to Teams channels' },
    { value: 'zapier', label: 'Zapier', description: 'Trigger Zapier workflows' },
    { value: 'webhook', label: 'Custom Webhook', description: 'Send to any webhook URL' },
    { value: 'email', label: 'Email', description: 'Send email notifications' }
  ];

  const availableEvents = [
    'training_assigned',
    'training_completed',
    'training_overdue',
    'employee_added',
    'certificate_issued',
    'achievement_earned',
    'bulk_operation_completed',
    // PropGEN Workflow Events
    'risk_assessment_completed',
    'risk_score_updated',
    'spin_content_generated',
    'investment_analysis_saved',
    'proposal_generated',
    'proposal_approval_requested',
    'proposal_approved',
    'proposal_sent'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading integration triggers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Triggers</h1>
          <p className="text-muted-foreground">Connect external systems and automate workflows</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Webhook className="w-4 h-4 mr-2" />
          Create Integration
        </Button>
      </div>

      {/* System-Wide PropGEN Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System-Wide PropGEN Triggers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium">HR Risk Assessment → Enable PropGEN</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically enables PropGEN module when risk assessment is completed
                </p>
                <Badge variant="default" className="mt-2">System-Wide</Badge>
              </div>
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium">Proposal Generated → Update Stage</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Updates company stage to 'Proposal Sent' when proposal is generated
                </p>
                <Badge variant="default" className="mt-2">System-Wide</Badge>
              </div>
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium">Client Stage → Activate Onboarding</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Activates onboarding module when company becomes a client
                </p>
                <Badge variant="default" className="mt-2">System-Wide</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Note: These triggers apply automatically to all companies in the system. They control system logic, module visibility, and stage changes globally.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="system-triggers">System Triggers</TabsTrigger>
          <TabsTrigger value="test">Test Triggers</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {/* Create Integration Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create Integration Trigger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Integration Name</Label>
                    <Input
                      id="name"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
                      placeholder="e.g., Slack Notifications"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Integration Type</Label>
                    <Select 
                      value={newWebhook.integration_type} 
                      onValueChange={(value: any) => setNewWebhook({...newWebhook, integration_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {integrationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {getIntegrationIcon(type.value)}
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    value={newWebhook.webhook_url}
                    onChange={(e) => setNewWebhook({...newWebhook, webhook_url: e.target.value})}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>

                <div>
                  <Label>Trigger Events</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableEvents.map(event => (
                      <div key={event} className="flex items-center space-x-2">
                        <Switch
                          id={event}
                          checked={newWebhook.trigger_events?.includes(event)}
                          onCheckedChange={(checked) => {
                            const events = newWebhook.trigger_events || [];
                            if (checked) {
                              setNewWebhook({...newWebhook, trigger_events: [...events, event]});
                            } else {
                              setNewWebhook({...newWebhook, trigger_events: events.filter(e => e !== event)});
                            }
                          }}
                        />
                        <Label htmlFor={event} className="text-sm">
                          {event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={createWebhook}>Create Integration</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integrations List */}
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        {getIntegrationIcon(webhook.integration_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{webhook.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {integrationTypes.find(t => t.value === webhook.integration_type)?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={webhook.is_active}
                        onCheckedChange={(checked) => toggleWebhook(webhook.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testWebhook(webhook)}
                      >
                        Test
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium">Trigger Events</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {webhook.trigger_events.map(event => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Success Rate</p>
                      <p className="text-lg font-bold text-green-600">{webhook.success_count}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Failures</p>
                      <p className="text-lg font-bold text-red-600">{webhook.failure_count}</p>
                    </div>
                  </div>

                  {webhook.last_triggered_at && (
                    <p className="text-xs text-muted-foreground mt-4">
                      Last triggered: {new Date(webhook.last_triggered_at).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            {webhooks.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Webhook className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No integrations configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect external systems to automate your workflows
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    Create Your First Integration
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="system-triggers" className="space-y-4">
          <SystemTriggersManager />
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <PropGENWorkflowTester />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.map((log) => {
                  const webhook = webhooks.find(w => w.id === log.webhook_id);
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <p className="font-medium text-sm">
                            {webhook?.name || 'Unknown Integration'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.event_type} • {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                        {log.response_status && (
                          <p className="text-xs text-muted-foreground mt-1">
                            HTTP {log.response_status}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {logs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No activity logs yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};