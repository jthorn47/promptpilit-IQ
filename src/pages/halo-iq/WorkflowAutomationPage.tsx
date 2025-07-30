import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Play, Settings, BarChart3 } from 'lucide-react';

export const WorkflowAutomationPage: React.FC = () => {
  const workflows = [
    {
      id: 1,
      name: 'Employee Onboarding',
      description: 'Automated process for new employee setup',
      status: 'active',
      triggers: 12,
      lastRun: '2 hours ago'
    },
    {
      id: 2,
      name: 'Policy Acknowledgment',
      description: 'Automated policy distribution and tracking',
      status: 'active',
      triggers: 8,
      lastRun: '1 day ago'
    },
    {
      id: 3,
      name: 'Compliance Monitoring',
      description: 'Automated compliance checks and alerts',
      status: 'draft',
      triggers: 0,
      lastRun: 'Never'
    }
  ];

  return (
    <StandardPageLayout
      title="Workflow Automation"
      subtitle="Automated business process workflows"
      headerActions={
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{workflow.name}</CardTitle>
                <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                  {workflow.status}
                </Badge>
              </div>
              <CardDescription>{workflow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Triggers:</span>
                  <span className="font-medium">{workflow.triggers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Run:</span>
                  <span className="font-medium">{workflow.lastRun}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-1" />
                    Run
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Stats
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPageLayout>
  );
};