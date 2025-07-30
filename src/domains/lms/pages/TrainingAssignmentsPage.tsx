import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTrainingAssignments } from '../hooks/useTrainingAssignments';
import { 
  Search, 
  Plus, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Filter
} from 'lucide-react';

export const TrainingAssignmentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const { 
    assignments, 
    isLoading, 
    error,
    createAssignment,
    updateAssignment,
    isCreating,
    isUpdating
  } = useTrainingAssignments({
    search: searchTerm,
    status: statusFilter || undefined
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-lg">Loading training assignments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading training assignments</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'not_started':
        return <Badge variant="outline">Not Started</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Training Assignments</h2>
          <p className="text-muted-foreground">
            Assign training modules to employees and track their progress
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Assignment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(assignment.status || 'not_started')}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {assignment.training_module?.title || 'Unknown Module'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Assigned to: {assignment.employee?.first_name} {assignment.employee?.last_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Assigned: {new Date(assignment.assigned_at || '').toLocaleDateString()}
                    </div>
                  </div>
                  {getStatusBadge(assignment.status || 'not_started')}
                </div>
              </div>
              
              {assignment.training_completion && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {assignment.training_completion.progress_percentage || 0}%</span>
                    {assignment.training_completion.completed_at && (
                      <span>Completed: {new Date(assignment.training_completion.completed_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${assignment.training_completion.progress_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No training assignments found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first training assignment to track employee progress.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};