import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, Download, Filter } from "lucide-react";

export function TimesheetManagement() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Timesheet Management</h1>
          <p className="text-muted-foreground">Review and manage employee timesheets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timesheet Overview</CardTitle>
          <CardDescription>Current period timesheet status and details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search employees..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Select Period
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <div>Employee</div>
              <div>Total Hours</div>
              <div>Regular Hours</div>
              <div>Overtime</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-6 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-muted-foreground">Software Engineer</p>
                </div>
                <div>42.5 hrs</div>
                <div>40.0 hrs</div>
                <div>2.5 hrs</div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Submitted
                  </span>
                </div>
                <div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Marketing Manager</p>
                </div>
                <div>38.0 hrs</div>
                <div>38.0 hrs</div>
                <div>0.0 hrs</div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
                <div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Mike Davis</p>
                  <p className="text-sm text-muted-foreground">Project Manager</p>
                </div>
                <div>45.0 hrs</div>
                <div>40.0 hrs</div>
                <div>5.0 hrs</div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Approved
                  </span>
                </div>
                <div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}