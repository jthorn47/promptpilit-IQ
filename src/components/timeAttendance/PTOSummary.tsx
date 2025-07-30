import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Clock } from 'lucide-react';
import { PTORequest, PTOBalance } from '@/types/timeAttendance';

interface PTOSummaryProps {
  ptoRequests: PTORequest[];
  ptoBalances: PTOBalance[];
  onNewRequest?: () => void;
}

export const PTOSummary: React.FC<PTOSummaryProps> = ({
  ptoRequests,
  ptoBalances,
  onNewRequest,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      approved: { variant: 'default' as const, label: 'Approved' },
      denied: { variant: 'destructive' as const, label: 'Denied' },
      cancelled: { variant: 'outline' as const, label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPTOTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      vacation: '🏖️',
      sick: '🤒',
      personal: '👤',
      holiday: '🎉',
      bereavement: '💐',
    };
    return icons[type] || '📅';
  };

  return (
    <div className="space-y-6">
      {/* PTO Balances */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                PTO Balances
              </CardTitle>
              <CardDescription>Available time off for 2024</CardDescription>
            </div>
            {onNewRequest && (
              <Button onClick={onNewRequest} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Request PTO
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ptoBalances.map((balance) => (
              <div
                key={balance.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium capitalize">{balance.pto_type}</h4>
                  <Badge variant="outline">{balance.year}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Available:</span>
                    <span className="font-mono font-bold text-green-600">
                      {balance.available_hours}h
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Used:</span>
                    <span className="font-mono">{balance.used_hours}h</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Accrued:</span>
                    <span className="font-mono">{balance.accrued_hours}h</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${Math.min((balance.used_hours / balance.accrued_hours) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent PTO Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent PTO Requests
          </CardTitle>
          <CardDescription>Your time off requests and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ptoRequests.map((request) => (
              <div
                key={request.id}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getPTOTypeIcon(request.request_type)}
                  </div>
                  <div>
                    <div className="font-medium capitalize">
                      {request.request_type}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(request.start_date)}
                      {request.start_date !== request.end_date && 
                        ` - ${formatDate(request.end_date)}`
                      }
                    </div>
                    {request.reason && (
                      <div className="text-xs text-muted-foreground">
                        {request.reason}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  {getStatusBadge(request.status)}
                  <div className="text-sm font-mono">
                    {request.hours_requested}h
                  </div>
                </div>
              </div>
            ))}
          </div>

          {ptoRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No PTO requests found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};