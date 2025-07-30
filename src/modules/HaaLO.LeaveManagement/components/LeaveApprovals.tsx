import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, AlertCircle } from "lucide-react";

export function LeaveApprovals() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Approvals</h1>
          <p className="text-muted-foreground">Review and approve employee leave requests</p>
        </div>
        <Button variant="outline">
          <Check className="h-4 w-4 mr-2" />
          Approve All Eligible
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Awaiting your review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Requests processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Reviews</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
          <CardDescription>Employee requests awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <div>Employee</div>
              <div>Leave Type</div>
              <div>Dates</div>
              <div>Duration</div>
              <div>Priority</div>
              <div>Actions</div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-6 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Marketing Manager</p>
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Vacation
                  </span>
                </div>
                <div>
                  <p className="text-sm">Dec 23 - Dec 27</p>
                  <p className="text-xs text-muted-foreground">Christmas Week</p>
                </div>
                <div className="font-medium">5 days</div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Urgent
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline">
                    <Check className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    <X className="h-3 w-3 mr-1" />
                    Deny
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Emily Chen</p>
                  <p className="text-sm text-muted-foreground">Software Engineer</p>
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Personal
                  </span>
                </div>
                <div>
                  <p className="text-sm">Jan 2 - Jan 3</p>
                  <p className="text-xs text-muted-foreground">Family event</p>
                </div>
                <div className="font-medium">2 days</div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Normal
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline">
                    <Check className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    <X className="h-3 w-3 mr-1" />
                    Deny
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Approval Activity</CardTitle>
          <CardDescription>Recently processed leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Mike Davis - Sick Leave (1 day)</p>
                <p className="text-sm text-muted-foreground">Approved 2 hours ago</p>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Approved
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Tom Wilson - Vacation (3 days)</p>
                <p className="text-sm text-muted-foreground">Approved yesterday</p>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Approved
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}