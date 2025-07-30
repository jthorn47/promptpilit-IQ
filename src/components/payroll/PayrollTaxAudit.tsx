
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useBackgroundTaxProcessing } from '@/hooks/useBackgroundTaxProcessing';

interface PayrollTaxAuditProps {
  companyId?: string;
  className?: string;
}

export const PayrollTaxAudit: React.FC<PayrollTaxAuditProps> = ({
  companyId,
  className
}) => {
  const { useBackgroundJobLogs } = useBackgroundTaxProcessing();
  
  const { data: jobLogs, isLoading } = useBackgroundJobLogs('payroll_tax_calculation_batch');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'completed' ? 'default' : 
                   status === 'failed' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tax Calculation Audit Trail</span>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading audit trail...</p>
          </div>
        ) : jobLogs && Array.isArray(jobLogs) && jobLogs.length > 0 ? (
          <div className="space-y-3">
            {jobLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <div className="font-medium text-sm">
                      Tax Calculation Batch
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                    {log.job_data && (
                      <div className="text-xs text-muted-foreground">
                        Processed: {log.job_data.results_count || 0} of {log.job_data.jobs_count || 0} employees
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(log.status)}
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tax calculation history found.</p>
            <p className="text-sm">Audit trail will appear here after running payroll.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
