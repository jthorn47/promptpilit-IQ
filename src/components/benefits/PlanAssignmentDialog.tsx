import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useBenefitPlanTemplates, useAssignPlanToClient, BenefitPlanTemplate } from "@/hooks/useBenefitPlans";
import { CalendarDays, Shield } from "lucide-react";

interface PlanAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

export const PlanAssignmentDialog: React.FC<PlanAssignmentDialogProps> = ({
  open,
  onOpenChange,
  clientId,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedLockedFields, setSelectedLockedFields] = useState<string[]>([]);

  const { data: planTemplates = [] } = useBenefitPlanTemplates();
  const assignPlanMutation = useAssignPlanToClient();

  const selectedPlan = planTemplates.find(p => p.id === selectedPlanId);

  const availableFieldsToLock = [
    'employee_contribution',
    'employer_contribution',
    'coverage_tiers',
    'deductible',
    'copay',
    'out_of_pocket_max',
  ];

  const handleAssign = async () => {
    if (!selectedPlanId || !effectiveDate) return;

    await assignPlanMutation.mutateAsync({
      planTemplateId: selectedPlanId,
      clientId,
      effectiveDate,
      lockedFields: selectedLockedFields,
    });

    onOpenChange(false);
    setSelectedPlanId('');
    setSelectedLockedFields([]);
  };

  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case 'medical': return 'bg-blue-100 text-blue-800';
      case 'dental': return 'bg-green-100 text-green-800';
      case 'vision': return 'bg-purple-100 text-purple-800';
      case 'life': return 'bg-red-100 text-red-800';
      case 'disability': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Global Benefit Plan</DialogTitle>
          <DialogDescription>
            Select a global benefit plan template to assign to this client. 
            You can optionally lock specific fields to prevent client-level modifications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Selection */}
          <div className="space-y-2">
            <Label htmlFor="plan-select">Select Plan Template</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a plan template..." />
              </SelectTrigger>
              <SelectContent>
                {planTemplates.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex items-center gap-2">
                      <span>{plan.name}</span>
                      {plan.carrier && (
                        <Badge variant="outline" className="text-xs">
                          {plan.carrier.name}
                        </Badge>
                      )}
                      {plan.plan_type && (
                        <Badge className={`text-xs ${getPlanTypeColor(plan.plan_type.category)}`}>
                          {plan.plan_type.category}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Plan Details */}
          {selectedPlan && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">Plan Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Carrier:</span>
                  <span className="ml-2">{selectedPlan.carrier?.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Rating Method:</span>
                  <span className="ml-2 capitalize">{selectedPlan.rating_method.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Plan Type:</span>
                  <span className="ml-2">{selectedPlan.plan_type?.description}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tier Structure:</span>
                  <span className="ml-2">{selectedPlan.tier_structure.length} tiers</span>
                </div>
              </div>
            </div>
          )}

          {/* Effective Date */}
          <div className="space-y-2">
            <Label htmlFor="effective-date">Effective Date</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="effective-date"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Locked Fields */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Label>Lock Fields (Prevent Client Modifications)</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availableFieldsToLock.map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={selectedLockedFields.includes(field)}
                    onCheckedChange={(checked) => {
                      setSelectedLockedFields(prev =>
                        checked
                          ? [...prev, field]
                          : prev.filter(f => f !== field)
                      );
                    }}
                  />
                  <Label 
                    htmlFor={field} 
                    className="text-sm font-normal capitalize"
                  >
                    {field.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
            {selectedLockedFields.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedLockedFields.length} field(s) will be locked from client modifications
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={assignPlanMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedPlanId || !effectiveDate || assignPlanMutation.isPending}
          >
            {assignPlanMutation.isPending ? 'Assigning...' : 'Assign Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};