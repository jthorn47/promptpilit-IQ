import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useOnboardingMetrics } from '@/hooks/useBusinessMetrics';
import { Calendar, DollarSign, AlertTriangle } from 'lucide-react';

export const OperationsSection: React.FC = () => {
  const { data: onboardingData, isLoading } = useOnboardingMetrics();

  // Mock data for AR aging and support tickets
  const arAgingBuckets = [
    { bucket: 'Current', amount: 45000, count: 12 },
    { bucket: '30 days', amount: 32000, count: 8 },
    { bucket: '60 days', amount: 28000, count: 6 },
    { bucket: '90+ days', amount: 20000, count: 4 }
  ];

  const supportTicketTrends = [
    { category: 'Technical Issues', current: 45, previous: 38, trend: 'up' },
    { category: 'Account Management', current: 23, previous: 29, trend: 'down' },
    { category: 'Billing Inquiries', current: 18, previous: 15, trend: 'up' },
    { category: 'Training Support', current: 12, previous: 18, trend: 'down' },
    { category: 'General Questions', current: 8, previous: 12, trend: 'down' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'setup': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? '↗️' : '↘️';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Client Onboarding Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Client Onboarding Pipeline
            <Badge variant="secondary">{onboardingData?.activeOnboardings?.length || 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : onboardingData?.activeOnboardings?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active onboardings</p>
            ) : (
              onboardingData?.activeOnboardings?.map((client, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{client.clientName}</p>
                    <Badge variant="outline" className={getStatusColor(client.status)}>
                      {client.status}
                    </Badge>
                  </div>
                  <Progress value={client.progressPercent} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Owner: {client.owner || 'Unassigned'}</span>
                    <span>{client.progressPercent}% complete</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Open Invoices + Aging Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            AR Aging Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {arAgingBuckets.map((bucket, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{bucket.bucket}</p>
                  <p className="text-xs text-muted-foreground">{bucket.count} invoices</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0
                    }).format(bucket.amount)}
                  </p>
                  {index >= 2 && (
                    <AlertTriangle className="h-4 w-4 text-orange-500 ml-auto mt-1" />
                  )}
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex justify-between font-bold">
                <span>Total AR:</span>
                <span>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  }).format(arAgingBuckets.reduce((sum, bucket) => sum + bucket.amount, 0))}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Ticket Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Support Ticket Trends (30d)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {supportTicketTrends.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{category.category}</p>
                  <p className="text-xs text-muted-foreground">
                    Previous: {category.previous} tickets
                  </p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="font-bold">{category.current}</span>
                  <span className="text-lg">{getTrendIcon(category.trend)}</span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex justify-between font-bold">
                <span>Total Open:</span>
                <span>{supportTicketTrends.reduce((sum, cat) => sum + cat.current, 0)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};