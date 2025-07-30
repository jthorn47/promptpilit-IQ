import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientMetrics } from '@/hooks/useBusinessMetrics';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ClientRevenueSection: React.FC = () => {
  const { data: clientData, isLoading } = useClientMetrics();

  // Mock data for charts and leaderboard
  const revenueByProduct = [
    { name: 'LMS', revenue: 450000 },
    { name: 'Payroll', revenue: 320000 },
    { name: 'HR Consulting', revenue: 180000 },
    { name: 'Compliance', revenue: 95000 }
  ];

  const topClients = [
    { name: 'Acme Corp', logins: 1250, lastActivity: '2024-01-22', modules: 12 },
    { name: 'TechStart Inc', logins: 980, lastActivity: '2024-01-22', modules: 8 },
    { name: 'Global Industries', logins: 756, lastActivity: '2024-01-21', modules: 15 },
    { name: 'Innovation Ltd', logins: 634, lastActivity: '2024-01-21', modules: 6 },
    { name: 'Future Corp', logins: 523, lastActivity: '2024-01-20', modules: 9 }
  ];

  const churnedClients = [
    { name: 'OldTech Solutions', terminationDate: '2024-01-15', reason: 'Budget constraints' },
    { name: 'StartupXYZ', terminationDate: '2024-01-10', reason: 'Company closure' },
    { name: 'Local Business', terminationDate: '2024-01-05', reason: 'Service mismatch' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Client Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Client Leaderboard
            <Badge variant="secondary">{topClients.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {client.logins} logins • {client.modules} modules
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Last active</div>
                  <div className="text-xs font-medium">{client.lastActivity}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Product Line */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Product Line</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByProduct}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value) => [new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0
                }).format(value as number), 'Revenue']}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Churned Clients Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Recent Churned Clients
            <Badge variant="destructive">{churnedClients.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {churnedClients.map((client, index) => (
              <div key={index} className="p-3 border rounded-lg border-red-200 bg-red-50 dark:bg-red-950/20">
                <p className="font-medium text-sm">{client.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Terminated: {client.terminationDate}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Reason: {client.reason}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};