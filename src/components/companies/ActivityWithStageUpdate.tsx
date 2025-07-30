import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { SalesLifecycleStage } from '@/components/SalesFunnelTiles';

interface ActivityStageUpdatePromptProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activityType: string;
  companyName: string;
  currentStage: SalesLifecycleStage;
  suggestedStage: SalesLifecycleStage;
  onConfirm: () => void;
  onSkip: () => void;
}

const stageLabels = {
  lead_new: 'Lead – New',
  prospect_qualified: 'Prospect – Qualified',
  proposal_sent: 'Proposal Sent',
  client_active: 'Client – Active',
  client_inactive: 'Client – Inactive',
  disqualified_no_fit: 'Disqualified / No Fit',
  // Legacy stages
  prospect: 'Prospect',
  contacted: 'Contacted',
  engaged: 'Engaged',
  in_onboarding: 'Onboarding',
  active_paying_client: 'Active Client',
  dormant_churned: 'Dormant'
};

const getActivityStageMapping = (activityType: string): SalesLifecycleStage | null => {
  const mappings: Record<string, SalesLifecycleStage> = {
    'Proposal Sent': 'proposal_sent',
    'Contract Signed': 'client_active',
    'Initial Contact': 'prospect_qualified',
    'Qualification Call': 'prospect_qualified',
    'Demo Completed': 'prospect_qualified',
    'Follow-up': 'prospect_qualified',
    'Client Onboarding': 'client_active',
    'Service Delivery': 'client_active',
    'Client Meeting': 'client_active',
  };
  
  return mappings[activityType] || null;
};

export const ActivityStageUpdatePrompt: React.FC<ActivityStageUpdatePromptProps> = ({
  isOpen,
  onOpenChange,
  activityType,
  companyName,
  currentStage,
  suggestedStage,
  onConfirm,
  onSkip
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Lifecycle Stage?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              You just logged a <strong>"{activityType}"</strong> activity for <strong>{companyName}</strong>.
            </p>
            
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current stage:</span>
                <Badge variant="outline">{stageLabels[currentStage] || currentStage}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Suggested stage:</span>
                <Badge variant="default">{stageLabels[suggestedStage] || suggestedStage}</Badge>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Would you like to update the lifecycle stage to better reflect this progress?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onSkip}>
            Skip for now
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Update Stage
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Hook to manage activity-stage workflow
export const useActivityStageUpdate = (
  companyId: string,
  currentStage: SalesLifecycleStage,
  onStageUpdate: (companyId: string, newStage: SalesLifecycleStage) => Promise<boolean>
) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [suggestedStage, setSuggestedStage] = useState<SalesLifecycleStage | null>(null);
  const [activityType, setActivityType] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');

  const checkForStageUpdate = (
    activityTypeInput: string, 
    companyNameInput: string
  ) => {
    const suggested = getActivityStageMapping(activityTypeInput);
    
    if (suggested && suggested !== currentStage) {
      // Only suggest if it's a progression forward
      const stageOrder = {
        lead_new: 1,
        prospect_qualified: 2,
        proposal_sent: 3,
        client_active: 4,
        client_inactive: 5,
        disqualified_no_fit: 6,
        // Legacy stages
        prospect: 1,
        contacted: 1.5,
        engaged: 2,
        in_onboarding: 3.5,
        active_paying_client: 4,
        dormant_churned: 5
      };
      
      const currentOrder = stageOrder[currentStage] || 0;
      const suggestedOrder = stageOrder[suggested] || 0;
      
      if (suggestedOrder > currentOrder) {
        setSuggestedStage(suggested);
        setActivityType(activityTypeInput);
        setCompanyName(companyNameInput);
        setShowPrompt(true);
      }
    }
  };

  const handleConfirmUpdate = async () => {
    if (suggestedStage) {
      await onStageUpdate(companyId, suggestedStage);
    }
    setShowPrompt(false);
  };

  const handleSkipUpdate = () => {
    setShowPrompt(false);
  };

  return {
    showPrompt,
    suggestedStage,
    activityType,
    companyName,
    checkForStageUpdate,
    handleConfirmUpdate,
    handleSkipUpdate,
    setShowPrompt
  };
};