import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Zap, Users } from "lucide-react";

export const TasksWorkflowsConfig = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tasks & Workflows</h1>
        <p className="text-muted-foreground">Automated task management and customizable workflow builders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> created today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              8 automated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Participating
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common workflow and task operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Create New Task
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              Build Workflow
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              View Overdue Tasks
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Assign Team Tasks
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Templates</CardTitle>
            <CardDescription>Pre-built workflows for common processes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Employee Onboarding</p>
                  <p className="text-sm text-muted-foreground">15 steps, 3-day duration</p>
                </div>
                <Button size="sm" variant="outline">Use</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Document Approval</p>
                  <p className="text-sm text-muted-foreground">5 steps, auto-routing</p>
                </div>
                <Button size="sm" variant="outline">Use</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Project Kickoff</p>
                  <p className="text-sm text-muted-foreground">8 steps, milestone tracking</p>
                </div>
                <Button size="sm" variant="outline">Use</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest task and workflow updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Task completed</p>
                <p className="text-sm text-muted-foreground">Review Q4 budget proposal</p>
              </div>
              <span className="text-sm text-muted-foreground">30m ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Workflow triggered</p>
                <p className="text-sm text-muted-foreground">New employee onboarding - Sarah Johnson</p>
              </div>
              <span className="text-sm text-muted-foreground">1h ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Task assigned</p>
                <p className="text-sm text-muted-foreground">Update company policies to Mike Wilson</p>
              </div>
              <span className="text-sm text-muted-foreground">2h ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};