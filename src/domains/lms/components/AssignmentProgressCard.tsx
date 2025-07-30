import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrainingAssignmentWithDetails } from '../types';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';

interface AssignmentProgressCardProps {
  assignment: TrainingAssignmentWithDetails;
}

export const AssignmentProgressCard: React.FC<AssignmentProgressCardProps> = ({ assignment }) => {
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
    <Card>
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
            <div className="flex justify-between text-sm mb-2">
              <span>Progress: {assignment.training_completion.progress_percentage || 0}%</span>
              {assignment.training_completion.completed_at && (
                <span>Completed: {new Date(assignment.training_completion.completed_at).toLocaleDateString()}</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all" 
                style={{ width: `${assignment.training_completion.progress_percentage || 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};