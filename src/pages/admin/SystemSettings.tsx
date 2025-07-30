import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, DollarSign, Shield, Mail } from "lucide-react";
import { PropGENSettings } from "@/components/admin/PropGENSettings";
import { EmailSignatureSettings } from "@/components/admin/EmailSignatureSettings";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState("propgen");

  return (
    <StandardPageLayout
      title="PropGEN Settings"
      subtitle="Manage PropGEN financial configurations and regulatory settings"
      headerActions={
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
          Super Admin Only
        </Badge>
      }
    >

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="propgen" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            PropGEN Pro
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="propgen" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                PropGEN Pro Configuration
              </CardTitle>
              <CardDescription>
                Manage financial data and regulatory settings used in investment analysis and proposal generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropGENSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Manage global email settings and signature templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">System Email Templates</h4>
                <p className="text-sm text-muted-foreground mb-3">Manage templates for authentication, security, and system notifications</p>
                <a 
                  href="/admin/system/email-templates" 
                  className="inline-flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Manage System Templates
                </a>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Email Signatures</h4>
                <EmailSignatureSettings />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                System-wide configuration options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">General settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Security and compliance configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Security settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </StandardPageLayout>
  );
};

export default SystemSettings;