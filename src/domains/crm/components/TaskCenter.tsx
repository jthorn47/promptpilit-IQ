import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Filter,
  Search,
  Check,
  X,
  Edit
} from 'lucide-react';
import { useCrmTasks, useCrmTaskMutations, CreateTaskData } from '../hooks/useCrmTasks';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface TaskCenterProps {
  filters?: {
    assignedUserId?: string;
    companyId?: string;
    opportunityId?: string;
    status?: string;
    priority?: string;
  };
  showCreateTask?: boolean;
  title?: string;
  className?: string;
}

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const STATUS_COLORS = {
  to_do: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function TaskCenter({ 
  filters = {}, 
  showCreateTask = true, 
  title = "Task Center",
  className 
}: TaskCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createTaskData, setCreateTaskData] = useState<Partial<CreateTaskData>>({});

  const { toast } = useToast();
  const { createTask, updateTask, completeTask } = useCrmTaskMutations();

  // Build query filters
  const queryFilters = {
    ...filters,
    search: searchTerm || undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    priority: filterPriority !== 'all' ? filterPriority : undefined,
    overdue: activeTab === 'overdue' ? true : undefined,
  };

  // Filter for specific tab views
  if (activeTab === 'my-tasks') {
    // This would be set to current user ID in a real app
    queryFilters.assignedUserId = 'current-user-id';
  }

  const { data: tasks = [], isLoading } = useCrmTasks(queryFilters);

  const handleCreateTask = async () => {
    try {
      if (!createTaskData.title || !createTaskData.assigned_user_id) {
        toast({
          title: "Error",
          description: "Title and assigned user are required.",
          variant: "destructive",
        });
        return;
      }

      await createTask.mutateAsync({
        ...createTaskData,
        ...filters, // Include any context filters (company, opportunity)
      } as CreateTaskData);

      setIsCreateDialogOpen(false);
      setCreateTaskData({});
      toast({
        title: "Task Created",
        description: "New task has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask.mutateAsync({ id: taskId });
      toast({
        title: "Task Completed",
        description: "Task has been marked as completed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await updateTask.mutateAsync({ id: taskId, status: status as any });
      toast({
        title: "Task Updated",
        description: "Task status has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    }
  };

  const isOverdue = (task: any) => {
    return task.due_date && 
           new Date(task.due_date) < new Date() && 
           task.status !== 'completed';
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'completed') return task.status === 'completed';
    if (activeTab === 'pending') return task.status !== 'completed';
    return true;
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            {title}
          </CardTitle>
          {showCreateTask && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Task title..."
                      value={createTaskData.title || ''}
                      onChange={(e) => setCreateTaskData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Task description..."
                      value={createTaskData.description || ''}
                      onChange={(e) => setCreateTaskData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select
                        value={createTaskData.priority || 'medium'}
                        onValueChange={(value: any) => setCreateTaskData(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Due Date</label>
                      <Input
                        type="date"
                        value={createTaskData.due_date || ''}
                        onChange={(e) => setCreateTaskData(prev => ({ ...prev, due_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Assigned To</label>
                    <Select
                      value={createTaskData.assigned_user_id || ''}
                      onValueChange={(value) => setCreateTaskData(prev => ({ ...prev, assigned_user_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current-user">Me</SelectItem>
                        {/* Add dynamic user options here */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask} disabled={createTask.isPending}>
                      Create Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="to_do">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center p-8">
                <CheckSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No tasks found</p>
                {showCreateTask && (
                  <Button 
                    className="mt-2" 
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    Create First Task
                  </Button>
                )}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <Card key={task.id} className={`transition-colors ${isOverdue(task) ? 'border-red-200 bg-red-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}>
                            {task.priority}
                          </Badge>
                          <Badge className={STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}>
                            {task.status?.replace('_', ' ')}
                          </Badge>
                          {isOverdue(task) && (
                            <Badge variant="destructive">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                              </span>
                            </div>
                          )}
                          
                          {task.company && (
                            <div className="flex items-center gap-1">
                              <span>Company: {task.company.name}</span>
                            </div>
                          )}
                          
                          {task.opportunity && (
                            <div className="flex items-center gap-1">
                              <span>Opportunity: {task.opportunity.name}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4">
                        {task.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteTask(task.id)}
                            disabled={completeTask.isPending}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}