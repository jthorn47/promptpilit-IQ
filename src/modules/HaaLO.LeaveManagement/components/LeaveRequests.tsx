import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Search, Filter } from "lucide-react";

export function LeaveRequests() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Requests</h1>
          <p className="text-muted-foreground">Manage employee leave requests and submissions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
          <CardDescription>Review and manage employee leave submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search requests..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <div>Employee</div>
              <div>Leave Type</div>
              <div>Start Date</div>
              <div>End Date</div>
              <div>Days</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Marketing Manager</p>
                </div>
                <div>Vacation</div>
                <div>Dec 23, 2024</div>
                <div>Dec 27, 2024</div>
                <div className="font-medium">5 days</div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
                <div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Mike Davis</p>
                  <p className="text-sm text-muted-foreground">Project Manager</p>
                </div>
                <div>Sick Leave</div>
                <div>Dec 19, 2024</div>
                <div>Dec 19, 2024</div>
                <div className="font-medium">1 day</div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Approved
                  </span>
                </div>
                <div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-4 items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Emily Chen</p>
                  <p className="text-sm text-muted-foreground">Software Engineer</p>
                </div>
                <div>Personal</div>
                <div>Jan 2, 2025</div>
                <div>Jan 3, 2025</div>
                <div className="font-medium">2 days</div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Submitted
                  </span>
                </div>
                <div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}