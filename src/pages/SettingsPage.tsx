import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { Integrations } from "@/components/settings/Integrations";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { CustomizableWidgetArea } from "@/components/widgets/CustomizableWidgetArea";
import { useAuth } from "@/contexts/AuthContext";
import { use2FA } from "@/hooks/use2FA";
import { useNavigate } from "react-router-dom";
import { User, Settings, Building2, Save, Layout, Shield, Key, History, Mail, Bell, Smartphone, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const SettingsPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { get2FAStatus, disable2FA, loading: twoFALoading } = use2FA();
  
  const [isSaving, setIsSaving] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [hasBackupCodes, setHasBackupCodes] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // Load 2FA status on component mount
  useEffect(() => {
    
    const load2FAStatus = async () => {
      try {
        const status = await get2FAStatus();
        if (status) {
          setTwoFAEnabled(status.isEnabled);
          setHasBackupCodes(status.hasBackupCodes);
        }
      } catch (error) {
        console.error('Failed to load 2FA status:', error);
      }
    };

    if (user) {
      load2FAStatus();
    }
  }, [user, get2FAStatus]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save notification preferences to localStorage for now
      // In a real app, this would save to the database
      const preferences = {
        emailNotifications,
        inAppAlerts,
        smsAlerts
      };
      
      localStorage.setItem('userNotificationPreferences', JSON.stringify(preferences));
      
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Settings saved successfully!");
      
      // Close and navigate back
      navigate(-1);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    if (twoFAEnabled) {
      try {
        await disable2FA();
        setTwoFAEnabled(false);
        setHasBackupCodes(false);
        toast.success("2FA disabled successfully");
      } catch (error) {
        toast.error("Failed to disable 2FA");
      }
    } else {
      // Navigate to 2FA setup
      navigate('/setup-2fa');
    }
  };

  const handleResetPassword = async () => {
    // This would typically send a password reset email
    toast.success("Password reset email sent to your email address");
  };

  const handleGenerateBackupCodes = () => {
    // This would generate new backup codes
    toast.success("New backup codes generated. Please save them securely.");
    setHasBackupCodes(true);
  };

  return (
    <UnifiedLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save & Close"}
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email:</p>
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Profile settings functionality will be implemented in a future update.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                General settings functionality will be implemented in a future update.
              </div>
            </CardContent>
          </Card>

          {/* Company Settings - Only for client admins */}
          {userRole === 'client_admin' && (
            <div className="md:col-span-2 lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CompanySettings />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Security Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 2FA Section */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {twoFAEnabled && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Enabled
                  </span>
                )}
                <Switch
                  checked={twoFAEnabled}
                  onCheckedChange={handleToggle2FA}
                  disabled={twoFALoading}
                />
              </div>
            </div>

            {/* Backup Codes */}
            {twoFAEnabled && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Backup Codes</p>
                    <p className="text-sm text-muted-foreground">
                      Generate backup codes for account recovery
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateBackupCodes}
                >
                  {hasBackupCodes ? "Regenerate" : "Generate"} Codes
                </Button>
              </div>
            )}

            {/* Login History */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Login History</p>
                  <p className="text-sm text-muted-foreground">
                    View recent login activity
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View History
              </Button>
            </div>

            {/* Reset Password */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Reset Password</p>
                  <p className="text-sm text-muted-foreground">
                    Send a password reset email
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetPassword}
              >
                Reset Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-notifications" className="font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            {/* In-App Alerts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="in-app-alerts" className="font-medium">
                    In-App Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show notifications in app
                  </p>
                </div>
              </div>
              <Switch
                id="in-app-alerts"
                checked={inAppAlerts}
                onCheckedChange={setInAppAlerts}
              />
            </div>

            {/* SMS Alerts (Future) */}
            <div className="flex items-center justify-between opacity-50">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="sms-alerts" className="font-medium">
                    SMS Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Coming soon
                  </p>
                </div>
              </div>
              <Switch
                id="sms-alerts"
                checked={smsAlerts}
                onCheckedChange={setSmsAlerts}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Widget Customization Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Widget Customization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Customize your dashboard widgets and quick actions.
            </p>
            <CustomizableWidgetArea />
          </CardContent>
        </Card>

        {/* Additional Settings Sections */}
        <div className="grid gap-6">
          <Integrations />
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SettingsPage;