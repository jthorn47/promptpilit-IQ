import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, AlertCircle } from "lucide-react";

export function TimeApprovals() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Time Approvals</h1>
          <p className="text-muted-foreground">Review and approve employee time entries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Check className="h-4 w-4 mr-2" />
            Approve All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Requiring your review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Reviews</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Past approval deadline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Entries processed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Time Entries</CardTitle>
          <CardDescription>Employee time entries awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <div>Employee</div>
              <div>Date</div>
              <div>Hours</div>
              <div>Project</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-6 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-muted-foreground">Software Engineer</p>
                </div>
                <div>Dec 18, 2024</div>
                <div className="font-medium">8.5 hrs</div>
                <div>Website Redesign</div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline">
                    <Check className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    <X className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Marketing Manager</p>
                </div>
                <div>Dec 17, 2024</div>
                <div className="font-medium">7.0 hrs</div>
                <div>Marketing Campaign</div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Overdue
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline">
                    <Check className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    <X className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Mike Davis</p>
                  <p className="text-sm text-muted-foreground">Project Manager</p>
                </div>
                <div>Dec 18, 2024</div>
                <div className="font-medium">9.5 hrs</div>
                <div>Project Planning</div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Overtime
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline">
                    <Check className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    <X className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approval History</CardTitle>
          <CardDescription>Recently processed time entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Emily Chen - 8.0 hours</p>
                <p className="text-sm text-muted-foreground">Approved on Dec 18, 2024 at 10:30 AM</p>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Approved
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Tom Wilson - 6.5 hours</p>
                <p className="text-sm text-muted-foreground">Approved on Dec 18, 2024 at 9:15 AM</p>
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