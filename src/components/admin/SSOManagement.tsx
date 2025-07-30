import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Settings, Users, Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface SSOConfiguration {
  id: string;
  provider_name: string;
  provider_type: string;
  is_active: boolean;
  auto_provision_users: boolean;
  default_role: string;
  domain_restrictions: string[] | null;
  saml_entity_id?: string;
  saml_sso_url?: string;
  oidc_client_id?: string;
  created_at: string;
  updated_at: string;
}

interface SSOFormData {
  provider_name: string;
  provider_type: 'saml' | 'oidc';
  is_active: boolean;
  auto_provision_users: boolean;
  default_role: 'learner' | 'company_admin';
  domain_restrictions: string;
  
  // SAML fields
  saml_entity_id: string;
  saml_sso_url: string;
  saml_certificate: string;
  
  // OIDC fields
  oidc_client_id: string;
  oidc_client_secret: string;
  oidc_discovery_url: string;
}

const initialFormData: SSOFormData = {
  provider_name: '',
  provider_type: 'saml',
  is_active: false,
  auto_provision_users: true,
  default_role: 'learner',
  domain_restrictions: '',
  saml_entity_id: '',
  saml_sso_url: '',
  saml_certificate: '',
  oidc_client_id: '',
  oidc_client_secret: '',
  oidc_discovery_url: '',
};

const providerPresets = {
  azure_ad: {
    name: 'Azure Active Directory',
    type: 'saml' as const,
    description: 'Microsoft Azure AD SAML integration'
  },
  okta: {
    name: 'Okta',
    type: 'saml' as const,
    description: 'Okta SAML integration'
  },
  google_workspace: {
    name: 'Google Workspace',
    type: 'oidc' as const,
    description: 'Google Workspace OpenID Connect'
  },
  saml_generic: {
    name: 'Generic SAML',
    type: 'saml' as const,
    description: 'Generic SAML 2.0 provider'
  }
};

