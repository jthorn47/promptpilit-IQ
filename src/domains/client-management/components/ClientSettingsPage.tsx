import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Bell, Lock, Mail, Users, Database } from 'lucide-react';
import { StandardLayout } from '@/components/layouts/StandardLayout';

export const ClientSettingsPage: React.FC = () => {
  const settingsCategories = [
    {
      title: 'General Settings',
      description: 'Basic client management configuration',
      icon: Settings,
      settings: [
        { id: 'auto-assign', label: 'Auto-assign new clients', enabled: true },
        { id: 'client-portal', label: 'Enable client portal access', enabled: false },
        { id: 'bulk-operations', label: 'Allow bulk operations', enabled: true }
      ]
    },
    {
      title: 'Notifications',
      description: 'Configure notification preferences',
      icon: Bell,
      settings: [
        { id: 'email-notifications', label: 'Email notifications', enabled: true },
        { id: 'contract-reminders', label: 'Contract renewal reminders', enabled: true },
        { id: 'payment-alerts', label: 'Payment due alerts', enabled: false }
      ]
    },
    {
      title: 'Security',
      description: 'Security and access control settings',
      icon: Lock,
      settings: [
        { id: 'two-factor', label: 'Require two-factor authentication', enabled: false },
        { id: 'audit-logs', label: 'Enable audit logging', enabled: true },
        { id: 'data-encryption', label: 'Encrypt sensitive data', enabled: true }
      ]
    },
    {
      title: 'Integration',
      description: 'Third-party service integrations',
      icon: Database,
      settings: [
        { id: 'crm-sync', label: 'CRM synchronization', enabled: false },
        { id: 'billing-integration', label: 'Billing system integration', enabled: false },
        { id: 'email-integration', label: 'Email platform integration', enabled: true }
      ]
    }
  ];

  return (
    <StandardLayout 
      title="Client Settings"
      subtitle="Configure client-specific settings and preferences"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end">
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>

        {/* Settings Categories */}
        <div className="space-y-6">
          {settingsCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.title}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.settings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between py-2">
                        <Label htmlFor={setting.id} className="text-sm font-medium">
                          {setting.label}
                        </Label>
                        <Switch id={setting.id} checked={setting.enabled} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Global Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Global Configuration</CardTitle>
            <CardDescription>System-wide client management settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Default Client Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Default status for new clients</Label>
                    <span className="text-sm text-muted-foreground">Prospective</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Auto-archive inactive clients</Label>
                    <span className="text-sm text-muted-foreground">90 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Contract renewal notice</Label>
                    <span className="text-sm text-muted-foreground">30 days</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Data retention period</Label>
                    <span className="text-sm text-muted-foreground">7 years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Backup frequency</Label>
                    <span className="text-sm text-muted-foreground">Daily</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Export format</Label>
                    <span className="text-sm text-muted-foreground">CSV, PDF</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardLayout>
  );
};