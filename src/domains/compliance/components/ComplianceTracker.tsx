import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCompliancePolicies } from '../hooks/useCompliancePolicies';
import { useComplianceAssessments } from '../hooks/useComplianceAssessments';

interface ComplianceTrackerProps {
  timeRange?: string;
}

export const ComplianceTracker = ({ timeRange = 'monthly' }: ComplianceTrackerProps) => {
  const { policies, loading: policiesLoading } = useCompliancePolicies();
  const { assessments, loading: assessmentsLoading } = useComplianceAssessments();

  const loading = policiesLoading || assessmentsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
      case 'non-compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activePolicies = policies.filter(p => p.status === 'active');
  const completionRate = policies.length > 0 ? (activePolicies.length / policies.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
          <CardDescription>
            Track compliance status across all policies and frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Compliance</span>
              <span className="text-sm text-muted-foreground">
                {activePolicies.length} of {policies.length} policies active
              </span>
            </div>
            <Progress value={completionRate} className="w-full" />
            <div className="text-right text-sm text-muted-foreground">
              {Math.round(completionRate)}% compliant
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Policies</CardTitle>
          <CardDescription>
            Current compliance policies and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No compliance policies found
              </div>
            ) : (
              policies.map((policy) => (
                <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{policy.title}</h4>
                    <p className="text-sm text-muted-foreground">{policy.description}</p>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
                      <Badge className={getPriorityColor(policy.priority)}>
                        {policy.priority}
                      </Badge>
                      <Badge variant="outline">{policy.category}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Next review: {new Date(policy.next_review_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
          <CardDescription>
            Latest compliance assessment results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No assessments conducted yet
              </div>
            ) : (
              assessments.slice(0, 5).map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Assessment #{assessment.id.slice(0, 8)}</h4>
                    <p className="text-sm text-muted-foreground">
                      Date: {new Date(assessment.assessment_date).toLocaleDateString()}
                    </p>
                    <Badge className={getStatusColor(assessment.status)}>
                      {assessment.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{assessment.compliance_score}%</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};