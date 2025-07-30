import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Calendar, 
  User, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Edit,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

interface PIPData {
  id: string;
  employeeName: string;
  employeeId: string;
  position: string;
  department: string;
  supervisor: string;
  hireDate: Date;
  pipStartDate: Date;
  pipEndDate: Date;
  reviewDate: Date;
  performanceIssues: string[];
  specificConcerns: string;
  currentSalesPerformance: {
    monthlySales: number;
    quarterlyGoal: number;
    conversionRate: number;
    prospectingActivity: number;
  };
  improvementGoals: {
    id: string;
    goal: string;
    measurable: string;
    timeline: string;
    resources: string;
  }[];
  trainingRequired: string[];
  mentorship: boolean;
  additionalSupport: string;
  consequencesOfFailure: string;
  status: 'draft' | 'active' | 'completed' | 'extended';
  createdAt: Date;
  updatedAt: Date;
}

interface PIPViewerProps {
  pipData: PIPData;
  onEdit?: () => void;
  onDownload?: () => void;
  showActions?: boolean;
}

export const PIPViewer: React.FC<PIPViewerProps> = ({
  pipData,
  onEdit,
  onDownload,
  showActions = true
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'extended':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(pipData.pipEndDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const salesPerformancePercent = pipData.currentSalesPerformance.quarterlyGoal > 0 
    ? (pipData.currentSalesPerformance.monthlySales * 3 / pipData.currentSalesPerformance.quarterlyGoal) * 100
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-red-500" />
                Performance Improvement Plan
              </CardTitle>
              <CardDescription>
                Outside Sales Position - {pipData.employeeName} (ID: {pipData.employeeId})
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(pipData.status)}>
                {pipData.status.charAt(0).toUpperCase() + pipData.status.slice(1)}
              </Badge>
              {pipData.status === 'active' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getDaysRemaining()} days remaining
                </Badge>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit PIP
              </Button>
              <Button variant="outline" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Employee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Employee Name</p>
              <p className="font-medium">{pipData.employeeName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-medium">{pipData.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Position</p>
              <p className="font-medium">{pipData.position}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{pipData.department}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Supervisor</p>
              <p className="font-medium">{pipData.supervisor}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hire Date</p>
              <p className="font-medium">{format(pipData.hireDate, 'PPP')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PIP Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            PIP Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">{format(pipData.pipStartDate, 'PPP')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">{format(pipData.pipEndDate, 'PPP')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Review Date</p>
              <p className="font-medium">{format(pipData.reviewDate, 'PPP')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Sales Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Current Sales Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Sales (3-month avg)</p>
              <p className="text-2xl font-bold">${pipData.currentSalesPerformance.monthlySales.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quarterly Goal</p>
              <p className="text-2xl font-bold">${pipData.currentSalesPerformance.quarterlyGoal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">{pipData.currentSalesPerformance.conversionRate}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prospecting Activity</p>
              <p className="text-2xl font-bold">{pipData.currentSalesPerformance.prospectingActivity} calls/week</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Goal Achievement: {salesPerformancePercent.toFixed(1)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${salesPerformancePercent >= 100 ? 'bg-green-500' : salesPerformancePercent >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(salesPerformancePercent, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Performance Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Identified Issues</p>
              <div className="flex flex-wrap gap-2">
                {pipData.performanceIssues.map((issue, index) => (
                  <Badge key={index} variant="destructive">
                    {issue}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Specific Concerns</p>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-line">{pipData.specificConcerns}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Improvement Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipData.improvementGoals.map((goal, index) => (
              <div key={goal.id} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Goal {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Goal Description</p>
                    <p className="text-sm">{goal.goal}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Measurable Outcome</p>
                    <p className="text-sm">{goal.measurable}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="text-sm">{goal.timeline}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Resources & Support</p>
                    <p className="text-sm">{goal.resources}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support & Training */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            Support & Training
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Required Training</p>
              <div className="flex flex-wrap gap-2">
                {pipData.trainingRequired.map((training, index) => (
                  <Badge key={index} variant="outline">
                    {training}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Mentorship</p>
              <Badge variant={pipData.mentorship ? "default" : "secondary"}>
                {pipData.mentorship ? "Assigned" : "Not Assigned"}
              </Badge>
            </div>
            
            {pipData.additionalSupport && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Additional Support</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-line">{pipData.additionalSupport}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Consequences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Consequences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm whitespace-pre-line">{pipData.consequencesOfFailure}</p>
          </div>
        </CardContent>
      </Card>

      {/* Signatures Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Signatures & Acknowledgments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Employee Signature</p>
                <div className="border-b border-gray-300 pb-2 mb-2">
                  <p className="text-sm text-muted-foreground">Print Name: {pipData.employeeName}</p>
                </div>
                <div className="border-b border-gray-300 pb-2 mb-2">
                  <p className="text-sm text-muted-foreground">Signature: ________________</p>
                </div>
                <div className="border-b border-gray-300 pb-2">
                  <p className="text-sm text-muted-foreground">Date: ________________</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Supervisor Signature</p>
                <div className="border-b border-gray-300 pb-2 mb-2">
                  <p className="text-sm text-muted-foreground">Print Name: {pipData.supervisor}</p>
                </div>
                <div className="border-b border-gray-300 pb-2 mb-2">
                  <p className="text-sm text-muted-foreground">Signature: ________________</p>
                </div>
                <div className="border-b border-gray-300 pb-2">
                  <p className="text-sm text-muted-foreground">Date: ________________</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Employee Acknowledgment:</strong> I acknowledge that I have received and reviewed this Performance Improvement Plan. 
                I understand the expectations outlined and the consequences of not meeting the improvement goals within the specified timeframe.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Performance Improvement Plan - Outside Sales Position</p>
            <p>Created: {format(pipData.createdAt, 'PPP')} | Last Updated: {format(pipData.updatedAt, 'PPP')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};