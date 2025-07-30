import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, DollarSign } from 'lucide-react';

const ClientContracts = () => {
  const sampleContracts = [
    {
      id: '1',
      title: 'Enterprise Software License',
      client: 'Acme Corporation',
      value: '$50,000',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      type: 'Annual'
    },
    {
      id: '2',
      title: 'Consulting Services Agreement',
      client: 'Tech Solutions Inc',
      value: '$25,000',
      startDate: '2024-02-15',
      endDate: '2024-08-15',
      status: 'pending',
      type: 'Fixed Term'
    },
    {
      id: '3',
      title: 'Maintenance & Support',
      client: 'StartupXYZ',
      value: '$12,000',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      type: 'Recurring'
    },
    {
      id: '4',
      title: 'Custom Development',
      client: 'Innovation Labs',
      value: '$75,000',
      startDate: '2024-03-01',
      endDate: '2024-09-30',
      status: 'draft',
      type: 'Project'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <StandardPageLayout 
      title="Client Contracts"
      subtitle="Manage client contracts and agreements"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Contract Management</h2>
            <p className="text-muted-foreground">Track and manage all client contracts</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleContracts.map((contract) => (
            <Card key={contract.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <CardTitle className="text-lg">{contract.title}</CardTitle>
                  </div>
                  <Badge variant={getStatusColor(contract.status)}>
                    {contract.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Client:</span>
                  <span className="font-medium">{contract.client}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Value:</span>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="font-medium">{contract.value}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge variant="outline">{contract.type}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{contract.startDate}</span>
                  </div>
                  <span>to</span>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{contract.endDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StandardPageLayout>
  );
};

export default ClientContracts;