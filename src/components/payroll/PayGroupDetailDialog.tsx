import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Users, Clock, DollarSign } from 'lucide-react';
import { PayGroupEmployeeManager } from './PayGroupEmployeeManager';

interface PayGroup {
  id: string;
  name: string;
  pay_frequency: string;
  next_pay_date?: string;
  company_id: string;
  employee_count?: number;
  pay_calendar_config?: any;
  created_at: string;
  updated_at: string;
}

interface PayGroupDetailDialogProps {
  payGroup: PayGroup | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PayGroupDetailDialog: React.FC<PayGroupDetailDialogProps> = ({
  payGroup,
  isOpen,
  onClose
}) => {
  if (!payGroup) return null;

  const formatFrequency = (frequency: string) => {
    const frequencyMap: Record<string, string> = {
      weekly: 'Weekly',
      bi_weekly: 'Bi-Weekly',
      semi_monthly: 'Semi-Monthly',
      monthly: 'Monthly'
    };
    return frequencyMap[frequency] || frequency;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {payGroup.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pay Group Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Pay Frequency</p>
                <p className="font-semibold">{formatFrequency(payGroup.pay_frequency)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Next Pay Date</p>
                <p className="font-semibold">{formatDate(payGroup.next_pay_date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="font-semibold">{payGroup.employee_count || 0}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Employee Management */}
          <PayGroupEmployeeManager
            payGroupId={payGroup.id}
            payGroupName={payGroup.name}
            companyId={payGroup.company_id}
          />

          {/* Pay Calendar Configuration */}
          {payGroup.pay_calendar_config && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Pay Calendar Configuration</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cutoff Days Before Payday:</span>
                    <span className="ml-2 font-medium">
                      {payGroup.pay_calendar_config.cutoff_days_before_payday || 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Processing Days Required:</span>
                    <span className="ml-2 font-medium">
                      {payGroup.pay_calendar_config.processing_days_required || 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Holiday Handling:</span>
                    <span className="ml-2 font-medium">
                      {payGroup.pay_calendar_config.holiday_handling || 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Weekend Handling:</span>
                    <span className="ml-2 font-medium">
                      {payGroup.pay_calendar_config.weekend_handling || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Created: {new Date(payGroup.created_at).toLocaleString()}</p>
            <p>Last Updated: {new Date(payGroup.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};