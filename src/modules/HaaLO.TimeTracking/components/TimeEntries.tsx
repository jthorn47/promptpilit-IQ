import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Plus, Edit, Trash2 } from "lucide-react";

export function TimeEntries() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Time Entries</h1>
          <p className="text-muted-foreground">Track and manage individual time entries</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Time Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Entry Log</CardTitle>
          <CardDescription>Detailed view of all time entries and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <div>Date</div>
              <div>Employee</div>
              <div>Project</div>
              <div>Start Time</div>
              <div>End Time</div>
              <div>Duration</div>
              <div>Actions</div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>Dec 18, 2024</div>
                <div>
                  <p className="font-medium">John Smith</p>
                </div>
                <div>Website Redesign</div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  9:00 AM
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  5:30 PM
                </div>
                <div className="font-medium">8.5 hrs</div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>Dec 18, 2024</div>
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                </div>
                <div>Marketing Campaign</div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  8:30 AM
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  4:30 PM
                </div>
                <div className="font-medium">8.0 hrs</div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>Dec 17, 2024</div>
                <div>
                  <p className="font-medium">Mike Davis</p>
                </div>
                <div>Project Planning</div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  9:15 AM
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  6:00 PM
                </div>
                <div className="font-medium">8.75 hrs</div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Summary of time entry data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">Total Entries Today</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">8.2</div>
              <div className="text-sm text-muted-foreground">Avg Hours/Employee</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Active Projects</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">95%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}