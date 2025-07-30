import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, Workflow, Settings, Save, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TasksWorkflowsConfigProps {
  onBack: () => void;
  clientId?: string;
}

export const TasksWorkflowsConfig = ({ onBack, clientId }: TasksWorkflowsConfigProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    automaticAssignment: true,
    priorityLevels: true,
    dueDateReminders: true,
    workflowTemplates: true,
    customFields: false,
    timeTracking: true,
    dependencies: true,
    approvalSteps: false,
    notifications: true,
    reporting: true,
    integration: false,
    kanbanView: true,
    ganttChart: false,
    recurringTasks: true,
    maxTasksPerUser: 50,
    reminderDays: 3,
    escalationHours: 24
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuration Saved",
        description: "Tasks & Workflows settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Modules
        </Button>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Tasks & Workflows Configuration</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Task Management
            </CardTitle>
            <CardDescription>
              Configure core task management features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="automatic-assignment" className="text-sm font-medium">
                Automatic Assignment
              </Label>
              <Switch
                id="automatic-assignment"
                checked={config.automaticAssignment}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, automaticAssignment: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="priority-levels" className="text-sm font-medium">
                Priority Levels
              </Label>
              <Switch
                id="priority-levels"
                checked={config.priorityLevels}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, priorityLevels: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="due-date-reminders" className="text-sm font-medium">
                Due Date Reminders
              </Label>
              <Switch
                id="due-date-reminders"
                checked={config.dueDateReminders}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, dueDateReminders: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="time-tracking" className="text-sm font-medium">
                Time Tracking
              </Label>
              <Switch
                id="time-tracking"
                checked={config.timeTracking}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, timeTracking: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="dependencies" className="text-sm font-medium">
                Task Dependencies
              </Label>
              <Switch
                id="dependencies"
                checked={config.dependencies}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, dependencies: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="recurring-tasks" className="text-sm font-medium">
                Recurring Tasks
              </Label>
              <Switch
                id="recurring-tasks"
                checked={config.recurringTasks}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, recurringTasks: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Workflow Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Workflow Features
            </CardTitle>
            <CardDescription>
              Configure workflow automation and collaboration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="workflow-templates" className="text-sm font-medium">
                Workflow Templates
              </Label>
              <Switch
                id="workflow-templates"
                checked={config.workflowTemplates}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, workflowTemplates: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="approval-steps" className="text-sm font-medium">
                Approval Steps
              </Label>
              <Switch
                id="approval-steps"
                checked={config.approvalSteps}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, approvalSteps: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-fields" className="text-sm font-medium">
                Custom Fields
              </Label>
              <Switch
                id="custom-fields"
                checked={config.customFields}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, customFields: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm font-medium">
                Notifications
              </Label>
              <Switch
                id="notifications"
                checked={config.notifications}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, notifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="reporting" className="text-sm font-medium">
                Advanced Reporting
              </Label>
              <Switch
                id="reporting"
                checked={config.reporting}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, reporting: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="integration" className="text-sm font-medium">
                External Integrations
              </Label>
              <Switch
                id="integration"
                checked={config.integration}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, integration: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Views & Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Views & Interface
            </CardTitle>
            <CardDescription>
              Configure user interface and viewing options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="kanban-view" className="text-sm font-medium">
                Kanban Board View
              </Label>
              <Switch
                id="kanban-view"
                checked={config.kanbanView}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, kanbanView: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="gantt-chart" className="text-sm font-medium">
                Gantt Chart View
              </Label>
              <Switch
                id="gantt-chart"
                checked={config.ganttChart}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ganttChart: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Configuration Settings
            </CardTitle>
            <CardDescription>
              Customize system parameters and limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max-tasks">Max Tasks Per User</Label>
              <Input
                id="max-tasks"
                type="number"
                value={config.maxTasksPerUser}
                onChange={(e) => setConfig(prev => ({ ...prev, maxTasksPerUser: parseInt(e.target.value) || 0 }))}
                min="1"
                max="200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminder-days">Reminder Days Before Due</Label>
              <Input
                id="reminder-days"
                type="number"
                value={config.reminderDays}
                onChange={(e) => setConfig(prev => ({ ...prev, reminderDays: parseInt(e.target.value) || 0 }))}
                min="0"
                max="30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="escalation-hours">Escalation Hours After Due</Label>
              <Input
                id="escalation-hours"
                type="number"
                value={config.escalationHours}
                onChange={(e) => setConfig(prev => ({ ...prev, escalationHours: parseInt(e.target.value) || 0 }))}
                min="1"
                max="168"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Modules
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
};