export const SSOManagement = () => {
  const [ssoConfigs, setSsoConfigs] = useState<SSOConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<SSOFormData>(initialFormData);
  const [editingConfig, setEditingConfig] = useState<SSOConfiguration | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSSOConfigurations();
  }, []);

  const fetchSSOConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('sso_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSsoConfigs(data || []);
    } catch (error) {
      console.error('Error fetching SSO configurations:', error);
      toast({
        title: "Error",
        description: "Failed to load SSO configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Get user's company ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', userData.user.id)
        .single();

      if (profileError) throw profileError;

      if (!profileData?.company_id) {
        throw new Error('No company associated with your account');
      }

      const domainRestrictions = formData.domain_restrictions
        ? formData.domain_restrictions.split(',').map(d => d.trim()).filter(Boolean)
        : null;

      const configData = {
        company_id: profileData.company_id,
        provider_name: formData.provider_name,
        provider_type: formData.provider_type,
        is_active: formData.is_active,
        auto_provision_users: formData.auto_provision_users,
        default_role: formData.default_role,
        domain_restrictions: domainRestrictions,
        ...(formData.provider_type === 'saml' ? {
          saml_entity_id: formData.saml_entity_id || null,
          saml_sso_url: formData.saml_sso_url || null,
          saml_certificate: formData.saml_certificate || null,
        } : {
          oidc_client_id: formData.oidc_client_id || null,
          oidc_client_secret: formData.oidc_client_secret || null,
          oidc_discovery_url: formData.oidc_discovery_url || null,
        })
      };

      let result;
      if (editingConfig) {
        result = await supabase
          .from('sso_configurations')
          .update(configData)
          .eq('id', editingConfig.id);
      } else {
        result = await supabase
          .from('sso_configurations')
          .insert([configData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `SSO configuration ${editingConfig ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      setFormData(initialFormData);
      setEditingConfig(null);
      fetchSSOConfigurations();
    } catch (error: any) {
      console.error('Error saving SSO configuration:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save SSO configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (config: SSOConfiguration) => {
    setEditingConfig(config);
    setFormData({
      provider_name: config.provider_name,
      provider_type: config.provider_type as 'saml' | 'oidc',
      is_active: config.is_active,
      auto_provision_users: config.auto_provision_users,
      default_role: config.default_role as 'learner' | 'company_admin',
      domain_restrictions: config.domain_restrictions?.join(', ') || '',
      saml_entity_id: config.saml_entity_id || '',
      saml_sso_url: config.saml_sso_url || '',
      saml_certificate: '',
      oidc_client_id: config.oidc_client_id || '',
      oidc_client_secret: '',
      oidc_discovery_url: '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this SSO configuration?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sso_configurations')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "SSO configuration deleted successfully",
      });

      fetchSSOConfigurations();
    } catch (error: any) {
      console.error('Error deleting SSO configuration:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete SSO configuration",
        variant: "destructive",
      });
    }
  };

  const handlePresetSelect = (presetKey: string) => {
    const preset = providerPresets[presetKey as keyof typeof providerPresets];
    setFormData(prev => ({
      ...prev,
      provider_name: presetKey,
      provider_type: preset.type,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Single Sign-On (SSO)</h2>
          <p className="text-gray-600">Configure enterprise identity providers for seamless authentication</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingConfig(null);
              setFormData(initialFormData);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add SSO Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? 'Edit SSO Configuration' : 'Add SSO Provider'}
              </DialogTitle>
              <DialogDescription>
                Configure single sign-on integration with your enterprise identity provider
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!editingConfig && (
                <div className="space-y-2">
                  <Label>Provider Template</Label>
                  <Select onValueChange={handlePresetSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider template" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(providerPresets).map(([key, preset]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{preset.name}</div>
                            <div className="text-sm text-gray-500">{preset.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider_name">Provider Name *</Label>
                  <Input
                    id="provider_name"
                    value={formData.provider_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, provider_name: e.target.value }))}
                    placeholder="e.g., azure_ad, okta"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider_type">Provider Type *</Label>
                  <Select value={formData.provider_type} onValueChange={(value: 'saml' | 'oidc') => 
                    setFormData(prev => ({ ...prev, provider_type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saml">SAML 2.0</SelectItem>
                      <SelectItem value="oidc">OpenID Connect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_role">Default Role</Label>
                  <Select value={formData.default_role} onValueChange={(value: 'learner' | 'company_admin') => 
                    setFormData(prev => ({ ...prev, default_role: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learner">Learner</SelectItem>
                      <SelectItem value="company_admin">Company Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain_restrictions">Domain Restrictions</Label>
                  <Input
                    id="domain_restrictions"
                    value={formData.domain_restrictions}
                    onChange={(e) => setFormData(prev => ({ ...prev, domain_restrictions: e.target.value }))}
                    placeholder="company.com, subsidiary.com"
                  />
                  <p className="text-sm text-gray-500">Comma-separated email domains (optional)</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_provision_users"
                    checked={formData.auto_provision_users}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_provision_users: checked }))}
                  />
                  <Label htmlFor="auto_provision_users">Auto-provision new users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Enable this SSO configuration</Label>
                </div>
              </div>

              <Tabs value={formData.provider_type} className="w-full">
                <TabsList>
                  <TabsTrigger value="saml">SAML Configuration</TabsTrigger>
                  <TabsTrigger value="oidc">OpenID Connect</TabsTrigger>
                </TabsList>

                <TabsContent value="saml" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="saml_entity_id">Entity ID</Label>
                    <Input
                      id="saml_entity_id"
                      value={formData.saml_entity_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, saml_entity_id: e.target.value }))}
                      placeholder="https://your-idp.com/saml"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="saml_sso_url">SSO URL</Label>
                    <Input
                      id="saml_sso_url"
                      value={formData.saml_sso_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, saml_sso_url: e.target.value }))}
                      placeholder="https://your-idp.com/sso"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="saml_certificate">X.509 Certificate</Label>
                    <Textarea
                      id="saml_certificate"
                      value={formData.saml_certificate}
                      onChange={(e) => setFormData(prev => ({ ...prev, saml_certificate: e.target.value }))}
                      placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="oidc" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oidc_client_id">Client ID</Label>
                    <Input
                      id="oidc_client_id"
                      value={formData.oidc_client_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, oidc_client_id: e.target.value }))}
                      placeholder="your-client-id"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oidc_client_secret">Client Secret</Label>
                    <Input
                      id="oidc_client_secret"
                      type="password"
                      value={formData.oidc_client_secret}
                      onChange={(e) => setFormData(prev => ({ ...prev, oidc_client_secret: e.target.value }))}
                      placeholder="your-client-secret"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oidc_discovery_url">Discovery URL</Label>
                    <Input
                      id="oidc_discovery_url"
                      value={formData.oidc_discovery_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, oidc_discovery_url: e.target.value }))}
                      placeholder="https://your-idp.com/.well-known/openid_configuration"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingConfig ? 'Update' : 'Create'} Configuration
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {ssoConfigs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No SSO Configurations</h3>
            <p className="text-gray-600 mb-4">
              Configure single sign-on to enable enterprise authentication for your users.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingConfig(null);
                  setFormData(initialFormData);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First SSO Provider
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {ssoConfigs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      {providerPresets[config.provider_name as keyof typeof providerPresets]?.name || config.provider_name}
                      <Badge variant={config.is_active ? "default" : "secondary"}>
                        {config.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {config.provider_type.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Default role: {config.default_role} • 
                      Auto-provision: {config.auto_provision_users ? 'Enabled' : 'Disabled'}
                      {config.domain_restrictions && (
                        <> • Domains: {config.domain_restrictions.join(', ')}</>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(config)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(config.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};