import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Mail, 
  Shield, 
  FileText, 
  Users,
  Save,
  Database,
  Bell
} from "lucide-react";

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    companyName: "Easeworks",
    supportEmail: "info@easeworks.com",
    allowPublicAssessments: true,
    requireEmailVerification: false,
    
    // Assessment Settings
    maxAssessmentRetakes: 3,
    assessmentTimeLimit: 30, // minutes
    autoGenerateReports: true,
    
    // Email Settings
    emailNotifications: true,
    adminAlerts: true,
    weeklyReports: false,
    
    // Data Settings
    dataRetentionDays: 365,
    anonymizeData: false,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate saving settings
    setTimeout(() => {
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
      setIsSaving(false);
    }, 1000);
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>General Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowPublicAssessments">Allow Public Assessments</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to take assessments without creating an account
                  </p>
                </div>
                <Switch
                  id="allowPublicAssessments"
                  checked={settings.allowPublicAssessments}
                  onCheckedChange={(checked) => handleInputChange('allowPublicAssessments', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email before accessing admin features
                  </p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => handleInputChange('requireEmailVerification', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Assessment Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxRetakes">Maximum Retakes</Label>
                <Input
                  id="maxRetakes"
                  type="number"
                  value={settings.maxAssessmentRetakes}
                  onChange={(e) => handleInputChange('maxAssessmentRetakes', parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Number of times a user can retake an assessment
                </p>
              </div>
              <div>
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={settings.assessmentTimeLimit}
                  onChange={(e) => handleInputChange('assessmentTimeLimit', parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum time allowed to complete an assessment
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoGenerateReports">Auto-Generate AI Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate AI reports when assessments are completed
                </p>
              </div>
              <Switch
                id="autoGenerateReports"
                checked={settings.autoGenerateReports}
                onCheckedChange={(checked) => handleInputChange('autoGenerateReports', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email & Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="adminAlerts">Admin Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for high-risk assessments and system issues
                  </p>
                </div>
                <Switch
                  id="adminAlerts"
                  checked={settings.adminAlerts}
                  onCheckedChange={(checked) => handleInputChange('adminAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyReports">Weekly Summary Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly summary of assessment activity
                  </p>
                </div>
                <Switch
                  id="weeklyReports"
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => handleInputChange('weeklyReports', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dataRetention">Data Retention (days)</Label>
              <Input
                id="dataRetention"
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) => handleInputChange('dataRetentionDays', parseInt(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                How long to keep assessment data before automatic deletion
              </p>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="anonymizeData">Anonymize Old Data</Label>
                <p className="text-sm text-muted-foreground">
                  Remove personally identifiable information from old assessments
                </p>
              </div>
              <Switch
                id="anonymizeData"
                checked={settings.anonymizeData}
                onCheckedChange={(checked) => handleInputChange('anonymizeData', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>System Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Application Version</Label>
                <p className="text-sm text-muted-foreground">v1.0.0</p>
              </div>
              <div>
                <Label>Database Status</Label>
                <p className="text-sm text-green-600">Connected</p>
              </div>
              <div>
                <Label>Last Backup</Label>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
              <div>
                <Label>AI Service Status</Label>
                <p className="text-sm text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};