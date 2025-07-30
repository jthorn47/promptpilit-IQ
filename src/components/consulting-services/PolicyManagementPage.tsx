
import React from 'react';
import { StandardLayout } from '@/components/layouts/StandardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Settings, Clock, Users } from 'lucide-react';

export const PolicyManagementPage: React.FC = () => {
  const policies = [
    {
      id: '1',
      title: 'Remote Work Policy',
      description: 'Guidelines for remote work arrangements and expectations',
      status: 'active',
      lastUpdated: '2024-01-15',
      assignedTo: 45
    },
    {
      id: '2',
      title: 'Code of Conduct',
      description: 'Professional behavior standards and ethical guidelines',
      status: 'review',
      lastUpdated: '2024-01-12',
      assignedTo: 120
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <StandardLayout 
      title="Policy Management"
      subtitle="Centralize and manage company policies with automated distribution and acknowledgment tracking"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Policy
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <Card key={policy.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{policy.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {policy.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(policy.status)}>
                    {policy.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Updated {policy.lastUpdated}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {policy.assignedTo} assigned
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    View
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
      </div>
    </StandardLayout>
  );
};
