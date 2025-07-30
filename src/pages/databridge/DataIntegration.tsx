import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Plus, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DataIntegration: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Integration</h1>
            <p className="text-muted-foreground">Connect and sync data across systems</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Active Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">HubSpot CRM</CardTitle>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <CardDescription>Customer relationship management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Sync:</span>
                <span>2 minutes ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Records:</span>
                <span>1,247</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
              <Button variant="outline" size="sm">
                Sync Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">QuickBooks</CardTitle>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <CardDescription>Accounting and financial data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Sync:</span>
                <span>15 minutes ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transactions:</span>
                <span>892</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
              <Button variant="outline" size="sm">
                Sync Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Slack</CardTitle>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            <CardDescription>Team communication platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Sync:</span>
                <span>1 hour ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Messages:</span>
                <span>3,241</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
              <Button variant="outline" size="sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                Fix Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>Expand your data connectivity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Salesforce', 'Microsoft 365', 'Google Workspace', 'Zendesk', 'Jira', 'Asana'].map((service) => (
              <div key={service} className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent cursor-pointer">
                <div className="w-8 h-8 bg-muted rounded mb-2"></div>
                <span className="text-sm font-medium">{service}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};