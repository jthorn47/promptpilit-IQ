import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTasks, Task } from '../hooks/useTasks';
import { 
  Plus, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Brain,
  User,
  Phone,
  Mail
} from 'lucide-react';

interface TaskTabProps {
  companyId?: string;
  dealId?: string;
  leadId?: string;
  contactName?: string;
  contactEmail?: string;
}

export const TaskTab: React.FC<TaskTabProps> = ({ 
  companyId, 
  dealId, 
  leadId, 
  contactName, 
  contactEmail 
}) => {
  const { tasks, loading, fetchTasks, createTask, completeTask } = useTasks();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'follow_up',
    priority: 'medium' as const,
    due_date: '',
  });

  // Filter tasks related to this company/deal/lead
  const relatedTasks = tasks.filter(task => 
    task.company_id === companyId || 
    task.deal_id === dealId || 
    task.lead_id === leadId
  );

  const handleCreateTask = async () => {
    try {
      await createTask({
        ...newTask,
        assigned_to: 'current-user', // Should be actual user ID
        created_by: 'current-user', // Should be actual user ID
        company_id: companyId,
        deal_id: dealId,
        lead_id: leadId,
        contact_name: contactName,
        contact_email: contactEmail,
        status: 'pending',
        due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : undefined,
      });
      
      setIsCreateDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        type: 'follow_up',
        priority: 'medium',
        due_date: '',
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={priorityColors[priority] || priorityColors.medium}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };

    const isOverdue = (task: Task) => 
      task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

    return (
      <Badge className={statusColors[status] || statusColors.pending}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      call: <Phone className="h-4 w-4" />,
      email: <Mail className="h-4 w-4" />,
      meeting: <Calendar className="h-4 w-4" />,
      follow_up: <Clock className="h-4 w-4" />,
      assessment: <AlertTriangle className="h-4 w-4" />,
      task: <CheckCircle className="h-4 w-4" />
    };

    return icons[type] || <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tasks & Follow-ups</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title..."
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newTask.type} onValueChange={(value) => setNewTask(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
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
              </div>
              
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} disabled={!newTask.title}>
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading tasks...
          </div>
        ) : relatedTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found. Create your first task to get started.
          </div>
        ) : (
          relatedTasks.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(task.type)}
                    <h4 className="font-medium">{task.title}</h4>
                    {task.is_auto_generated && (
                      <Badge variant="outline" className="text-xs">
                        {task.sarah_generated ? (
                          <>
                            <Brain className="h-3 w-3 mr-1" />
                            Sarah AI
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            Auto
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {task.due_date && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                    {task.trigger_reason && (
                      <span>• {task.trigger_reason}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getPriorityBadge(task.priority)}
                  {getStatusBadge(task.status)}
                  {task.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => completeTask(task.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};