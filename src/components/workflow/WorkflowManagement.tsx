import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Settings, Clock, CheckCircle, XCircle, AlertTriangle, Activity, TestTube, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkflowTesting } from "./WorkflowTesting";

interface WorkflowDefinition {
  id: string;
  workflow_id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_value: string;
  is_active: boolean;
  steps: any;
  created_at: string;
  updated_at: string;
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: string;
  trigger_data: any;
  context_data: any;
  current_step: number;
  step_results: any;
  started_at: string;
  completed_at: string;
  error_message: string;
  scheduled_for: string;
}

interface WorkflowStep {
  id: string;
  execution_id: string;
  step_number: number;
  action: string;
  params: any;
  status: string;
  started_at: string;
  completed_at: string;
  error_message: string;
  retry_count: number;
}

export const WorkflowManagement = () => {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [realTimeStats, setRealTimeStats] = useState({
    totalExecutions: 0,
    runningExecutions: 0,
    completedExecutions: 0,
    failedExecutions: 0
  });

  useEffect(() => {
    fetchWorkflows();
    fetchExecutions();
    setupRealTimeUpdates();
  }, []);

  useEffect(() => {
    if (selectedExecution) {
      fetchWorkflowSteps(selectedExecution);
    }
  }, [selectedExecution]);

  const setupRealTimeUpdates = () => {
    const executionsChannel = supabase
      .channel('workflow-executions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'automation_executions'
        },
        () => {
          fetchExecutions();
          updateStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_steps'
        },
        () => {
          if (selectedExecution) {
            fetchWorkflowSteps(selectedExecution);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(executionsChannel);
    };
  };

  const updateStats = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_executions')
        .select('status');

      if (error) throw error;

      const stats = (data || []).reduce((acc, execution) => {
        acc.totalExecutions++;
        if (execution.status === 'running' || execution.status === 'pending') acc.runningExecutions++;
        if (execution.status === 'completed') acc.completedExecutions++;
        if (execution.status === 'failed') acc.failedExecutions++;
        return acc;
      }, { totalExecutions: 0, runningExecutions: 0, completedExecutions: 0, failedExecutions: 0 });

      setRealTimeStats(stats);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to load workflows');
    }
  };

  const fetchExecutions = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setExecutions(data || []);
      updateStats();
    } catch (error) {
      console.error('Error fetching executions:', error);
      toast.error('Failed to load executions');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowSteps = async (executionId: string) => {
    try {
      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('execution_id', executionId)
        .order('step_number', { ascending: true });

      if (error) throw error;
      setWorkflowSteps(data || []);
    } catch (error) {
      console.error('Error fetching workflow steps:', error);
      toast.error('Failed to load workflow steps');
    }
  };

  const toggleWorkflow = async (workflowId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_workflows')
        .update({ is_active: isActive })
        .eq('id', workflowId);

      if (error) throw error;

      setWorkflows(workflows.map(w => 
        w.id === workflowId ? { ...w, is_active: isActive } : w
      ));

      toast.success(`Workflow ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast.error('Failed to update workflow status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{realTimeStats.totalExecutions}</div>
                <div className="text-sm text-muted-foreground">Total Executions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
              <div>
                <div className="text-2xl font-bold">{realTimeStats.runningExecutions}</div>
                <div className="text-sm text-muted-foreground">Running</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{realTimeStats.completedExecutions}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{realTimeStats.failedExecutions}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="executions" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Executions
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Definitions</CardTitle>
              <CardDescription>
                Manage and monitor automated workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading workflows...</div>
              ) : (
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <Card key={workflow.id} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{workflow.name}</CardTitle>
                            <CardDescription>{workflow.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={workflow.is_active ? "default" : "secondary"}>
                              {workflow.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleWorkflow(workflow.id, !workflow.is_active)}
                            >
                              {workflow.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Trigger:</span> {workflow.trigger_type}
                            {workflow.trigger_value && ` (${workflow.trigger_value})`}
                          </div>
                          <div>
                            <span className="font-medium">Steps:</span> {workflow.steps ? workflow.steps.length : 0}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span> {new Date(workflow.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {workflow.steps && workflow.steps.length > 0 && (
                          <div className="mt-4">
                            <span className="font-medium text-sm">Workflow Steps:</span>
                            <div className="mt-2 space-y-1">
                              {workflow.steps.map((step: any, index: number) => (
                                <div key={index} className="text-sm bg-muted p-2 rounded flex items-center gap-2">
                                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                                    {index + 1}
                                  </span>
                                  <span className="font-medium">{step.action}</span>
                                  {step.params?.template && <span className="text-muted-foreground">({step.params.template})</span>}
                                  {step.params?.minutes && <span className="text-muted-foreground">({step.params.minutes}m delay)</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>
                Real-time workflow execution monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {executions.map((execution) => (
                  <Card key={execution.id} className={`cursor-pointer transition-colors ${
                    selectedExecution === execution.id ? 'border-primary' : ''
                  }`} onClick={() => setSelectedExecution(execution.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {execution.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {execution.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                            {execution.status === 'running' && <Clock className="h-4 w-4 text-blue-500 animate-pulse" />}
                            {execution.status === 'pending' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                            <Badge variant="outline">{execution.status}</Badge>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {workflows.find(w => w.id === execution.workflow_id)?.name || 'Unknown Workflow'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Started: {new Date(execution.started_at).toLocaleString()}
                            </div>
                            {execution.context_data?.company_name && (
                              <div className="text-xs text-muted-foreground">
                                Company: {execution.context_data.company_name}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Step {execution.current_step || 0}
                          </div>
                          {execution.error_message && (
                            <div className="text-xs text-red-500 max-w-xs truncate">
                              {execution.error_message}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {selectedExecution === execution.id && workflowSteps.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm font-medium mb-2">Step Details:</div>
                          <div className="space-y-2">
                            {workflowSteps.map((step) => (
                              <div key={step.id} className="flex items-center justify-between text-xs bg-muted p-2 rounded">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                                    {step.step_number}
                                  </span>
                                  <span>{step.action}</span>
                                  {step.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-500" />}
                                  {step.status === 'failed' && <XCircle className="h-3 w-3 text-red-500" />}
                                  {step.status === 'running' && <Clock className="h-3 w-3 text-blue-500 animate-pulse" />}
                                </div>
                                <div className="text-muted-foreground">
                                  {step.completed_at ? new Date(step.completed_at).toLocaleTimeString() : 
                                   step.started_at ? 'Running...' : 'Pending'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing">
          <WorkflowTesting />
        </TabsContent>
      </Tabs>
    </div>
  );
};