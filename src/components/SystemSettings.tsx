import { useState, useEffect } from "react";
import { Save, Settings, Mail, Clock, Search, Database, Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SystemSetting {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string;
  is_public: boolean;
}

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" }
];

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state organized by category
  const [generalSettings, setGeneralSettings] = useState({
    company_name: "",
    timezone: "UTC",
    currency: "USD",
    date_format: "MM/dd/yyyy"
  });

  const [emailSettings, setEmailSettings] = useState({
    from_name: "",
    from_email: "",
    smtp_host: "",
    smtp_port: "587",
    smtp_username: "",
    smtp_password: "",
    enable_notifications: true
  });

  const [automationSettings, setAutomationSettings] = useState({
    max_executions_per_hour: 100,
    enable_auto_assignment: true,
    default_lead_score: 50,
    email_tracking: true
  });

  const [searchSettings, setSearchSettings] = useState({
    max_results: 50,
    enable_fuzzy_search: true,
    index_activities: true,
    index_emails: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    session_timeout: 24,
    require_2fa: false,
    password_expiry_days: 90,
    max_login_attempts: 5
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category');

      if (error) throw error;
      
      setSettings(data || []);
      
      // Populate form states with current settings
      data?.forEach((setting) => {
        let value = setting.value;
        // Only try to parse if it's a string that looks like JSON
        if (typeof setting.value === 'string') {
          try {
            // Check if it starts with { or [ to determine if it's JSON
            if (setting.value.startsWith('{') || setting.value.startsWith('[')) {
              value = JSON.parse(setting.value);
            }
          } catch (e) {
            // If parsing fails, use the original string value
            value = setting.value;
          }
        }
        
        switch (setting.category) {
          case 'general':
            setGeneralSettings(prev => ({ ...prev, [setting.key]: value }));
            break;
          case 'email':
            setEmailSettings(prev => ({ ...prev, [setting.key]: value }));
            break;
          case 'automation':
            setAutomationSettings(prev => ({ ...prev, [setting.key]: value }));
            break;
          case 'search':
            setSearchSettings(prev => ({ ...prev, [setting.key]: value }));
            break;
          case 'security':
            setSecuritySettings(prev => ({ ...prev, [setting.key]: value }));
            break;
        }
      });
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load system settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (category: string, settingsData: any) => {
    setIsSaving(true);
    try {
      // Get user once outside the loop
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '';

      for (const [key, value] of Object.entries(settingsData)) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            category,
            key,
            value: JSON.stringify(value),
            description: `${category} setting: ${key}`,
            is_public: category === 'general',
            created_by: userId
          }, {
            onConflict: 'category,key'
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully.`,
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">
            Configure global settings for your CRM system
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic configuration for your CRM system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={generalSettings.company_name}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, company_name: e.target.value })}
                    placeholder="Your Company Name"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={generalSettings.currency}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select
                    value={generalSettings.date_format}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, date_format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                      <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                      <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={() => saveSettings('general', generalSettings)} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save General Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Settings
              </CardTitle>
              <CardDescription>
                Configure email delivery and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    value={emailSettings.from_name}
                    onChange={(e) => setEmailSettings({ ...emailSettings, from_name: e.target.value })}
                    placeholder="Your CRM Name"
                  />
                </div>
                <div>
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={emailSettings.from_email}
                    onChange={(e) => setEmailSettings({ ...emailSettings, from_email: e.target.value })}
                    placeholder="noreply@yourcompany.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    value={emailSettings.smtp_host}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    value={emailSettings.smtp_port}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: e.target.value })}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={emailSettings.enable_notifications}
                  onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enable_notifications: checked })}
                />
                <Label>Enable Email Notifications</Label>
              </div>

              <Button onClick={() => saveSettings('email', emailSettings)} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Email Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Automation Settings
              </CardTitle>
              <CardDescription>
                Configure automation rules and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-executions">Max Executions per Hour</Label>
                  <Input
                    id="max-executions"
                    type="number"
                    value={automationSettings.max_executions_per_hour}
                    onChange={(e) => setAutomationSettings({ ...automationSettings, max_executions_per_hour: parseInt(e.target.value) })}
                    min="10"
                    max="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="default-lead-score">Default Lead Score</Label>
                  <Input
                    id="default-lead-score"
                    type="number"
                    value={automationSettings.default_lead_score}
                    onChange={(e) => setAutomationSettings({ ...automationSettings, default_lead_score: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={automationSettings.enable_auto_assignment}
                    onCheckedChange={(checked) => setAutomationSettings({ ...automationSettings, enable_auto_assignment: checked })}
                  />
                  <Label>Enable Auto Assignment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={automationSettings.email_tracking}
                    onCheckedChange={(checked) => setAutomationSettings({ ...automationSettings, email_tracking: checked })}
                  />
                  <Label>Enable Email Tracking</Label>
                </div>
              </div>

              <Button onClick={() => saveSettings('automation', automationSettings)} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Automation Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Settings
              </CardTitle>
              <CardDescription>
                Configure search behavior and indexing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="max-results">Maximum Search Results</Label>
                <Input
                  id="max-results"
                  type="number"
                  value={searchSettings.max_results}
                  onChange={(e) => setSearchSettings({ ...searchSettings, max_results: parseInt(e.target.value) })}
                  min="10"
                  max="200"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={searchSettings.enable_fuzzy_search}
                    onCheckedChange={(checked) => setSearchSettings({ ...searchSettings, enable_fuzzy_search: checked })}
                  />
                  <Label>Enable Fuzzy Search</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={searchSettings.index_activities}
                    onCheckedChange={(checked) => setSearchSettings({ ...searchSettings, index_activities: checked })}
                  />
                  <Label>Index Activities in Search</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={searchSettings.index_emails}
                    onCheckedChange={(checked) => setSearchSettings({ ...searchSettings, index_emails: checked })}
                  />
                  <Label>Index Emails in Search</Label>
                </div>
              </div>

              <Button onClick={() => saveSettings('search', searchSettings)} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Search Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={securitySettings.session_timeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, session_timeout: parseInt(e.target.value) })}
                    min="1"
                    max="168"
                  />
                </div>
                <div>
                  <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                  <Input
                    id="password-expiry"
                    type="number"
                    value={securitySettings.password_expiry_days}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, password_expiry_days: parseInt(e.target.value) })}
                    min="30"
                    max="365"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                <Input
                  id="max-login-attempts"
                  type="number"
                  value={securitySettings.max_login_attempts}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, max_login_attempts: parseInt(e.target.value) })}
                  min="3"
                  max="10"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={securitySettings.require_2fa}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, require_2fa: checked })}
                />
                <Label>Require Two-Factor Authentication</Label>
              </div>

              <Button onClick={() => saveSettings('security', securitySettings)} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}