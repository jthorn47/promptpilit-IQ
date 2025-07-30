import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle, Clock, Settings } from 'lucide-react';

export const ComplianceEnginePage: React.FC = () => {
  const complianceItems = [
    {
      id: 1,
      name: 'OSHA Safety Requirements',
      description: 'Workplace safety compliance monitoring',
      status: 'compliant',
      score: 95,
      nextReview: '30 days',
      issues: 0
    },
    {
      id: 2,
      name: 'GDPR Data Protection',
      description: 'Data privacy and protection compliance',
      status: 'warning',
      score: 78,
      nextReview: '15 days',
      issues: 3
    },
    {
      id: 3,
      name: 'Equal Employment Opportunity',
      description: 'EEO compliance and reporting',
      status: 'non-compliant',
      score: 62,
      nextReview: '7 days',
      issues: 8
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'default';
      case 'warning': return 'secondary';
      case 'non-compliant': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'non-compliant': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <StandardPageLayout
      title="Compliance Engine"
      subtitle="Automated compliance monitoring and reporting"
      headerActions={
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Add Compliance Rule
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complianceItems.map((item) => {
          const StatusIcon = getStatusIcon(item.status);
          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <StatusIcon className="h-5 w-5" />
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </div>
                  <Badge variant={getStatusColor(item.status)}>
                    {item.status.replace('-', ' ')}
                  </Badge>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Compliance Score</span>
                      <span>{item.score}%</span>
                    </div>
                    <Progress 
                      value={item.score} 
                      className="h-2"
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next Review:</span>
                    <span className="font-medium">{item.nextReview}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Issues:</span>
                    <span className={`font-medium ${item.issues > 0 ? 'text-destructive' : 'text-green-600'}`}>
                      {item.issues}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <Shield className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
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