import React, { useState } from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Calendar, Clock, Flag, Filter } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Review quarterly marketing report",
      description: "Analyze Q4 performance metrics and prepare executive summary",
      priority: "high",
      status: "pending", 
      dueDate: "2024-01-15",
      assignee: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b107?w=150&h=150&fit=crop&crop=face"
      },
      completed: false
    },
    {
      id: 2,
      title: "Update client onboarding process",
      description: "Streamline the new client setup workflow and documentation",
      priority: "medium",
      status: "in-progress",
      dueDate: "2024-01-20",
      assignee: {
        name: "Michael Chen", 
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      completed: false
    },
    {
      id: 3,
      title: "Prepare presentation slides",
      description: "Create slides for next week's board meeting",
      priority: "high",
      status: "pending",
      dueDate: "2024-01-12",
      assignee: {
        name: "Emily Rodriguez",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      completed: false
    },
    {
      id: 4,
      title: "Database backup verification",
      description: "Verify automated backup systems are working correctly", 
      priority: "low",
      status: "completed",
      dueDate: "2024-01-10",
      assignee: {
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      completed: true
    }
  ]);

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed, status: !task.completed ? 'completed' : 'pending' }
        : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      default: return 'outline';
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;

  return (
    <StandardPageLayout
      title="Task Manager"
      subtitle="Track and manage your team's tasks and projects"
      badge={`${pendingTasks} Pending`}
      headerActions={
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      }
    >
      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
            <Badge variant="outline">{tasks.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <Badge className="bg-green-100 text-green-800">{completedTasks}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <Flag className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((completedTasks / tasks.length) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className={`transition-all duration-200 ${task.completed ? 'opacity-75' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                    {task.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                          <AvatarFallback className="text-xs">
                            {task.assignee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{task.assignee.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPageLayout>
  );
}