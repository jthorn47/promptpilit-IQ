import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Building, CreditCard, Users, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export default function ClientSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save logic
      toast({
        title: "Settings Saved",
        description: "Client settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StandardPageLayout
      title="Client Settings"
      subtitle="Manage client configurations and system preferences"
    >

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" placeholder="Enter company name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" placeholder="Enter industry" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Enter company address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter email" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Module Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: 'Time Tracking', description: 'Employee time and attendance tracking' },
                { name: 'Payroll IQ', description: 'Automated payroll processing' },
                { name: 'Workers Comp', description: 'Workers compensation management' },
                { name: 'Onboarding', description: 'Employee onboarding workflows' },
                { name: 'Billing', description: 'Client billing and invoicing' },
              ].map((module) => (
                <div key={module.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{module.name}</h4>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <Switch />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billing-cycle">Billing Cycle</Label>
                  <Input id="billing-cycle" placeholder="Monthly" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Input id="payment-method" placeholder="Credit Card" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-contact">Billing Contact</Label>
                <Input id="billing-contact" placeholder="Enter billing contact email" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Single Sign-On (SSO)</h4>
                  <p className="text-sm text-muted-foreground">Enable SSO authentication</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Password Policy</h4>
                  <p className="text-sm text-muted-foreground">Enforce strong password requirements</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </StandardPageLayout>
  );
}