
import React from 'react';
import { StandardLayout } from '@/components/layouts/StandardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Plus, Settings } from 'lucide-react';

export const ComplianceTrackingPage: React.FC = () => {
  const complianceItems = [
    {
      id: '1',
      title: 'OSHA Safety Training',
      description: 'Required safety training for all employees',
      dueDate: '2024-02-15',
      completionRate: 78,
      status: 'in-progress',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Anti-Harassment Certification',
      description: 'Annual harassment prevention training',
      dueDate: '2024-03-01',
      completionRate: 95,
      status: 'completed',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Data Privacy Compliance',
      description: 'GDPR and privacy regulation training',
      dueDate: '2024-02-28',
      completionRate: 45,
      status: 'at-risk',
      priority: 'high'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'at-risk': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'at-risk': return <AlertTriangle className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <StandardLayout 
      title="Compliance Tracking"
      subtitle="Monitor and track compliance requirements, certifications, and deadlines"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Requirement
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Compliance Items */}
        <div className="space-y-4">
          {complianceItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge className={getStatusColor(item.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          {item.status}
                        </div>
                      </Badge>
                      {item.priority === 'high' && (
                        <Badge variant="destructive">High Priority</Badge>
                      )}
                    </div>
                    <CardDescription className="mt-2">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Due: {item.dueDate}</span>
                  <span>{item.completionRate}% complete</span>
                </div>

                <Progress value={item.completionRate} className="h-2" />

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm">
                    Manage
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
