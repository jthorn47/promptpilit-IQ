import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, Users, Clock, AlertTriangle, ExternalLink } from "lucide-react";
import { useLifecycleFunnel } from "../hooks/useLifecycleFunnel";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface FunnelStage {
  key: string;
  label: string;
  count: number;
  percentage: number;
  avgDaysInStage: number;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  tooltip: string;
  action: () => void;
}

export const LifecycleFunnelTile = () => {
  const { data: funnelData, isLoading } = useLifecycleFunnel();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const navigate = useNavigate();

  const totalClients = funnelData ? 
    (funnelData.signedUpNoPurchase + funnelData.purchasedNotOnboarded + 
     funnelData.onboardingInProgress + funnelData.onboardedNoTraining + 
     funnelData.trainingStarted + funnelData.trainingCompleted) : 0;

  const stages: FunnelStage[] = [
    {
      key: 'signed_up_no_purchase',
      label: 'Signed Up – No Purchase',
      count: funnelData?.signedUpNoPurchase || 0,
      percentage: totalClients > 0 ? Math.round((funnelData?.signedUpNoPurchase || 0) / totalClients * 100) : 0,
      avgDaysInStage: 12, // TODO: Calculate from actual data
      trend: 'down',
      status: 'warning',
      tooltip: 'Companies that have signed up but haven\'t made a purchase yet. Click to review and assign sales follow-up.',
      action: () => navigate('/admin/companies?filter=lifecycle:signed_up_no_purchase')
    },
    {
      key: 'purchased_not_onboarded',
      label: 'Purchased – Not Onboarded',
      count: funnelData?.purchasedNotOnboarded || 0,
      percentage: totalClients > 0 ? Math.round((funnelData?.purchasedNotOnboarded || 0) / totalClients * 100) : 0,
      avgDaysInStage: 8, // TODO: Calculate from actual data
      trend: 'up',
      status: 'critical',
      tooltip: 'Clients who have purchased but haven\'t started onboarding. Immediate action required to initiate onboarding process.',
      action: () => navigate('/admin/companies?filter=lifecycle:purchased_not_onboarded')
    },
    {
      key: 'onboarding_in_progress',
      label: 'Onboarding In Progress',
      count: funnelData?.onboardingInProgress || 0,
      percentage: totalClients > 0 ? Math.round((funnelData?.onboardingInProgress || 0) / totalClients * 100) : 0,
      avgDaysInStage: 5, // TODO: Calculate from actual data
      trend: 'stable',
      status: 'healthy',
      tooltip: 'Clients currently going through the onboarding process. Monitor progress and provide support as needed.',
      action: () => navigate('/admin/companies?filter=lifecycle:onboarding_in_progress')
    },
    {
      key: 'onboarded_no_training',
      label: 'Onboarded – No Training Started',
      count: funnelData?.onboardedNoTraining || 0,
      percentage: totalClients > 0 ? Math.round((funnelData?.onboardedNoTraining || 0) / totalClients * 100) : 0,
      avgDaysInStage: 14, // TODO: Calculate from actual data
      trend: 'down',
      status: 'warning',
      tooltip: 'Clients who completed onboarding but haven\'t started training. Help them set up learners and assign modules.',
      action: () => navigate('/admin/companies?filter=lifecycle:onboarded_no_training')
    },
    {
      key: 'training_started',
      label: 'Training Started',
      count: funnelData?.trainingStarted || 0,
      percentage: totalClients > 0 ? Math.round((funnelData?.trainingStarted || 0) / totalClients * 100) : 0,
      avgDaysInStage: 7, // TODO: Calculate from actual data
      trend: 'up',
      status: 'healthy',
      tooltip: 'Clients with active training sessions. Monitor completion rates and provide guidance.',
      action: () => navigate('/admin/companies?filter=lifecycle:training_started')
    },
    {
      key: 'training_completed',
      label: 'Training Completed',
      count: funnelData?.trainingCompleted || 0,
      percentage: totalClients > 0 ? Math.round((funnelData?.trainingCompleted || 0) / totalClients * 100) : 0,
      avgDaysInStage: 0, // Completed stage
      trend: 'up',
      status: 'healthy',
      tooltip: 'Clients who have successfully completed training. Consider renewal opportunities and advanced modules.',
      action: () => navigate('/admin/companies?filter=lifecycle:training_completed')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-emerald-500/20 text-emerald-700 border-emerald-200';
      case 'warning': return 'bg-amber-500/20 text-amber-700 border-amber-200';
      case 'critical': return 'bg-red-500/20 text-red-700 border-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-emerald-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <div className="w-3 h-3 bg-muted-foreground/50 rounded-full" />;
    }
  };

  const handleStageClick = (stageKey: string) => {
    setSelectedStage(stageKey);
    // TODO: Navigate to filtered client list
    console.log('Navigate to filtered clients for stage:', stageKey);
  };

  return (
    <Card className="shadow-elegant border-0 bg-gradient-to-br from-card via-card/95 to-card/90">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">EaseLearn Lifecycle Funnel</CardTitle>
              <p className="text-sm text-muted-foreground">
                Client progression through LMS journey stages
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/5">
            {stages.reduce((sum, stage) => sum + stage.count, 0)} Total Clients
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {stages.map((stage, index) => (
              <div
                key={stage.key}
                className={cn(
                  "group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer",
                  "hover:shadow-lg hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent",
                  selectedStage === stage.key && "border-primary bg-primary/5"
                )}
                onClick={() => handleStageClick(stage.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Stage Number */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                      getStatusColor(stage.status)
                    )}>
                      {index + 1}
                    </div>
                    
                    {/* Stage Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{stage.label}</h4>
                        {stage.status === 'critical' && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {stage.count} clients
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {stage.avgDaysInStage} avg days
                        </span>
                        <span className="flex items-center gap-1">
                          {getTrendIcon(stage.trend)}
                          {stage.percentage}% of total
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-24 ml-4">
                    <Progress 
                      value={stage.percentage} 
                      className="h-2"
                    />
                  </div>
                  
                  {/* Count Badge */}
                  <div className="ml-4">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "font-semibold",
                        stage.status === 'critical' && "bg-red-500/10 text-red-700",
                        stage.status === 'warning' && "bg-amber-500/10 text-amber-700",
                        stage.status === 'healthy' && "bg-emerald-500/10 text-emerald-700"
                      )}
                    >
                      {stage.count}
                    </Badge>
                  </div>
                </div>
                
                {/* Hover indicator */}
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary/20 transition-colors pointer-events-none" />
              </div>
            ))}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => console.log('Export funnel data')}
          >
            Export Data
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => console.log('View detailed analytics')}
          >
            Detailed View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};