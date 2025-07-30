import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe,
  Plus,
  Heart,
  Lock,
  Copy,
  Trash2,
  Building2
} from 'lucide-react';
import { useBenefitPlanAssignments } from '@/hooks/useBenefitPlans';
import { PlanAssignmentDialog } from '@/components/benefits/PlanAssignmentDialog';

interface BenefitsAdministrationProps {
  clientId?: string;
}

export const BenefitsAdministration: React.FC<BenefitsAdministrationProps> = ({ clientId }) => {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const { data: planAssignments = [], isLoading } = useBenefitPlanAssignments(clientId || '');

  const getPlanTypeColor = (category: string) => {
    switch (category) {
      case 'medical': return 'bg-blue-100 text-blue-800';
      case 'dental': return 'bg-green-100 text-green-800';
      case 'vision': return 'bg-purple-100 text-purple-800';
      case 'life': return 'bg-red-100 text-red-800';
      case 'disability': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{planAssignments.length}</div>
          <div className="text-sm text-muted-foreground">Total Plans</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{planAssignments.filter(p => p.source === 'global').length}</div>
          <div className="text-sm text-muted-foreground">Global Plans</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          onClick={() => setShowAssignDialog(true)} 
          size="sm"
          disabled={!clientId}
          className="flex-1"
        >
          <Globe className="w-4 h-4 mr-2" />
          Assign Global Plan
        </Button>
      </div>

      {/* Assigned Plans List */}
      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground">
          Loading plans...
        </div>
      ) : planAssignments.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Heart className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm">No benefit plans assigned</p>
          <p className="text-xs">Use "Assign Global Plan" to get started</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {planAssignments.map((assignment) => (
            <div key={assignment.id} className="p-2 border rounded text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{assignment.plan_template?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {assignment.plan_template?.carrier?.name} • 
                    {assignment.source === 'global' ? 'Global' : 'Local'}
                  </div>
                  {assignment.locked_fields.length > 0 && (
                    <div className="text-xs text-red-600">
                      <Lock className="h-2 w-2 inline mr-1" />
                      {assignment.locked_fields.length} locked
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // TODO: Implement remove functionality
                    }}
                    className="h-6 w-6 p-0"
                    title="Remove"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Assignment Dialog */}
      {clientId && (
        <PlanAssignmentDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          clientId={clientId}
        />
      )}
    </div>
  );
};