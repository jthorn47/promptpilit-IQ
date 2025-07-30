import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

export const RenewalsManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockRenewals = [
    {
      id: '1',
      certificateName: 'CPR Certification',
      learnerName: 'John Smith',
      dueDate: '2024-02-15',
      status: 'overdue',
      daysPastDue: 5
    },
    {
      id: '2',
      certificateName: 'First Aid Training',
      learnerName: 'Sarah Johnson',
      dueDate: '2024-02-20',
      status: 'due_soon',
      daysPastDue: 0
    },
    {
      id: '3',
      certificateName: 'OSHA Safety Training',
      learnerName: 'Mike Davis',
      dueDate: '2024-03-01',
      status: 'upcoming',
      daysPastDue: 0
    }
  ];

  const getStatusBadge = (status: string, daysPastDue: number) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive">Overdue ({daysPastDue} days)</Badge>;
      case 'due_soon':
        return <Badge variant="secondary">Due Soon</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Renewals Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Renewal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">1</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">1</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Month</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">2</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">23</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search renewals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Renewals List */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRenewals.map((renewal) => (
              <div key={renewal.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{renewal.certificateName}</div>
                  <div className="text-sm text-muted-foreground">{renewal.learnerName}</div>
                  <div className="text-sm text-muted-foreground">Due: {renewal.dueDate}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(renewal.status, renewal.daysPastDue)}
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};