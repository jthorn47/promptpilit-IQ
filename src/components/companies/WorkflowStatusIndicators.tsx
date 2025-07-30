import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface WorkflowStatusProps {
  companyId: string;
  companyName: string;
  className?: string;
}

export const WorkflowStatusIndicators: React.FC<WorkflowStatusProps> = ({ 
  companyId, 
  companyName,
  className = ""
}) => {
  // Mock data - in a real implementation, this would come from the system triggers
  const workflowStatuses = [
    {
      id: 'risk-assessment',
      name: 'Risk Assessment',
      status: 'completed',
      description: 'PropGEN module enabled',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 'proposal',
      name: 'Proposal',
      status: 'pending',
      description: 'Awaiting generation',
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      id: 'onboarding',
      name: 'Onboarding',
      status: 'inactive',
      description: 'Client status required',
      icon: AlertCircle,
      color: 'text-gray-400'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Workflow Status</CardTitle>
        <p className="text-sm text-muted-foreground">
          System-managed workflow indicators for {companyName}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workflowStatuses.map((workflow) => {
            const IconComponent = workflow.icon;
            return (
              <div key={workflow.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-4 h-4 ${workflow.color}`} />
                  <div>
                    <p className="font-medium text-sm">{workflow.name}</p>
                    <p className="text-xs text-muted-foreground">{workflow.description}</p>
                  </div>
                </div>
                {getStatusBadge(workflow.status)}
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> These workflow statuses are automatically managed by system-wide triggers. 
            Changes are applied globally and reflect the outcome of automated processes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};