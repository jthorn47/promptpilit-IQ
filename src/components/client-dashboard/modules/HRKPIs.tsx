import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  AlertTriangle, 
  Plane, 
  ShieldCheck,
  MessageSquare,
  ClipboardCheck
} from 'lucide-react';

export const HRKPIs: React.FC = () => {
  // TODO: Replace with actual API call
  const hrData = {
    policyAcknowledgmentRate: 92,
    openHRIssues: 3,
    ptoUsageRate: 68,
    hrRiskScore: 15, // Lower is better
    riskLevel: 'Low'
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-amber-600';
      case 'high': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          HR Management
        </CardTitle>
        <Badge variant="secondary">Active</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Policy Acknowledgment</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {hrData.policyAcknowledgmentRate}%
            </div>
            <div className="text-xs text-muted-foreground">completion rate</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-muted-foreground">Open Issues</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {hrData.openHRIssues}
            </div>
            <div className="text-xs text-muted-foreground">requiring attention</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">PTO Usage</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {hrData.ptoUsageRate}%
            </div>
            <div className="text-xs text-muted-foreground">of allocated time</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">HR Risk Score</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {hrData.hrRiskScore}
            </div>
            <div className={`text-xs ${getRiskColor(hrData.riskLevel)}`}>
              {hrData.riskLevel} risk
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Open HR Ticket
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Review Compliance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};