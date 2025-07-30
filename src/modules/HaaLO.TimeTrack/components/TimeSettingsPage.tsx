import React, { useState } from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Settings, 
  Code, 
  FolderOpen, 
  Clock, 
  Bell,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import { useTimeSettings } from '../hooks/useTimeSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';

interface TimeCodeForm {
  code: string;
  name: string;
  description?: string;
  category: 'work' | 'pto' | 'training' | 'admin' | 'other';
  is_paid: boolean;
  is_billable: boolean;
  is_active: boolean;
  requires_approval: boolean;
  color_code: string;
  sort_order: number;
}

interface TimeProjectForm {
  name: string;
  client_name?: string;
  project_code?: string;
  description?: string;
  is_billable: boolean;
  is_active: boolean;
  default_hourly_rate?: number;
  budget_hours?: number;
}

export const TimeSettingsPage: React.FC = () => {
  const { companyId } = useAuth();
  const {
    timeCodes,
    isLoadingTimeCodes,
    createTimeCode,
    updateTimeCode,
    deleteTimeCode,
    timeProjects,
    isLoadingTimeProjects,
    createTimeProject,
    updateTimeProject,
    deleteTimeProject,
    timeSettings,
    isLoadingTimeSettings,
    updateTimeSettings,
    isUpdatingTimeSettings
  } = useTimeSettings();

  const [timeCodeDialogOpen, setTimeCodeDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingTimeCode, setEditingTimeCode] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);

  const timeCodeForm = useForm<TimeCodeForm>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      category: 'work',
      is_paid: true,
      is_billable: false,
      is_active: true,
      requires_approval: false,
      color_code: '#655DC6',
      sort_order: 0
    }
  });

  const projectForm = useForm<TimeProjectForm>({
    defaultValues: {
      name: '',
      client_name: '',
      project_code: '',
      description: '',
      is_billable: false,
      is_active: true,
      default_hourly_rate: undefined,
      budget_hours: undefined
    }
  });

  const settingsForm = useForm({
    defaultValues: timeSettings || {
      overtime_threshold_daily: 8,
      overtime_threshold_weekly: 40,
      auto_break_minutes: 30,
      require_notes_for_overtime: false,
      require_project_for_billable: true,
      allow_mobile_entry: true,
      require_manager_approval: false,
      require_time_approval: false,
      allow_future_entries: false,
      auto_submit_timesheet: false,
      enforce_break_rules: false,
      max_hours_per_day: 12,
      minimum_break_minutes: 30,
      time_entry_method: 'manual' as const,
      reminder_enabled: false,
      reminder_time: '09:00',
      reminder_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timezone: 'UTC'
    }
  });

  // Update form when settings load
  React.useEffect(() => {
    if (timeSettings) {
      settingsForm.reset(timeSettings);
    }
  }, [timeSettings, settingsForm]);

  const handleTimeCodeSubmit = (data: TimeCodeForm) => {
    if (editingTimeCode) {
      updateTimeCode({ ...data, id: editingTimeCode.id });
    } else {
      createTimeCode({ ...data, company_id: companyId });
    }
    setTimeCodeDialogOpen(false);
    setEditingTimeCode(null);
    timeCodeForm.reset();
  };

  const handleProjectSubmit = (data: TimeProjectForm) => {
    if (editingProject) {
      updateTimeProject({ ...data, id: editingProject.id });
    } else {
      createTimeProject({ ...data, company_id: companyId });
    }
    setProjectDialogOpen(false);
    setEditingProject(null);
    projectForm.reset();
  };

  const handleSettingsSubmit = (data: any) => {
    updateTimeSettings(data);
  };

  const openEditTimeCode = (timeCode: any) => {
    setEditingTimeCode(timeCode);
    timeCodeForm.reset(timeCode);
    setTimeCodeDialogOpen(true);
  };

  const openEditProject = (project: any) => {
    setEditingProject(project);
    projectForm.reset(project);
    setProjectDialogOpen(true);
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'work': return 'default';
      case 'pto': return 'secondary';
      case 'training': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <UnifiedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Time Tracking Settings</h1>
            <p className="text-muted-foreground">Configure time codes, projects, and tracking rules</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Admin Configuration</span>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="time-codes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="time-codes" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Time Codes
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="overtime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Overtime Rules
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminders
            </TabsTrigger>
          </TabsList>

          {/* Time Codes Tab */}
          <TabsContent value="time-codes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Time Codes</CardTitle>
                  <Dialog open={timeCodeDialogOpen} onOpenChange={setTimeCodeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingTimeCode(null);
                        timeCodeForm.reset();
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTimeCode ? 'Edit Time Code' : 'Add New Time Code'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={timeCodeForm.handleSubmit(handleTimeCodeSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="code">Code</Label>
                            <Input
                              id="code"
                              {...timeCodeForm.register('code', { required: true })}
                              placeholder="e.g., REG"
                            />
                          </div>
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              {...timeCodeForm.register('name', { required: true })}
                              placeholder="e.g., Regular Time"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            {...timeCodeForm.register('description')}
                            placeholder="Optional description"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select 
                              value={timeCodeForm.watch('category')} 
                              onValueChange={(value) => timeCodeForm.setValue('category', value as any)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="work">Work</SelectItem>
                                <SelectItem value="pto">PTO</SelectItem>
                                <SelectItem value="training">Training</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="color_code">Color</Label>
                            <Input
                              id="color_code"
                              type="color"
                              {...timeCodeForm.register('color_code')}
                              className="h-10 w-full"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is_paid"
                              checked={timeCodeForm.watch('is_paid')}
                              onCheckedChange={(checked) => timeCodeForm.setValue('is_paid', checked)}
                            />
                            <Label htmlFor="is_paid">Paid</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is_billable"
                              checked={timeCodeForm.watch('is_billable')}
                              onCheckedChange={(checked) => timeCodeForm.setValue('is_billable', checked)}
                            />
                            <Label htmlFor="is_billable">Billable</Label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="requires_approval"
                              checked={timeCodeForm.watch('requires_approval')}
                              onCheckedChange={(checked) => timeCodeForm.setValue('requires_approval', checked)}
                            />
                            <Label htmlFor="requires_approval">Requires Approval</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is_active"
                              checked={timeCodeForm.watch('is_active')}
                              onCheckedChange={(checked) => timeCodeForm.setValue('is_active', checked)}
                            />
                            <Label htmlFor="is_active">Active</Label>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setTimeCodeDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingTimeCode ? 'Update' : 'Create'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTimeCodes ? (
                  <div className="animate-pulse space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {timeCodes.map((timeCode) => (
                      <div
                        key={timeCode.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: timeCode.color_code }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{timeCode.name}</span>
                              <code className="px-2 py-1 bg-muted rounded text-xs">{timeCode.code}</code>
                              <Badge variant={getCategoryBadgeVariant(timeCode.category)}>
                                {timeCode.category}
                              </Badge>
                              {timeCode.is_paid && <Badge variant="outline">Paid</Badge>}
                              {timeCode.is_billable && <Badge variant="outline">Billable</Badge>}
                              {!timeCode.is_active && <Badge variant="destructive">Inactive</Badge>}
                            </div>
                            {timeCode.description && (
                              <p className="text-sm text-muted-foreground">{timeCode.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditTimeCode(timeCode)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTimeCode(timeCode.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Projects</CardTitle>
                  <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingProject(null);
                        projectForm.reset();
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProject ? 'Edit Project' : 'Add New Project'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={projectForm.handleSubmit(handleProjectSubmit)} className="space-y-4">
                        <div>
                          <Label htmlFor="project-name">Project Name</Label>
                          <Input
                            id="project-name"
                            {...projectForm.register('name', { required: true })}
                            placeholder="e.g., Website Redesign"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="client_name">Client Name</Label>
                            <Input
                              id="client_name"
                              {...projectForm.register('client_name')}
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <Label htmlFor="project_code">Project Code</Label>
                            <Input
                              id="project_code"
                              {...projectForm.register('project_code')}
                              placeholder="e.g., WEB-001"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="project-description">Description</Label>
                          <Input
                            id="project-description"
                            {...projectForm.register('description')}
                            placeholder="Optional description"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="default_hourly_rate">Hourly Rate ($)</Label>
                            <Input
                              id="default_hourly_rate"
                              type="number"
                              step="0.01"
                              {...projectForm.register('default_hourly_rate', { valueAsNumber: true })}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="budget_hours">Budget Hours</Label>
                            <Input
                              id="budget_hours"
                              type="number"
                              step="0.25"
                              {...projectForm.register('budget_hours', { valueAsNumber: true })}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="project-is_billable"
                              checked={projectForm.watch('is_billable')}
                              onCheckedChange={(checked) => projectForm.setValue('is_billable', checked)}
                            />
                            <Label htmlFor="project-is_billable">Billable</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="project-is_active"
                              checked={projectForm.watch('is_active')}
                              onCheckedChange={(checked) => projectForm.setValue('is_active', checked)}
                            />
                            <Label htmlFor="project-is_active">Active</Label>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setProjectDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingProject ? 'Update' : 'Create'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTimeProjects ? (
                  <div className="animate-pulse space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {timeProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{project.name}</span>
                            {project.project_code && (
                              <code className="px-2 py-1 bg-muted rounded text-xs">{project.project_code}</code>
                            )}
                            {project.is_billable && <Badge variant="outline">Billable</Badge>}
                            {!project.is_active && <Badge variant="destructive">Inactive</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {project.client_name && <span>Client: {project.client_name}</span>}
                            {project.default_hourly_rate && (
                              <span className="ml-4">Rate: ${project.default_hourly_rate}/hr</span>
                            )}
                            {project.budget_hours && (
                              <span className="ml-4">Budget: {project.budget_hours}h</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditProject(project)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTimeProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overtime Rules Tab */}
          <TabsContent value="overtime">
            <Card>
              <CardHeader>
                <CardTitle>Overtime & Compliance Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="overtime_threshold_daily">Daily Overtime Threshold (hours)</Label>
                      <Input
                        id="overtime_threshold_daily"
                        type="number"
                        step="0.25"
                        {...settingsForm.register('overtime_threshold_daily', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="overtime_threshold_weekly">Weekly Overtime Threshold (hours)</Label>
                      <Input
                        id="overtime_threshold_weekly"
                        type="number"
                        step="0.25"
                        {...settingsForm.register('overtime_threshold_weekly', { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="max_hours_per_day">Maximum Hours Per Day</Label>
                      <Input
                        id="max_hours_per_day"
                        type="number"
                        step="0.25"
                        {...settingsForm.register('max_hours_per_day', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="minimum_break_minutes">Minimum Break (minutes)</Label>
                      <Input
                        id="minimum_break_minutes"
                        type="number"
                        {...settingsForm.register('minimum_break_minutes', { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="require_notes_for_overtime">Require Notes for Overtime</Label>
                        <p className="text-sm text-muted-foreground">Employees must add notes when logging overtime</p>
                      </div>
                      <Switch
                        id="require_notes_for_overtime"
                        checked={settingsForm.watch('require_notes_for_overtime')}
                        onCheckedChange={(checked) => settingsForm.setValue('require_notes_for_overtime', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enforce_break_rules">Enforce Break Rules</Label>
                        <p className="text-sm text-muted-foreground">Automatically enforce minimum break requirements</p>
                      </div>
                      <Switch
                        id="enforce_break_rules"
                        checked={settingsForm.watch('enforce_break_rules')}
                        onCheckedChange={(checked) => settingsForm.setValue('enforce_break_rules', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="require_manager_approval">Require Manager Approval</Label>
                        <p className="text-sm text-muted-foreground">All time entries need manager approval</p>
                      </div>
                      <Switch
                        id="require_manager_approval"
                        checked={settingsForm.watch('require_manager_approval')}
                        onCheckedChange={(checked) => settingsForm.setValue('require_manager_approval', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdatingTimeSettings}>
                      <Save className="h-4 w-4 mr-2" />
                      {isUpdatingTimeSettings ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders">
            <Card>
              <CardHeader>
                <CardTitle>Reminder Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reminder_enabled">Enable Reminders</Label>
                      <p className="text-sm text-muted-foreground">Send automatic time entry reminders</p>
                    </div>
                    <Switch
                      id="reminder_enabled"
                      checked={settingsForm.watch('reminder_enabled')}
                      onCheckedChange={(checked) => settingsForm.setValue('reminder_enabled', checked)}
                    />
                  </div>

                  {settingsForm.watch('reminder_enabled') && (
                    <>
                      <div>
                        <Label htmlFor="reminder_time">Reminder Time</Label>
                        <Input
                          id="reminder_time"
                          type="time"
                          {...settingsForm.register('reminder_time')}
                        />
                      </div>

                      <div>
                        <Label>Reminder Days</Label>
                        <div className="grid grid-cols-7 gap-2 mt-2">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                            <div key={day} className="flex items-center space-x-2">
                              <Switch
                                id={day}
                                checked={settingsForm.watch('reminder_days')?.includes(day)}
                                onCheckedChange={(checked) => {
                                  const currentDays = settingsForm.watch('reminder_days') || [];
                                  if (checked) {
                                    settingsForm.setValue('reminder_days', [...currentDays, day]);
                                  } else {
                                    settingsForm.setValue('reminder_days', currentDays.filter(d => d !== day));
                                  }
                                }}
                              />
                              <Label htmlFor={day} className="text-sm capitalize">{day.slice(0, 3)}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdatingTimeSettings}>
                      <Save className="h-4 w-4 mr-2" />
                      {isUpdatingTimeSettings ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedLayout>
  );
};