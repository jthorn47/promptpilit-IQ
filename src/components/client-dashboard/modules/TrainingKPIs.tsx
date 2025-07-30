import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Clock, 
  Award, 
  Users, 
  TrendingUp,
  FileText
} from 'lucide-react';

export const TrainingKPIs: React.FC = () => {
  // TODO: Replace with actual API call
  const trainingData = {
    completionRate: 85,
    overdueTrainings: 12,
    certificatesIssued: 45,
    enrolledEmployees: 150,
    trend: '+12%'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Training Management
        </CardTitle>
        <Badge variant="secondary">Active</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Completion Rate</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {trainingData.completionRate}%
            </div>
            <div className="text-xs text-green-600">{trainingData.trend} from last month</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-muted-foreground">Overdue</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {trainingData.overdueTrainings}
            </div>
            <div className="text-xs text-muted-foreground">trainings pending</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Certificates</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {trainingData.certificatesIssued}
            </div>
            <div className="text-xs text-muted-foreground">issued this month</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Enrolled</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {trainingData.enrolledEmployees}
            </div>
            <div className="text-xs text-muted-foreground">employees active</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Enroll Employees
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            View Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};