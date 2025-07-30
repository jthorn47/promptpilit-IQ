import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrainingModule } from '../types';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Clock,
  Users,
  BookOpen
} from 'lucide-react';

interface TrainingModuleCardProps {
  module: TrainingModule;
  onEdit?: (module: TrainingModule) => void;
  onDelete?: (module: TrainingModule) => void;
  onView?: (module: TrainingModule) => void;
}

export const TrainingModuleCard: React.FC<TrainingModuleCardProps> = ({
  module,
  onEdit,
  onDelete,
  onView
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
          {getStatusBadge(module.status || 'draft')}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {module.description || 'No description available'}
        </p>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{module.estimated_duration || 0} min</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{module.category || 'Standard'}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {onView && (
            <Button size="sm" variant="outline" onClick={() => onView(module)}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          )}
          {onEdit && (
            <Button size="sm" variant="outline" onClick={() => onEdit(module)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="outline" onClick={() => onDelete(module)}>
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};