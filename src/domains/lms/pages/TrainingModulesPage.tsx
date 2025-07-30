import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTrainingModules } from '../hooks/useTrainingModules';
import { EngagementHeatmap } from '@/components/training-analytics/EngagementHeatmap';
import { DropoutTracker } from '@/components/training-analytics/DropoutTracker';
import { 
  Search, 
  Plus, 
  BookOpen, 
  Edit, 
  Trash2,
  Eye,
  Filter
} from 'lucide-react';

export const TrainingModulesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const { 
    modules, 
    isLoading, 
    error, 
    createModule, 
    updateModule, 
    deleteModule,
    isCreating,
    isUpdating,
    isDeleting
  } = useTrainingModules({
    search: searchTerm,
    status: statusFilter || undefined
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-lg">Loading training modules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading training modules</div>
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Training Modules</h2>
          <p className="text-muted-foreground">
            Create and manage training content for your organization
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Module
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
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

      {/* Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <EngagementHeatmap moduleId={modules[0]?.id || ''} />
        <DropoutTracker onTagForRework={(moduleId, tags) => {
          console.log('Module tagged for rework:', moduleId, tags);
        }} />
      </div>

      {/* Modules Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.id} className="hover:shadow-md transition-shadow">
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
                <span>Duration: {module.estimated_duration || 0} min</span>
                <span>Type: {module.category || 'Standard'}</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {modules.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No training modules found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first training module to get started with the LMS.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Training Module
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};