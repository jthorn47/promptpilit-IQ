import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, RefreshCw, Settings, Plus, Eye, Trash2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RenewalSchedule {
  id: string;
  training_module_id: string;
  company_id: string | null;
  renewal_period_months: number;
  grace_period_days: number;
  auto_assign: boolean;
  is_active: boolean;
  next_renewal_check: string | null;
  created_at: string;
  updated_at: string;
  training_modules?: {
    title: string;
    status: string;
  };
}

interface RenewalHistory {
  id: string;
  employee_id: string;
  training_module_id: string;
  renewal_date: string;
  renewal_type: string;
  status: string;
  due_date: string | null;
  employees?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  training_modules?: {
    title: string;
  };
}

interface TrainingModule {
  id: string;
  title: string;
  status: string;
}

export const AdminRenewals = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<RenewalSchedule[]>([]);
  const [history, setHistory] = useState<RenewalHistory[]>([]);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [newSchedule, setNewSchedule] = useState({
    training_module_id: '',
    renewal_period_months: 12,
    grace_period_days: 30,
    auto_assign: true,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch renewal schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('renewal_schedules')
        .select(`
          *,
          training_modules (title, status)
        `)
        .order('created_at', { ascending: false });

      if (schedulesError) throw schedulesError;

      // Fetch renewal history
      const { data: historyData, error: historyError } = await supabase
        .from('renewal_history')
        .select(`
          *,
          employees (first_name, last_name, email),
          training_modules (title)
        `)
        .order('renewal_date', { ascending: false })
        .limit(50);

      if (historyError) throw historyError;

      // Fetch training modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('training_modules')
        .select('id, title, status')
        .eq('status', 'published')
        .order('title');

      if (modulesError) throw modulesError;

      setSchedules(schedulesData || []);
      setHistory(historyData || []);
      setModules(modulesData || []);
    } catch (error) {
      console.error('Error fetching renewal data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch renewal data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async () => {
    try {
      const { error } = await supabase
        .from('renewal_schedules')
        .insert([newSchedule]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Renewal schedule created successfully",
      });

      setIsCreateDialogOpen(false);
      setNewSchedule({
        training_module_id: '',
        renewal_period_months: 12,
        grace_period_days: 30,
        auto_assign: true,
        is_active: true
      });
      fetchData();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create renewal schedule",
        variant: "destructive",
      });
    }
  };

  const toggleScheduleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('renewal_schedules')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Schedule ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchData();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule status",
        variant: "destructive",
      });
    }
  };

  const processRenewals = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.rpc('process_automatic_renewals');

      if (error) throw error;

      toast({
        title: "Success",
        description: "Renewal processing completed successfully",
      });

      fetchData();
    } catch (error) {
      console.error('Error processing renewals:', error);
      toast({
        title: "Error",
        description: "Failed to process renewals",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('renewal_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Renewal schedule deleted successfully",
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete renewal schedule",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      assigned: { variant: "default" as const, label: "Assigned" },
      completed: { variant: "default" as const, label: "Completed" },
      overdue: { variant: "destructive" as const, label: "Overdue" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeSchedules = schedules.filter(s => s.is_active).length;
  const totalRenewalsThisMonth = history.filter(h => 
    new Date(h.renewal_date).getMonth() === new Date().getMonth()
  ).length;
  const overdueRenewals = history.filter(h => 
    h.status === 'assigned' && h.due_date && new Date(h.due_date) < new Date()
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Renewals</h1>
          <p className="text-muted-foreground">Manage automatic course renewal schedules and history</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={processRenewals}
            disabled={isProcessing}
            variant="outline"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Process Renewals
              </>
            )}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Renewal Schedule</DialogTitle>
                <DialogDescription>
                  Set up automatic renewal for a training module
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="module">Training Module</Label>
                  <Select
                    value={newSchedule.training_module_id}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, training_module_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select training module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="renewal-months">Renewal Period (Months)</Label>
                    <Input
                      id="renewal-months"
                      type="number"
                      min="1"
                      max="60"
                      value={newSchedule.renewal_period_months}
                      onChange={(e) => setNewSchedule({
                        ...newSchedule,
                        renewal_period_months: parseInt(e.target.value) || 12
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="grace-days">Grace Period (Days)</Label>
                    <Input
                      id="grace-days"
                      type="number"
                      min="0"
                      max="365"
                      value={newSchedule.grace_period_days}
                      onChange={(e) => setNewSchedule({
                        ...newSchedule,
                        grace_period_days: parseInt(e.target.value) || 30
                      })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-assign"
                    checked={newSchedule.auto_assign}
                    onCheckedChange={(checked) => setNewSchedule({
                      ...newSchedule,
                      auto_assign: checked
                    })}
                  />
                  <Label htmlFor="auto-assign">Auto-assign renewals</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={newSchedule.is_active}
                    onCheckedChange={(checked) => setNewSchedule({
                      ...newSchedule,
                      is_active: checked
                    })}
                  />
                  <Label htmlFor="is-active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createSchedule} disabled={!newSchedule.training_module_id}>
                  Create Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSchedules}</div>
            <p className="text-xs text-muted-foreground">
              out of {schedules.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRenewalsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              renewals processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueRenewals}</div>
            <p className="text-xs text-muted-foreground">
              past due date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Processing</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {schedules.filter(s => s.auto_assign && s.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              automated schedules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="schedules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedules">Renewal Schedules</TabsTrigger>
          <TabsTrigger value="history">Renewal History</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Renewal Schedules</CardTitle>
              <CardDescription>
                Configure automatic renewal schedules for training modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No renewal schedules</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first renewal schedule to automate course renewals
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Schedule
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Training Module</TableHead>
                      <TableHead>Renewal Period</TableHead>
                      <TableHead>Grace Period</TableHead>
                      <TableHead>Auto-Assign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Check</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          {schedule.training_modules?.title || 'Unknown Module'}
                        </TableCell>
                        <TableCell>{schedule.renewal_period_months} months</TableCell>
                        <TableCell>{schedule.grace_period_days} days</TableCell>
                        <TableCell>
                          <Badge variant={schedule.auto_assign ? "default" : "secondary"}>
                            {schedule.auto_assign ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={schedule.is_active ? "default" : "secondary"}>
                            {schedule.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {schedule.next_renewal_check 
                            ? new Date(schedule.next_renewal_check).toLocaleDateString()
                            : 'Not scheduled'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleScheduleStatus(schedule.id, schedule.is_active)}
                            >
                              {schedule.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSchedule(schedule.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Renewal History</CardTitle>
              <CardDescription>
                Track renewal assignments and their completion status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No renewal history</h3>
                  <p className="text-muted-foreground">
                    Renewal history will appear here once renewals are processed
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Training Module</TableHead>
                      <TableHead>Renewal Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.employees?.first_name} {item.employees?.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.employees?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.training_modules?.title}</TableCell>
                        <TableCell>
                          {new Date(item.renewal_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {item.due_date 
                            ? new Date(item.due_date).toLocaleDateString()
                            : 'No due date'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.renewal_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};