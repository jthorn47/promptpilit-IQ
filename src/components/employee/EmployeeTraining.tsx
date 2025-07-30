// Employee Training Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Clock, Award, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Training {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
  dueDate: string;
  estimatedDuration: number; // in minutes
  category: string;
  priority: 'low' | 'medium' | 'high';
  lastAccessed?: string;
  completedDate?: string;
  certificateUrl?: string;
}

export const EmployeeTraining: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const { toast } = useToast();

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockTrainings: Training[] = [
      {
        id: '1',
        title: 'Sexual Harassment Prevention',
        description: 'California-mandated training for all employees on preventing sexual harassment in the workplace.',
        status: 'in_progress',
        progress: 65,
        dueDate: '2024-01-25',
        estimatedDuration: 120,
        category: 'Compliance',
        priority: 'high',
        lastAccessed: '2024-01-15'
      },
      {
        id: '2',
        title: 'Workplace Safety Fundamentals',
        description: 'Essential safety protocols and emergency procedures for office workers.',
        status: 'completed',
        progress: 100,
        dueDate: '2024-01-15',
        estimatedDuration: 90,
        category: 'Safety',
        priority: 'medium',
        completedDate: '2024-01-10',
        certificateUrl: '/certificates/safety-fundamentals.pdf'
      },
      {
        id: '3',
        title: 'Data Privacy and Security',
        description: 'Learn about protecting sensitive information and cybersecurity best practices.',
        status: 'not_started',
        progress: 0,
        dueDate: '2024-02-01',
        estimatedDuration: 75,
        category: 'Security',
        priority: 'medium'
      },
      {
        id: '4',
        title: 'Emergency Response Procedures',
        description: 'Critical procedures for workplace emergencies including evacuation and first aid.',
        status: 'overdue',
        progress: 25,
        dueDate: '2024-01-10',
        estimatedDuration: 60,
        category: 'Safety',
        priority: 'high',
        lastAccessed: '2024-01-08'
      },
      {
        id: '5',
        title: 'Company Code of Conduct',
        description: 'Understanding our company values, ethics, and professional conduct standards.',
        status: 'completed',
        progress: 100,
        dueDate: '2023-12-01',
        estimatedDuration: 45,
        category: 'HR',
        priority: 'low',
        completedDate: '2023-11-28',
        certificateUrl: '/certificates/code-of-conduct.pdf'
      }
    ];

    setTimeout(() => {
      setTrainings(mockTrainings);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStartTraining = (training: Training) => {
    toast({
      title: "Starting Training",
      description: `Opening "${training.title}"`
    });
    // Navigate to training module
  };

  const handleContinueTraining = (training: Training) => {
    toast({
      title: "Continuing Training",
      description: `Resuming "${training.title}" from ${training.progress}%`
    });
    // Navigate to training module
  };

  const handleDownloadCertificate = (training: Training) => {
    if (training.certificateUrl) {
      toast({
        title: "Certificate Download",
        description: `Downloading certificate for "${training.title}"`
      });
      // Implement download
    }
  };

  const getStatusBadge = (status: Training['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getPriorityColor = (priority: Training['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const filteredTrainings = trainings.filter(training => {
    if (filter === 'all') return true;
    if (filter === 'pending') return training.status === 'not_started' || training.status === 'in_progress';
    if (filter === 'completed') return training.status === 'completed';
    if (filter === 'overdue') return training.status === 'overdue';
    return true;
  });

  const trainingStats = {
    total: trainings.length,
    completed: trainings.filter(t => t.status === 'completed').length,
    pending: trainings.filter(t => t.status === 'not_started' || t.status === 'in_progress').length,
    overdue: trainings.filter(t => t.status === 'overdue').length
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Training</h1>
          <p className="text-muted-foreground">
            Complete your assigned training modules to stay compliant and informed
          </p>
        </div>
      </div>

      {/* Training Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{trainingStats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{trainingStats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{trainingStats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button 
          variant={filter === 'pending' ? 'default' : 'outline'} 
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button 
          variant={filter === 'completed' ? 'default' : 'outline'} 
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
        <Button 
          variant={filter === 'overdue' ? 'default' : 'outline'} 
          onClick={() => setFilter('overdue')}
        >
          Overdue
        </Button>
      </div>

      {/* Training List */}
      <Card>
        <CardHeader>
          <CardTitle>Training Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTrainings.map((training) => (
              <div key={training.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{training.title}</h3>
                      {getStatusBadge(training.status)}
                      <div className={`text-xs font-medium ${getPriorityColor(training.priority)}`}>
                        {training.priority.toUpperCase()} PRIORITY
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{training.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>📂 {training.category}</span>
                      <span>⏱️ {training.estimatedDuration} minutes</span>
                      <span>📅 Due: {new Date(training.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {training.status === 'completed' && training.certificateUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadCertificate(training)}
                      >
                        <Award className="h-4 w-4 mr-1" />
                        Certificate
                      </Button>
                    )}
                    {training.status === 'not_started' && (
                      <Button 
                        size="sm"
                        onClick={() => handleStartTraining(training)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {training.status === 'in_progress' && (
                      <Button 
                        size="sm"
                        onClick={() => handleContinueTraining(training)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Continue
                      </Button>
                    )}
                    {training.status === 'overdue' && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleContinueTraining(training)}
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Complete Now
                      </Button>
                    )}
                  </div>
                </div>
                
                {training.status !== 'not_started' && training.status !== 'completed' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{training.progress}%</span>
                    </div>
                    <Progress value={training.progress} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredTrainings.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No training modules found</h3>
              <p className="text-muted-foreground">Check back later for new assignments</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};