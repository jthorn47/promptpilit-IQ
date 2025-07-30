import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  FileText,
  Users,
  BookOpen,
  Award,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { useComplianceData } from '../hooks/useComplianceData';
import { useUserRoles } from '@/hooks/useClientAccess';
import { ComplianceCategory } from '@/domains/compliance/types';

export const HROIQComplianceDashboard: React.FC = () => {
  const { data: userRoles } = useUserRoles();
  
  // Get company ID from user roles
  const companyId = userRoles?.find(role => 
    role.role === 'company_admin' || role.role === 'super_admin'
  )?.company_id;

  const { categories, loading, error, metrics, refreshData } = useComplianceData(companyId || '');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'in_progress': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'missing': return <AlertCircle className="h-5 w-5 text-destructive" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (category: ComplianceCategory) => {
    switch (category.status) {
      case 'complete': 
        return <Badge variant="secondary" className="bg-success/10 text-success">Complete</Badge>;
      case 'in_progress': 
        return <Badge variant="secondary" className="bg-warning/10 text-warning">In Progress</Badge>;
      case 'missing': 
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive">Missing</Badge>;
      default: 
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'onboarding': return <Users className="h-5 w-5" />;
      case 'harassment_training': return <Award className="h-5 w-5" />;
      case 'sb553_policy': return <Shield className="h-5 w-5" />;
      case 'employee_handbook': return <BookOpen className="h-5 w-5" />;
      case 'hr_policies': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const completeCount = categories.filter(cat => cat.status === 'complete').length;
  const inProgressCount = categories.filter(cat => cat.status === 'in_progress').length;
  const missingCount = categories.filter(cat => cat.status === 'missing').length;
  const overallProgress = categories.length > 0 ? Math.round((completeCount / categories.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading compliance data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
          <p className="text-muted-foreground">Real-time HR compliance monitoring and status tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2" />
            <p className="text-muted-foreground text-sm mt-2">
              {completeCount} of {categories.length} categories complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Missing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{missingCount}</div>
            <p className="text-muted-foreground text-sm mt-2">Critical items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{inProgressCount}</div>
            <p className="text-muted-foreground text-sm mt-2">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{completeCount}</div>
            <p className="text-muted-foreground text-sm mt-2">Fully compliant</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(category.id)}
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(category)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(category.status)}
                    <span className="text-sm font-medium">
                      {category.details.completed} of {category.details.total} complete
                    </span>
                  </div>
                  <span className="text-sm font-bold">
                    {category.details.percentage}%
                  </span>
                </div>
                
                <Progress value={category.details.percentage} className="h-2" />
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Last checked: {category.lastChecked.toLocaleDateString()}
                  </div>
                  <span>Source: {category.source}</span>
                </div>
                
                {category.actionButton && (
                  <Button 
                    onClick={category.actionButton.action}
                    variant="outline" 
                    size="sm"
                    className="w-full mt-3"
                  >
                    {category.actionButton.label}
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Compliance Data Available</h3>
              <p className="text-muted-foreground mb-4">
                Start by setting up employees and policies to see compliance status.
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => window.location.href = '/admin/hro-iq/employees'}>
                  Add Employees
                </Button>
                <Button onClick={() => window.location.href = '/admin/hro-iq/policies'}>
                  Create Policies
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Policy Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{metrics.total_policies}</div>
                <div className="text-sm text-muted-foreground">Total Policies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{metrics.active_policies}</div>
                <div className="text-sm text-muted-foreground">Active Policies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{metrics.overdue_reviews}</div>
                <div className="text-sm text-muted-foreground">Overdue Reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HROIQComplianceDashboard;