import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  FileCheck, 
  AlertCircle, 
  Download,
  Upload,
  BarChart3
} from 'lucide-react';

export const SB553KPIs: React.FC = () => {
  // TODO: Replace with actual API call
  const sb553Data = {
    planCompletion: 78,
    trainingComplianceByRole: 85,
    incidentsTracked: 2,
    lastIncidentDate: '2024-11-15'
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          SB 553 Compliance
        </CardTitle>
        <Badge variant="secondary">Active</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Plan Completion</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {sb553Data.planCompletion}%
            </div>
            <div className="text-xs text-muted-foreground">implementation progress</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Training Compliance</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {sb553Data.trainingComplianceByRole}%
            </div>
            <div className="text-xs text-muted-foreground">by role completion</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-muted-foreground">Incidents</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {sb553Data.incidentsTracked}
            </div>
            <div className="text-xs text-muted-foreground">tracked this quarter</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Last Incident</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {formatDate(sb553Data.lastIncidentDate)}
            </div>
            <div className="text-xs text-muted-foreground">reported date</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Plan
          </Button>
          <Button size="sm" variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Submit Incident
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};