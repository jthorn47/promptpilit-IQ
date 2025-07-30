/**
 * Tasks & Follow-ups Manager - Stage 5
 * Comprehensive task management with AI-powered automation and smart follow-ups
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { 
  Search, Plus, MoreHorizontal, Calendar, Clock, AlertTriangle,
  CheckCircle, User, Phone, Mail, MessageSquare, Brain, Zap,
  Filter, BarChart3, Target, TrendingUp, Sparkles, Settings
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'follow_up' | 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'assessment';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  company: string;
  contact: string;
  dueDate: string;
  created: string;
  automationGenerated?: boolean;
}

export const TasksFollowUpsManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedView, setSelectedView] = useState('list');
  const { toast } = useToast();

  const statuses = ['all', 'pending', 'in_progress', 'completed', 'overdue'];
  const priorities = ['all', 'low', 'medium', 'high', 'urgent'];
  const types = ['all', 'follow_up', 'call', 'email', 'meeting', 'demo', 'proposal', 'assessment'];

  // Mock data
  useEffect(() => {
    setTasks([
      {
        id: '1',
        title: 'Follow up on proposal',
        description: 'Check status of Q4 proposal with Acme Corp',
        type: 'follow_up',
        status: 'pending',
        priority: 'high',
        assignee: 'John Doe',
        company: 'Acme Corp',
        contact: 'Jane Smith',
        dueDate: '2024-01-15',
        created: '2024-01-10',
        automationGenerated: true
      },
      {
        id: '2',
        title: 'Demo call with TechStart',
        description: 'Product demonstration for TechStart Inc',
        type: 'demo',
        status: 'in_progress',
        priority: 'medium',
        assignee: 'Sarah Johnson',
        company: 'TechStart Inc',
        contact: 'Mike Wilson',
        dueDate: '2024-01-16',
        created: '2024-01-12'
      },
      {
        id: '3',
        title: 'Send contract to Enterprise Co',
        description: 'Final contract review and sending',
        type: 'email',
        status: 'overdue',
        priority: 'urgent',
        assignee: 'Bob Smith',
        company: 'Enterprise Co',
        contact: 'Lisa Brown',
        dueDate: '2024-01-13',
        created: '2024-01-08'
      }
    ]);
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.contact.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesType = selectedType === 'all' || task.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const taskMetrics = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    aiGenerated: tasks.filter(t => t.automationGenerated).length
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'demo': return <Target className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const generateAutoTasks = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'AI: Follow up on stale opportunity',
      description: 'Auto-generated task based on pipeline analysis',
      type: 'follow_up',
      status: 'pending',
      priority: 'medium',
      assignee: 'AI Assistant',
      company: 'Prospect Corp',
      contact: 'Auto-detected',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created: new Date().toISOString().split('T')[0],
      automationGenerated: true
    };

    setTasks(prev => [newTask, ...prev]);
    toast({
      title: "AI Tasks Generated",
      description: "1 new task created based on pipeline analysis"
    });
  };

  const markComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'completed' as const } : task
    ));
    toast({
      title: "Task Completed",
      description: "Task marked as completed successfully"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CheckCircle className="h-8 w-8" />
            Tasks & Follow-ups
          </h1>
          <p className="text-muted-foreground">AI-powered task management and automated follow-ups</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateAutoTasks}>
            <Brain className="h-4 w-4 mr-2" />
            Generate AI Tasks
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{taskMetrics.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{taskMetrics.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{taskMetrics.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{taskMetrics.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Generated</p>
                <p className="text-2xl font-bold text-purple-600">{taskMetrics.aiGenerated}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="automation">Smart Automation</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Organize and track all your sales tasks and follow-ups
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status === 'all' ? 'All Status' : status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority} value={priority}>
                        {priority === 'all' ? 'All Priority' : priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tasks Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Checkbox 
                          checked={task.status === 'completed'}
                          onCheckedChange={() => markComplete(task.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {task.title}
                            {task.automationGenerated && (
                              <Sparkles className="h-3 w-3 text-purple-600" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{task.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(task.type)}
                          <span className="capitalize">{task.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.company}</div>
                          <div className="text-sm text-muted-foreground">{task.contact}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm">{task.assignee}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Automation Rules
                </CardTitle>
                <CardDescription>
                  Smart automation for task creation and follow-ups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Stale Opportunity Follow-up</p>
                    <p className="text-sm text-muted-foreground">Auto-create tasks for deals inactive 7+ days</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Meeting Follow-up</p>
                    <p className="text-sm text-muted-foreground">Create follow-up tasks after meetings</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Proposal Expiry Alert</p>
                    <p className="text-sm text-muted-foreground">Remind to follow up before proposal expires</p>
                  </div>
                  <Badge variant="secondary">Inactive</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Insights
                </CardTitle>
                <CardDescription>
                  Smart recommendations and insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Zap className="h-4 w-4 text-amber-500 mt-1" />
                  <div>
                    <p className="font-medium">High-Value Opportunity Risk</p>
                    <p className="text-sm text-muted-foreground">3 deals worth $250K+ haven't been touched in 5 days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <p className="font-medium">Follow-up Success Rate</p>
                    <p className="text-sm text-muted-foreground">Deals with 3+ follow-ups have 40% higher close rate</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Clock className="h-4 w-4 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium">Optimal Follow-up Time</p>
                    <p className="text-sm text-muted-foreground">Tuesday 2-4 PM shows highest response rates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Task completion rates and team performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Analytics Dashboard Coming Soon</p>
                <p>Detailed performance metrics and insights will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};