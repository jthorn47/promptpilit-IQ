import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, MessageSquare, Bell, Link, FileUp, Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HALIConfiguration {
  id: string;
  auto_responses: Record<string, string>;
  escalation_enabled: boolean;
  escalation_routing: {
    slack_webhook?: string;
    email_recipients?: string[];
    webhook_url?: string;
  };
  allowed_keywords: string[];
  vault_file_settings: {
    expiry_hours: number;
    size_limit_mb: number;
    allowed_types: string[];
  };
  twilio_config?: {
    account_sid?: string;
    auth_token?: string;
    phone_number?: string;
  };
}

export const HALIConfigurationPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['hali_configuration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hali_configurations')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no config exists, return default values
      if (!data) {
        return {
          id: null,
          auto_responses: {
            welcome: 'Hi! I\'m HALI, your HR assistant. Reply START to begin or HELP for options.',
            help: 'Available commands: START (begin conversation), HELP (this message), STOP (opt out)',
            stop: 'You\'ve been unsubscribed from HALI SMS notifications.'
          },
          escalation_enabled: true,
          escalation_routing: {
            slack_webhook: '',
            email_recipients: ['hr@company.com'],
            webhook_url: ''
          },
          allowed_keywords: ['START', 'HELP', 'STOP', 'HR', 'PAYROLL'],
          vault_file_settings: {
            expiry_hours: 24,
            size_limit_mb: 10,
            allowed_types: ['pdf', 'doc', 'docx', 'jpg', 'png']
          }
        } as HALIConfiguration;
      }

      return {
        id: data.id,
        auto_responses: (data.auto_responses as Record<string, string>) || {},
        escalation_enabled: data.escalation_enabled,
        escalation_routing: (data.escalation_routing as any) || {},
        allowed_keywords: data.allowed_keywords,
        vault_file_settings: (data.vault_file_settings as any) || { expiry_hours: 24, size_limit_mb: 10, allowed_types: [] }
      } as HALIConfiguration;
    }
  });

  const updateConfig = useMutation({
    mutationFn: async (updates: Partial<HALIConfiguration>) => {
      if (config?.id) {
        // Update existing configuration
        const { data, error } = await supabase
          .from('hali_configurations')
          .update(updates)
          .eq('id', config.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new configuration
        const { data, error } = await supabase
          .from('hali_configurations')
          .insert(updates)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hali_configuration'] });
      toast({
        title: "Configuration Updated",
        description: "HALI settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update configuration. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to update HALI configuration:', error);
    }
  });

  const [autoResponses, setAutoResponses] = useState<Record<string, string>>({});
  const [escalationEnabled, setEscalationEnabled] = useState(false);
  const [escalationRouting, setEscalationRouting] = useState<{
    slack_webhook?: string;
    email_recipients?: string[];
    webhook_url?: string;
  }>({});
  const [keywords, setKeywords] = useState('');
  const [vaultSettings, setVaultSettings] = useState({ expiry_hours: 24, size_limit_mb: 10, allowed_types: [] as string[] });

  // Update state when config data loads
  useEffect(() => {
    if (config) {
      setAutoResponses(config.auto_responses || {});
      setEscalationEnabled(config.escalation_enabled || false);
      setEscalationRouting(config.escalation_routing || {});
      setKeywords(config.allowed_keywords?.join(', ') || '');
      setVaultSettings(config.vault_file_settings || { expiry_hours: 24, size_limit_mb: 10, allowed_types: [] });
    }
  }, [config]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="responses" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="responses">Auto-Responses</TabsTrigger>
          <TabsTrigger value="escalation">Escalation</TabsTrigger>
          <TabsTrigger value="vault">Vault Settings</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Auto-Response Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="welcome-msg">Welcome Message</Label>
                <Textarea
                  id="welcome-msg"
                  value={autoResponses.welcome || ''}
                  onChange={(e) => setAutoResponses(prev => ({ ...prev, welcome: e.target.value }))}
                  placeholder="Welcome message for new conversations"
                />
              </div>
              <div>
                <Label htmlFor="help-msg">Help Message</Label>
                <Textarea
                  id="help-msg"
                  value={autoResponses.help || ''}
                  onChange={(e) => setAutoResponses(prev => ({ ...prev, help: e.target.value }))}
                  placeholder="Help message with available commands"
                />
              </div>
              <div>
                <Label htmlFor="stop-msg">Stop Message</Label>
                <Textarea
                  id="stop-msg"
                  value={autoResponses.stop || ''}
                  onChange={(e) => setAutoResponses(prev => ({ ...prev, stop: e.target.value }))}
                  placeholder="Unsubscribe confirmation message"
                />
              </div>
              <div>
                <Label htmlFor="keywords">Allowed Keywords</Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="START, HELP, STOP, HR, PAYROLL"
                />
                <p className="text-sm text-muted-foreground mt-1">Comma-separated list of recognized keywords</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Escalation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="escalation-enabled">Enable Escalation</Label>
                  <p className="text-sm text-muted-foreground">Automatically escalate HR requests</p>
                </div>
                <Switch
                  id="escalation-enabled"
                  checked={escalationEnabled}
                  onCheckedChange={setEscalationEnabled}
                />
              </div>

              {escalationEnabled && (
                <>
                  <div>
                    <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                    <Input
                      id="slack-webhook"
                      value={escalationRouting.slack_webhook || ''}
                      onChange={(e) => setEscalationRouting(prev => ({ ...prev, slack_webhook: e.target.value }))}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-recipients">Email Recipients</Label>
                    <Input
                      id="email-recipients"
                      value={escalationRouting.email_recipients?.join(', ') || ''}
                      onChange={(e) => setEscalationRouting(prev => ({ 
                        ...prev, 
                        email_recipients: e.target.value.split(',').map(email => email.trim()) 
                      }))}
                      placeholder="hr@company.com, manager@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook-url">Custom Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      value={escalationRouting.webhook_url || ''}
                      onChange={(e) => setEscalationRouting(prev => ({ ...prev, webhook_url: e.target.value }))}
                      placeholder="https://your-api.com/hali-escalation"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vault" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                Vault File Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="expiry-hours">Link Expiry (Hours)</Label>
                <Input
                  id="expiry-hours"
                  type="number"
                  value={vaultSettings.expiry_hours || 24}
                  onChange={(e) => setVaultSettings(prev => ({ ...prev, expiry_hours: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="size-limit">Size Limit (MB)</Label>
                <Input
                  id="size-limit"
                  type="number"
                  value={vaultSettings.size_limit_mb || 10}
                  onChange={(e) => setVaultSettings(prev => ({ ...prev, size_limit_mb: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="allowed-types">Allowed File Types</Label>
                <Input
                  id="allowed-types"
                  value={vaultSettings.allowed_types?.join(', ') || ''}
                  onChange={(e) => setVaultSettings(prev => ({ 
                    ...prev, 
                    allowed_types: e.target.value.split(',').map(type => type.trim()) 
                  }))}
                  placeholder="pdf, doc, docx, jpg, png"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Twilio Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Twilio configuration is managed through the Integration Hub.
                  Contact your system administrator to update these settings.
                </p>
              </div>
              <div>
                <Label>Account SID</Label>
                <div className="flex items-center gap-2">
                  <Input value="AC************************************" disabled />
                  <Badge variant="secondary">Configured</Badge>
                </div>
              </div>
              <div>
                <Label>Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Input value="+1 (555) ***-****" disabled />
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={() => updateConfig.mutate({
            auto_responses: autoResponses,
            escalation_enabled: escalationEnabled,
            escalation_routing: escalationRouting,
            allowed_keywords: keywords.split(',').map(k => k.trim()),
            vault_file_settings: vaultSettings
          })}
          disabled={updateConfig.isPending}
        >
          {updateConfig.isPending ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
};