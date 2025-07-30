import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, FileText, DollarSign, Calendar, Plus } from 'lucide-react';
import { StandardLayout } from '@/components/layouts/StandardLayout';

export const ClientBillingPage: React.FC = () => {
  const billingStats = [
    {
      title: 'Total Revenue',
      value: '$0',
      description: 'This month',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Contracts',
      value: '0',
      description: 'Currently active',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Pending Invoices',
      value: '0',
      description: 'Awaiting payment',
      icon: CreditCard,
      color: 'text-orange-600'
    },
    {
      title: 'Upcoming Renewals',
      value: '0',
      description: 'Next 30 days',
      icon: Calendar,
      color: 'text-purple-600'
    }
  ];

  return (
    <StandardLayout 
      title="Client Billing"
      subtitle="Manage client contracts and billing information"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Billing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {billingStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest billing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Invoices Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first invoice to start tracking billing</p>
              <Button variant="outline">
                Create First Invoice
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contract Management */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Management</CardTitle>
            <CardDescription>Manage client contracts and agreements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Contracts</h3>
              <p className="text-muted-foreground mb-4">Set up client contracts to manage billing and renewals</p>
              <Button variant="outline">
                Create Contract Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardLayout>
  );
};