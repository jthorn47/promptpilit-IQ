import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Users, DollarSign, Target } from 'lucide-react';

const LeadSourceAttribution = () => {
  const sampleSources = [
    {
      id: '1',
      name: 'Website',
      leads: 125,
      conversions: 23,
      conversionRate: 18.4,
      revenue: '$125,000',
      costPerLead: '$45',
      status: 'active'
    },
    {
      id: '2',
      name: 'LinkedIn Ads',
      leads: 89,
      conversions: 15,
      conversionRate: 16.9,
      revenue: '$75,000',
      costPerLead: '$67',
      status: 'active'
    },
    {
      id: '3',
      name: 'Google Ads',
      leads: 156,
      conversions: 31,
      conversionRate: 19.9,
      revenue: '$185,000',
      costPerLead: '$52',
      status: 'active'
    },
    {
      id: '4',
      name: 'Referrals',
      leads: 67,
      conversions: 28,
      conversionRate: 41.8,
      revenue: '$210,000',
      costPerLead: '$15',
      status: 'active'
    },
    {
      id: '5',
      name: 'Trade Shows',
      leads: 45,
      conversions: 8,
      conversionRate: 17.8,
      revenue: '$95,000',
      costPerLead: '$120',
      status: 'paused'
    }
  ];

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 30) return 'default';
    if (rate >= 20) return 'secondary';
    return 'outline';
  };

  return (
    <StandardPageLayout 
      title="Lead Source Attribution"
      subtitle="Track and analyze lead source performance"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Lead Source Performance</h2>
            <p className="text-muted-foreground">Analyze which sources drive the best results</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleSources.map((source) => (
            <Card key={source.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{source.name}</CardTitle>
                  <Badge variant={getStatusColor(source.status)}>
                    {source.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      Leads
                    </div>
                    <p className="text-2xl font-bold">{source.leads}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Target className="h-4 w-4 mr-1" />
                      Conversions
                    </div>
                    <p className="text-2xl font-bold">{source.conversions}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversion Rate:</span>
                    <Badge variant={getConversionColor(source.conversionRate)}>
                      {source.conversionRate}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Revenue:</span>
                    <div className="flex items-center font-medium">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {source.revenue}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cost per Lead:</span>
                    <span className="font-medium">{source.costPerLead}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                    <span className="text-muted-foreground">ROI: </span>
                    <span className="font-medium ml-1">
                      {Math.round((parseInt(source.revenue.replace(/[$,]/g, '')) / (source.leads * parseInt(source.costPerLead.replace('$', '')))) * 100)}%
                    </span>
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

export default LeadSourceAttribution;