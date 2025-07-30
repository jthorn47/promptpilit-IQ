import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Clock, Activity, Settings, History, Shield } from "lucide-react";
import { AuditLogViewer } from "./AuditLogViewer";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_number?: string;
  department?: string;
  location?: string;
  status: string;
  hire_date?: string;
  time_tracking_enabled?: boolean;
}

interface EmployeeDetailModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeDetailModal({ 
  employee, 
  open, 
  onOpenChange 
}: EmployeeDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!employee) return null;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'terminated':
        return <Badge variant="destructive">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            {employee.first_name} {employee.last_name}
            {getStatusBadge(employee.status)}
          </DialogTitle>
          <DialogDescription>
            Employee details, time tracking history, and audit trail
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="timecard" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timecard
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Employee Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Employee #:</span>
                      <span>{employee.employee_number || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Email:</span>
                      <span>{employee.email}</span>
                      
                      <span className="text-muted-foreground">Department:</span>
                      <span>{employee.department || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Location:</span>
                      <span>{employee.location || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Hire Date:</span>
                      <span>
                        {employee.hire_date 
                          ? new Date(employee.hire_date).toLocaleDateString()
                          : 'N/A'
                        }
                      </span>
                      
                      <span className="text-muted-foreground">Time Tracking:</span>
                      <span>
                        {employee.time_tracking_enabled ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Status</span>
                      {getStatusBadge(employee.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">This Week Hours</span>
                        <span className="font-medium">40.0h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Overtime Hours</span>
                        <span className="font-medium">2.5h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Punch</span>
                        <span className="font-medium">Today 5:30 PM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>Latest time tracking activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium">Clock Out</p>
                          <p className="text-sm text-muted-foreground">Today at 5:30 PM</p>
                        </div>
                      </div>
                      <Badge variant="outline">Regular</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">Break End</p>
                          <p className="text-sm text-muted-foreground">Today at 1:00 PM</p>
                        </div>
                      </div>
                      <Badge variant="outline">30 min</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timecard" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Timecard</CardTitle>
                  <CardDescription>Weekly timecard summary and details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Timecard view integration coming soon</p>
                    <p className="text-sm">Will show punch details, hours breakdown, and approval status</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="mt-4">
              <AuditLogViewer 
                employeeId={employee.id}
                showFilters={true}
                maxHeight="500px"
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}