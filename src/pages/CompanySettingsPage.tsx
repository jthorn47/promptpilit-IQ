import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Building2, 
  Settings, 
  Users, 
  Shield,
  Bell,
  Palette,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload
} from 'lucide-react';

const CompanySettingsPage = () => {
  const settingsSections = [
    {
      title: 'Company Profile',
      description: 'Basic company information and branding',
      icon: Building2,
      color: 'bg-blue-500'
    },
    {
      title: 'User Management',
      description: 'User roles, permissions, and access control',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Security Settings',
      description: 'Authentication, passwords, and security policies',
      icon: Shield,
      color: 'bg-red-500'
    },
    {
      title: 'Notifications',
      description: 'Email notifications and alert preferences',
      icon: Bell,
      color: 'bg-yellow-500'
    },
    {
      title: 'Appearance',
      description: 'Themes, branding, and UI customization',
      icon: Palette,
      color: 'bg-purple-500'
    },
    {
      title: 'System Settings',
      description: 'System-wide configurations and preferences',
      icon: Settings,
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="container mx-auto py-4 px-4 space-y-6 max-w-none overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Company Settings</h1>
          <p className="text-muted-foreground">
            Manage your company profile, settings, and configurations
          </p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Settings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${section.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {section.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full" variant="outline">
                  Configure
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Company Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Profile
          </CardTitle>
          <CardDescription>
            Update your company information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" placeholder="Enter company name" defaultValue="EaseWorks Inc." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-website">Website</Label>
              <div className="flex">
                <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                  id="company-website" 
                  placeholder="www.company.com" 
                  className="rounded-l-none"
                  defaultValue="www.easeworks.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-description">Company Description</Label>
            <Textarea 
              id="company-description" 
              placeholder="Brief description of your company"
              defaultValue="EaseWorks provides comprehensive HR and business management solutions."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company-email">Company Email</Label>
              <div className="flex">
                <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                  id="company-email" 
                  type="email" 
                  placeholder="contact@company.com"
                  className="rounded-l-none"
                  defaultValue="contact@easeworks.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Phone Number</Label>
              <div className="flex">
                <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                  id="company-phone" 
                  placeholder="+1 (555) 123-4567"
                  className="rounded-l-none"
                  defaultValue="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-address">Address</Label>
            <div className="flex">
              <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input 
                id="company-address" 
                placeholder="Company address"
                className="rounded-l-none"
                defaultValue="123 Business Ave, Suite 100, City, State 12345"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG up to 2MB. Recommended: 200x200px
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Preferences
          </CardTitle>
          <CardDescription>
            Configure system-wide settings and defaults
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important events
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all admin users
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Save Changes</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save changes as you type
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Enable usage analytics and reporting
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable maintenance mode for system updates
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline">
          Reset to Defaults
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            Cancel
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanySettingsPage;