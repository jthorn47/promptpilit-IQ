import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Plus, Play, Pause, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WorkflowAutomation: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workflow Automation</h1>
            <p className="text-muted-foreground">Automate business processes</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Active Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">New Lead Processing</CardTitle>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <CardDescription>Automatically process new CRM leads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trigger:</span>
                <span>New HubSpot Lead</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actions:</span>
                <span>3 steps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Run:</span>
                <span>5 minutes ago</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Invoice Generation</CardTitle>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <CardDescription>Auto-generate invoices from project completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trigger:</span>
                <span>Project Completed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actions:</span>
                <span>5 steps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Run:</span>
                <span>2 hours ago</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Employee Onboarding</CardTitle>
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            </div>
            <CardDescription>Automate new employee setup process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trigger:</span>
                <span>New Employee Added</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actions:</span>
                <span>8 steps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span>Paused</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Weekly Reports</CardTitle>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <CardDescription>Generate and distribute weekly reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trigger:</span>
                <span>Weekly Schedule</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actions:</span>
                <span>4 steps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Run:</span>
                <span>Monday 9:00 AM</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Templates</CardTitle>
          <CardDescription>Get started with pre-built automation templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Lead Qualification',
              'Customer Support Ticket',
              'Document Approval',
              'Data Backup',
              'Expense Processing',
              'Time Tracking Sync'
            ].map((template) => (
              <div key={template} className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent cursor-pointer">
                <Zap className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium text-center">{template}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};