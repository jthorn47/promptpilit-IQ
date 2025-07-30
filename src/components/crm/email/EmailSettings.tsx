import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Eye, Bell, RefreshCw, Shield, Info } from 'lucide-react';
import { EmailSettings as EmailSettingsType, useCRMEmail } from '@/hooks/useCRMEmail';
import { useAuth } from '@/contexts/AuthContext';

interface EmailSettingsProps {
  settings: EmailSettingsType | null;
}

export function EmailSettings({ settings }: EmailSettingsProps) {
  const { user } = useAuth();
  const { updateSettings, disconnectMicrosoft365 } = useCRMEmail();
  const [saving, setSaving] = useState(false);

  // Function to generate Jeffrey's signature template
  const getJeffreySignature = () => {
    return `<table style="border-collapse: collapse; margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <tr>
    <td style="padding-right: 20px; vertical-align: top;">
      <img src="/lovable-uploads/78f0e7fb-5dff-4b07-b643-2c4aa6c09914.png" alt="Jeffrey Thorn" style="width: 150px; height: auto; border-radius: 8px;" />
    </td>
    <td style="vertical-align: top;">
      <table style="border-collapse: collapse; margin: 0; padding: 0;">
        <tr>
          <td style="padding-bottom: 10px;">
            <img src="https://easeworks.com/wp-content/uploads/2023/01/easeworks-logo.png" alt="Easeworks" style="height: 40px; width: auto;" />
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 5px;">
            <div style="font-size: 18px; font-weight: bold; color: #333; margin: 0;">Jeffrey Thorn</div>
            <div style="font-size: 14px; color: #666; margin: 0;">Easeworks</div>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-top: 2px solid #655DC6;">
            <table style="border-collapse: collapse; margin: 0; padding: 0;">
              <tr>
                <td style="padding: 5px 0; vertical-align: middle;">
                  <span style="color: #655DC6; margin-right: 8px;">📞</span>
                  <span style="font-size: 13px; color: #333;">888-843-0880 | 661-333-8188</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 5px 0; vertical-align: middle;">
                  <span style="color: #655DC6; margin-right: 8px;">✉️</span>
                  <a href="mailto:jeffrey@easeworks.com" style="font-size: 13px; color: #655DC6; text-decoration: none;">jeffrey@easeworks.com</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 5px 0; vertical-align: middle;">
                  <span style="color: #655DC6; margin-right: 8px;">🌐</span>
                  <a href="https://easeworks.com" style="font-size: 13px; color: #655DC6; text-decoration: none;">easeworks.com</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 5px 0; vertical-align: middle;">
                  <span style="color: #655DC6; margin-right: 8px;">📍</span>
                  <span style="font-size: 13px; color: #333;">3723 Wilson Rd, Bakersfield, CA. 93309</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 10px;">
            <div style="font-size: 11px; color: #999; font-style: italic;">Empowering Growth, Enhancing Productivity</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
  };
  
  // Form state
  const [defaultSignature, setDefaultSignature] = useState(settings?.default_signature || '');
  const [enableTracking, setEnableTracking] = useState(settings?.enable_tracking ?? true);
  const [enableNotifications, setEnableNotifications] = useState(settings?.enable_notifications ?? true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(settings?.auto_sync_enabled ?? true);
  const [syncFrequency, setSyncFrequency] = useState(settings?.sync_frequency_minutes || 5);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await updateSettings({
        default_signature: defaultSignature.trim() || null,
        enable_tracking: enableTracking,
        enable_notifications: enableNotifications,
        auto_sync_enabled: autoSyncEnabled,
        sync_frequency_minutes: syncFrequency
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = settings && (
    defaultSignature !== (settings.default_signature || '') ||
    enableTracking !== settings.enable_tracking ||
    enableNotifications !== settings.enable_notifications ||
    autoSyncEnabled !== settings.auto_sync_enabled ||
    syncFrequency !== settings.sync_frequency_minutes
  );

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your Microsoft 365 connection details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-muted-foreground">
                Connected Microsoft 365 account
              </p>
            </div>
            <Badge variant="outline" className="border-green-600 text-green-600">
              Active
            </Badge>
          </div>
          
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              This email module is exclusively for @easeworks.com accounts and personal 1:1 communication only. 
              Marketing emails should use the dedicated marketing system.
            </AlertDescription>
          </Alert>

          <Button 
            variant="outline" 
            onClick={disconnectMicrosoft365}
            className="w-full"
          >
            Disconnect Microsoft 365
          </Button>
        </CardContent>
      </Card>

      {/* Email Signature */}
      <Card>
        <CardHeader>
          <CardTitle>Email Signature</CardTitle>
          <CardDescription>
            This signature will be automatically added to all outgoing emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => setDefaultSignature(getJeffreySignature())}
              size="sm"
            >
              Use Jeffrey's Signature Template
            </Button>
            <Button
              variant="outline"
              onClick={() => setDefaultSignature('')}
              size="sm"
            >
              Clear Signature
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signature">Default Signature (HTML)</Label>
            <Textarea
              id="signature"
              value={defaultSignature}
              onChange={(e) => setDefaultSignature(e.target.value)}
              placeholder="Enter your HTML email signature here..."
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          
          {defaultSignature && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="bg-background p-4 rounded border">
                <div 
                  dangerouslySetInnerHTML={{ __html: defaultSignature }}
                  className="prose prose-sm max-w-none"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Email Tracking
          </CardTitle>
          <CardDescription>
            Configure email open tracking and analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable email tracking by default</Label>
              <p className="text-sm text-muted-foreground">
                Includes tracking pixels to detect when emails are opened
              </p>
            </div>
            <Switch
              checked={enableTracking}
              onCheckedChange={setEnableTracking}
            />
          </div>

          {enableTracking && (
            <Alert>
              <Eye className="w-4 h-4" />
              <AlertDescription>
                Tracking pixels are embedded invisibly in emails. Recipients won't see them, 
                but you'll know when and how often your emails are opened.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new emails and tracking events
              </p>
            </div>
            <Switch
              checked={enableNotifications}
              onCheckedChange={setEnableNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Synchronization
          </CardTitle>
          <CardDescription>
            Configure how often emails are synchronized with Microsoft 365
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable automatic sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically check for new emails in the background
              </p>
            </div>
            <Switch
              checked={autoSyncEnabled}
              onCheckedChange={setAutoSyncEnabled}
            />
          </div>

          {autoSyncEnabled && (
            <div className="space-y-2">
              <Label>Sync frequency</Label>
              <Select 
                value={syncFrequency.toString()} 
                onValueChange={(value) => setSyncFrequency(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Every minute</SelectItem>
                  <SelectItem value="5">Every 5 minutes</SelectItem>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="60">Every hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                You have unsaved changes
              </p>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}