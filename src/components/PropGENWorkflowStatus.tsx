import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle, Circle } from 'lucide-react';
import { usePropGENWorkflow } from '@/hooks/usePropGENWorkflow';

interface PropGENWorkflowStatusProps {
  companyId: string;
}

interface WorkflowStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'pending';
  description: string;
}

const PropGENWorkflowStatus: React.FC<PropGENWorkflowStatusProps> = ({ companyId }) => {
  const { workflow, isLoading } = usePropGENWorkflow(companyId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PropGEN Workflow Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getWorkflowSteps = (): WorkflowStep[] => {
    const currentStatus = workflow?.workflow_status || 'not_started';
    
    const steps: WorkflowStep[] = [
      {
        id: 'assessment',
        title: '1. Assessment',
        status: 'pending',
        description: 'Complete 10-Minute HR Risk Assessment'
      },
      {
        id: 'investment_analysis',
        title: '2. Investment Analysis',
        status: 'pending',
        description: 'Calculate ROI, compare admin costs, and model Easeworks value'
      },
      {
        id: 'benefits_comparison',
        title: '3. Benefits Comparison',
        status: 'pending',
        description: 'Compare Easeworks vs current benefits setup'
      },
      {
        id: 'additional_fees',
        title: '4. Additional Fees',
        status: 'pending',
        description: 'Select and configure optional service fees'
      },
      {
        id: 'spin_selling',
        title: '5. SPIN Selling',
        status: 'pending',
        description: 'Enter Situation, Problem, Implication, and Need-Payoff details'
      },
      {
        id: 'proposal',
        title: '6. Proposal',
        status: 'pending',
        description: 'Generate the final branded proposal document'
      }
    ];

    // Update step statuses based on workflow state
    const statusMap: { [key: string]: number } = {
      'not_started': 0,
      'risk_assessment_completed': 1,
      'investment_analysis_completed': 2,
      'benefits_comparison_completed': 3,
      'additional_fees_configured': 4,
      'spin_content_generated': 5,
      'proposal_generated': 6,
      'proposal_pending_approval': 5,
      'proposal_approved': 6,
      'proposal_sent': 6
    };

    const currentStepIndex = statusMap[currentStatus] || 0;

    return steps.map((step, index) => ({
      ...step,
      status: index < currentStepIndex ? 'completed' : 
              index === currentStepIndex ? 'current' : 'pending'
    }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'current': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'current': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getProgressPercentage = () => {
    const steps = getWorkflowSteps();
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  const getRiskScoreBadge = (score?: number) => {
    if (!score) return null;
    
    const variant = score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive';
    const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
    
    return (
      <Badge variant={variant} className={color}>
        Risk Score: {score}
      </Badge>
    );
  };

  const steps = getWorkflowSteps();
  const currentStatus = workflow?.workflow_status || 'not_started';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>PropGEN Workflow Status</CardTitle>
          <div className="flex items-center gap-2">
            {workflow?.investment_analysis_data && 
              typeof workflow.investment_analysis_data === 'object' &&
              'riskScore' in workflow.investment_analysis_data &&
              getRiskScoreBadge(Number(workflow.investment_analysis_data.riskScore))
            }
            <Badge variant="outline">
              {currentStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className="mt-1">
                {getStatusIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium ${
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'current' ? 'text-blue-600' :
                    'text-muted-foreground'
                  }`}>
                    {step.title}
                  </h4>
                  <Badge variant={getStatusBadgeVariant(step.status)} className="text-xs">
                    {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Status Information */}
        {workflow && (
          <div className="pt-4 border-t space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">SPIN Content:</span>
                <span className="ml-2 capitalize">
                  {workflow.spin_content_status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Investment Analysis:</span>
                <span className="ml-2 capitalize">
                  {workflow.investment_analysis_status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Proposal:</span>
                <span className="ml-2 capitalize">
                  {workflow.proposal_status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="ml-2">
                  {new Date(workflow.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropGENWorkflowStatus;