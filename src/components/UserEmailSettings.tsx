import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Settings, 
  TestTube,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

interface UserEmailSettings {
  id?: string;
  from_name: string;
  from_email: string;
  reply_to: string;
  smtp_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  is_verified: boolean;
}

export const UserEmailSettings = () => {
  const [settings, setSettings] = useState<UserEmailSettings>({
    from_name: "",
    from_email: "",
    reply_to: "",
    smtp_enabled: false,
    smtp_host: "smtp.office365.com",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    is_verified: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchUserEmailSettings();
  }, []);

  const fetchUserEmailSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_email_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      if (data) {
        setSettings(data);
      }
    } catch (error: any) {
      console.error('Error fetching user email settings:', error);
      toast({
        title: "Error",
        description: "Failed to load email settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('user_email_settings')
        .upsert({
          ...settings,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setSettings(data);
      toast({
        title: "Success",
        description: "Email settings saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving email settings:', error);
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.smtp_enabled) {
      toast({
        title: "Error",
        description: "Please enable email configuration first",
        variant: "destructive",
      });
      return;
    }
    
    setTesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-smtp-connection', {
        body: {
          smtp_host: settings.smtp_host,
          smtp_port: settings.smtp_port,
          smtp_username: settings.smtp_username,
          smtp_password: settings.smtp_password
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Connection Test Successful",
          description: "Your email configuration is working properly",
        });
      } else {
        throw new Error(data.error || 'Connection test failed');
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      toast({
        title: "Connection Test Failed",
        description: error.message || "Failed to connect to email server",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          email: testEmail
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Test Email Sent",
          description: `Test email successfully sent to ${testEmail}`,
        });
        setTestEmail("");
      } else {
        throw new Error(data.error || 'Failed to send test email');
      }
    } catch (error: any) {
      console.error('Test email error:', error);
      toast({
        title: "Test Email Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Email Settings</h1>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading email settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Email Settings</h1>
        <p className="text-muted-foreground">Configure your personal email settings for sending emails from the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Email Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from_name">Display Name</Label>
              <Input
                id="from_name"
                value={settings.from_name}
                onChange={(e) => setSettings({...settings, from_name: e.target.value})}
                placeholder="Your Name"
              />
            </div>
            <div>
              <Label htmlFor="from_email">From Email</Label>
              <Input
                id="from_email"
                type="email"
                value={settings.from_email}
                onChange={(e) => setSettings({...settings, from_email: e.target.value})}
                placeholder="you@yourcompany.com"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="reply_to">Reply To Email</Label>
            <Input
              id="reply_to"
              type="email"
              value={settings.reply_to}
              onChange={(e) => setSettings({...settings, reply_to: e.target.value})}
              placeholder="reply@yourcompany.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>SMTP Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="smtp_enabled"
              checked={settings.smtp_enabled}
              onCheckedChange={(checked) => setSettings({...settings, smtp_enabled: checked})}
            />
            <Label htmlFor="smtp_enabled">Enable Personal Email Configuration</Label>
          </div>
          
          {settings.smtp_enabled && (
            <>
              <Alert>
                <AlertDescription>
                  Configure your personal email server settings. For Office 365, use smtp.office365.com with port 587.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={settings.smtp_host}
                    onChange={(e) => setSettings({...settings, smtp_host: e.target.value})}
                    placeholder="smtp.office365.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={settings.smtp_port}
                    onChange={(e) => setSettings({...settings, smtp_port: parseInt(e.target.value)})}
                    placeholder="587"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_username">Email Address</Label>
                  <Input
                    id="smtp_username"
                    type="email"
                    value={settings.smtp_username}
                    onChange={(e) => setSettings({...settings, smtp_username: e.target.value})}
                    placeholder="your-email@yourcompany.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_password">Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={settings.smtp_password}
                    onChange={(e) => setSettings({...settings, smtp_password: e.target.value})}
                    placeholder="Your email password"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={testing}
                >
                  {testing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TestTube className="w-4 h-4 mr-2" />}
                  {testing ? "Testing..." : "Test Connection"}
                </Button>
                
                {settings.is_verified ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Not Verified</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test_email">Test Email Address</Label>
            <Input
              id="test_email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <Button onClick={handleSendTestEmail} disabled={!settings.smtp_enabled}>
            <TestTube className="w-4 h-4 mr-2" />
            Send Test Email
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};