
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  User, 
  MessageSquare, 
  FileText, 
  Upload,
  History,
  AlertTriangle,
  CheckCircle,
  Package
} from 'lucide-react';
import { useHROIQRetainer } from '../hooks/useHROIQRetainer';
import { useHROIQServiceLog } from '../hooks/useHROIQServiceLog';
import { useHROIQRequests } from '../hooks/useHROIQRequests';
import { useHROIQOnboarding } from '../hooks/useHROIQOnboarding';
import { RetainerUsageWidget } from '@/components/RetainerUsageWidget';
import { ClientServiceSummary } from '@/components/ClientServiceSummary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HROIQClientDashboardProps {
  clientId: string;
  onRequestSupport: () => void;
  onSendOnboarding: () => void;
  onUploadDocs: () => void;
  onViewHistory: () => void;
}

export const HROIQClientDashboard: React.FC<HROIQClientDashboardProps> = ({
  clientId,
  onRequestSupport,
  onSendOnboarding,
  onUploadDocs,
  onViewHistory,
}) => {
  const { retainer, isLoading: retainerLoading, calculateUsage } = useHROIQRetainer(clientId);
  const { serviceLogs } = useHROIQServiceLog({ clientId });
  const { requests } = useHROIQRequests(clientId);
  const { onboardingPackets } = useHROIQOnboarding(clientId);

  const usage = calculateUsage();
  const overage = Math.max(0, usage.used - usage.total);
  
  const getStatusColor = () => {
    if (usage.percentage >= 90) return 'destructive';
    if (usage.percentage >= 75) return 'outline';
    return 'default';
  };

  const getStatusIcon = () => {
    if (usage.percentage >= 90) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  if (retainerLoading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Service Activity</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Enhanced Retainer Status */}
        <RetainerUsageWidget
          hoursUsed={usage.used}
          totalHours={usage.total}
          rolloverHours={retainer?.rollover_bank || 0}
          overageHours={overage}
          tierName={retainer?.billing_period || 'Monthly'}
          status={usage.percentage >= 90 ? 'critical' : usage.percentage >= 75 ? 'warning' : 'ok'}
        />

      {/* Assigned Consultant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Assigned Consultant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{'Not Assigned'}</p>
              <p className="text-sm text-muted-foreground">
                {'No email available'}
              </p>
            </div>
            <Badge variant="outline">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={onRequestSupport}
          className="h-12 flex-col gap-1 text-sm"
        >
          <MessageSquare className="h-4 w-4" />
          Request HR Support
        </Button>
        
        <Button 
          onClick={onSendOnboarding}
          variant="outline"
          className="h-12 flex-col gap-1 text-sm"
        >
          <Package className="h-4 w-4" />
          Send Onboarding Packet
        </Button>
        
        <Button 
          onClick={onUploadDocs}
          variant="outline"
          className="h-12 flex-col gap-1 text-sm"
        >
          <Upload className="h-4 w-4" />
          Upload Documents
        </Button>
        
        <Button 
          onClick={onViewHistory}
          variant="outline"
          className="h-12 flex-col gap-1 text-sm"
        >
          <History className="h-4 w-4" />
          View History
        </Button>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceLogs?.slice(0, 3).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">HR Service</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.log_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{log.hours_logged}h</Badge>
              </div>
            ))}
            
            {(!serviceLogs || serviceLogs.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Open Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Open Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requests?.filter(r => r.status === 'open').slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{request.request_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{request.priority}</Badge>
              </div>
            ))}
            
            {(!requests || requests.filter(r => r.status === 'open').length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No open requests
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="activity">
        <ClientServiceSummary companyId={clientId} />
      </TabsContent>

      <TabsContent value="reports" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Service Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientServiceSummary companyId={clientId} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
