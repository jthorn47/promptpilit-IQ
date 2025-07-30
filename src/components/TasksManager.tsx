import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, CheckCircle, Clock, AlertTriangle, Calendar, User, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  assigned_to: string;
  created_by: string;
  lead_id?: string;
  deal_id?: string;
  company_id?: string;
  contact_name?: string;
  contact_email?: string;
  due_date?: string;
  completed_at?: string;
  reminder_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const TasksManager = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "follow_up",
    priority: "medium",
    status: "pending",
    contact_name: "",
    contact_email: "",
    due_date: "",
    reminder_at: "",
    notes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    try {
      if (!newTask.title) {
        toast({
          title: "Error",
          description: "Please enter a task title",
          variant: "destructive",
        });
        return;
      }

      const taskData = {
        ...newTask,
        assigned_to: user?.id,
        created_by: user?.id,
        due_date: newTask.due_date || null,
        reminder_at: newTask.reminder_at || null
      };

      const { error } = await supabase
        .from('tasks')
        .insert([taskData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      setShowAddDialog(false);
      setNewTask({
        title: "",
        description: "",
        type: "follow_up",
        priority: "medium",
        status: "pending",
        contact_name: "",
        contact_email: "",
        due_date: "",
        reminder_at: "",
        notes: ""
      });
      fetchTasks();
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Task marked as ${newStatus}`,
      });

      fetchTasks();
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && dueDate;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.contact_name && task.contact_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const tasksByStatus = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage your follow-ups and to-do items</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task or follow-up item
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Follow up with John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Task Type</Label>
                  <Select value={newTask.type} onValueChange={(value) => setNewTask({...newTask, type: value})}>
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input
                    id="contact_name"
                    value={newTask.contact_name}
                    onChange={(e) => setNewTask({...newTask, contact_name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={newTask.contact_email}
                    onChange={(e) => setNewTask({...newTask, contact_email: e.target.value})}
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Task details and notes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminder_at">Reminder</Label>
                  <Input
                    id="reminder_at"
                    type="datetime-local"
                    value={newTask.reminder_at}
                    onChange={(e) => setNewTask({...newTask, reminder_at: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask}>
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{tasksByStatus.pending.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{tasksByStatus.in_progress.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{tasksByStatus.completed.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
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

      {/* Task Views */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
              <CardDescription>Your tasks and follow-up items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.contact_name && (
                          <p className="text-sm text-gray-600">{task.contact_name} • {task.contact_email}</p>
                        )}
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        {task.due_date && (
                          <div className={`text-xs mt-2 flex items-center ${isOverdue(task.due_date) ? 'text-red-600' : 'text-gray-500'}`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {new Date(task.due_date).toLocaleDateString()}
                            {isOverdue(task.due_date) && ' (Overdue)'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <div className="flex space-x-1">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                          >
                            Start
                          </Button>
                        )}
                        {task.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks found</p>
                    <p className="text-sm">Create your first task to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-700">
                  <Clock className="w-4 h-4 mr-2" />
                  Pending ({tasksByStatus.pending.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasksByStatus.pending.map((task) => (
                  <div key={task.id} className="p-3 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    {task.contact_name && (
                      <p className="text-xs text-gray-600">{task.contact_name}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                      >
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* In Progress Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  In Progress ({tasksByStatus.in_progress.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasksByStatus.in_progress.map((task) => (
                  <div key={task.id} className="p-3 bg-blue-50 rounded-lg border">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    {task.contact_name && (
                      <p className="text-xs text-gray-600">{task.contact_name}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Completed Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed ({tasksByStatus.completed.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasksByStatus.completed.map((task) => (
                  <div key={task.id} className="p-3 bg-green-50 rounded-lg border">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    {task.contact_name && (
                      <p className="text-xs text-gray-600">{task.contact_name}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-green-600">
                        ✓ Done
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};