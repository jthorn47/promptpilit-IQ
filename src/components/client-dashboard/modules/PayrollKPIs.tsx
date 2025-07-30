import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  FileCheck,
  Send,
  History
} from 'lucide-react';

export const PayrollKPIs: React.FC = () => {
  // TODO: Replace with actual API call
  const payrollData = {
    totalWages: 125000,
    headcount: 45,
    nextPayDate: '2025-01-31',
    taxFilingStatus: 'Current',
    currency: 'USD'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: payrollData.currency,
    }).format(amount);
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
          <DollarSign className="h-5 w-5 text-primary" />
          Payroll Management
        </CardTitle>
        <Badge variant="secondary">Active</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Total Wages</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(payrollData.totalWages)}
            </div>
            <div className="text-xs text-muted-foreground">this period</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Headcount</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {payrollData.headcount}
            </div>
            <div className="text-xs text-muted-foreground">active employees</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-muted-foreground">Next Pay Date</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatDate(payrollData.nextPayDate)}
            </div>
            <div className="text-xs text-muted-foreground">upcoming</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Tax Filing</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {payrollData.taxFilingStatus}
            </div>
            <div className="text-xs text-green-600">up to date</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            Submit Payroll
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <History className="h-4 w-4 mr-2" />
            Pay History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};