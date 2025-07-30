import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CheckSquare, Plus, Search, Clock, AlertCircle, User, Calendar, MoreHorizontal, Edit, Trash2, CheckCircle2 } from "lucide-react";

import { format, isAfter, isPast } from 'date-fns';
import { useTasks } from '@/modules/HaaLO.CRM/hooks/useTasks';
import { TaskCreateModal } from '@/modules/CaseManagement/components/TaskCreateModal';
import { toast } from 'sonner';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export const PulseTasksPage: React.FC = () => {
  const { tasks, loading, updateTask, deleteTask, completeTask, fetchTasks } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.case_id && task.case_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         task.assigned_to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleMarkComplete = async (taskId: string) => {
    try {
      await completeTask(taskId);
      toast.success('Task marked as complete');
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      'in_progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'completed': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'overdue': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      'medium': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      'high': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const isOverdue = (dueDateString?: string, status?: string) => {
    if (!dueDateString || status === 'completed') return false;
    return isPast(new Date(dueDateString));
  };

  return (
    <StandardPageLayout
      title="Task Tracker"
      subtitle="Assign and track tasks related to each case"
      headerActions={
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks by title, case ID, or assignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="flex gap-2">
            {['all', 'pending', 'in_progress', 'completed'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All Status' : status.replace('_', ' ').toUpperCase()}
              </Button>
            ))}
          </div>
          <div className="border-l pl-2 ml-2">
            {['all', 'urgent', 'high', 'medium', 'low'].map((priority) => (
              <Button
                key={priority}
                variant={priorityFilter === priority ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPriorityFilter(priority)}
                className="ml-2"
              >
                {priority === 'all' ? 'All Priority' : priority.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Task Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{tasks.length}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'in_progress').length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">
                    {tasks.filter(t => isOverdue(t.due_date, t.status)).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
            <CardDescription>
              Track task progress and deadlines across all cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading tasks...
                    </TableCell>
                  </TableRow>
                ) : filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No tasks found. Create your first task to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow 
                      key={task.id}
                      className={isOverdue(task.due_date, task.status) ? 'bg-red-50 dark:bg-red-950/20' : ''}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{task.case_id || 'No case'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {task.assigned_to}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadge(task.priority)}>
                          {task.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(task.status)}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.due_date ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className={isOverdue(task.due_date, task.status) ? 'text-red-600 font-medium' : ''}>
                              {format(new Date(task.due_date), 'MMM d, yyyy')}
                            </span>
                            {isOverdue(task.due_date, task.status) && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No due date</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {task.status !== 'completed' && (
                              <DropdownMenuItem onClick={() => handleMarkComplete(task.id)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
      </div>

      <TaskCreateModal 
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          fetchTasks();
          setCreateModalOpen(false);
        }}
      />
    </StandardPageLayout>
  );
};