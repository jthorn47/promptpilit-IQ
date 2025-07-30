
import React, { useState } from 'react';
import { StandardLayout } from '@/components/layouts/StandardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Play, Settings, Users, Clock, CheckCircle } from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  completionRate: number;
  totalLearners: number;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
}

const mockModules: TrainingModule[] = [
  {
    id: '1',
    title: 'Workplace Safety Fundamentals',
    description: 'Essential safety protocols and procedures for all employees',
    duration: '45 min',
    completionRate: 85,
    totalLearners: 124,
    status: 'active',
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    title: 'Customer Service Excellence',
    description: 'Advanced techniques for exceptional customer interactions',
    duration: '60 min',
    completionRate: 72,
    totalLearners: 98,
    status: 'active',
    lastUpdated: '2024-01-12'
  },
  {
    id: '3',
    title: 'Data Privacy & Security',
    description: 'GDPR compliance and data protection best practices',
    duration: '30 min',
    completionRate: 0,
    totalLearners: 0,
    status: 'draft',
    lastUpdated: '2024-01-10'
  }
];

export const TrainingModulesPage: React.FC = () => {
  const [modules] = useState<TrainingModule[]>(mockModules);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <StandardLayout 
      title="Training Modules"
      subtitle="Create and manage interactive training content for your organization"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Module
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {module.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(module.status)}>
                    {module.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {module.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {module.totalLearners} learners
                  </div>
                </div>

                {module.status === 'active' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion Rate</span>
                      <span>{module.completionRate}%</span>
                    </div>
                    <Progress value={module.completionRate} className="h-2" />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {modules.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Play className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No training modules yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first training module to get started
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create First Module
            </Button>
          </div>
        )}
      </div>
    </StandardLayout>
  );
};
