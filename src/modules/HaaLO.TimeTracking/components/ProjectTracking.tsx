import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Folder, Plus, Calendar, DollarSign } from "lucide-react";

export function ProjectTracking() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Tracking</h1>
          <p className="text-muted-foreground">Monitor time allocation across projects</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">2 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,600</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>Current project status and time allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Website Redesign</h4>
                <span className="text-sm text-muted-foreground">156 hours logged</span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Budget: $25,000</span>
                <span>Used: $18,750 (75%)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Mobile App Development</h4>
                <span className="text-sm text-muted-foreground">89 hours logged</span>
              </div>
              <Progress value={45} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Budget: $40,000</span>
                <span>Used: $18,000 (45%)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Marketing Campaign</h4>
                <span className="text-sm text-muted-foreground">67 hours logged</span>
              </div>
              <Progress value={60} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Budget: $15,000</span>
                <span>Used: $9,000 (60%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Project Activity</CardTitle>
          <CardDescription>Latest time entries by project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Website Redesign</p>
                <p className="text-sm text-muted-foreground">John Smith - 4.5 hours</p>
              </div>
              <div className="text-sm text-muted-foreground">2 hours ago</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Mobile App Development</p>
                <p className="text-sm text-muted-foreground">Sarah Johnson - 6.0 hours</p>
              </div>
              <div className="text-sm text-muted-foreground">4 hours ago</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Marketing Campaign</p>
                <p className="text-sm text-muted-foreground">Mike Davis - 3.5 hours</p>
              </div>
              <div className="text-sm text-muted-foreground">6 hours ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}