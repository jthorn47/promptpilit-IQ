import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, PenTool, Workflow } from "lucide-react";

export const DocumentsConfig = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Document Management</h1>
        <p className="text-muted-foreground">Secure document storage, e-signatures, and workflow automation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18</span> added today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signatures</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4GB</div>
            <p className="text-xs text-muted-foreground">
              of 10GB limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common document management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <PenTool className="mr-2 h-4 w-4" />
              Send for Signature
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Create Template
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Workflow className="mr-2 h-4 w-4" />
              Setup Workflow
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest document updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Contract signed</p>
                  <p className="text-sm text-muted-foreground">Employment agreement - John Doe</p>
                </div>
                <span className="text-sm text-muted-foreground">1h ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Document uploaded</p>
                  <p className="text-sm text-muted-foreground">Policy handbook v3.2</p>
                </div>
                <span className="text-sm text-muted-foreground">3h ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Workflow completed</p>
                  <p className="text-sm text-muted-foreground">New hire documentation</p>
                </div>
                <span className="text-sm text-muted-foreground">5h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};