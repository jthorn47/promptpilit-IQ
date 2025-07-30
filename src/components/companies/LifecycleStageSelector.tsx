import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { SalesLifecycleStage } from '@/components/SalesFunnelTiles';
import { Company } from '@/hooks/useCompanies';

interface LifecycleStageSelectorProps {
  company: Company;
  onStageChange: (companyId: string, newStage: SalesLifecycleStage) => Promise<boolean>;
  disabled?: boolean;
}

const stageConfig = {
  // New lifecycle stages
  lead_new: { 
    label: 'Lead – New', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    description: 'New prospect just entered the pipeline'
  },
  prospect_qualified: { 
    label: 'Prospect – Qualified', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    description: 'Qualified prospect with validated need'
  },
  proposal_sent: { 
    label: 'Proposal Sent', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    description: 'Formal proposal has been submitted'
  },
  client_active: { 
    label: 'Client – Active', 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    description: 'Active paying client with services'
  },
  client_inactive: { 
    label: 'Client – Inactive', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    description: 'Inactive or churned client'
  },
  disqualified_no_fit: { 
    label: 'Disqualified / No Fit', 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    description: 'Not a good fit for our services'
  },
  // Legacy stages for backwards compatibility
  prospect: { 
    label: 'Prospect', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    description: 'Initial lead or prospect identified'
  },
  contacted: { 
    label: 'Contacted', 
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    description: 'First contact has been made'
  },
  engaged: { 
    label: 'Engaged', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    description: 'Actively discussing needs and solutions'
  },
  in_onboarding: { 
    label: 'Onboarding', 
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    description: 'Client is being onboarded'
  },
  active_paying_client: { 
    label: 'Active Client', 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    description: 'Active paying client with products/services'
  },
  dormant_churned: { 
    label: 'Dormant', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    description: 'Inactive or churned client'
  }
};

export const LifecycleStageSelector: React.FC<LifecycleStageSelectorProps> = ({
  company,
  onStageChange,
  disabled = false
}) => {
  const [selectedStage, setSelectedStage] = useState<SalesLifecycleStage | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  const currentStageConfig = stageConfig[company.sales_lifecycle_stage];

  const handleStageSelect = (newStage: SalesLifecycleStage) => {
    setSelectedStage(newStage);
    
    // Check if this is a change to client_active (company to client conversion)
    if (newStage === 'client_active' && company.sales_lifecycle_stage !== 'client_active') {
      setShowConfirmDialog(true);
    }
    // Check if this is a downgrade from active_paying_client
    else if (company.sales_lifecycle_stage === 'active_paying_client' && 
        newStage !== 'active_paying_client' && 
        company.has_paying_clients) {
      setShowConfirmDialog(true);
    } else {
      handleConfirmStageChange();
    }
  };

  const handleConfirmStageChange = async () => {
    if (!selectedStage) return;
    
    setUpdating(true);
    try {
      const success = await onStageChange(company.id, selectedStage);
      if (success) {
        setShowConfirmDialog(false);
        setSelectedStage(null);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelStageChange = () => {
    setShowConfirmDialog(false);
    setSelectedStage(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge 
          className={currentStageConfig.color}
        >
          {currentStageConfig.label}
        </Badge>
        
        {company.has_paying_clients && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
            Paying Client
          </Badge>
        )}
        
        <Select
          value=""
          onValueChange={handleStageSelect}
          disabled={disabled || updating}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Change..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(stageConfig).map(([stage, config]) => (
              <SelectItem 
                key={stage} 
                value={stage}
                disabled={stage === company.sales_lifecycle_stage}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.color.split(' ')[0]}`} />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedStage === 'client_active' ? 'Convert to Active Client' : 'Confirm Lifecycle Stage Change'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {selectedStage === 'client_active' ? (
                <>
                  <p>
                    You are about to convert <strong>{company.company_name}</strong> from 
                    <span className="font-semibold"> {stageConfig[company.sales_lifecycle_stage].label}</span> to 
                    <span className="font-semibold text-purple-600"> Active Client</span>.
                  </p>
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      ✅ This will automatically create a client record and enable HR/Payroll modules.
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      The company will be moved to the clients system and can start using employee management features.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    You are about to change <strong>{company.company_name}</strong> from 
                    <span className="font-semibold text-purple-600"> Active Paying Client</span> to 
                    <span className="font-semibold"> {selectedStage ? stageConfig[selectedStage].label : ''}</span>.
                  </p>
                  <p className="text-orange-600 font-medium">
                    ⚠️ This company has active paying clients. Are you sure you want to downgrade their lifecycle stage?
                  </p>
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Current paying clients:</strong> {company.paying_clients_count}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This action will not affect their payment status, but may impact reporting and funnel metrics.
                    </p>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelStageChange} disabled={updating}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStageChange}
              disabled={updating}
              className={selectedStage === 'client_active' ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              {updating ? "Updating..." : selectedStage === 'client_active' ? "Convert to Client" : "Confirm Change"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};