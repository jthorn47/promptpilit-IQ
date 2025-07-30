import { useState, useEffect } from "react";
import { Plus, Key, Webhook, ExternalLink, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret_key: string;
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
  headers: any;
  created_at: string;
}

interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  permissions: string[];
  expires_at: string;
  last_used_at: string;
  is_active: boolean;
  created_at: string;
}

const webhookEvents = [
  { value: "lead.created", label: "Lead Created" },
  { value: "lead.updated", label: "Lead Updated" },
  { value: "deal.created", label: "Deal Created" },
  { value: "deal.updated", label: "Deal Updated" },
  { value: "deal.won", label: "Deal Won" },
  { value: "deal.lost", label: "Deal Lost" },
  { value: "email.sent", label: "Email Sent" },
  { value: "email.opened", label: "Email Opened" },
  { value: "email.clicked", label: "Email Clicked" }
];

const apiPermissions = [
  { value: "leads:read", label: "Read Leads" },
  { value: "leads:write", label: "Write Leads" },
  { value: "deals:read", label: "Read Deals" },
  { value: "deals:write", label: "Write Deals" },
  { value: "activities:read", label: "Read Activities" },
  { value: "activities:write", label: "Write Activities" },
  { value: "reports:read", label: "Read Reports" }
];

export function IntegrationHub() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({});

  // Form states
  const [webhookForm, setWebhookForm] = useState({
    name: "",
    url: "",
    events: [] as string[],
    secret_key: "",
    is_active: true,
    retry_count: 3,
    timeout_seconds: 30,
    headers: {}
  });

  const [apiKeyForm, setApiKeyForm] = useState({
    name: "",
    permissions: [] as string[],
    expires_at: ""
  });

  useEffect(() => {
    fetchWebhooks();
    fetchApiKeys();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error: any) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
    }
  };

  const generateSecretKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleWebhookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('webhooks')
        .insert([{
          ...webhookForm,
          secret_key: webhookForm.secret_key || generateSecretKey(),
          created_by: '00000000-0000-0000-0000-000000000000'
        }]);

      if (error) throw error;
      
      toast({ title: "Success", description: "Webhook created successfully." });
      setWebhookDialogOpen(false);
      resetWebhookForm();
      fetchWebhooks();
    } catch (error: any) {
      console.error('Error creating webhook:', error);
      toast({
        title: "Error",
        description: "Failed to create webhook.",
        variant: "destructive",
      });
    }
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const apiKey = generateSecretKey();
      const keyHash = btoa(apiKey); // Simple hash for demo
      
      const { error } = await supabase
        .from('api_keys')
        .insert([{
          ...apiKeyForm,
          key_hash: keyHash,
          key_preview: apiKey.substring(0, 8) + '...',
          created_by: '00000000-0000-0000-0000-000000000000'
        }]);

      if (error) throw error;
      
      toast({ 
        title: "API Key Created", 
        description: `Your API key: ${apiKey}. Save it now - you won't see it again!`,
        duration: 10000
      });
      
      setApiKeyDialogOpen(false);
      resetApiKeyForm();
      fetchApiKeys();
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key.",
        variant: "destructive",
      });
    }
  };

  const resetWebhookForm = () => {
    setWebhookForm({
      name: "",
      url: "",
      events: [],
      secret_key: "",
      is_active: true,
      retry_count: 3,
      timeout_seconds: 30,
      headers: {}
    });
  };

  const resetApiKeyForm = () => {
    setApiKeyForm({
      name: "",
      permissions: [],
      expires_at: ""
    });
  };

  const toggleWebhook = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Webhook ${!isActive ? 'activated' : 'deactivated'}.`,
      });
      
      fetchWebhooks();
    } catch (error: any) {
      console.error('Error toggling webhook:', error);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Webhook deleted successfully." });
      fetchWebhooks();
    } catch (error: any) {
      console.error('Error deleting webhook:', error);
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Success", description: "API key deleted successfully." });
      fetchApiKeys();
    } catch (error: any) {
      console.error('Error deleting API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Integration Hub</h2>
          <p className="text-muted-foreground">
            Manage webhooks, API keys, and third-party integrations
          </p>
        </div>
      </div>

      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="integrations">Third-party Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Webhooks</h3>
              <p className="text-sm text-muted-foreground">
                Send real-time data to external services
              </p>
            </div>
            <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Webhook</DialogTitle>
                  <DialogDescription>
                    Configure a webhook to receive real-time notifications
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleWebhookSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="webhook-name">Name</Label>
                      <Input
                        id="webhook-name"
                        value={webhookForm.name}
                        onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                        placeholder="My Integration"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="webhook-url">URL</Label>
                      <Input
                        id="webhook-url"
                        type="url"
                        value={webhookForm.url}
                        onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                        placeholder="https://example.com/webhook"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Events</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {webhookEvents.map((event) => (
                        <div key={event.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={event.value}
                            checked={webhookForm.events.includes(event.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setWebhookForm({
                                  ...webhookForm,
                                  events: [...webhookForm.events, event.value]
                                });
                              } else {
                                setWebhookForm({
                                  ...webhookForm,
                                  events: webhookForm.events.filter(e => e !== event.value)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={event.value} className="text-sm">
                            {event.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="secret-key">Secret Key (optional)</Label>
                      <Input
                        id="secret-key"
                        value={webhookForm.secret_key}
                        onChange={(e) => setWebhookForm({ ...webhookForm, secret_key: e.target.value })}
                        placeholder="Auto-generated if empty"
                      />
                    </div>
                    <div>
                      <Label htmlFor="retry-count">Retry Count</Label>
                      <Input
                        id="retry-count"
                        type="number"
                        value={webhookForm.retry_count}
                        onChange={(e) => setWebhookForm({ ...webhookForm, retry_count: parseInt(e.target.value) })}
                        min="0"
                        max="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeout">Timeout (seconds)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={webhookForm.timeout_seconds}
                        onChange={(e) => setWebhookForm({ ...webhookForm, timeout_seconds: parseInt(e.target.value) })}
                        min="5"
                        max="300"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={webhookForm.is_active}
                      onCheckedChange={(checked) => setWebhookForm({ ...webhookForm, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setWebhookDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Webhook</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{webhook.name}</CardTitle>
                    <Badge variant={webhook.is_active ? "default" : "secondary"}>
                      {webhook.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription className="break-all">{webhook.url}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Events:</p>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleWebhook(webhook.id, webhook.is_active)}
                        >
                          {webhook.is_active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(webhook.secret_key)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">API Keys</h3>
              <p className="text-sm text-muted-foreground">
                Manage API access for external applications
              </p>
            </div>
            <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Key className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Generate a new API key with specific permissions
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleApiKeySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="api-key-name">Name</Label>
                    <Input
                      id="api-key-name"
                      value={apiKeyForm.name}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, name: e.target.value })}
                      placeholder="Production API"
                      required
                    />
                  </div>

                  <div>
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {apiPermissions.map((permission) => (
                        <div key={permission.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.value}
                            checked={apiKeyForm.permissions.includes(permission.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setApiKeyForm({
                                  ...apiKeyForm,
                                  permissions: [...apiKeyForm.permissions, permission.value]
                                });
                              } else {
                                setApiKeyForm({
                                  ...apiKeyForm,
                                  permissions: apiKeyForm.permissions.filter(p => p !== permission.value)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={permission.value} className="text-sm">
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expires-at">Expires At (optional)</Label>
                    <Input
                      id="expires-at"
                      type="datetime-local"
                      value={apiKeyForm.expires_at}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, expires_at: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setApiKeyDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create API Key</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{apiKey.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {showSecrets[apiKey.id] ? 'sk_' + apiKey.key_preview.replace('...', '_hidden_key') : apiKey.key_preview}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSecrets({ ...showSecrets, [apiKey.id]: !showSecrets[apiKey.id] })}
                        >
                          {showSecrets[apiKey.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key_preview)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                        {apiKey.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteApiKey(apiKey.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Integrations</CardTitle>
              <CardDescription>
                Connect your CRM with popular third-party services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Zapier", description: "Automate workflows", status: "Available" },
                  { name: "Slack", description: "Team notifications", status: "Coming Soon" },
                  { name: "HubSpot", description: "CRM sync", status: "Coming Soon" },
                  { name: "Salesforce", description: "Data migration", status: "Coming Soon" },
                  { name: "Google Workspace", description: "Calendar & contacts", status: "Coming Soon" },
                  { name: "Microsoft 365", description: "Email & calendar", status: "Coming Soon" }
                ].map((integration) => (
                  <Card key={integration.name}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{integration.name}</h4>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                        <Badge variant={integration.status === "Available" ? "default" : "secondary"}>
                          {integration.status}
                        </Badge>
                      </div>
                      {integration.status === "Available" && (
                        <Button className="w-full mt-3" size="sm">
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Connect
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}