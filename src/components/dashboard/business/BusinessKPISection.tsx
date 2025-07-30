import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  useClientMetrics, 
  useRevenueMetrics, 
  useFinanceMetrics, 
  useTrainingMetrics, 
  useSupportMetrics 
} from '@/hooks/useBusinessMetrics';
import { Users, DollarSign, Clock, GraduationCap, Receipt } from 'lucide-react';

export const BusinessKPISection: React.FC = () => {
  const { data: clientData, isLoading: clientLoading } = useClientMetrics();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueMetrics();
  const { data: financeData, isLoading: financeLoading } = useFinanceMetrics();
  const { data: trainingData, isLoading: trainingLoading } = useTrainingMetrics();
  const { data: supportData, isLoading: supportLoading } = useSupportMetrics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const kpiCards = [
    {
      title: 'Total Clients',
      value: clientData?.totalActiveClients || 0,
      icon: Users,
      isLoading: clientLoading,
      format: (val: number) => val.toString(),
      color: 'text-blue-600'
    },
    {
      title: 'Monthly Recurring Revenue',
      value: revenueData?.monthlyRecurringRevenue || 0,
      icon: DollarSign,
      isLoading: revenueLoading,
      format: formatCurrency,
      color: 'text-green-600'
    },
    {
      title: 'Total AR Balance',
      value: financeData?.totalARBalance || 0,
      icon: Receipt,
      isLoading: financeLoading,
      format: formatCurrency,
      color: 'text-orange-600'
    },
    {
      title: 'Training Completion Rate',
      value: trainingData?.completionRate || 0,
      icon: GraduationCap,
      isLoading: trainingLoading,
      format: (val: number) => `${val}%`,
      color: 'text-purple-600'
    },
    {
      title: 'Avg Support Ticket Close Time',
      value: supportData?.avgCloseTimeHours || 0,
      icon: Clock,
      isLoading: supportLoading,
      format: (val: number) => `${val}h`,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpiCards.map((kpi, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpi.isLoading ? (
                <div className="animate-pulse bg-muted h-8 w-16 rounded"></div>
              ) : (
                kpi.format(kpi.value)
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};