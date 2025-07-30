import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Users, Mail, BarChart } from 'lucide-react';

export default function Campaigns() {
  const campaigns = [
    {
      id: 1,
      name: "Q4 Product Launch",
      description: "Comprehensive marketing campaign for new product line",
      status: "active",
      progress: 75,
      budget: 50000,
      spent: 37500,
      reach: 125000,
      conversions: 2450,
      startDate: "2024-01-01",
      endDate: "2024-03-31"
    },
    {
      id: 2,
      name: "Holiday Email Series",
      description: "Seasonal email marketing campaign targeting existing customers",
      status: "completed",
      progress: 100,
      budget: 15000,
      spent: 14200,
      reach: 85000,
      conversions: 3200,
      startDate: "2023-12-01", 
      endDate: "2023-12-31"
    },
    {
      id: 3,
      name: "Social Media Awareness",
      description: "Brand awareness campaign across social media platforms",
      status: "draft",
      progress: 25,
      budget: 25000,
      spent: 0,
      reach: 0,
      conversions: 0,
      startDate: "2024-02-01",
      endDate: "2024-04-30"
    },
    {
      id: 4,
      name: "Customer Retention",
      description: "Re-engagement campaign for dormant customers",
      status: "active",
      progress: 45,
      budget: 18000,
      spent: 8100,
      reach: 32000,
      conversions: 890,
      startDate: "2024-01-15",
      endDate: "2024-02-28"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  return (
    <StandardPageLayout
      title="Campaign Management"
      subtitle="Create and manage your marketing campaigns"
      badge={`${activeCampaigns} Active`}
      headerActions={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      }
    >
      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Campaigns
            </CardTitle>
            <Target className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">{activeCampaigns} currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
            <BarChart className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalSpent)} spent ({Math.round((totalSpent/totalBudget) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reach
            </CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.reach, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">People reached</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversions
            </CardTitle>
            <Mail className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.conversions, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total conversions</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                <Badge variant={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>
              <CardDescription>{campaign.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{campaign.progress}%</span>
                </div>
                <Progress value={campaign.progress} className="h-2" />
              </div>

              {/* Budget */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">{formatCurrency(campaign.budget)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="font-semibold">{formatCurrency(campaign.spent)}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Reach</p>
                  <p className="font-semibold">{campaign.reach.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                  <p className="font-semibold">{campaign.conversions.toLocaleString()}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPageLayout>
  );
}