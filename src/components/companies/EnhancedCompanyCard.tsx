import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, FileText, TrendingUp, AlertTriangle, CheckCircle2, X, Settings } from "lucide-react";
import { SalesLifecycleStage } from '@/components/SalesFunnelTiles';
import { CompanyConfigurationPanel } from './CompanyConfigurationPanel';
import { ActivityFeedTile } from '@/components/shared/ActivityFeedTile';

interface CompanyCard {
  id: string;
  company_name: string;
  sales_lifecycle_stage: SalesLifecycleStage;
  subscription_status: string;
  max_employees: number;
  created_at: string;
  last_activity_date?: string;
  has_paying_clients?: boolean;
  paying_clients_count?: number;
}

interface EnhancedCompanyCardProps {
  company: CompanyCard;
  onStageChange?: (companyId: string, newStage: SalesLifecycleStage) => Promise<boolean>;
  isSelected?: boolean;
  onSelect?: (companyId: string) => void;
}

const stageConfig = {
  // New lifecycle stages
  lead_new: { 
    label: 'Lead – New', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: Users,
    description: 'New prospect just entered the pipeline'
  },
  prospect_qualified: { 
    label: 'Prospect – Qualified', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: TrendingUp,
    description: 'Qualified prospect with validated need'
  },
  proposal_sent: { 
    label: 'Proposal Sent', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: FileText,
    description: 'Formal proposal has been submitted'
  },
  client_active: { 
    label: 'Client – Active', 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: CheckCircle2,
    description: 'Active paying client with services'
  },
  client_inactive: { 
    label: 'Client – Inactive', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: AlertTriangle,
    description: 'Inactive or churned client'
  },
  disqualified_no_fit: { 
    label: 'Disqualified / No Fit', 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    icon: AlertTriangle,
    description: 'Not a good fit for our services'
  },
  // Legacy stages for backwards compatibility
  prospect: { 
    label: 'Prospect', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: Users,
    description: 'Initial lead or prospect identified'
  },
  contacted: { 
    label: 'Contacted', 
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    icon: Users,
    description: 'First contact has been made'
  },
  engaged: { 
    label: 'Engaged', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: TrendingUp,
    description: 'Actively discussing needs and solutions'
  },
  in_onboarding: { 
    label: 'Onboarding', 
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    icon: Building2,
    description: 'Client is being onboarded'
  },
  active_paying_client: { 
    label: 'Active Client', 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: CheckCircle2,
    description: 'Active paying client with products/services'
  },
  dormant_churned: { 
    label: 'Dormant', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: AlertTriangle,
    description: 'Inactive or churned client'
  }
};

export const EnhancedCompanyCard: React.FC<EnhancedCompanyCardProps> = ({
  company,
  onStageChange,
  isSelected = false,
  onSelect
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  
  const currentStageConfig = stageConfig[company.sales_lifecycle_stage];
  const Icon = currentStageConfig.icon;

  const handleCardClick = () => {
    navigate(`/admin/companies/${company.id}`);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(company.id);
  };

  const handleManage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfigPanelOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isNewCompany = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'premium': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-500 hover:shadow-xl hover:-translate-y-2 bg-gradient-to-br from-background via-background/95 to-background/90 border-border/60 backdrop-blur-sm ${
        isSelected ? 'ring-2 ring-primary/60 shadow-2xl scale-[1.02] bg-gradient-to-br from-primary/5 to-primary/10' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <div className={`p-3 rounded-2xl ${currentStageConfig.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-lg truncate text-foreground group-hover:text-primary transition-colors duration-300">
                  {company.company_name}
                </h3>
                {isNewCompany(company.created_at) && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-primary/20 to-primary/30 text-primary border-primary/40 text-sm font-semibold shadow-md animate-pulse">
                    ✨ New
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{company.max_employees} employees</span>
                </div>
                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                <span>{formatDate(company.created_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onSelect && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors duration-300"
                onClick={handleSelect}
              >
                {isSelected ? <X className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 border-border/60 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300"
              onClick={handleManage}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Badge className={`${currentStageConfig.color} shadow-md font-semibold px-3 py-1 text-sm`} variant="outline">
              {currentStageConfig.label}
            </Badge>
            <Badge 
              variant={getStatusBadgeVariant(company.subscription_status)}
              className="shadow-md font-semibold px-3 py-1 text-sm capitalize"
            >
              {company.subscription_status}
            </Badge>
          </div>

          {/* Activity Card */}
          <div className="transform transition-all duration-300 hover:scale-[1.02]">
            <ActivityFeedTile
              entityType="company"
              entityId={company.id}
              entityName={company.company_name}
              onViewAll={() => navigate(`/admin/companies/${company.id}?tab=activities`)}
              className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300"
            />
          </div>

          {company.has_paying_clients && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-gradient-to-r from-emerald-50 to-green-100 text-green-700 border-green-300 shadow-md px-3 py-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                💰 {company.paying_clients_count} Paying Client{company.paying_clients_count !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}

          {company.last_activity_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
              <span className="font-medium">Last activity: {formatDate(company.last_activity_date)}</span>
            </div>
          )}
        </div>

        {/* Footer Description */}
        <div className="mt-4 pt-4 border-t border-border/40 bg-gradient-to-r from-muted/20 to-muted/10 -mx-6 px-6 py-3 rounded-b-lg">
          <p className="text-sm text-muted-foreground italic leading-relaxed">{currentStageConfig.description}</p>
        </div>
      </CardContent>

      <CompanyConfigurationPanel
        isOpen={isConfigPanelOpen}
        onClose={() => setIsConfigPanelOpen(false)}
        company={company}
        onSave={(updatedCompany) => {
          // Handle save logic here
          console.log('Updated company:', updatedCompany);
        }}
      />
    </Card>
  );
};