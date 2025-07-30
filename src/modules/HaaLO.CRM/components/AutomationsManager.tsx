import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAutomations } from '../hooks/useAutomations';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Workflow,
  Zap,
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Target,
  CheckCircle,
  Activity,
  TrendingUp,
  Settings
} from 'lucide-react';

// CRM-specific trigger and action types
const CRM_TRIGGER_TYPES = {
  deal_risk_change: 'Deal Risk Change',
  deal_stage_change: 'Deal Stage Change', 
  no_activity_threshold: 'No Activity Threshold',
  proposal_sent: 'Proposal Sent',
  lead_score_change: 'Lead Score Change',
  time_based: 'Time Based'
};

const CRM_ACTION_TYPES = {
  create_task: 'Create Task',
  send_notification: 'Send Notification',
  assign_deal: 'Assign Deal',
  change_stage: 'Change Stage',
  trigger_proposal_builder: 'Trigger Proposal Builder',
  send_email: 'Send Email'
};

export const AutomationsManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { 
    automations, 
    metrics, 
    loading, 
    toggleAutomation, 
    deleteAutomation,
    getExecutionHistory,
    getLastExecution
  } = useAutomations();

  const handleDeleteAutomation = async (id: string) => {
    if (confirm('Are you sure you want to delete this automation?')) {
      await deleteAutomation(id);
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    const icons: Record<string, React.ReactNode> = {
      deal_risk_change: <AlertTriangle className="h-4 w-4" />,
      deal_stage_change: <TrendingUp className="h-4 w-4" />,
      no_activity_threshold: <Clock className="h-4 w-4" />,
      proposal_sent: <Mail className="h-4 w-4" />,
      lead_score_change: <Target className="h-4 w-4" />,
      time_based: <Clock className="h-4 w-4" />
    };

    return icons[triggerType] || <Workflow className="h-4 w-4" />;
  };

  const getActionIcon = (actionType: string) => {
    const icons: Record<string, React.ReactNode> = {
      create_task: <CheckCircle className="h-4 w-4" />,
      send_notification: <Activity className="h-4 w-4" />,
      assign_deal: <Target className="h-4 w-4" />,
      change_stage: <TrendingUp className="h-4 w-4" />,
      trigger_proposal_builder: <Settings className="h-4 w-4" />,
      send_email: <Mail className="h-4 w-4" />
    };

    return icons[actionType] || <Zap className="h-4 w-4" />;
  };

  const formatTriggerType = (triggerType: string) => {
    return CRM_TRIGGER_TYPES[triggerType as keyof typeof CRM_TRIGGER_TYPES] || triggerType;
  };

  const formatActionType = (actionType: string) => {
    return CRM_ACTION_TYPES[actionType as keyof typeof CRM_ACTION_TYPES] || actionType;
  };

  const getExecutionCount = (workflowId: string) => {
    return getExecutionHistory(workflowId).length;
  };


  const filteredAutomations = automations.filter(automation =>
    automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (automation.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automations</h1>
          <p className="text-muted-foreground">
            Create if/then rules to automate your sales process
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Workflow className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalActive}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalExecutions}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.recentExecutions}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search automations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>

        {/* Automations Table */}
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Automation</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Executions</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading automations...
                  </TableCell>
                </TableRow>
              ) : filteredAutomations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No automations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAutomations.map((automation) => (
                  <TableRow key={automation.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={automation.is_active}
                          onCheckedChange={() => toggleAutomation(automation.id, !automation.is_active)}
                        />
                        {automation.is_active ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{automation.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {automation.description || 'No description provided'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTriggerIcon(automation.trigger_type)}
                        <div>
                          <div className="font-medium text-sm">
                            {formatTriggerType(automation.trigger_type)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {automation.trigger_value || 'No conditions set'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getActionIcon(automation.steps?.action_type || 'create_task')}
                        <div>
                          <div className="font-medium text-sm">
                            {formatActionType(automation.steps?.action_type || 'create_task')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {automation.steps?.action_details || 'No action details'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{getExecutionCount(automation.id)}</div>
                      <div className="text-xs text-muted-foreground">times</div>
                    </TableCell>
                    <TableCell>
                      {getLastExecution(automation.id) ? (
                        <div>
                          <div className="text-sm">
                            {new Date(getLastExecution(automation.id)!).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(getLastExecution(automation.id)!).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Never</div>
                      )}
                    </TableCell>
                    <TableCell>{automation.created_by}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Automation</DropdownMenuItem>
                          <DropdownMenuItem>Test Run</DropdownMenuItem>
                          <DropdownMenuItem>View Execution Log</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteAutomation(automation.id)}
                          >
                            Delete Automation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Automation Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Automation Templates</CardTitle>
          <CardDescription>Quick-start templates for common sales automation scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h4 className="font-semibold">Risk Alert System</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically create tasks when deal risk scores exceed thresholds
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <h4 className="font-semibold">Activity Nudges</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send reminders when deals have no activity for specified periods
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <h4 className="font-semibold">Lead Routing</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Auto-assign high-quality leads to the most appropriate sales reps
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};