import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Eye, 
  MessageCircle, 
  FileText, 
  Settings, 
  DollarSign, 
  Clock 
} from 'lucide-react';

export type SalesLifecycleStage = 
  | 'lead_new'
  | 'prospect_qualified'
  | 'proposal_sent'
  | 'client_active'
  | 'client_inactive'
  | 'disqualified_no_fit'
  // Legacy stages for backwards compatibility
  | 'prospect' 
  | 'contacted' 
  | 'engaged' 
  | 'in_onboarding' 
  | 'active_paying_client' 
  | 'dormant_churned';

export interface SalesFunnelMetrics {
  // New lifecycle stages
  leadsNew?: number; // lead_new
  prospectsQualified?: number; // prospect_qualified
  proposalsSent: number; // proposal_sent
  clientsActive?: number; // client_active
  clientsInactive?: number; // client_inactive
  disqualified?: number; // disqualified_no_fit
  // Legacy metrics for backwards compatibility
  prospectsInPipeline: number; // prospect + contacted
  engagedLeads: number; // engaged
  clientsOnboarding: number; // in_onboarding
  activePayingClients: number; // active_paying_client
  dormantAccounts: number; // dormant_churned
}

export interface SalesFunnelTile {
  id: string;
  title: string;
  count: number;
  stages: SalesLifecycleStage[];
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  hoverColorClass: string;
  badgeColorClass: string;
  tooltip?: string;
}

interface SalesFunnelTilesProps {
  metrics: SalesFunnelMetrics;
  isLoading?: boolean;
  onTileClick?: (stages: SalesLifecycleStage[]) => void;
  selectedStages?: SalesLifecycleStage[];
}

export const SalesFunnelTiles: React.FC<SalesFunnelTilesProps> = ({
  metrics,
  isLoading = false,
  onTileClick,
  selectedStages = []
}) => {
  const tiles: SalesFunnelTile[] = [
    {
      id: 'prospects-pipeline',
      title: 'Prospects in Pipeline',
      count: metrics.prospectsInPipeline,
      stages: ['prospect', 'contacted'],
      icon: Eye,
      colorClass: 'bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:hover:bg-blue-900',
      hoverColorClass: 'group-hover:text-blue-700 dark:group-hover:text-blue-300',
      badgeColorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      id: 'engaged-leads',
      title: 'Engaged Leads', 
      count: metrics.engagedLeads,
      stages: ['engaged'],
      icon: MessageCircle,
      colorClass: 'bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:border-green-800 dark:hover:bg-green-900',
      hoverColorClass: 'group-hover:text-green-700 dark:group-hover:text-green-300',
      badgeColorClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    {
      id: 'proposals-sent',
      title: 'Proposals Sent',
      count: metrics.proposalsSent,
      stages: ['proposal_sent'],
      icon: FileText,
      colorClass: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950 dark:border-yellow-800 dark:hover:bg-yellow-900',
      hoverColorClass: 'group-hover:text-yellow-700 dark:group-hover:text-yellow-300',
      badgeColorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    },
    {
      id: 'clients-onboarding',
      title: 'Clients Onboarding',
      count: metrics.clientsOnboarding,
      stages: ['in_onboarding'],
      icon: Settings,
      colorClass: 'bg-orange-50 border-orange-200 hover:bg-orange-100 dark:bg-orange-950 dark:border-orange-800 dark:hover:bg-orange-900',
      hoverColorClass: 'group-hover:text-orange-700 dark:group-hover:text-orange-300',
      badgeColorClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    },
    {
      id: 'active-paying-clients',
      title: 'Active Paying Clients',
      count: metrics.activePayingClients,
      stages: ['active_paying_client'],
      icon: DollarSign,
      colorClass: 'bg-purple-50 border-purple-200 hover:bg-purple-100 dark:bg-purple-950 dark:border-purple-800 dark:hover:bg-purple-900',
      hoverColorClass: 'group-hover:text-purple-700 dark:group-hover:text-purple-300',
      badgeColorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      tooltip: 'Companies with at least one paying client and active product.'
    },
    {
      id: 'dormant-accounts',
      title: 'Dormant Accounts',
      count: metrics.dormantAccounts,
      stages: ['dormant_churned'],
      icon: Clock,
      colorClass: 'bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:border-red-800 dark:hover:bg-red-900',
      hoverColorClass: 'group-hover:text-red-700 dark:group-hover:text-red-300',
      badgeColorClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  ];

  const isStagesSelected = (stages: SalesLifecycleStage[]) => {
    return stages.some(stage => selectedStages.includes(stage));
  };

  const handleTileClick = (tile: SalesFunnelTile) => {
    if (onTileClick) {
      // If the tile is already selected, deselect it (pass empty array)
      // Otherwise, select this tile's stages
      const isSelected = isStagesSelected(tile.stages);
      onTileClick(isSelected ? [] : tile.stages);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-12"></div>
                </div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const isSelected = isStagesSelected(tile.stages);
          
          const cardContent = (
            <Card 
              key={tile.id}
              className={`
                group cursor-pointer transition-all duration-200 animate-fade-in hover-scale
                ${tile.colorClass}
                ${isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-lg'}
              `}
              onClick={() => handleTileClick(tile)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTileClick(tile);
                }
              }}
              aria-label={`Filter by ${tile.title}: ${tile.count} companies`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`
                        text-sm font-medium text-muted-foreground transition-colors
                        ${tile.hoverColorClass}
                      `}>
                        {tile.title}
                      </h3>
                      {isSelected && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`
                        text-2xl font-bold transition-colors
                        ${tile.hoverColorClass}
                      `}>
                        {tile.count.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className={`
                    p-3 rounded-lg transition-all duration-200
                    ${tile.badgeColorClass}
                    group-hover:scale-110
                  `}>
                    <Icon className={`
                      h-5 w-5 transition-colors
                      ${tile.hoverColorClass}
                    `} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );

          if (tile.tooltip) {
            return (
              <Tooltip key={tile.id}>
                <TooltipTrigger asChild>
                  {cardContent}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tile.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return cardContent;
        })}
      </div>
    </TooltipProvider>
  );
};
