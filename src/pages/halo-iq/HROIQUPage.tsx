import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Video, FileText, Users, Clock } from 'lucide-react';

export const HROIQUPage: React.FC = () => {
  const resources = [
    {
      id: 1,
      title: 'HR Compliance Guide 2024',
      type: 'document',
      description: 'Comprehensive guide to current HR compliance requirements',
      category: 'Compliance',
      lastUpdated: '2 days ago',
      views: 245
    },
    {
      id: 2,
      title: 'Payroll Processing Best Practices',
      type: 'video',
      description: 'Video series on effective payroll management',
      category: 'Payroll',
      lastUpdated: '1 week ago',
      views: 189
    },
    {
      id: 3,
      title: 'Employee Relations Workshop',
      type: 'webinar',
      description: 'Live workshop on handling employee relations issues',
      category: 'Employee Relations',
      lastUpdated: '3 days ago',
      views: 156
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'video': return Video;
      case 'webinar': return Users;
      default: return BookOpen;
    }
  };

  return (
    <StandardPageLayout
      title="HRO IQ-U"
      subtitle="HR outsourcing university and knowledge base"
      headerActions={
        <Button>
          <BookOpen className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => {
          const IconComponent = getIcon(resource.type);
          return (
            <Card key={resource.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <Badge variant="outline">{resource.category}</Badge>
                  </div>
                  <Badge variant="secondary">{resource.type}</Badge>
                </div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Views:</span>
                    <span className="font-medium">{resource.views}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="font-medium">{resource.lastUpdated}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <IconComponent className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Clock className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </StandardPageLayout>
  );
};