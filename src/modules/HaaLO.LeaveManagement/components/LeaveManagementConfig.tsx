import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Settings } from "lucide-react";

export const LeaveManagementConfig = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <p className="text-muted-foreground">Streamlined PTO requests, approvals, and accrual tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees on Leave</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Currently out of office
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3d</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.5d</span> improvement
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common leave management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              View Leave Calendar
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Review Pending Requests
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Leave Policies
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configure Accrual Rules
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest leave management updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">John Doe requested vacation</p>
                  <p className="text-sm text-muted-foreground">3 days from Dec 23-25</p>
                </div>
                <span className="text-sm text-muted-foreground">2h ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sarah Smith approved</p>
                  <p className="text-sm text-muted-foreground">Mike Johnson's sick leave</p>
                </div>
                <span className="text-sm text-muted-foreground">4h ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Policy updated</p>
                  <p className="text-sm text-muted-foreground">Annual PTO accrual rate changed</p>
                </div>
                <span className="text-sm text-muted-foreground">1d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};