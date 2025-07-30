import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, FileText, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SalesLifecycleStage, SalesFunnelMetrics } from '@/components/SalesFunnelTiles';

interface FilterTile {
  id: string;
  title: string;
  description: string;
  count: number;
  icon: React.ElementType;
  color: string;
  stages: SalesLifecycleStage[];
}

interface CompanyLifecycleFilterProps {
  metrics: SalesFunnelMetrics;
  selectedStages: SalesLifecycleStage[];
  onFilterClick: (stages: SalesLifecycleStage[]) => void;
  onClearFilters: () => void;
}

export const CompanyLifecycleFilter: React.FC<CompanyLifecycleFilterProps> = ({
  metrics,
  selectedStages,
  onFilterClick,
  onClearFilters
}) => {
  const filterTiles: FilterTile[] = [
    {
      id: 'leads_new',
      title: 'Leads - New',
      description: 'New prospects just entered',
      count: metrics.leadsNew || 0,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-700 border-blue-200',
      stages: ['lead_new']
    },
    {
      id: 'prospects_qualified',
      title: 'Prospects - Qualified',
      description: 'Qualified and engaged prospects',
      count: metrics.prospectsQualified || 0,
      icon: TrendingUp,
      color: 'bg-green-500/10 text-green-700 border-green-200',
      stages: ['prospect_qualified']
    },
    {
      id: 'proposals_sent',
      title: 'Proposals Sent',
      description: 'Awaiting client decision',
      count: metrics.proposalsSent || 0,
      icon: FileText,
      color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
      stages: ['proposal_sent']
    },
    {
      id: 'clients_active',
      title: 'Clients - Active',
      description: 'Active paying customers',
      count: metrics.clientsActive || 0,
      icon: CheckCircle2,
      color: 'bg-purple-500/10 text-purple-700 border-purple-200',
      stages: ['client_active']
    },
    {
      id: 'clients_inactive',
      title: 'Clients - Inactive',
      description: 'Inactive or churned clients',
      count: metrics.clientsInactive || 0,
      icon: AlertTriangle,
      color: 'bg-red-500/10 text-red-700 border-red-200',
      stages: ['client_inactive']
    },
    {
      id: 'disqualified',
      title: 'Disqualified / No Fit',
      description: 'Not a good fit for services',
      count: metrics.disqualified || 0,
      icon: AlertTriangle,
      color: 'bg-gray-500/10 text-gray-700 border-gray-200',
      stages: ['disqualified_no_fit']
    }
  ];

  const isSelected = (stages: SalesLifecycleStage[]) => {
    return selectedStages.length > 0 && 
           stages.every(stage => selectedStages.includes(stage)) &&
           selectedStages.every(stage => stages.includes(stage));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Company Pipeline</h2>
        {selectedStages.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {filterTiles.map((tile) => {
          const Icon = tile.icon;
          const isActive = isSelected(tile.stages);
          
          return (
            <Card 
              key={tile.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                isActive ? 'ring-2 ring-primary shadow-md' : ''
              }`}
              onClick={() => onFilterClick(tile.stages)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  {isActive && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-sm">{tile.title}</h3>
                  <p className="text-2xl font-bold">{tile.count}</p>
                  <p className="text-xs text-muted-foreground">{tile.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedStages.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtering by:</span>
          {selectedStages.map(stage => {
            const stageLabels = {
              lead_new: 'Lead - New',
              prospect_qualified: 'Prospect - Qualified',
              proposal_sent: 'Proposal Sent',
              client_active: 'Client - Active',
              client_inactive: 'Client - Inactive',
              disqualified_no_fit: 'Disqualified / No Fit',
              // Legacy stages for backwards compatibility
              prospect: 'Prospect',
              contacted: 'Contacted',
              engaged: 'Engaged',
              in_onboarding: 'Onboarding',
              active_paying_client: 'Active Client',
              dormant_churned: 'Dormant'
            };
            
            return (
              <Badge key={stage} variant="secondary">
                {stageLabels[stage]}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};