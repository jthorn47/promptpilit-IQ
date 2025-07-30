import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building2, Users, MapPin, Phone, Mail, Globe, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrgSettingsConfigProps {
  onBack: () => void;
  clientId?: string;
}

export const OrgSettingsConfig = ({ onBack, clientId }: OrgSettingsConfigProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Organization Information
  const [orgInfo, setOrgInfo] = useState({
    legalName: 'Palms Liquor Inc.',
    displayName: 'Palms Liquor',
    taxId: '12-3456789',
    registrationNumber: 'REG-2024-001',
    businessType: 'corporation',
    foundedDate: '2020-01-15'
  });

  // Contact Information
  const [contactInfo, setContactInfo] = useState({
    headquarters: '123 Main Street, City, State 12345',
    phone: '(555) 123-4567',
    email: 'info@palmsliquor.com',
    website: 'https://palmsliquor.com',
    alternatePhone: '(555) 123-4568',
    faxNumber: '(555) 123-4569'
  });

  // Operating Settings
  const [operatingSettings, setOperatingSettings] = useState({
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    currency: 'USD',
    language: 'en-US',
    fiscalYearStart: 'January'
  });

  // Security & Compliance
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: true,
    passwordComplexity: true,
    sessionTimeout: 30,
    auditLogging: true,
    dataRetention: 7,
    encryptionEnabled: true,
    backupFrequency: 'daily'
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    systemAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    criticalAlerts: true
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Organization settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save organization settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Modules
        </Button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Organization Settings
          </h2>
          <p className="text-muted-foreground">
            Configure organization-wide settings, policies, and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Organization Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Information
            </CardTitle>
            <CardDescription>
              Basic information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legal-name">Legal Name</Label>
                <Input
                  id="legal-name"
                  value={orgInfo.legalName}
                  onChange={(e) => setOrgInfo({...orgInfo, legalName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={orgInfo.displayName}
                  onChange={(e) => setOrgInfo({...orgInfo, displayName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-id">Tax ID</Label>
                <Input
                  id="tax-id"
                  value={orgInfo.taxId}
                  onChange={(e) => setOrgInfo({...orgInfo, taxId: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Select value={orgInfo.businessType} onValueChange={(value) => setOrgInfo({...orgInfo, businessType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Organization contact details and locations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headquarters">Headquarters Address</Label>
              <Textarea
                id="headquarters"
                value={contactInfo.headquarters}
                onChange={(e) => setContactInfo({...contactInfo, headquarters: e.target.value})}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Primary Phone</Label>
                <Input
                  id="phone"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Primary Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={contactInfo.website}
                  onChange={(e) => setContactInfo({...contactInfo, website: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alt-phone">Alternate Phone</Label>
                <Input
                  id="alt-phone"
                  value={contactInfo.alternatePhone}
                  onChange={(e) => setContactInfo({...contactInfo, alternatePhone: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Operating Settings
            </CardTitle>
            <CardDescription>
              Time, date, currency, and language preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={operatingSettings.timezone} onValueChange={(value) => setOperatingSettings({...operatingSettings, timezone: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={operatingSettings.currency} onValueChange={(value) => setOperatingSettings({...operatingSettings, currency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select value={operatingSettings.dateFormat} onValueChange={(value) => setOperatingSettings({...operatingSettings, dateFormat: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-format">Time Format</Label>
                <Select value={operatingSettings.timeFormat} onValueChange={(value) => setOperatingSettings({...operatingSettings, timeFormat: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12-hour">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24-hour">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Compliance
            </CardTitle>
            <CardDescription>
              Security policies and compliance settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication Required</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorRequired}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorRequired: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Complexity</Label>
                  <p className="text-sm text-muted-foreground">Enforce strong password requirements</p>
                </div>
                <Switch
                  checked={securitySettings.passwordComplexity}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordComplexity: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">Log all user activities</p>
                </div>
                <Switch
                  checked={securitySettings.auditLogging}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, auditLogging: checked})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data Retention (years)</Label>
                  <Input
                    id="data-retention"
                    type="number"
                    value={securitySettings.dataRetention}
                    onChange={(e) => setSecuritySettings({...securitySettings, dataRetention: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure organization-wide notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">Critical system notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemAlerts: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Automated weekly summary reports</p>
                </div>
                <Switch
                  checked={notificationSettings.weeklyReports}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
};