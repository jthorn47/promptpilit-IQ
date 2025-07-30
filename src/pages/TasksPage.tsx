import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Filter,
  Calendar,
  User,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  Target,
  Flag
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const TasksPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  const taskStats = [
    {
      title: 'Total Tasks',
      value: '48',
      change: '+6 this week',
      color: 'text-blue-600',
      icon: Target,
      bgColor: 'bg-blue-500'
    },
    {
      title: 'In Progress',
      value: '12',
      change: 'Currently active',
      color: 'text-yellow-600',
      icon: Clock,
      bgColor: 'bg-yellow-500'
    },
    {
      title: 'Completed',
      value: '32',
      change: '+8 this week',
      color: 'text-green-600',
      icon: CheckCircle,
      bgColor: 'bg-green-500'
    },
    {
      title: 'Overdue',
      value: '4',
      change: 'Need attention',
      color: 'text-red-600',
      icon: AlertCircle,
      bgColor: 'bg-red-500'
    }
  ];

  const tasks = [
    {
      id: 1,
      title: 'Review Q4 Performance Reports',
      description: 'Analyze team performance metrics and prepare recommendations',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2024-02-20',
      assignee: 'Sarah Johnson',
      assigneeAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b7b64b83?w=64&h=64&fit=crop&crop=face',
      category: 'HR',
      progress: 60
    },
    {
      id: 2,
      title: 'Update Employee Handbook',
      description: 'Revise policies and procedures for 2024',
      status: 'Pending',
      priority: 'Medium',
      dueDate: '2024-02-25',
      assignee: 'Michael Chen',
      assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
      category: 'Documentation',
      progress: 0
    },
    {
      id: 3,
      title: 'Setup New Employee Workstation',
      description: 'Prepare workstation and equipment for new hire starting Monday',
      status: 'Completed',
      priority: 'High',
      dueDate: '2024-02-15',
      assignee: 'Emily Rodriguez',
      assigneeAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
      category: 'IT',
      progress: 100
    },
    {
      id: 4,
      title: 'Conduct Training Session',
      description: 'Lead workplace safety training for manufacturing team',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2024-02-18',
      assignee: 'David Kumar',
      assigneeAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
      category: 'Training',
      progress: 75
    },
    {
      id: 5,
      title: 'Budget Review Meeting',
      description: 'Quarterly budget analysis with finance team',
      status: 'Overdue',
      priority: 'High',
      dueDate: '2024-02-10',
      assignee: 'Lisa Thompson',
      assigneeAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face',
      category: 'Finance',
      progress: 25
    },
    {
      id: 6,
      title: 'Client Follow-up Calls',
      description: 'Contact key clients for feedback and renewal discussions',
      status: 'Pending',
      priority: 'Medium',
      dueDate: '2024-02-22',
      assignee: 'Robert Wilson',
      assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
      category: 'Sales',
      progress: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return task.status === 'Pending';
    if (activeTab === 'progress') return task.status === 'In Progress';
    if (activeTab === 'completed') return task.status === 'Completed';
    if (activeTab === 'overdue') return task.status === 'Overdue';
    return true;
  });

  return (
    <div className="container mx-auto py-4 px-4 space-y-6 max-w-none overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            Track and manage all tasks and project workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {taskStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-1 rounded ${stat.bgColor} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.color}`}>{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tasks Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>Manage and track task progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({tasks.filter(t => t.status === 'Pending').length})</TabsTrigger>
              <TabsTrigger value="progress">In Progress ({tasks.filter(t => t.status === 'In Progress').length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({tasks.filter(t => t.status === 'Completed').length})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({tasks.filter(t => t.status === 'Overdue').length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{task.title}</h3>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)} variant="outline">
                            <Flag className="h-3 w-3 mr-1" />
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={task.assigneeAvatar} alt={task.assignee} />
                              <AvatarFallback>
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <span>{task.assignee}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {task.dueDate}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                        </div>

                        {task.status !== 'Completed' && task.status !== 'Pending' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Target className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Project View</CardTitle>
            <CardDescription>View tasks by project</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Projects
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Calendar className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Calendar</CardTitle>
            <CardDescription>View tasks in calendar</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Open Calendar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Team View</CardTitle>
            <CardDescription>View tasks by team member</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Teams
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Analytics</CardTitle>
            <CardDescription>Task performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TasksPage;