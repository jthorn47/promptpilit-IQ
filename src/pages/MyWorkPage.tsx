import React from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, AlertCircle, Calendar, User, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const MyWorkPage: React.FC = () => {
  const { userRole } = useAuth();

  const tasks = [
    {
      id: 1,
      title: 'Review John Doe\'s training completion',
      description: 'Sexual harassment training completed - needs approval',
      priority: 'high',
      dueDate: '2024-01-15',
      type: 'approval',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Submit Q4 payroll report',
      description: 'Quarterly payroll summary due to corporate',
      priority: 'medium',
      dueDate: '2024-01-20',
      type: 'submission',
      status: 'in_progress'
    },
    {
      id: 3,
      title: 'Complete SB 553 policy update',
      description: 'Update workplace violence prevention policy',
      priority: 'high',
      dueDate: '2024-01-12',
      type: 'policy',
      status: 'overdue'
    },
    {
      id: 4,
      title: 'Schedule team meeting',
      description: 'Monthly team sync and project updates',
      priority: 'low',
      dueDate: '2024-01-25',
      type: 'meeting',
      status: 'pending'
    }
  ];

  const upcomingDeadlines = [
    { title: 'Benefits enrollment deadline', date: '2024-01-31', days: 3 },
    { title: 'Q1 training assignments', date: '2024-02-15', days: 18 },
    { title: 'Annual compliance review', date: '2024-03-01', days: 32 }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <UnifiedLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Work</h1>
          <p className="text-muted-foreground">Your tasks, approvals, and upcoming deadlines</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">2 overdue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approvals Needed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">1 urgent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">items due</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium truncate">{task.title}</h4>
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {task.dueDate}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      {task.type === 'approval' ? 'Review' : 'Open'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Important dates and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium">{deadline.title}</div>
                        <div className="text-sm text-muted-foreground">{deadline.date}</div>
                      </div>
                    </div>
                    <Badge variant={deadline.days <= 7 ? 'destructive' : 'secondary'}>
                      {deadline.days} days
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default MyWorkPage;